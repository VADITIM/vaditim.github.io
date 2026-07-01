/**
 * Playground section animations.
 *
 * Unlike the other sections, the Playground co-locates all of its animation and
 * interaction logic inside `aPlayground-Section.vue` — it relies on template refs
 * (magnetic button, hover list, tilt card, particle container) and a gated
 * requestAnimationFrame physics loop that only steps while the section is active.
 *
 * The enter reveal is driven from the component via `onSectionStatesChange`, so
 * there is nothing to register here. This stub keeps the section consistent with
 * the registry contract (`registerAnimations`).
 */
export function registerPlaygroundAnimations() {
  // Intentionally empty — see component for the self-managed reveal + interactions.
}
