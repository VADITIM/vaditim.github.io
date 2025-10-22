import { ref } from 'vue'

// Track current section (0 = intro, 1 = info, 2 = work)
export const currentSection = ref(0)

function updateCurrentSection() {
  const scrollY = window.scrollY
  const viewportHeight = window.innerHeight
  const sectionHeight = viewportHeight // 100vh per section
  
  // Calculate progress through current section (0 to 1)
  const currentSectionIndex = Math.floor(scrollY / sectionHeight)
  const progressInSection = (scrollY % sectionHeight) / sectionHeight
  
  // Switch to next section when 60% through current section
  if (progressInSection >= 0.6 && currentSectionIndex < 2) {
    currentSection.value = currentSectionIndex + 1
  } else {
    currentSection.value = currentSectionIndex
  }
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
  // Initial check
  updateCurrentSection()
  
  // Listen to scroll events
  window.addEventListener('scroll', updateCurrentSection)
}

export function cleanupSectionTracking() {
  window.removeEventListener('scroll', updateCurrentSection)
}
