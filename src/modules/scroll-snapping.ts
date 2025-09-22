import { ref, onMounted, onBeforeUnmount } from 'vue'

export const container = ref<HTMLElement>()

let isAnimating: boolean = false
let scrollTimeout: number

const SnapToNearest = () => {
  if (isAnimating) return

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

      const AnimateScroll = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        const easeInOut = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2

        const current = start + (target - start) * easeInOut
        window.scrollTo(0, current)

        if (progress < 1) {
          requestAnimationFrame(AnimateScroll)
        } else {
          isAnimating = false
        }
      }

      requestAnimationFrame(AnimateScroll)
    }
  })
}

export function InitializeScrollSnap() {
   const handleScroll = () => {
   if (isAnimating) return

   clearTimeout(scrollTimeout)
   scrollTimeout = setTimeout(SnapToNearest, 400)
   }

   onMounted(() => {
   window.addEventListener('scroll', handleScroll)
   })

   onBeforeUnmount(() => {
   window.removeEventListener('scroll', handleScroll)
   clearTimeout(scrollTimeout)
   })
}

