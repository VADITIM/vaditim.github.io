// Standalone typewriter API; mirrors the Label-Reveal pattern (see CLAUDE.md).
// Types out text one character at a time behind a blinking caret bar, then can
// clear it back out. The component (Typewriter.vue) is a thin wrapper; all
// motion lives here so any section can drive it from its own animation handler.
//
// Structure expected per instance: .tw > .tw-text, .tw-caret
import { gsap } from 'gsap';
import { keepFullMotion, prefersReducedMotion } from './miscReducedMotion';

export interface TypewriterOptions {
  // Seconds per character while typing (default 0.06 → ~16 chars/s).
  speed?: number;
  // Seconds to wait before the first character appears.
  delay?: number;
  // Seconds per character while clearing (defaults to half the type speed -
  // deletion always reads faster than typing).
  clearSpeed?: number;
  // Caret blink period in seconds.
  caretBlink?: number;
  // Leave the caret blinking after the line finishes typing (default true).
  holdCaret?: boolean;
}

const DEFAULTS: Required<TypewriterOptions> = {
  speed: 0.06,
  delay: 0,
  clearSpeed: 0.03,
  caretBlink: 0.5,
  holdCaret: true,
};

interface Handle {
  el: HTMLElement;
  textEl: HTMLElement;
  caretEl: HTMLElement;
  full: string;
  reverse: boolean;
  blink: gsap.core.Tween | null;
  tween: gsap.core.Tween | null;
}

function resolve(opts?: TypewriterOptions): Required<TypewriterOptions> {
  return { ...DEFAULTS, ...(opts ?? {}) };
}

// Reveal formula shared by type/clear: `count` visible characters, taken from
// the start (normal) or the end (reverse, so growth reads right-to-left).
function reveal(h: Handle, count: number) {
  h.textEl.textContent = h.reverse ? h.full.slice(h.full.length - count) : h.full.slice(0, count);
}

// Wire an element into a typewriter handle. `full` is the target text; the
// element starts empty with the caret hidden. `reverse` types/clears from the
// end of the string instead of the start, so it reads right-to-left; the
// element needs a fixed width (see Typewriter.vue) so the text has a stable
// right edge to grow from.
export function createTypewriter(el: HTMLElement, full: string, reverse = false): Handle {
  const textEl = el.querySelector<HTMLElement>('.tw-text')!;
  const caretEl = el.querySelector<HTMLElement>('.tw-caret')!;
  textEl.textContent = '';
  gsap.set(caretEl, { opacity: 0 });
  return { el, textEl, caretEl, full, reverse, blink: null, tween: null };
}

function startBlink(h: Handle, period: number) {
  h.blink?.kill();
  gsap.set(h.caretEl, { opacity: 1 });
  // A blink at the collapsed time scale is a strobe; hold the caret solid instead.
  if (prefersReducedMotion.value) { h.blink = null; return; }
  h.blink = gsap.to(h.caretEl, {
    opacity: 0,
    duration: period,
    repeat: -1,
    yoyo: true,
    ease: 'steps(1)',
  });
}

function stopBlink(h: Handle) {
  h.blink?.kill();
  h.blink = null;
}

// Type the line out. Resolves the returned promise once fully typed.
export function playType(h: Handle, opts?: TypewriterOptions): Promise<void> {
  const o = resolve(opts);
  h.tween?.kill();
  startBlink(h, o.caretBlink);
  const state = { i: 0 };
  return new Promise(resolve => {
    // Carved out of reduced motion: the typing IS the content here, and a line that
    // appears fully formed says nothing. See TASKS.md's reduced-motion exceptions.
    h.tween = keepFullMotion(gsap.to(state, {
      i: h.full.length,
      duration: h.full.length * o.speed,
      delay: o.delay,
      ease: `steps(${Math.max(1, h.full.length)})`,
      onUpdate: () => {
        reveal(h, Math.round(state.i));
      },
      onComplete: () => {
        h.textEl.textContent = h.full;
        if (!o.holdCaret) stopBlink(h);
        resolve();
      },
    }));
  });
}

// Clear the line back to empty (used on section leave).
export function playClear(h: Handle, opts?: TypewriterOptions): Promise<void> {
  const o = resolve(opts);
  h.tween?.kill();
  startBlink(h, o.caretBlink);
  const state = { i: h.textEl.textContent?.length ?? h.full.length };
  return new Promise(resolve => {
    // Not carved out of reduced motion the way typing is: the backspace is an exit,
    // and letting it run in real time would leave text on a section already gone.
    h.tween = gsap.to(state, {
      i: 0,
      duration: state.i * o.clearSpeed,
      ease: `steps(${Math.max(1, state.i)})`,
      onUpdate: () => {
        reveal(h, Math.round(state.i));
      },
      onComplete: () => {
        h.textEl.textContent = '';
        stopBlink(h);
        resolve();
      },
    });
  });
}

// Snap to the hidden/empty state with no animation (cold mount / reset).
export function resetTypewriter(h: Handle) {
  h.tween?.kill();
  stopBlink(h);
  h.textEl.textContent = '';
  gsap.set(h.caretEl, { opacity: 0 });
}

export function killTypewriter(h: Handle) {
  h.tween?.kill();
  stopBlink(h);
}
