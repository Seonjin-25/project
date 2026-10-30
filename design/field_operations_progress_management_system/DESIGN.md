---
name: Field Operations & Progress Management System
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#444651'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#757682'
  outline-variant: '#c5c5d3'
  surface-tint: '#4059aa'
  primary: '#00236f'
  on-primary: '#ffffff'
  primary-container: '#1e3a8a'
  on-primary-container: '#90a8ff'
  inverse-primary: '#b6c4ff'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#00312c'
  on-tertiary: '#ffffff'
  tertiary-container: '#004942'
  on-tertiary-container: '#4ebdb0'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#264191'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#89f5e7'
  tertiary-fixed-dim: '#6bd8cb'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#005049'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
  data-display:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: -0.03em
  data-metric:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-compact: 0.5rem
  margin: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 1.75rem
---

## Brand & Style

This design system serves headquarters engineering, cost control, and project administration teams who monitor enterprise-scale construction portfolios. The audience comprises project managers, cost engineers, and executive directors requiring high-density situational awareness, rapid delta analysis, and zero ambiguity under time-sensitive auditing conditions.

The visual style blends **Corporate Modern** with **Technical Industrial**. It relies on structured, precision-driven surfaces, clear micro-borders, and high-density data layouts. Rather than decorative flourishes, the UI delivers industrial-grade clarity: sharp divisional lines, explicit operational statuses, and dedicated data-scanning lanes that project institutional authority, engineering precision, and operational safety.

## Colors

The palette establishes an industrial, high-contrast operational environment optimized for intense daylight or office lighting.

- **Primary (`#1E3A8A`)**: Deep Navy Blue, delivering enterprise reliability and structural weight for key headers, master navigation panels, and definitive action points.
- **Secondary (`#2563EB`)**: Engineering Blue, serving as the high-visibility interaction driver for selections, active tabs, progress bars, and focus indicators.
- **Tertiary (`#0D9488`)**: Deep Teal, utilized for secondary metrics such as cumulative billing verification, audit sign-offs, and quality assurance checkpoints.
- **Neutral (`#0F172A`)**: Slate 900 base, grounding the system with neutral slate tones for text, structured dividers (`#E2E8F0`), and muted table backgrounds (`#F8FAFC`).

### Operational Delta Status Colors
Field execution and billing deviations (Planned vs. Actual) are strictly mapped to fixed semantic color tokens:
- **Critical Deviation / Inspection Required (`#E11D48`, Rose Red)**: Delta ≤ -5.0%p. High-priority intervention trigger for delayed structural milestones or payment withholding.
- **Warning / Variance Caution (`#D97706`, Amber Orange)**: -5.0%p < Delta < 0.0%p. Moderate operational slippage requiring site manager verification.
- **Normal / On Track (`#059669`, Emerald Green)**: Delta ≥ 0.0%p. Standard target achievement or accelerated progress.
- **Educational / Virtual Training Notice (`#6366F1`, Indigo Violet)**: Distinctive badge and banner accent for mandatory safety and operational methodology modules.

## Typography

Typography enforces strict operational readability and column alignment. The font pairing relies on **Inter** for all narrative labels, section headers, and administrative dialogues, paired with **JetBrains Mono** for all numerical values, progress percentages, currency counters, date stamps, and WBS (Work Breakdown Structure) codes.

- **Tabular Alignment**: All numerical expressions must enable tabular numbers (`font-variant-numeric: tabular-nums`) to prevent horizontal jitter during real-time data streaming or side-by-side site ledger comparisons.
- **Micro-Scale Text**: The system supports compact 11px and 12px monospaced typography explicitly tuned for high-density datagrids, status badges, and delta variance indicators.

## Layout & Spacing

The layout is built on a **Fluid 24-Column Data Grid** specifically tailored for multi-monitor desktop engineering setups (1920×1080 and larger standard PC viewports). 

- **Density Rules**: Spacing uses a compact 4px baseline rhythm (`space-xs: 4px`, `space-sm: 8px`, `space-md: 12px`, `space-lg: 20px`, `space-xl: 28px`). Paddings inside datagrids and filter controls prioritize maximum vertical information density, eliminating excess dead space.
- **Top Filter Canvas**: A persistent 48px to 56px sticky filter ribbon spans across the top, accommodating multi-site drop-downs, fiscal period selectors, and deviation range sliders.
- **Responsive Adaptability**:
  - **Desktop Wide (≥1680px)**: Persistent collapsible left navigation (240px), 24-column flex grid for cross-site variance matrices.
  - **Standard Desktop (1280px - 1679px)**: Compact left navigation (64px icon rail), 12-column grid, horizontal scroll zones for deep financial tables.
  - **Mobile/Field Tablet (Audit Fallback)**: Collapsible drawer, single-column KPI stacking, prioritized critical delta indicators pinned to viewport top.

## Elevation & Depth

To maintain visual discipline and keep performance high across large datasets, the design system minimizes heavy drop shadows, favoring **Structural Low-Contrast Outlines** and **Tonal Layering**.

- **Canvas Base**: Default background is set to a technical light neutral (`#F1F5F9`), while primary dashboard cards sit on pure white (`#FFFFFF`) framed by a crisp 1px border (`#E2E8F0`).
- **Container Tiers**:
  - **Level 0 (App Shell Background)**: `#F1F5F9`
  - **Level 1 (Card & Data Containers)**: `#FFFFFF` with `1px solid #CBD5E1`
  - **Level 2 (Active/Hover Rows, Pinned Table Headers)**: `#F8FAFC` with bottom border `2px solid #94A3B8`
  - **Level 3 (Sticky Sidebars, Modals & Floating Filters)**: `#FFFFFF` accompanied by an engineered micro-shadow: `0 4px 12px -2px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.04)` and border `1px solid #94A3B8`.
- **Warning Depth Overlays**: When a project enters critical state (≤ -5.0%p), the surrounding card applies a 1px inset accent line on the left edge (`#E11D48`) without disrupting grid alignment.

## Shapes

The interface implements a strict **Soft (`1`)** shape token (4px base border-radius) reflecting an architectural blueprint aesthetic.

- **Standard Elements (4px / 0.25rem)**: Applied to buttons, text inputs, table row highlights, metric cards, status tags, and progress bar tracks.
- **Compound Components (8px / 0.5rem - `rounded-lg`)**: Reserved exclusively for top-level operational cards, flyout modals, and floating fly-through inspection sheets.
- **Pill Shapes (Restricted)**: Strictly avoided for core layout components to maximize data area and prevent visual casualness. Allowed only on micro numeric badge counters (e.g., notification counts) with a maximum height of 18px.

## Components

### Buttons
- **Primary**: Solid Deep Navy (`#1E3A8A`) or Engineering Blue (`#2563EB`) fill, text `#FFFFFF`, 4px radius. Height: 32px for compact, 38px for default actions. Hover shifts to darker saturation with 1px focus ring offset.
- **Secondary / Outlined**: 1px solid border (`#CBD5E1`), background `#FFFFFF`, text `#0F172A`. Hover: background `#F8FAFC`, border `#94A3B8`.
- **Destructive / Flagged**: Subtle tint `#FFE4E6`, text `#BE123C`, border `1px solid #FDA4AF`.

### Status Badges & Chips
- **Inspection Required**: Background `#FFF1F2`, text `#BE123C`, border `1px solid #FECDD3`. Shows icon prefix `▼` with delta percentage in tabular mono.
- **Caution / Warning**: Background `#FFFBEB`, text `#B45309`, border `1px solid #FDE68A`. Shows icon prefix `▲` or `▼` with delta value.
- **Normal / Target Met**: Background `#ECFDF5`, text `#047857`, border `1px solid #A7F3D0`. Shows check or `●` indicator.
- **Educational / Training Badge**: Background `#EEF2FF`, text `#4338CA`, border `1px solid #C7D2FE`. Appended to methodology documents and new safety-standard training logs.

### Tables & Work Breakdown Structures (WBS)
- **Cell Density**: Row height 36px (compact) to 44px (default). Monospaced right-aligned numbers; left-aligned project naming.
- **Zebra Striping & Borders**: 1px subtle divider (`#E2E8F0`). Alternate row shading optional on datasets exceeding 50 lines using `#F8FAFC`.
- **Pinned Headers**: Sticky positioning with `#F1F5F9` background, `#475569` uppercase 11px monospaced typography, and a 2px `#CBD5E1` bottom separator.

### Input Fields & Compact Filter Bar
- **Dimensions**: Single-row height 32px to match dense operational button scaling.
- **Styling**: `#FFFFFF` background, `1px solid #CBD5E1` resting state, transitions to `1.5px solid #2563EB` upon focus. Placeholder text in `#94A3B8`.
- **Filter Groups**: Segmented selectors joined horizontally with internal dividers to conserve horizontal screen estate.

### Cards & KPI Tiles
- Enclosed with 1px border (`#E2E8F0`), padding `12px 16px`.
- Structured into three vertical tiers: Header (Category + Site ID), Data Hero (Monospaced Progress % and Accrued Amount), Footer (Delta vs Target with semantic badge).

### Modals & Banners
- **Modals**: Centered, max-width 720px, 8px corner radius, `#FFFFFF` surface with Level 3 shadow. Header contains project code, current phase, and close action.
- **Virtual Training Banner**: Full-width or card-top dismissible panel with Indigo accent (`#6366F1`), monospaced instructional metadata, and an explicit action button for compliance logging.