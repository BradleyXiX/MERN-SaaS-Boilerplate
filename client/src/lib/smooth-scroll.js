import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenisInstance = null;

/**
 * Initializes smooth scrolling with Lenis driven directly by GSAP ticker.
 * Guarantees zero scroll tearing or desync between ScrollTrigger and wheel motion.
 */
export function initSmoothScroll() {
  if (typeof window === 'undefined') return null;
  if (lenisInstance) return lenisInstance;

  lenisInstance = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
    infinite: false,
  });

  // Step 1: Notify ScrollTrigger on every Lenis scroll
  lenisInstance.on('scroll', ScrollTrigger.update);

  // Step 2: Feed Lenis RAF directly from GSAP ticker
  gsap.ticker.add((time) => {
    lenisInstance?.raf(time * 1000);
  });

  // Step 3: Disable lag smoothing to prevent desync during intensive frames
  gsap.ticker.lagSmoothing(0);

  return lenisInstance;
}

export function destroySmoothScroll() {
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }
}
