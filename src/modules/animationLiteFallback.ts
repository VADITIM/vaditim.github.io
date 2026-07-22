/**
 * The single definition of lite-mode motion (see `miscAnimationMode`). Nothing
 * else in the app may pick a lite duration, ease or delay: components choose
 * *which* elements fall back, this module decides how they move.
 *
 * The pair is the hardware-notice / sandbox window reveal, stripped to what a
 * software rasteriser can afford. Leave is the exact reverse of enter, so
 * registering an element with `playLiteEnter` and `playLiteLeave` satisfies the
 * enter/leave pairing rule by construction — see `.claude/rules/animations.md`.
 */

import { gsap } from 'gsap'

import { SECTION_ENTER_DELAY } from './sectionsTransition'

const ENTER_DURATION = 0.42
const LEAVE_DURATION = 0.24
const ENTER_STAGGER = 0.05

/**
 * How long an incoming section waits before anything of it moves. It is the
 * leave duration plus a gap, so the outgoing section is fully gone first: lite
 * mode has no curtain to hide an overlap, and two sections animating against
 * each other is both the ugliest and the most expensive frame on the page.
 * `sectionsTransition` publishes it as `SECTION_ENTER_DELAY`.
 */
export const LITE_ENTER_GATE = LEAVE_DURATION + 0.12

/**
 * Opacity plus a short 2D offset, nothing else. No scale (it redraws the element
 * at a new size every frame) and no 3D promotion (`force3D` below), because
 * without hardware acceleration a composited layer is a cost, not a saving.
 */
const HIDDEN_STATE = { opacity: 0, y: 18 }
const VISIBLE_STATE = { opacity: 1, y: 0 }

const LABEL_TEXT_SELECTOR = '.pc-label-text'
const LABEL_BAR_SELECTOR = '.pc-label-bar'

type LiteTarget = HTMLElement | null | undefined

function resolveTargets(targets: LiteTarget[]): HTMLElement[] {
  return targets.filter((target): target is HTMLElement => Boolean(target))
}

export function playLiteEnter(targets: LiteTarget[]): void {
  const elements = resolveTargets(targets)
  if (!elements.length) return
  gsap.killTweensOf(elements)
  gsap.fromTo(elements, HIDDEN_STATE, {
    ...VISIBLE_STATE,
    duration: ENTER_DURATION,
    stagger: ENTER_STAGGER,
    ease: 'power2.out',
    delay: SECTION_ENTER_DELAY,
    force3D: false,
    overwrite: 'auto',
  })
}

/** No delay and no stagger: the section clears as one, within the enter gate. */
export function playLiteLeave(targets: LiteTarget[]): void {
  const elements = resolveTargets(targets)
  if (!elements.length) return
  gsap.killTweensOf(elements)
  gsap.to(elements, {
    ...HIDDEN_STATE,
    duration: LEAVE_DURATION,
    ease: 'power2.in',
    force3D: false,
    overwrite: 'auto',
  })
}

/**
 * The bar sweep animates a clip-path and a scaling bar per label on a positional
 * stagger that trails up to ~2.4s behind the swap — the priciest paint on the
 * page unaccelerated, and still running when the next section enters. Lite shows
 * the text outright and gives the label the same reveal as everything else.
 */
function showLabelTextInstantly(labels: HTMLElement[]): void {
  labels.forEach((label) => {
    gsap.set(label.querySelector(LABEL_TEXT_SELECTOR), { clipPath: 'inset(0 0% 0 0)' })
    gsap.set(label.querySelector(LABEL_BAR_SELECTOR), { opacity: 0 })
  })
}

export function hideLiteLabels(labels: HTMLElement[]): void {
  showLabelTextInstantly(labels)
  gsap.set(labels, HIDDEN_STATE)
}

export function playLiteLabelEnter(labels: HTMLElement[]): void {
  showLabelTextInstantly(labels)
  playLiteEnter(labels)
}

export function playLiteLabelLeave(labels: HTMLElement[]): void {
  playLiteLeave(labels)
}
