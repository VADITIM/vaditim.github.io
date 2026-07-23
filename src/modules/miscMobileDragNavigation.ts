import { ref } from 'vue'
import { currentSection, ChangeToSectionID } from '@modules/sectionsCore'
import { navigationLockRef } from '@modules/miscNavigationLock'
import { SECTIONS } from '@modules/sectionsRegistry'
import { isSectionLocked } from '@modules/sectionLookup'

// A step is valid only to an in-range, unlocked section — mirrors ChangeToSectionID
// so a locked entry (e.g. Classified before unlock) is never stepped into.
const canStepTo = (index: number) =>
  index >= 0 && index < SECTIONS.length && !isSectionLocked(index)

let DRAG_THRESHOLD = window.innerHeight * 0.3;

const VibrateThreshold = () => {
  if (typeof navigator === 'undefined') return
  if (!('vibrate' in navigator)) return
  navigator.vibrate(20)
}

let touchStartY = 0
let touchStartX = 0
let dragOffset = ref(0)
let dragOffsetX = ref(0)
let isDragging = ref(false)
let dragDirection = ref<'up' | 'down' | null>(null)
let thresholdReached = ref(false)
let lastDragOffsetY = ref(0)

export function InitializeMobileDragNavigation() {
  window.addEventListener('touchstart', HandleTouchStart, { passive: true })
  window.addEventListener('touchmove', HandleTouchMove, { passive: false })
  window.addEventListener('touchend', HandleTouchEnd, { passive: true })
}

export function CleanupMobileDragNavigation() {
  window.removeEventListener('touchstart', HandleTouchStart)
  window.removeEventListener('touchmove', HandleTouchMove)
  window.removeEventListener('touchend', HandleTouchEnd)
}

function HandleTouchStart(Event: TouchEvent) {
  touchStartY = Event.touches[0].clientY
  touchStartX = Event.touches[0].clientX
  isDragging.value = true
  dragOffset.value = 0
  dragOffsetX.value = 0
  dragDirection.value = null
}

function HandleTouchMove(Event: TouchEvent) {
  if (!isDragging.value) return

  Event.preventDefault()
  
  if (navigationLockRef.value) return
  
  const currentY = Event.touches[0].clientY
  const currentX = Event.touches[0].clientX
  const deltaY = touchStartY - currentY
  const deltaX = currentX - touchStartX
  const canDragUp = canStepTo(currentSection.value + 1)
  const canDragDown = canStepTo(currentSection.value - 1)
  let offset = deltaY

  // Only a predominantly-vertical swipe counts as section intent; a horizontal
  // one is left for in-section paging (e.g. Projects swipes between projects).
  if (Math.abs(deltaY) > 5 && Math.abs(deltaY) >= Math.abs(deltaX)) {
    dragDirection.value = deltaY > 0 ? 'down' : 'up'
  }

  if (dragDirection.value === 'down' && !canDragUp) offset = 0
  if (dragDirection.value === 'up' && !canDragDown) offset = 0
  
  dragOffset.value = Math.abs(offset)
  dragOffsetX.value = deltaX
  
  if (dragOffset.value >= DRAG_THRESHOLD && !thresholdReached.value) {
    thresholdReached.value = true
    VibrateThreshold()
  } else if (dragOffset.value < DRAG_THRESHOLD && thresholdReached.value) {
    thresholdReached.value = false
  }
}

function HandleTouchEnd() {
  if (!isDragging.value) return

  const hasDrag = dragOffset.value > 0 && dragDirection.value
  const rawOffset = hasDrag ? dragOffset.value * 0.5 : 0
  const popYTransform = thresholdReached.value ? -10 : 0
  
  if (dragOffset.value >= DRAG_THRESHOLD && dragDirection.value) {
    const targetSection = dragDirection.value === 'down' ? currentSection.value + 1 : currentSection.value - 1

    if (canStepTo(targetSection)) {
      lastDragOffsetY.value = (dragDirection.value === 'down' ? -rawOffset : rawOffset) + popYTransform
      markTransitionAsDragged(true)
      ChangeToSectionID(targetSection)
    }
  } else if (hasDrag) {
    lastDragOffsetY.value = (dragDirection.value === 'down' ? -rawOffset : rawOffset) + popYTransform
  }
  
  isDragging.value = false
  dragOffset.value = 0
  dragOffsetX.value = 0
  dragDirection.value = null
  thresholdReached.value = false
}

export function consumeLastDragOffsetY() {
  const value = lastDragOffsetY.value
  lastDragOffsetY.value = 0
  return value
}

let wasLastTransitionDragged = false

export function markTransitionAsDragged(isDragged: boolean) {
  wasLastTransitionDragged = isDragged
}

export function wasTransitionDragged() {
  const value = wasLastTransitionDragged
  wasLastTransitionDragged = false
  return value
}

export { dragOffset, isDragging, dragDirection, dragOffsetX, thresholdReached }
