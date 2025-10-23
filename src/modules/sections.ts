import { ref } from 'vue'

export const currentSection = ref(0)

function updateCurrentSection() {
  const scrollY = window.scrollY
  const viewportHeight = window.innerHeight
  const sectionHeight = viewportHeight 
  
  const currentSectionIndex = Math.floor(scrollY / sectionHeight)
  const progressInSection = (scrollY % sectionHeight) / sectionHeight
  
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
  updateCurrentSection()
  
  window.addEventListener('scroll', updateCurrentSection)
}

export function cleanupSectionTracking() {
  window.removeEventListener('scroll', updateCurrentSection)
}
