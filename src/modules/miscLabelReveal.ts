// Shared "bar sweep" reveal animation for corner/edge labels; see "Label Reveal
// Pattern" in CLAUDE.md. Used by any component rendering a set of `.pc-label`
// elements (structure: .pc-label > .pc-label-inner > .pc-label-text, .pc-label-bar).
import { gsap } from 'gsap';

// Initial hidden state; bar collapsed, text clipped away.
export function hideLabels(labelEls: HTMLElement[]) {
  labelEls.forEach(label => {
    gsap.set(label.querySelector('.pc-label-text'), { clipPath: 'inset(0 100% 0 0)' });
    gsap.set(label.querySelector('.pc-label-bar'), { scaleX: 0, x: '0%', opacity: 1, transformOrigin: 'left center' });
  });
}

// Build the 4-step bar-sweep reveal for a single label (expects .pc-label-text
// and .pc-label-bar children). The hidden state is applied immediately; the
// returned timeline plays the sweep. Used by playLabelReveals below and by
// one-off choreographies (e.g. the landing page) that sequence labels inside a
// master timeline instead of via the positional stagger.
export function buildLabelReveal(label: HTMLElement): gsap.core.Timeline {
  const tl = gsap.timeline();
  const text = label.querySelector('.pc-label-text');
  const bar = label.querySelector('.pc-label-bar');
  if (!text || !bar) return tl;
  gsap.killTweensOf([text, bar]);
  gsap.set(text, { clipPath: 'inset(0 100% 0 0)' });
  gsap.set(bar, { scaleX: 0, x: '0%', opacity: 1, transformOrigin: 'left center' });
  tl.to(bar, { scaleX: 1, duration: 0.42, ease: 'power3.inOut' })
    .set(text, { clipPath: 'inset(0 0% 0 0)' })
    .set(bar, { transformOrigin: 'right center' })
    .to(bar, { scaleX: 0, duration: 0.5, ease: 'power3.inOut' })
    .set(bar, { opacity: 0 });
  return tl;
}

// Each label: a thin bar grows to the right to cover the text, then slides out
// to the right; leaving the text behind. Delay scales with distance from the
// top-left corner (top-left first, bottom-right last); see "Label Reveal
// Pattern" in CLAUDE.md.
export function playLabelReveals(labelEls: HTMLElement[], startAt: number) {
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  labelEls.forEach(label => {
    const rect = label.getBoundingClientRect();
    const yFrac = rect.top / vh;    // 0 (top) → ~1 (bottom)
    const xFrac = rect.left / vw;   // 0 (left) → ~1 (right)
    // Combined top-left distance: vertical position dominates (bottom labels
    // clearly start later), horizontal position breaks the tie between labels
    // on the same row so the more left-aligned one always animates first.
    const delay = startAt + yFrac * 1.1 + xFrac * 0.4;

    buildLabelReveal(label).delay(delay);
  });
}

// Leave fires immediately (no delay), snappier than enter; labels re-collapse
// without re-running the positional stagger.
export function playLabelLeave(labelEls: HTMLElement[]) {
  labelEls.forEach(label => {
    const text = label.querySelector('.pc-label-text');
    const bar = label.querySelector('.pc-label-bar');
    gsap.killTweensOf([text, bar]);
    gsap.to(text, { clipPath: 'inset(0 100% 0 0)', duration: 0.3, ease: 'power2.in', overwrite: 'auto' });
    gsap.set(bar, { opacity: 0 });
  });
}
