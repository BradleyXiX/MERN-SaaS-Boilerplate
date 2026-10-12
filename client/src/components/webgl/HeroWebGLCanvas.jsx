import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import ParticleConstellation from './ParticleConstellation';

/**
 * Production-ready WebGL Canvas container with clamped DPR, ACES Filmic tonemapping, and PBR lighting.
 */
export function HeroWebGLCanvas() {
  return (
    <div className="absolute inset-0 h-full w-full pointer-events-none" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 14], fov: 45, near: 0.1, far: 100 }}
        dpr={[1, 1.8]} // Clamp DPR to prevent mobile battery drain
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 12, 10]} intensity={1.1} color="#F8FAFC" />
        <pointLight position={[-10, -5, -5]} intensity={0.8} color="#06B6D4" />

        <Suspense fallback={null}>
          <ParticleConstellation count={1200} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default HeroWebGLCanvas;
