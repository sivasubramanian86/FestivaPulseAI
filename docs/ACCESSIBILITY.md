# Accessibility Specification & Audit Ledger (WCAG 2.1 AA) — FestivaPulseAI

FestivaPulseAI is engineered to be universally accessible, adhering strictly to **W3C Web Content Accessibility Guidelines (WCAG) 2.1 Level AA** standards across both desktop and mobile form factors.

---

## 1. Core Accessibility Standards

| Category | Specification | Implementation in FestivaPulseAI |
| :--- | :--- | :--- |
| **Color Contrast** | Minimum 4.5:1 for normal text, 3:1 for large text / UI | Validated in both **Ivory Silk (Light)** and **Midnight Velvet (Dark)** modes with gold, slate, emerald, and crimson tokens. |
| **Keyboard Navigation** | 100% reachable via `Tab`, `Shift+Tab`, `Enter`, `Space`, `Escape` | Skip to main content link (`#main-content`), focusable tabs, interactive sliders with keyboard steps, modal focus trapping. |
| **Landmark Semantics** | Proper HTML5 landmarks | `<header role="banner">`, `<main id="main-content">`, `<nav aria-label="...">`, `<footer role="contentinfo">`, `<section>`. |
| **ARIA Name, Role & Value** | Explicit accessible names on all controls | All `<button>`, `<input>`, `<select>`, and interactive sliders provide clear `aria-label`, `aria-describedby`, or associated `<label htmlFor="...">`. |
| **Non-Text Content** | Meaningful alternatives | Decorative background elements use `alt="" role="presentation" aria-hidden="true"`; visual renders provide descriptive `alt` captions. |
| **Motion & Visuals** | Vestibular comfort | Supports CSS `@media (prefers-reduced-motion)` to reduce animation intensity for sensitive users. |
| **Internationalization** | Multilingual inclusion | Real-time localization across 10 Indian and global languages: English, Tamil, Hindi, Telugu, Kannada, Malayalam, and Spanish. |

---

## 2. Interactive Component Accessibility Audit

### 2.1. Dual Theme System (Light & Dark)
- Built on `ThemeContext` with pre-paint theme hydration from `localStorage` to avoid blinding theme flashes.
- High-contrast visual borders and semantic color accents prevent information from being conveyed by color alone (badges always pair status icons with explicit text labels).

### 2.2. Command Navigation Cockpit
- Desktop navigation (`Main Navigation`) and touch-friendly mobile navigation bar (`Mobile Secondary Navigation`) provide distinct, non-colliding accessible names.
- Active tabs state clearly communicated via `aria-selected` and active color tokens.

### 2.3. Sliders & Range Controls
- Attendance gate slider (`#live-attendance-gate-slider`): includes `aria-label="Live Attendance Gate Slider"`, min, max, step, and current value readouts.
- 3D Venue Transformation slider: includes `aria-label="3D Venue Transformation Progress Slider"`.
- Scenario Lab shock sliders: include `aria-label` with real-time numeric counter readouts.

### 2.4. Modals & Overlay Drawers
- Guided Tour Modal (`ImmersiveVenueTourModal`), QA Modal (`QATestRunnerModal`), and GenAI Telemetry X-Ray Drawer (`GenAIXRayDrawer`) feature:
  - Accessible dismiss buttons (`aria-label="Close ..."`).
  - Background overlay clicks and `Escape` key listeners.
  - Proper focus management.
