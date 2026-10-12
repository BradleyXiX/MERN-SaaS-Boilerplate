import { useRef, useEffect } from 'react';
import gsap from 'gsap';

/**
 * Magnetic button wrapper that physically attracts toward the pointer on proximity.
 * Smooth elastic rebound on mouse leave.
 */
export function MagneticButton({
  children,
  strength = 0.35,
  className = '',
  onClick,
  ...props
}) {
  const buttonRef = useRef(null);

  useEffect(() => {
    const el = buttonRef.current;
    if (!el || typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const xTo = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power2.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power2.out' });

    const handleMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;

      xTo(deltaX);
      yTo(deltaY);
    };

    const handleMouseLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.65, ease: 'elastic.out(1, 0.3)' });
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength]);

  return (
    <button
      ref={buttonRef}
      className={`relative inline-flex items-center justify-center transition-colors ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

export default MagneticButton;
