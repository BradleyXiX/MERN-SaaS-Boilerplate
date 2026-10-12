---
name: ui-ux-design-system
description: Govern tokenized design systems, strict WCAG AA contrast compliance (≥4.5:1), fluid micro-interactions, accessible keyboard navigation, and focus management.
---

# UI/UX Design System, Accessibility & Interaction Standards

## Core Principles

Every user interface created in this codebase must adhere to a mathematically consistent spacing scale, pass strict accessibility criteria, and provide responsive feedback for mouse, keyboard, and assistive device users.

This skill dictates:
1. **Tokenized Spacing Scale**: 4px base increment system preventing arbitrary margin/padding values.
2. **WCAG AA Compliance**: Guaranteed color contrast (≥ 4.5:1 for normal text, ≥ 3.0:1 for large text and UI components).
3. **Keyboard & Focus Navigation**: Explicit `:focus-visible` styling, escape key handlers, and modal focus traps.
4. **Fluid Micro-Interactions**: Predictable, physics-aligned transition curves for buttons, toggles, dialogs, and tooltips.

---

## 1. Tokenized Spacing & Dimension Scale

Never use arbitrary ad-hoc units (e.g., `margin-top: 19px` or `padding: 23px`). All dimensions must consume standard token increments:

```css
:root {
  /* Spacing Scale (4px Base Grid) */
  --space-0: 0px;
  --space-1: 0.25rem;  /* 4px  - Micro gap, badge padding */
  --space-2: 0.5rem;   /* 8px  - Icon offsets, input internal padding */
  --space-3: 0.75rem;  /* 12px - Dense list spacing */
  --space-4: 1rem;     /* 16px - Standard component padding */
  --space-5: 1.25rem;  /* 20px - Medium container padding */
  --space-6: 1.5rem;   /* 24px - Card internal padding */
  --space-8: 2rem;     /* 32px - Section subsection spacing */
  --space-10: 2.5rem;  /* 40px - Major element offsets */
  --space-12: 3rem;    /* 48px - Section breaks */
  --space-16: 4rem;    /* 64px - Major section dividers */
  --space-20: 5rem;    /* 80px - Hero gutters */

  /* Border Radii */
  --radius-xs: 0.25rem;  /* 4px  - Tags, chips */
  --radius-sm: 0.375rem; /* 6px  - Badges, small inputs */
  --radius-md: 0.5rem;   /* 8px  - Standard buttons, text fields */
  --radius-lg: 0.75rem;  /* 12px - Dropdowns, popovers */
  --radius-xl: 1rem;     /* 16px - Cards, dialogs */
  --radius-2xl: 1.5rem;  /* 24px - Bento containers */
  --radius-full: 9999px; /* Pills, avatars */

  /* Transition Curves */
  --ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
}
```

---

## 2. WCAG AA Contrast Ratios (≥4.5:1)

Text and interactive elements that fail contrast checks reduce usability and violate compliance guidelines.

### Contrast Verification Matrix

| Element Type | Minimum Contrast Required | Light Theme Spec | Dark Theme Spec |
|---|---|---|---|
| **Body Copy & Input Text** | **4.5:1** (Normal Text) | `#1A1816` on `#FFFFFF` (16.2:1) | `#F3F4F6` on `#090B10` (17.5:1) |
| **Secondary & Muted Copy** | **4.5:1** (Normal Text) | `#52525B` on `#FFFFFF` (7.0:1) | `#94A3B8` on `#090B10` (8.4:1) |
| **Headings (≥ 24px or bold ≥ 18.5px)** | **3.0:1** (Large Text) | `#18181B` on `#FFFFFF` (16.8:1) | `#FFFFFF` on `#090B10` (19.8:1) |
| **Input Borders & Toggle Tracks** | **3.0:1** (UI Components) | `#A1A1AA` on `#FFFFFF` (3.05:1) | `#475569` on `#090B10` (3.2:1) |
| **Focus Rings** | **3.0:1** against adjacent surfaces | `#2563EB` on `#FFFFFF` (6.2:1) | `#38BDF8` on `#090B10` (8.9:1) |

> **Audit Requirement**: When introducing new accent colors (e.g. badges, alerts, status pills), compute relative luminance before committing. Avoid using light yellow or soft mint green text on white/light backgrounds.

---

## 3. Keyboard Navigation & Accessible Focus Rings

Never remove default browser focus outlines without providing a high-visibility replacement. `outline: none` without `:focus-visible` is forbidden.

### Universal Accessible Focus Ring Pattern
```css
/* Visible only when navigating via keyboard, suppressed during mouse clicks */
button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible,
[tabindex]:focus-visible {
  outline: 2px solid #38BDF8;
  outline-offset: 3px;
  border-radius: var(--radius-sm);
  box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.25);
}
```

### Accessible Modal Focus Trap & Esc Handler
All interactive dialogs, sheets, and drawers must trap Tab focus inside the active container and close upon pressing the Escape key:

```typescript
// src/hooks/useFocusTrap.ts
import { useEffect, useRef } from 'react';

export function useFocusTrap<T extends HTMLElement>(isOpen: boolean, onClose: () => void) {
  const containerRef = useRef<T | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const el = containerRef.current;
    if (!el) return;

    // Find all focusable elements
    const focusableElements = el.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus the initial element
    firstElement?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return containerRef;
}
```

---

## 4. Micro-Interactions & Tactile States

All clickable elements must give clear visual feedback during their lifecycle:
- **Hover**: Subtle elevation or border luminosity shift (`transform: translateY(-1px)`, border brightness +20%).
- **Active / Pressed**: Tactile compression (`transform: scale(0.98)`).
- **Disabled**: Clear semantic disengagement (`opacity: 0.5`, `cursor: not-allowed`, `pointer-events: none`).
- **Loading**: Preserved physical dimensions (avoid layout shift during spinner display) with `aria-busy="true"`.
