import { ref, onMounted, onBeforeUnmount } from 'vue'

export const container = ref<HTMLElement>()

let isAnimating: boolean = false
let scrollTimeout: number
let animationId: number
let lastScrollY: number = 0
let userScrolled: boolean = false

const SnapToNearest = () => {
  if (isAnimating && !userScrolled) return

  if (isAnimating && userScrolled) {
    cancelAnimationFrame(animationId)
    isAnimating = false
  }

  const scrollY: number = window.scrollY
  const proximityDistance: number = 400

  const sections = document.querySelectorAll('.app-container > *')

  sections.forEach((section) => {
    const sectionTop = (section as HTMLElement).offsetTop
    const distance = Math.abs(scrollY - sectionTop)

    if (distance < proximityDistance) {
      const start = window.scrollY
      const target = sectionTop
      const duration = 1000
      const startTime = performance.now()

      isAnimating = true
      userScrolled = false

      const AnimateScroll = (currentTime: number) => {
        if (userScrolled) {
          isAnimating = false
          return
        }

        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        const easeInOut = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2

        const current = start + (target - start) * easeInOut
        window.scrollTo(0, current)

        if (progress < 1) {
          animationId = requestAnimationFrame(AnimateScroll)
        } else {
          isAnimating = false
        }
      }

      animationId = requestAnimationFrame(AnimateScroll)
    }
  })
}

export function InitializeScrollSnap() {
   const handleScroll = () => {
   const currentScrollY = window.scrollY
   
   if (Math.abs(currentScrollY - lastScrollY) > 10) {
     userScrolled = true
   }
   
   lastScrollY = currentScrollY
   
   if (isAnimating && !userScrolled) return

   clearTimeout(scrollTimeout)
   scrollTimeout = setTimeout(() => {
     userScrolled = false 
     SnapToNearest()
   }, 400)
   }

   onMounted(() => {
   lastScrollY = window.scrollY
   window.addEventListener('scroll', handleScroll)
   })

   onBeforeUnmount(() => {
   window.removeEventListener('scroll', handleScroll)
   clearTimeout(scrollTimeout)
   if (animationId) {
     cancelAnimationFrame(animationId)
   }
   })
}

