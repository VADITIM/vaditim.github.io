import { ref } from 'vue'
import {
  getVirtualSectionHeightPx,
  lockVirtualScrollForSectionTransition,
  releaseVirtualScrollAfterSectionTransition,
  syncVirtualScrollToSection,
} from './miscVirtualScroll'
import { isVertical } from './miscIsVertical'
import { navigationLockRef, setNavigationLock } from './miscNavigationLock'
import { activateSectionEnterGate } from './sectionsTransition'
import { isSectionLocked } from './sectionLookup'

let totalSections = 3;
export function setSectionCount(count: number) { totalSections = count; }

// Must cover the full section-cut curtain (~1.67s, see SECTION_ENTER_DELAY in
// section-transition.ts) so a new navigation can't pre-empt the curtain before
// the incoming section's gated enter animations have started.
const SECTION_TRANSITION_LOCK_MS = 1800
let transitionLockTimer: number | null = null

const LockTransition = () => {
  if (transitionLockTimer !== null) return

  isTransitioning.value = true
  setNavigationLock(true, 'section-transition')
  lockVirtualScrollForSectionTransition()
  transitionLockTimer = window.setTimeout(() => {
    isTransitioning.value = false
    setNavigationLock(false, 'section-transition')
    transitionLockTimer = null
    // Release after the navigation lock clears so the scroll layer can
    // realign to the settled section and finish its motion.
    releaseVirtualScrollAfterSectionTransition(currentSection.value)
  }, SECTION_TRANSITION_LOCK_MS)
}

type SectionChangeCallback = (current: number, previous: number, direction: 'forward' | 'backward' | 'none') => void
const sectionChangeCallbacks: SectionChangeCallback[] = []

export const currentSection = ref(0)
export const previousSection = ref(0)
export const sectionDirection = ref<'forward' | 'backward' | 'none'>('none')
export const isTransitioning = ref(false)

export function resetSectionStateToPerks() {
  currentSection.value = 0
  previousSection.value = 0
  sectionDirection.value = 'none'
  isTransitioning.value = false
  setNavigationLock(false, 'section-transition')

  if (transitionLockTimer !== null) {
    window.clearTimeout(transitionLockTimer)
    transitionLockTimer = null
  }

  releaseVirtualScrollAfterSectionTransition(0)
}


export function onSectionChange(callback: SectionChangeCallback) {
  sectionChangeCallbacks.push(callback)
  return () => {
    const index = sectionChangeCallbacks.indexOf(callback)
    if (index > -1) sectionChangeCallbacks.splice(index, 1)
  }
}


export function ChangeSection(current: number, previous: number, direction: 'forward' | 'backward' | 'none' = 'none') {
  // First real navigation between two sections: switch enter animations from
  // immediate (cold-mount / loading handoff) to gated-behind-the-curtain. The
  // loading handoff comes in as previous === -1 and plays no curtain, so it must
  // stay immediate.
  if (previous >= 0) activateSectionEnterGate()

  previousSection.value = previous
  currentSection.value = current
  sectionDirection.value = direction
  NotifyChange(current, previous, direction)
}

function NotifyChange(current: number, previous: number, direction: 'forward' | 'backward' | 'none') {
  sectionChangeCallbacks.forEach(callback => callback(current, previous, direction))
}
function UpdateSection() {
  if (isTransitioning.value || navigationLockRef.value) return

  const scrollY = window.scrollY
  const sectionHeight = getVirtualSectionHeightPx()
  
  const currentSectionIndex = Math.floor(scrollY / sectionHeight)
  const progressInSection = (scrollY % sectionHeight) / sectionHeight
  
  let newSection = currentSectionIndex
  if (progressInSection >= 0.6 && currentSectionIndex < totalSections - 1 && !isSectionLocked(currentSectionIndex + 1)) {
    newSection = currentSectionIndex + 1
  }

  // Scroll-driven changes may never skip sections, no matter how far the
  // scroll position lands — clamp to one step from the current section.
  newSection = Math.min(
    Math.max(newSection, currentSection.value - 1),
    currentSection.value + 1
  )

  if (newSection !== currentSection.value) {
    LockTransition()

    const previous = currentSection.value
    const direction: 'forward' | 'backward' | 'none' =
      newSection > previous ? 'forward' : newSection < previous ? 'backward' : 'none'

    ChangeSection(newSection, previous, direction)
  }
  
}

export function ChangeToSectionID(sectionIndex: number) {
  if (sectionIndex === currentSection.value) return
  if (sectionIndex < 0 || sectionIndex >= totalSections) return
  if (isSectionLocked(sectionIndex)) return
  if (navigationLockRef.value) return

  // Keep the current transition; ignore new ones.
  if (isTransitioning.value) return

  LockTransition()

  const previous = currentSection.value
  const direction: 'forward' | 'backward' | 'none' =
    sectionIndex > previous ? 'forward' : sectionIndex < previous ? 'backward' : 'none'

  ChangeSection(sectionIndex, previous, direction)

  if (!isVertical.value) {
    const sectionHeight = getVirtualSectionHeightPx()
    const targetScroll = sectionIndex * sectionHeight
    window.scrollTo({ top: targetScroll, behavior: 'auto' })
    // The jump bypasses the stroke system; keep the scroll layer's section
    // tracker and target aligned so the next stroke steps from here.
    syncVirtualScrollToSection(sectionIndex)
  }

}

export function InitializeSectionTracking() {
  UpdateSection()

  if (isVertical.value) return

  window.addEventListener('scroll', UpdateSection, { passive: true })
}

export function cleanupSectionTracking() {
  window.removeEventListener('scroll', UpdateSection)
}
