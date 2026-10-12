---
name: gsap-motion
description: Master GSAP animation architectures, Lenis smooth scroll ticker synchronization, scoped lifecycle teardown in React, and pinned scroll-scrubbed storytelling sequences.
---

# GSAP Motion Architecture & Smooth Scroll Orchestration

## Core Principles

Fluid, narrative-driven motion distinguishes world-class applications from static prototypes. However, unconstrained animation causes memory leaks, frame drops, and erratic scroll jumps.

This skill establishes the production standard for GSAP (GreenSock Animation Platform) motion engineering:
1. **Lenis Integration**: Smooth scrolling driven by a single unified tick source tied to `gsap.ticker`.
2. **Context Lifecycle Discipline**: Mandatory usage of `@gsap/react` (`useGSAP()`) or `gsap.context()` to guarantee 100% teardown of listeners, triggers, and pins on component unmount.
3. **Scroll-Scrubbed Pinning**: Cinematic storytelling utilizing `pin: true` and `scrub: 1` with transform-only CSS properties (`xPercent`, `yPercent`, `scale`, `rotation`, `opacity`).

---

## 1. Unified Lenis + GSAP Ticker Synchronizer

Never run Lenis and GSAP on independent `requestAnimationFrame` loops. Doing so creates frame misalignment, stuttering, and tearing during rapid wheel interactions.

### Standard Synchronization Engine
```typescript
// src/lib/motion/smooth-scroll.ts
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenisInstance: Lenis | null = null;

export function initSmoothScroll(): Lenis {
  if (lenisInstance) return lenisInstance;

  lenisInstance = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential ease-out
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
    infinite: false,
  });

  // Step 1: Tell ScrollTrigger to update whenever Lenis scrolls
  lenisInstance.on('scroll', ScrollTrigger.update);

  // Step 2: Feed Lenis RAF directly from GSAP's optimized ticker
  gsap.ticker.add((time: number) => {
    lenisInstance?.raf(time * 1000);
  });

  // Step 3: Disable GSAP lag smoothing to prevent desync during heavy frame rendering
  gsap.ticker.lagSmoothing(0);

  return lenisInstance;
}

export function destroySmoothScroll(): void {
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }
}
```

---

## 2. React Scoped Lifecycle: `useGSAP()` & `gsap.context()`

Duplicate animations, orphaned event triggers, and sticky DOM pins occur when components re-render without cleaning up their GSAP instances. 

### Mandatory React Hook Standard
```tsx
// src/components/motion/StorytellingShowcase.tsx
import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const StorytellingShowcase: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardGroupRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      // All selectors inside this scope are automatically scoped to containerRef
      const cards = gsap.utils.toArray<HTMLElement>('.story-card');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=300%',
          pin: true,
          scrub: 1, // Smooth scrub with 1-second lag compensation
          anticipatePin: 1,
          invalidateOnRefresh: true, // Recalculates coordinates on resize
        },
      });

      // Sequential card stacking and reveal sequence
      cards.forEach((card, index) => {
        if (index === 0) return; // First card is active initially

        tl.fromTo(
          card,
          {
            yPercent: 120,
            opacity: 0,
            scale: 0.9,
          },
          {
            yPercent: 0,
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: 'power2.out',
          },
          `card-${index}` // Precise timeline positioning
        );

        // Dim previous card
        if (cards[index - 1]) {
          tl.to(
            cards[index - 1],
            {
              scale: 0.94,
              opacity: 0.4,
              filter: 'blur(8px)',
              duration: 0.8,
            },
            `card-${index}`
          );
        }
      });
    },
    { scope: containerRef } // Lifecycle boundary: auto-reverts on unmount
  );

  return (
    <section ref={containerRef} className="story-container">
      <div className="story-viewport">
        <div ref={cardGroupRef} className="cards-wrapper">
          <div className="story-card card-1">
            <span className="card-step">01</span>
            <h3>Data Ingestion Layer</h3>
            <p>Ingesting 1.2M stream events per second with zero-loss durability.</p>
          </div>
          <div className="story-card card-2">
            <span className="card-step">02</span>
            <h3>Real-time Vectorization</h3>
            <p>Sub-millisecond embedding generation with dedicated neural coprocessors.</p>
          </div>
          <div className="story-card card-3">
            <span className="card-step">03</span>
            <h3>Distributed Query Execution</h3>
            <p>Instantaneous multi-region semantic retrieval across global partitions.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
```

---

## 3. Performance & Layout Rules

1. **Transform-Only Animations**:
   - **Allowed**: `x`, `y`, `xPercent`, `yPercent`, `scale`, `rotation`, `opacity`.
   - **Strictly Banned**: Animating `width`, `height`, `top`, `left`, `margin`, or `padding` during scroll scrubs. These trigger layout recalculation and cause severe frame drops.
2. **`will-change` Discipline**:
   - Apply `will-change: transform, opacity` only to elements currently animating; release it when inactive or let GSAP handle GPU promotion via `force3D: true`.
3. **Resize & Mobile Safeguards**:
   - Always include `invalidateOnRefresh: true` on pinned triggers so responsive layout changes calculate fresh offsets.
   - Use `ScrollTrigger.matchMedia()` to disable pinning or reduce motion on mobile viewports (< 768px):
   ```typescript
   ScrollTrigger.matchMedia({
     "(min-width: 769px)": function() {
       // High-fidelity pinned timeline
     },
     "(max-width: 768px)": function() {
       // Simplified stacked layout without pinning
     }
   });
   ```
4. **Accessible Reduced Motion**:
   - Check `window.matchMedia('(prefers-reduced-motion: reduce)')`. When set, bypass scroll timelines and render elements in their final resting state immediately.
