import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Custom hardware-accelerated pointer cursor using gsap.quickTo().
 * Bypasses React state completely to achieve 60-120fps tracking with zero main-thread lag.
 * Automatically disabled on touch screens.
 */
export function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    // Detect touchscreen / coarse pointer devices
    if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Center coordinates
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });

    // Pre-allocate optimized quickTo setters
    const xDot = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power3' });
    const yDot = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power3' });

    const xRing = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power2.out' });
    const yRing = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power2.out' });

    const onMouseMove = (e) => {
      xDot(e.clientX);
      yDot(e.clientY);
      xRing(e.clientX);
      yRing(e.clientY);
    };

    const onMouseDown = () => {
      gsap.to(ring, { scale: 0.7, duration: 0.15 });
      gsap.to(dot, { scale: 1.6, duration: 0.15 });
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
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      <div
        ref={dotRef}
        className="fixed top-0 left-0 h-2 w-2 rounded-full bg-cyan-400 opacity-90"
        style={{ willChange: 'transform' }}
      />
      <div
        ref={ringRef}
        className="fixed top-0 left-0 h-8 w-8 rounded-full border border-cyan-400/40 opacity-70"
        style={{ willChange: 'transform' }}
      />
    </div>
  );
}

export default CustomCursor;
