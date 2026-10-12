---
name: threejs-webgl
description: Guide production Three.js and React Three Fiber (R3F) scene architectures, PBR lighting, InstancedMesh particle fields, mouse parallax, and mandatory WebGL resource disposal.
---

# Three.js & React Three Fiber (R3F) WebGL Production Architecture

## Core Requirements

WebGL canvases must elevate product perception without degrading client performance, overheating mobile devices, or leaking GPU memory. 

This skill governs:
1. **Scene Scaffolding**: Structured camera projection, physical lighting, and Canvas DPR clamps.
2. **High-Performance Instancing**: Using `THREE.InstancedMesh` for all multi-object systems and particle fields to maintain single-draw-call efficiency.
3. **Responsive Parallax**: Smooth lerping of camera/object orientation linked to normalized device coordinates (NDC).
4. **Mandatory Disposal Protocol**: Complete deallocation of buffers, geometries, materials, and textures on unmount.

---

## 1. Production Canvas Scaffolding & PBR Lighting

Never instantiate an unconstrained `<Canvas>` without pixel ratio clamping or color management.

### React Three Fiber Master Canvas Template
```tsx
// src/components/webgl/SceneCanvas.tsx
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ParticleConstellation } from './ParticleConstellation';
import * as THREE from 'three';

export const SceneCanvas: React.FC = () => {
  return (
    <div className="webgl-canvas-container" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 15], fov: 45, near: 0.1, far: 100 }}
        dpr={[1, 2]} // Clamp pixel ratio between 1 and 2 (prevents 3x battery drain on retina displays)
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
      >
        {/* Physically-Based Lighting Rig */}
        <ambientLight intensity={0.35} />
        <directionalLight
          position={[10, 15, 10]}
          intensity={1.2}
          color="#F8FAFC"
          castShadow={false}
        />
        <pointLight position={[-10, -5, -5]} intensity={0.6} color="#06B6D4" />

        <Suspense fallback={null}>
          <ParticleConstellation count={1500} />
        </Suspense>
      </Canvas>
    </div>
  );
};
```

---

## 2. High-Density Particle Fields with `InstancedMesh`

Rendering hundreds of individual `<mesh>` nodes creates hundreds of draw calls, choking the WebGL pipeline. Agents must use `InstancedMesh`.

```tsx
// src/components/webgl/ParticleConstellation.tsx
import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleConstellationProps {
  count?: number;
}

export const ParticleConstellation: React.FC<ParticleConstellationProps> = ({ count = 1500 }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Generate initial particle coordinate cloud
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const radius = 6 + Math.random() * 8;
      const theta = THREE.MathUtils.randFloatSpread(360);
      const phi = THREE.MathUtils.randFloatSpread(360);

      const x = radius * Math.sin(theta) * Math.cos(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(theta);

      const speed = 0.2 + Math.random() * 0.4;
      const factor = 0.2 + Math.random() * 0.8;

      temp.push({ x, y, z, origX: x, origY: y, origZ: z, speed, factor });
    }
    return temp;
  }, [count]);

  // Mouse coordinate tracker in Normalized Device Coordinates (-1 to 1)
  const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Smooth mouse lerping
    mouse.current.x += (mouse.current.targetX - mouse.current.x) * 0.05;
    mouse.current.y += (mouse.current.targetY - mouse.current.y) * 0.05;

    const time = state.clock.getElapsedTime();

    particles.forEach((p, i) => {
      // Gentle orbital drift combined with mouse parallax
      const t = time * p.speed;
      dummy.position.set(
        p.origX + Math.cos(t) * 0.4 + mouse.current.x * (p.factor * 1.5),
        p.origY + Math.sin(t) * 0.4 + mouse.current.y * (p.factor * 1.5),
        p.origZ + Math.sin(t * 0.5) * 0.3
      );

      const s = 0.04 + Math.sin(t + i) * 0.015;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      frustumCulled={false}
    >
      <sphereGeometry args={[1, 12, 12]} />
      <meshStandardMaterial
        color="#94A3B8"
        roughness={0.2}
        metalness={0.8}
        emissive="#06B6D4"
        emissiveIntensity={0.25}
      />
    </instancedMesh>
  );
};
```

---

## 3. WebGL Resource Deallocation & Cleanup Rules

GPU memory is NOT automatically reclaimed by JavaScript garbage collection. When WebGL components unmount in SPAs, failed disposals crash the browser tab (Context Lost).

### Mandatory Cleanup Protocol (Vanilla Three.js and imperative setups)
Whenever imperative Three.js scenes, geometries, materials, or renderers are instantiated, run this recursive disposal function on unmount:

```typescript
// src/lib/webgl/dispose.ts
import * as THREE from 'three';

export function disposeThreeScene(scene: THREE.Scene, renderer?: THREE.WebGLRenderer): void {
  scene.traverse((object: THREE.Object3D) => {
    if (!(object instanceof THREE.Mesh)) return;

    // Dispose Geometry
    if (object.geometry) {
      object.geometry.dispose();
    }

    // Dispose Material(s)
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach((mat) => disposeMaterial(mat));
      } else {
        disposeMaterial(object.material);
      }
    }
  });

  if (renderer) {
    renderer.dispose();
    renderer.forceContextLoss();
    if (renderer.domElement && renderer.domElement.parentElement) {
      renderer.domElement.parentElement.removeChild(renderer.domElement);
    }
  }
}

function disposeMaterial(material: THREE.Material): void {
  material.dispose();

  // Dispose associated textures
  for (const value of Object.values(material)) {
    if (value instanceof THREE.Texture) {
      value.dispose();
    }
  }
}
```

---

## 4. Performance Safeguards

- **Shader Complexity**: Keep custom fragment shaders lean. Avoid unbounded for-loops or complex procedural noise calculations per fragment on mobile.
- **Occlusion**: Use frustum culling or disable rendering when the WebGL canvas scrolls outside the active viewport using `IntersectionObserver`.
- **Visibility Pausing**: Hook into document `visibilitychange` to pause `requestAnimationFrame` loops when the user switches browser tabs.
