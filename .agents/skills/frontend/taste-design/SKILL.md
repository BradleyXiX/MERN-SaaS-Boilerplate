---
name: taste-design
description: Enforce high-taste visual aesthetics, curated color palettes, editorial typography scales, asymmetric bento layouts, and strict anti-slop design rules across all web interfaces.
---

# Taste Design System & Anti-Slop Aesthetic Directive

## Overview & Core Philosophy

This skill dictates the visual design language and typographic discipline of all frontend code in this repository. Default AI-generated aesthetics—such as neon violet/indigo gradients, uniform 3-column centered cards, floaty glow spheres, and generic system fonts—are explicitly forbidden. 

The goal is an intentional, editorial, and tactile visual experience characterized by deep foundational palettes, asymmetric information density, rigorous typographic hierarchy, and fine-tuned micro-textures.

---

## The Anti-Slop Prohibitions

When rendering user interfaces, agents must adhere to the following negative constraints:

| Banned AI Trope | Why It Fails | Approved Production Standard |
|---|---|---|
| **Neon Violet-Indigo Gradients** (`#6366f1` to `#a855f7`) | Oversaturated, generic, communicates low effort template design. | Charcoal and obsidian foundations with single-point warm or cold spectral accents (e.g., deep slate with ember copper or muted acid lime). |
| **Centered 3-Card Feature Rows** | Rigid, static, lacks visual hierarchy or narrative pacing. | Asymmetric Bento grids with variable spans (e.g., 8-col master card + two 4-col stacked auxiliary cards). |
| **Flat Cards with Excessive Drop Shadows** (`box-shadow: 0 10px 30px rgba(0,0,0,0.15)`) | Floats unnaturally without surface physics or tactile grounding. | Hairline borders (`border: 1px solid rgba(255, 255, 255, 0.08)`), multi-layered diffuse ambient occlusion, subtle noise grain. |
| **Default System Font Stacks** (`font-family: sans-serif`) | Lacks distinct personality, editorial authority, or typographic rhythm. | Curated editorial display headings paired with high-legibility geometric sans-serif body fonts and monospace data labels. |
| **Decorative Floating Blobs** (Unbounded blurry SVG circles) | Distracting visual clutter that provides zero semantic utility. | Structured lighting gradients with hard-boundary masking or subtle canvas-rendered directional light sources. |

---

## Foundational Color Architectures

### 1. Obsidian & Deep Slate Palette (Primary Dark Mode)
```css
:root {
  /* Surface Foundations */
  --surface-canvas: #090B10;
  --surface-raised: #0F131C;
  --surface-overlay: #161B26;
  --surface-card: rgba(22, 27, 38, 0.7);
  --surface-card-hover: rgba(28, 35, 48, 0.85);

  /* Hairlines & Dividers */
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-prominent: rgba(255, 255, 255, 0.12);
  --border-highlight: rgba(255, 255, 255, 0.22);

  /* Typography Scale */
  --text-primary: #F3F4F6;
  --text-secondary: #94A3B8;
  --text-tertiary: #64748B;
  --text-inverse: #090B10;

  /* Intentional Spectral Accents (Use One Primary + One Micro-Indicator) */
  --accent-amber: #F59E0B;
  --accent-amber-glow: rgba(245, 158, 11, 0.15);
  --accent-cyan: #06B6D4;
  --accent-signal-red: #EF4444;
  --accent-signal-emerald: #10B981;
}
```

### 2. Warm Editorial Neutral Palette (Alternative Architectural Theme)
```css
:root {
  --surface-canvas: #F8F7F4;
  --surface-raised: #EFECE6;
  --surface-card: #FFFFFF;
  --border-subtle: rgba(27, 24, 22, 0.08);
  --text-primary: #1A1816;
  --text-secondary: #6B665F;
  --text-tertiary: #9E988F;
  --accent-terracotta: #C85A32;
  --accent-sage: #4E6E5D;
}
```

---

## Typographic Hierarchy & Token Rules

All typographic choices must establish a strong visual rhythm:
1. **Display Headings**: Use an expressive, high-contrast typeface (`Outfit`, `Cabinet Grotesk`, `Playfair Display`, or `Syne`).
2. **Body & Interface**: High-readability geometric sans (`Plus Jakarta Sans`, `Inter`, `Geist`).
3. **Data, Monospace, & Metadata**: Precise monospaced fonts (`JetBrains Mono`, `Geist Mono`).

```css
/* Typographic Fluid Scale */
--font-display: 'Cabinet Grotesk', -apple-system, sans-serif;
--font-body: 'Plus Jakarta Sans', -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', monospace;

--text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.8125rem); /* Meta labels */
--text-sm: clamp(0.875rem, 0.825rem + 0.25vw, 0.9375rem); /* Secondary body */
--text-base: clamp(1rem, 0.95rem + 0.25vw, 1.0625rem); /* Default copy */
--text-lg: clamp(1.125rem, 1.05rem + 0.35vw, 1.25rem); /* Subheads */
--text-xl: clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem); /* Card titles */
--text-2xl: clamp(1.75rem, 1.5rem + 1vw, 2.25rem); /* Section headers */
--text-4xl: clamp(2.5rem, 2rem + 2vw, 3.75rem); /* Hero display */
--text-6xl: clamp(3.5rem, 2.8rem + 3.5vw, 5.5rem); /* Editorial mastheads */
```

---

## Asymmetric Bento Layout Engine

Feature displays and dashboards must be structured using an asymmetric Bento arrangement rather than identical 3-up cards:

```html
<section class="bento-grid">
  <!-- Primary Anchor: Spans 8 columns, rich interactive hero -->
  <article class="bento-item bento-span-8">
    <div class="bento-badge">Real-time Telemetry</div>
    <h3 class="bento-title">Autonomous Traffic Orchestration</h3>
    <p class="bento-description">Sub-millisecond routing across geographically distributed edge nodes with continuous failover verification.</p>
    <div class="bento-visual">
      <!-- High-density visualization component -->
    </div>
  </article>

  <!-- Secondary Anchor: Spans 4 columns, metric snapshot -->
  <article class="bento-item bento-span-4">
    <span class="bento-label">P99 Latency</span>
    <div class="bento-metric">1.84<span class="unit">ms</span></div>
    <div class="bento-sparkline"><!-- SVG sparkline --></div>
  </article>

  <!-- Tertiary Complement: Spans 4 columns -->
  <article class="bento-item bento-span-4">
    <span class="bento-label">Active Edges</span>
    <div class="bento-metric">142</div>
  </article>

  <!-- Narrative Summary: Spans 8 columns -->
  <article class="bento-item bento-span-8 bento-row-compact">
    <div class="bento-status-indicator"></div>
    <p class="bento-quote">"System convergence achieved with zero dropped transactions across all regions."</p>
  </article>
</section>
```

```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.bento-item {
  position: relative;
  background: var(--surface-card);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--border-subtle);
  border-radius: 1.25rem;
  padding: 2rem;
  overflow: hidden;
  transition: border-color 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.bento-item:hover {
  border-color: var(--border-prominent);
  transform: translateY(-2px);
}

.bento-span-8 { grid-column: span 8; }
.bento-span-4 { grid-column: span 4; }

@media (max-width: 1024px) {
  .bento-span-8, .bento-span-4 {
    grid-column: span 12;
  }
}
```

---

## Visual Texture & Tactile Details

To give interfaces physical depth and craftsmanship:
1. **Surface Highlights**: Apply an inset radial gradient at the card top edge simulating an overhead rim light:
   ```css
   .bento-item::before {
     content: "";
     position: absolute;
     inset: 0;
     border-radius: inherit;
     padding: 1px;
     background: linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 50%);
     -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
     -webkit-mask-composite: xor;
     mask-composite: exclude;
     pointer-events: none;
   }
   ```
2. **Noise Grain Texture**: Apply a non-tiling SVG noise data URI layer with opacity 0.025 to break up flat digital color fields.
3. **Intentional Contrast Ratios**: Ensure all text elements strictly meet WCAG AA standards: primary headings at ≥ 10:1 against canvas, and body text at ≥ 4.5:1. Never use muted grey on grey for functional information.
