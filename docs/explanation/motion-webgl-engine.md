# Motion & WebGL Graphics Engine Architecture

This document details the engineering principles and implementation architecture powering the SaaS Pro visual presentation layer: the Obsidian Bento design system, the synchronized Lenis-GSAP animation loop, and the Three.js / React Three Fiber (R3F) WebGL canvas.

---

## 1. Unified RequestAnimationFrame (RAF) Synchronization

Modern scroll-driven interfaces often degrade when inertia smooth scroll libraries run independently of animation timeline engines. 

In SaaS Pro, Lenis is bound directly to `gsap.ticker`:

```mermaid
flowchart LR
    A[Browser Display Refresh (60/120Hz)] --> B[gsap.ticker]
    B -->|timeMs delta| C[Lenis Smooth Scroll Engine]
    C -->|Calculate Hermite Inertia| D[ScrollTrigger.update]
    D -->|Scrub Timeline Transforms| E[Obsidian Bento DOM Cards]
```

### Implementation Blueprint (`client/src/lib/smooth-scroll.js`)

```javascript
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const initSmoothScroll = () => {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
  });

  // Direct tick binding: GSAP ticker drives Lenis RAF
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
  return lenis;
};
```

This single-ticker design ensures virtual scroll calculations and ScrollTrigger scrubbed timelines execute in the exact same render phase, eliminating pin tearing and visual micro-stutter.

---

## 2. WebGL InstancedMesh Constellation (`HeroWebGLCanvas.jsx`)

The ambient background visual is an interactive 3D particle constellation built with React Three Fiber.

### Single GPU Draw Call Optimization

Rendering thousands of nodes individually produces severe CPU overhead. SaaS Pro uses `THREE.InstancedMesh` with a single 4x4 matrix buffer:

- **Node Count**: 1,200 particle nodes.
- **Draw Calls**: Exactly **1 draw call** per frame.
- **DPR Clamping**: Restricts `dpr={[1, 1.8]}` on `<Canvas>` to prevent fill-rate exhaustion on mobile and high-density Retina displays.
- **Tone Mapping**: `THREE.ACESFilmicToneMapping` for high dynamic range color fidelity without neon blowout.

### Interactive Parallax via Normalized Device Coordinates (NDC)

Pointer tracking operates by calculating normalized coordinates (`[-1, 1]`) on mouse movement, then applying linear interpolation (`lerp`) inside `useFrame`:

```javascript
useFrame((state) => {
  // Lerp rotation smoothly toward cursor position
  meshRef.current.rotation.y += (targetX - meshRef.current.rotation.y) * 0.05;
  meshRef.current.rotation.x += (targetY - meshRef.current.rotation.x) * 0.05;
});
```

---

## 3. Hardware-Accelerated Magnetic Pointer (`CustomCursor.jsx`)

The custom cursor provides smooth tracking without frame lag by utilizing `gsap.quickTo()`:

```javascript
const xTo = gsap.quickTo(cursorRef.current, 'x', { duration: 0.2, ease: 'power3' });
const yTo = gsap.quickTo(cursorRef.current, 'y', { duration: 0.2, ease: 'power3' });

window.addEventListener('mousemove', (e) => {
  xTo(e.clientX);
  yTo(e.clientY);
});
```

### Proximity Snapping (`MagneticButton.jsx`)
Buttons pull the cursor into their center using magnetic proximity calculations:
- Calculates distance between cursor position and button centroid.
- Within an attraction radius (80px), applies a weighted translation to the button element (`x: deltaX * 0.3, y: deltaY * 0.3`).
- On mouse leave, smoothly springs back via `gsap.to(el, { x: 0, y: 0, ease: 'elastic.out(1, 0.3)' })`.

---

## 4. React 19 Lifecycle Safety & Memory Disposal

All visual and motion components enforce strict cleanup logic on component teardown:
- **GSAP Timelines**: Managed using `@gsap/react` `useGSAP()` or scoped `ctx.revert()` blocks.
- **Three.js Geometries & Materials**: Disposed in unmount callbacks (`geometry.dispose()`, `material.dispose()`).
- **Event Listeners**: Scroll and mousemove listeners are explicitly detached during effect cleanup.
