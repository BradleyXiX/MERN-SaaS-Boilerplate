import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * 1,500 Instanced Particle Constellation with single-draw-call efficiency.
 * Smoothly tracks mouse coordinates with lerped NDC parallax.
 */
export function ParticleConstellation({ count = 1200 }) {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Generate particle cloud with orbital drift metadata
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const radius = 5 + Math.random() * 9;
      const theta = THREE.MathUtils.randFloatSpread(360);
      const phi = THREE.MathUtils.randFloatSpread(360);

      const x = radius * Math.sin(theta) * Math.cos(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(theta);

      const speed = 0.15 + Math.random() * 0.35;
      const factor = 0.2 + Math.random() * 0.8;
      const scale = 0.03 + Math.random() * 0.025;

      temp.push({ x, y, z, origX: x, origY: y, origZ: z, speed, factor, scale });
    }
    return temp;
  }, [count]);

  const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouse.current.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;

    // Smooth lerp mouse coordinates
    mouse.current.x += (mouse.current.targetX - mouse.current.x) * 0.04;
    mouse.current.y += (mouse.current.targetY - mouse.current.y) * 0.04;

    const time = state.clock.getElapsedTime();

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const t = time * p.speed;

      dummy.position.set(
        p.origX + Math.cos(t) * 0.35 + mouse.current.x * (p.factor * 1.8),
        p.origY + Math.sin(t) * 0.35 + mouse.current.y * (p.factor * 1.8),
        p.origZ + Math.sin(t * 0.5) * 0.25
      );

      dummy.scale.set(p.scale, p.scale, p.scale);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 10, 10]} />
      <meshStandardMaterial
        color="#38BDF8"
        roughness={0.2}
        metalness={0.7}
        emissive="#06B6D4"
        emissiveIntensity={0.35}
      />
    </instancedMesh>
  );
}

export default ParticleConstellation;
