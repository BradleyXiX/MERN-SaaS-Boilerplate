---
name: cursor-effects
description: Implement high-performance custom cursor systems, non-blocking gsap.quickTo lerping, magnetic button attraction, and proximity particle repulsion.
---

# Fluid Cursor Systems & Magnetic Interactions

## Architecture Overview

Custom cursors must never feel sluggish, block main-thread execution, or fight against the operating system's native input latency. Updating React state on every `mousemove` event (`setMousePos({ x, y })`) triggers severe re-render thrashing and produces visible jitter.

This skill governs:
1. **Zero-React-State Cursor Physics**: Direct DOM transforms using GSAP's optimized `gsap.quickTo()` pipeline.
2. **Magnetic Target Snapping**: Calculating interactive bounding boxes to magnetize buttons toward the cursor when within a proximity radius.
3. **Cursor Repulsion Physics**: Displacing nearby floating particles or elements smoothly away from the pointer focal point.

---

## 1. High-Performance Pointer Tracking with `gsap.quickTo`

`gsap.quickTo()` pre-allocates an optimized tween pipeline, yielding 60–120 FPS tracking with sub-millisecond overhead.

```tsx
// src/components/motion/CustomCursor.tsx
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Check for pointer device capability (do not mount cursor on touch screens)
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Set initial centered coordinates
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });

    // Pre-allocate quickTo functions
    const xDot = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power3' });
    const yDot = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power3' });

    const xRing = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power2.out' });
    const yRing = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power2.out' });

    const onMouseMove = (e: MouseEvent) => {
      xDot(e.clientX);
      yDot(e.clientY);
      xRing(e.clientX);
      yRing(e.clientY);
    };

    const onMouseDown = () => {
      gsap.to(ring, { scale: 0.7, duration: 0.2 });
      gsap.to(dot, { scale: 1.5, duration: 0.2 });
    };

    const onMouseUp = () => {
      gsap.to(ring, { scale: 1, duration: 0.25 });
      gsap.to(dot, { scale: 1, duration: 0.25 });
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-50 h-2 w-2 rounded-full bg-cyan-400"
        style={{ willChange: 'transform' }}
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-50 h-9 w-9 rounded-full border border-cyan-400/40"
        style={{ willChange: 'transform' }}
      />
    </>
  );
};
```

---

## 2. Magnetic Interactive Attraction

Buttons and action triggers pull toward the cursor when hovering or entering proximity, creating an elastic, tactile physical feel.

```tsx
// src/components/motion/MagneticButton.tsx
import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface MagneticButtonProps {
  children: React.ReactNode;
  strength?: number; // Distance multiplier (default: 0.35)
  className?: string;
  onClick?: () => void;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  strength = 0.35,
  className = '',
  onClick,
}) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const el = buttonRef.current;
    if (!el || window.matchMedia('(pointer: coarse)').matches) return;

    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power2.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power2.out' });

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;

      xTo(deltaX);
      yTo(deltaY);
    };

    const handleMouseLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength]);

  return (
    <button ref={buttonRef} className={`relative inline-flex items-center ${className}`} onClick={onClick}>
      {children}
    </button>
  );
};
```

---

## 3. Particle Repulsion Under Cursor Radius

When floating elements, ambient dots, or decorative grid lines detect the pointer within a radial distance `R`, they calculate a repulsion vector and displace smoothly:

```typescript
// src/lib/motion/repulsion.ts
export interface Point {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
}

export function applyCursorRepulsion(
  points: Point[],
  cursorX: number,
  cursorY: number,
  radius: number = 120,
  force: number = 0.8
): void {
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const dx = cursorX - p.x;
    const dy = cursorY - p.y;
    const distance = Math.hypot(dx, dy);

    if (distance < radius && distance > 0) {
      // Repulsion angle
      const angle = Math.atan2(dy, dx);
      const intensity = ((radius - distance) / radius) * force;

      // Push away along the radial vector
      p.vx -= Math.cos(angle) * intensity * 5;
      p.vy -= Math.sin(angle) * intensity * 5;
    }

    // Spring restoration back to original coordinate
    p.vx += (p.originX - p.x) * 0.08;
    p.vy += (p.originY - p.y) * 0.08;

    // Viscous damping
    p.vx *= 0.82;
    p.vy *= 0.82;

    p.x += p.vx;
    p.y += p.vy;
  }
}
```

---

## 4. Accessibility & Platform Standards

1. **Touch Screening**: Custom cursors must ALWAYS be disabled when `window.matchMedia('(pointer: coarse)').matches` is true. Mobile interfaces must never show trailing fake cursor nodes.
2. **Hidden Native Cursor**: If hiding the native cursor via `body { cursor: none; }`, ensure text inputs (`<input>`, `<textarea>`) and interactive fallbacks preserve standard contextual pointers (`cursor: text`, `cursor: pointer`).
3. **Hardware Acceleration**: Always style the custom cursor container with `pointer-events: none` and `will-change: transform`.
