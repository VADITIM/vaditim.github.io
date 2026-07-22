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
  element: HTMLElement;
  textElement: HTMLElement;
  caretElement: HTMLElement;
  full: string;
  reverse: boolean;
  blink: gsap.core.Tween | null;
  tween: gsap.core.Tween | null;
}

function resolve(options?: TypewriterOptions): Required<TypewriterOptions> {
  return { ...DEFAULTS, ...(options ?? {}) };
}

// Reveal formula shared by type/clear: `count` visible characters, taken from
// the start (normal) or the end (reverse, so growth reads right-to-left).
function reveal(handle: Handle, count: number) {
  handle.textElement.textContent = handle.reverse ? handle.full.slice(handle.full.length - count) : handle.full.slice(0, count);
}

// Wire an element into a typewriter handle. `full` is the target text; the
// element starts empty with the caret hidden. `reverse` types/clears from the
// end of the string instead of the start, so it reads right-to-left; the
// element needs a fixed width (see Typewriter.vue) so the text has a stable
// right edge to grow from.
export function createTypewriter(element: HTMLElement, full: string, reverse = false): Handle {
  const textElement = element.querySelector<HTMLElement>('.tw-text')!;
  const caretElement = element.querySelector<HTMLElement>('.tw-caret')!;
  textElement.textContent = '';
  gsap.set(caretElement, { opacity: 0 });
  return { element, textElement, caretElement, full, reverse, blink: null, tween: null };
}

function startBlink(handle: Handle, period: number) {
  handle.blink?.kill();
  gsap.set(handle.caretElement, { opacity: 1 });
  // A blink at the collapsed time scale is a strobe; hold the caret solid instead.
  if (prefersReducedMotion.value) { handle.blink = null; return; }
  handle.blink = gsap.to(handle.caretElement, {
    opacity: 0,
    duration: period,
    repeat: -1,
    yoyo: true,
    ease: 'steps(1)',
  });
}

function stopBlink(handle: Handle) {
  handle.blink?.kill();
  handle.blink = null;
}

// Type the line out. Resolves the returned promise once fully typed.
export function playType(handle: Handle, options?: TypewriterOptions): Promise<void> {
  const resolvedOptions = resolve(options);
  handle.tween?.kill();
  startBlink(handle, resolvedOptions.caretBlink);
  const state = { visibleCount: 0 };
  return new Promise(resolve => {
    // Carved out of reduced motion: the typing IS the content here, and a line that
    // appears fully formed says nothing. See TASKS.md's reduced-motion exceptions.
    handle.tween = keepFullMotion(gsap.to(state, {
      visibleCount: handle.full.length,
      duration: handle.full.length * resolvedOptions.speed,
      delay: resolvedOptions.delay,
      ease: `steps(${Math.max(1, handle.full.length)})`,
      onUpdate: () => {
        reveal(handle, Math.round(state.visibleCount));
      },
      onComplete: () => {
        handle.textElement.textContent = handle.full;
        if (!resolvedOptions.holdCaret) stopBlink(handle);
        resolve();
      },
    }));
  });
}

// Clear the line back to empty (used on section leave).
export function playClear(handle: Handle, options?: TypewriterOptions): Promise<void> {
  const resolvedOptions = resolve(options);
  handle.tween?.kill();
  startBlink(handle, resolvedOptions.caretBlink);
  const state = { visibleCount: handle.textElement.textContent?.length ?? handle.full.length };
  return new Promise(resolve => {
    // Not carved out of reduced motion the way typing is: the backspace is an exit,
    // and letting it run in real time would leave text on a section already gone.
    handle.tween = gsap.to(state, {
      visibleCount: 0,
      duration: state.visibleCount * resolvedOptions.clearSpeed,
      ease: `steps(${Math.max(1, state.visibleCount)})`,
      onUpdate: () => {
        reveal(handle, Math.round(state.visibleCount));
      },
      onComplete: () => {
        handle.textElement.textContent = '';
        stopBlink(handle);
        resolve();
      },
    });
  });
}

// Snap to the hidden/empty state with no animation (cold mount / reset).
export function resetTypewriter(handle: Handle) {
  handle.tween?.kill();
  stopBlink(handle);
  handle.textElement.textContent = '';
  gsap.set(handle.caretElement, { opacity: 0 });
}

export function killTypewriter(handle: Handle) {
  handle.tween?.kill();
  stopBlink(handle);
}
