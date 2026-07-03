---
paths:
  - "src/components/**"
  - "src/App.vue"
  - "src/style/**"
  - "**/*.vue"
  - "**/*.scss"
  - "index.html"
---

# Frontend

## Design Tokens

Shared variables live in `src/style/variables.scss` (e.g. `--card-size`, `--cards-container-size`). Never hardcode raw values in components when a variable exists; add new shared values there, not inline.

The visual language is established (game-menu aesthetic, diagonal slice backgrounds, section main colors). Don't introduce a competing design principle or component library — the stack is Vue 3 + SCSS + GSAP + vanilla-tilt, nothing else.

## Layout

- CSS Grid for 2D, Flexbox for 1D. Use `gap`, not margin hacks.
- Semantic HTML: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`.
- Desktop-first (>= 1200px); mobile paths are frozen until desktop is finished.

## Accessibility

- All interactive elements keyboard-accessible.
- Images: meaningful `alt` text. Decorative: `alt=""`.
- Contrast: 4.5:1 normal text, 3:1 large text.
- Visible focus indicators. Never `outline: none` without replacement.
- Respect `prefers-reduced-motion` where feasible for ambient/decorative animation.

## Performance

- Images: `loading="lazy"` below fold, explicit `width`/`height`.
- Fonts: `font-display: swap`.
- Animations: `transform` and `opacity` only — never animate layout properties.
- Bundle size: never import a whole library for one function.
