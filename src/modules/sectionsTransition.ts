import { gsap } from 'gsap'
import { onSectionStatesChange, type SectionTransitionMeta } from '@modules/sectionsStateMachine'
import { SECTIONS } from '@modules/sectionsRegistry'
import { prefersReducedMotion } from '@modules/miscReducedMotion'

/**
 * Section-swap "Section Cut" transition.
 *
 * Adapted from the Claude design's "02 · Section Cut". A stack of horizontal bars
 * sweeps closed (scaleX 0 -> 1, alternating origins) to mask the moment the
 * outgoing section is swapped for the incoming one; while the curtain is closed
 * the incoming section's kicker + name flash on it, then the bars sweep open to
 * reveal the now-settled section.
 *
 * This is purely an overlay; it does NOT drive section state. The existing
 * per-section enter/leave animations still run underneath; the cut is appended
 * *in between* them. Leave fires at t=0, the curtain is fully closed ~0.42-0.9s
 * (so the swap is masked), and the incoming section's enter waits for ENTER_DELAY
 * (0.5s), settling behind the curtain before it opens.
 */

const SHUTTER_SELECTOR = '.section-transition-shutter'
const KICKER_SELECTOR = '.section-transition-kicker'
const HEADING_SELECTOR = '.section-transition-heading'

/** Returns true if the hex colour is perceptually light (luminance > 0.5). */
function isLightColor(hex: string): boolean {
  const red = parseInt(hex.slice(1, 3), 16)
  const green = parseInt(hex.slice(3, 5), 16)
  const blue = parseInt(hex.slice(5, 7), 16)
  return (red * 0.299 + green * 0.587 + blue * 0.114) / 255 > 0.5
}

/** Blend a hex colour toward grey by `amount` (0 = original, 1 = full grey). */
function desaturate(hex: string, amount: number): string {
  const red = parseInt(hex.slice(1, 3), 16)
  const green = parseInt(hex.slice(3, 5), 16)
  const blue = parseInt(hex.slice(5, 7), 16)
  const grey = red * 0.299 + green * 0.587 + blue * 0.114
  const greyedRed = Math.round(red + (grey - red) * amount)
  const greyedGreen = Math.round(green + (grey - green) * amount)
  const greyedBlue = Math.round(blue + (grey - blue) * amount)
  return `#${greyedRed.toString(16).padStart(2, '0')}${greyedGreen.toString(16).padStart(2, '0')}${greyedBlue.toString(16).padStart(2, '0')}`
}

/**
 * Curtain phase timing; mirrors the tween positions in `play()` and the
 * `BAR_COUNT` in `Section-Transition.vue`. Kept here so `SECTION_ENTER_DELAY`
 * below stays exact if the curtain choreography is retuned.
 */
const BAR_COUNT = 6
const CLOSE_DURATION = 0.42
const OPEN_AT = 0.92
const OPEN_DURATION = 0.5

/**
 * Bars stagger by a random offset in [0, MAX_BAR_STAGGER] rather than a fixed
 * cadence, so each close/open sweep lands in a different, organic order. Worst
 * case (a bar drawing the full offset) is used for the duration/gate maths below.
 */
const MAX_BAR_STAGGER = 0.3

/**
 * Minimum spacing between any two bars' start times. Without this, two random
 * offsets can land within a few ms of each other and the bars read as moving in
 * lockstep; defeating the point of randomising. We reject candidates that fall
 * within MIN_BAR_GAP of an already-chosen offset.
 */
const MIN_BAR_GAP = 0.045

/**
 * Build one set of per-bar start offsets: BAR_COUNT random values in
 * [0, MAX_BAR_STAGGER], each at least MIN_BAR_GAP from every other. The result
 * is in element order (not sorted), so the sweep direction is randomised too.
 */
function makeBarStaggers(): number[] {
  const offsets: number[] = []
  let guard = 0
  while (offsets.length < BAR_COUNT && guard++ < 1000) {
    const candidate = Math.random() * MAX_BAR_STAGGER
    if (offsets.every((offset) => Math.abs(offset - candidate) >= MIN_BAR_GAP)) {
      offsets.push(candidate)
    }
  }
  // Fallback (should never trigger): pad with evenly spaced values.
  while (offsets.length < BAR_COUNT) offsets.push(offsets.length * MIN_BAR_GAP)
  return offsets
}

/**
 * Total duration of the curtain timeline (last bar finishes opening). This is how
 * long a section-to-section transition takes from the hook to the fully-revealed
 * empty section.
 */
export const SECTION_CUT_DURATION =
  OPEN_AT + OPEN_DURATION + MAX_BAR_STAGGER

/**
 * The single source of truth for when a section's enter animation may begin.
 *
 * The section-cut is a *sequencing gate*, not an overlap: leave animations fire
 * immediately at the hook (and finish while the curtain is shut), the curtain
 * plays its full close → hold → open cycle, and only once it has completely
 * finished; revealing the now-empty incoming section; do that section's enter
 * reveals start. Every enter handler reads this (live) at the moment it fires;
 * leave handlers never use it.
 *
 * It is `0` until the first real navigation, because the initial section is
 * revealed on cold mount with no curtain in play; gating it would leave the
 * first section blank for a full curtain's length. `activateSectionEnterGate()`
 * (called from `ChangeSection`) raises it once the user actually navigates.
 *
 * The gate is a fixed `SECTION_ENTER_GATE` (1.4s) rather than the worst-case
 * `SECTION_CUT_DURATION` (1.72s). The bars' random staggers mean the curtain
 * usually finishes opening well before its worst case, so 1.4s lands after the
 * bulk of the sweep has cleared without leaving a long dead gap. Every section's
 * enter animations fire together at this one instant; not too early (mid-sweep),
 * not too late (staring at an empty section).
 */
const SECTION_ENTER_GATE = 1.4

export let SECTION_ENTER_DELAY = 0

export function activateSectionEnterGate() {
  SECTION_ENTER_DELAY = SECTION_ENTER_GATE
}

let activeTimeline: gsap.core.Timeline | null = null

function play(meta: SectionTransitionMeta) {
  // The handoff out of the loading page comes in as previous === -1 (no real
  // outgoing section). Don't play the curtain there; the loading exit already
  // covers that moment; the first section should just appear.
  if (meta.previous === -1) return

  // Reduced motion drops the curtain entirely rather than sweeping it at the
  // collapsed time scale — six bars flashing across the screen in one frame is
  // the exact strobe the preference exists to avoid.
  if (prefersReducedMotion.value) return

  const shutters = gsap.utils.toArray<HTMLElement>(SHUTTER_SELECTOR)
  if (shutters.length === 0) return

  const kicker = document.querySelector<HTMLElement>(KICKER_SELECTOR)
  const heading = document.querySelector<HTMLElement>(HEADING_SELECTOR)

  const section = SECTIONS[meta.current]
  const label = section?.label ?? ''
  const kickerText = `SECTION ${String(meta.current + 1).padStart(2, '0')}`
  const accent = section?.color ?? '#ffffff'

  // Desaturated variant of the accent colour for alternating bars.
  const accentMuted = desaturate(accent, 0.45)

  // Text colour flips so it's always readable against the bar behind it.
  const textColorOnAccent = isLightColor(accent) ? '#000000' : '#ffffff'
  const textColorOnMuted = isLightColor(accentMuted) ? '#000000' : '#ffffff'

  if (activeTimeline) activeTimeline.kill()
  gsap.killTweensOf([...shutters, kicker, heading])
  gsap.set(shutters, { scaleX: 0 })
  shutters.forEach((shutter, index) => {
    const barColor = index % 2 === 0 ? accent : accentMuted
    gsap.set(shutter, { backgroundColor: barColor, borderColor: barColor })
  })
  gsap.set([kicker, heading], { opacity: 0 })

  // Middle bar index; the label sits over whatever bar is at screen centre.
  const midBarIndex = Math.floor(BAR_COUNT / 2)
  const midBarColor = midBarIndex % 2 === 0 ? accent : accentMuted
  const labelColor = midBarColor === accent ? textColorOnAccent : textColorOnMuted

  // The heading is outlined in the opposing text colour (black fill → white
  // stroke and vice-versa) so its edges stay crisp against the bar behind it.
  const labelOutlineColor = labelColor === '#ffffff' ? '#000000' : '#ffffff'

  if (heading) heading.textContent = label
  if (kicker) kicker.textContent = kickerText

  const timeline = gsap.timeline({
    onComplete: () => {
      gsap.set(shutters, { scaleX: 0 })
      gsap.set([kicker, heading], { opacity: 0 })
      activeTimeline = null
    },
  })

  // Close; sweep the bars across the screen to fully cover the swap.
  const closeStaggers = makeBarStaggers()
  timeline.to(shutters, { scaleX: 1, duration: CLOSE_DURATION, stagger: (index) => closeStaggers[index], ease: 'power3.in' }, 0)

  // Flash the incoming section's name on the closed curtain.
  if (kicker) {
    gsap.set(kicker, { yPercent: 110, skewY: 3, opacity: 1, color: labelColor })
    timeline.to(kicker, { yPercent: 0, skewY: 0, duration: 0.45, ease: 'expo.out' }, 0.44)
  }
  if (heading) {
    gsap.set(heading, { yPercent: 115, skewY: 5, color: labelColor, webkitTextStroke: `1px ${labelOutlineColor}` })
    timeline.to(heading, { opacity: 1, yPercent: 0, skewY: 0, duration: 0.5, ease: 'expo.out' }, 0.52)
  }

  // Clear the label and open the bars together, revealing the empty section.
  if (heading) timeline.to(heading, { opacity: 0, yPercent: -60, duration: 0.4, ease: 'power3.in' }, 0.9)
  if (kicker) timeline.to(kicker, { yPercent: -110, skewY: -2, duration: 0.3, ease: 'power3.in' }, 0.88)
  const openStaggers = makeBarStaggers()
  timeline.to(shutters, { scaleX: 0, duration: OPEN_DURATION, stagger: (index) => openStaggers[index], ease: 'power3.out' }, OPEN_AT)

  activeTimeline = timeline
}

/**
 * Subscribe the cut to every section change. Returns a cleanup function.
 */
export function RegisterSectionTransition() {
  const stop = onSectionStatesChange((meta) => {
    play(meta)
  })

  return () => {
    stop()
    if (activeTimeline) {
      activeTimeline.kill()
      activeTimeline = null
    }
  }
}
