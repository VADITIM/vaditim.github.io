import { ref } from 'vue'
import { gsap } from 'gsap'

export const roles = [
  'Frontend Developer',
  'UI Designer',
  'Vue Specialist'
]

export const skillRefs = ref<(HTMLElement | null)[]>([])
export function expandSkill(index: number) {
  const el = skillRefs.value[index]
  if (!el) return
  gsap.to(el, {
    width: '150%',
    duration: 0.3,
    ease: 'power1.inOut',
    onComplete: () => {
      gsap.to(el, {
        height: '10rem',
        duration: 0.3,
        ease: 'power1.inOut'
      })
    }
  })
}

export function shrinkSkill(index: number) {
  const el = skillRefs.value[index]
  if (!el) return
  gsap.to(el, {
    height: '3rem',
    duration: 0.3,
    ease: 'power1.inOut',
    onComplete: () => {
      gsap.to(el, {
        width: '120%',
        duration: 0.3,
        ease: 'power1.inOut'
      })
    }
  })
}