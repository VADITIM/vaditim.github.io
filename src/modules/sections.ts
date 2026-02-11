import { ref, watch } from 'vue'

export const currentSection = ref(0)
export const previousSection = ref(0)
export const sectionDirection = ref<'forward' | 'backward' | 'none'>('none')
export const isTransitioning = ref(false)

// State change callbacks
type SectionChangeCallback = (current: number, previous: number, direction: 'forward' | 'backward' | 'none') => void
const sectionChangeCallbacks: SectionChangeCallback[] = []

export function onSectionChange(callback: SectionChangeCallback) {
  sectionChangeCallbacks.push(callback)
  return () => {
    const index = sectionChangeCallbacks.indexOf(callback)
    if (index > -1) sectionChangeCallbacks.splice(index, 1)
  }
}

function notifySectionChange(current: number, previous: number, direction: 'forward' | 'backward' | 'none') {
  sectionChangeCallbacks.forEach(callback => callback(current, previous, direction))
}

function updateCurrentSection() {
  const scrollY = window.scrollY
  const viewportHeight = window.innerHeight
  const sectionHeight = viewportHeight 
  
  const currentSectionIndex = Math.floor(scrollY / sectionHeight)
  const progressInSection = (scrollY % sectionHeight) / sectionHeight
  
  let newSection = currentSectionIndex
  if (progressInSection >= 0.6 && currentSectionIndex < 2) {
    newSection = currentSectionIndex + 1
  }
  
  if (newSection !== currentSection.value) {
    isTransitioning.value = true
    previousSection.value = currentSection.value
    
    // Determine direction
    if (newSection > currentSection.value) {
      sectionDirection.value = 'forward'
    } else if (newSection < currentSection.value) {
      sectionDirection.value = 'backward'
    } else {
      sectionDirection.value = 'none'
    }
    
    currentSection.value = newSection
    
    // Notify subscribers
    notifySectionChange(currentSection.value, previousSection.value, sectionDirection.value)
    
    // Reset transitioning flag after a short delay
    setTimeout(() => {
      isTransitioning.value = false
    }, 100)
  }
  
  console.log(currentSection.value)
}

export function scrollToSection(sectionIndex: number) {
  const viewportHeight = window.innerHeight
  const targetScroll = sectionIndex * viewportHeight
  
  window.scrollTo({
    top: targetScroll,
    behavior: 'smooth'
  })
}

export function initSectionTracking() {
  updateCurrentSection()
  
  window.addEventListener('scroll', updateCurrentSection)
}

export function cleanupSectionTracking() {
  window.removeEventListener('scroll', updateCurrentSection)
}
