import { ref } from 'vue'
import { getVirtualSectionHeightPx } from '../Misc/virtual-scroll'
import { isMobile } from '../Misc/is-mobile'
import { navigationLockRef, setNavigationLock } from '../Misc/navigation-lock'

const SECTION_TRANSITION_LOCK_MS = 1000
let transitionLockTimer: number | null = null

const LockTransition = () => {
  if (transitionLockTimer !== null) return

  isTransitioning.value = true
  setNavigationLock(true, 'section-transition')
  transitionLockTimer = window.setTimeout(() => {
    isTransitioning.value = false
    setNavigationLock(false, 'section-transition')
    transitionLockTimer = null
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
}


export function onSectionChange(callback: SectionChangeCallback) {
  sectionChangeCallbacks.push(callback)
  return () => {
    const index = sectionChangeCallbacks.indexOf(callback)
    if (index > -1) sectionChangeCallbacks.splice(index, 1)
  }
}


export function ChangeSection(current: number, previous: number, direction: 'forward' | 'backward' | 'none' = 'none') {
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
  if (progressInSection >= 0.6 && currentSectionIndex < 2) {
    newSection = currentSectionIndex + 1
  }
  
  if (newSection !== currentSection.value) {
    LockTransition()

    const previous = currentSection.value
    const direction: 'forward' | 'backward' | 'none' =
      newSection > previous ? 'forward' : newSection < previous ? 'backward' : 'none'

    ChangeSection(newSection, previous, direction)
  }
  
  console.log(currentSection.value)
}

export function ChangeToSectionID(sectionIndex: number) {
  if (sectionIndex === currentSection.value) return
  if (sectionIndex < 0 || sectionIndex > 2) return
  if (navigationLockRef.value) return

  // Keep the current transition; ignore new ones.
  if (isTransitioning.value) return

  LockTransition()

  const previous = currentSection.value
  const direction: 'forward' | 'backward' | 'none' =
    sectionIndex > previous ? 'forward' : sectionIndex < previous ? 'backward' : 'none'

  ChangeSection(sectionIndex, previous, direction)

  if (!isMobile.value) {
    const sectionHeight = getVirtualSectionHeightPx()
    const targetScroll = sectionIndex * sectionHeight
    window.scrollTo({ top: targetScroll, behavior: 'auto' })
  }

}

export function InitializeSectionTracking() {
  UpdateSection()

  if (isMobile.value) return

  window.addEventListener('scroll', UpdateSection, { passive: true })
}

export function cleanupSectionTracking() {
  window.removeEventListener('scroll', UpdateSection)
}
