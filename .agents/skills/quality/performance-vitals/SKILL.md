---
name: performance-vitals
description: Enforce Core Web Vitals targets (LCP, INP, CLS), dynamic code splitting, responsive modern image pipelines, and bundle-size monitoring.
---

# Web Performance & Core Web Vitals Architecture

## Core Targets & Budgets

Web performance directly dictates user conversion, retention, and search index rankings. Applications must feel instantaneous and prevent cumulative layout shifts during dynamic resource loading.

All frontend implementations must meet these thresholds on mobile emulation (Moto G4 / 4G Fast):

| Metric | Target Budget | Primary Causes of Violation | Remediation Pattern |
|---|---|---|---|
| **Largest Contentful Paint (LCP)** | **≤ 2.2s** | Slow server response, render-blocking JS/CSS, unoptimized hero images. | Priority preloading, critical CSS inlining, edge caching, WebP/AVIF formats. |
| **Interaction to Next Paint (INP)** | **≤ 180ms** | Long JavaScript tasks blocking the main thread during user input. | Code splitting, `requestIdleCallback`, web workers, microtask chunking. |
| **Cumulative Layout Shift (CLS)** | **≤ 0.05** | Unsized images/videos, dynamically injected banners, FOIT/FOUT fonts. | Explicit `aspect-ratio` attributes, font preload with `font-display: swap`, reserved DOM containers. |
| **Total Blocking Time (TBT)** | **≤ 150ms** | Monolithic JS bundles parsing/executing synchronously during initial load. | Dynamic imports (`React.lazy`), tree-shaking, removing duplicate utility libs. |

---

## 1. Dynamic Code Splitting & Route Chunking

Never import heavy third-party libraries (charts, rich-text editors, WebGL canvases, date utilities) statically into the top-level application root.

### Route-Level Lazy Loading
```tsx
// src/routes/AppRoutes.tsx
import React, { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { SkeletonPageLoader } from '../components/ui/SkeletonPageLoader';

// Critical landing route loaded synchronously
import { LandingPage } from '../pages/LandingPage';

// Heavy secondary routes loaded dynamically on demand
const AnalyticsDashboard = lazy(() =>
  import('../pages/AnalyticsDashboard').then((m) => ({ default: m.AnalyticsDashboard }))
);
const SettingsSecurity = lazy(() =>
  import('../pages/SettingsSecurity').then((m) => ({ default: m.SettingsSecurity }))
);

export const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route
      path="/dashboard"
      element={
        <Suspense fallback={<SkeletonPageLoader />}>
          <AnalyticsDashboard />
        </Suspense>
      }
    />
    <Route
      path="/settings/security"
      element={
        <Suspense fallback={<SkeletonPageLoader />}>
          <SettingsSecurity />
        </Suspense>
      }
    />
  </Routes>
);
```

### Component-Level On-Demand Loading
```tsx
// Dynamic WebGL Canvas Mount
import React, { Suspense, useState } from 'react';

const WebGLCanvas = React.lazy(() => import('../webgl/SceneCanvas'));

export const InteractiveHero: React.FC = () => {
  const [loadWebGL, setLoadWebGL] = useState(false);

  return (
    <div className="hero-section" onMouseEnter={() => setLoadWebGL(true)}>
      <h1>Next-Generation Data Engine</h1>
      {loadWebGL ? (
        <Suspense fallback={<div className="canvas-placeholder" />}>
          <WebGLCanvas />
        </Suspense>
      ) : (
        <img src="/hero-static.webp" alt="Preview" className="canvas-fallback" />
      )}
    </div>
  );
};
```

---

## 2. Image Optimization & Layout Shift Elimination

Missing width/height or aspect ratios on media elements is the leading cause of Cumulative Layout Shift (CLS).

### Modern `<picture>` Pattern
Always deliver modern formats (AVIF and WebP) with explicit aspect ratios and responsive srcset:

```html
<picture>
  <source
    type="image/avif"
    srcset="/images/hero-480.avif 480w, /images/hero-1080.avif 1080w, /images/hero-1920.avif 1920w"
    sizes="(max-width: 768px) 100vw, 1200px"
  />
  <source
    type="image/webp"
    srcset="/images/hero-480.webp 480w, /images/hero-1080.webp 1080w, /images/hero-1920.webp 1920w"
    sizes="(max-width: 768px) 100vw, 1200px"
  />
  <img
    src="/images/hero-1080.jpg"
    alt="Platform dashboard analytics overview"
    width="1200"
    height="675"
    loading="eager"
    fetchpriority="high"
    decoding="async"
    style="aspect-ratio: 16 / 9; width: 100%; height: auto;"
  />
</picture>
```

> **Rules**:
> - Hero / Above-the-fold images: `loading="eager"`, `fetchpriority="high"`.
> - Below-the-fold images: `loading="lazy"`, `decoding="async"`.
> - Always specify `width` and `height` attributes or CSS `aspect-ratio` to reserve space before image download.

---

## 3. Font Optimization & FOIT Elimination

Custom web fonts must not block text rendering (Flash of Invisible Text) or shift page content upon downloading:

```html
<!-- Preload critical display font in HTML head -->
<link
  rel="preload"
  href="/fonts/cabinet-grotesk-variable.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
```

```css
@font-face {
  font-family: 'Cabinet Grotesk';
  src: url('/fonts/cabinet-grotesk-variable.woff2') format('woff2');
  font-weight: 100 900;
  font-display: swap; /* Immediately renders fallback font, then swaps smoothly */
  font-style: normal;
}
```

---

## 4. Main Thread Long Task Mitigation (INP Optimization)

Tasks occupying the main thread for > 50ms block user input processing.

### Chunking Heavy Computation with `scheduler.yield` or `setTimeout`
```typescript
// src/lib/performance/task-chunker.ts
export async function yieldToMain(): Promise<void> {
  // @ts-ignore - Modern scheduler API
  if (globalThis.scheduler?.yield) {
    // @ts-ignore
    return globalThis.scheduler.yield();
  }
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export async function processLargeDataset<T>(
  items: T[],
  processItem: (item: T) => void,
  chunkSize = 100
): Promise<void> {
  for (let i = 0; i < items.length; i++) {
    processItem(items[i]);
    if (i % chunkSize === 0) {
      await yieldToMain(); // Yield back to the browser to handle inputs/animations
    }
  }
}
```

---

## 5. Bundle Size Budget Governance

- **Limit**: Initial entry bundle must not exceed 180 kB compressed (gzip/brotli).
- **Audit**: Run `vite-bundle-visualizer` or `@next/bundle-analyzer` on every production build.
- **Tree-Shaking**: Do not import entire icon libraries (`import * as Icons from 'lucide-react'`). Import individual components: `import { Check, AlertCircle } from 'lucide-react'`.
