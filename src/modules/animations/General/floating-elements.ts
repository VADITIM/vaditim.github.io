import { gsap } from 'gsap'
import { currentSection } from '@modules/sections'
import { onSectionStatesChange, type SectionIndex } from '../section-state-machine'

gsap.defaults({ immediateRender: false })

export function createFloatingAnimation(selector: string, options: {
  amplitude?: number,
  duration?: number,
  delay?: number,
  section?: SectionIndex
} = {}) {
  const {
    amplitude = 20, 
    duration = 3,   
    delay = 0,
    section,
  } = options

  const elements = gsap.utils.toArray(selector)
  const tweens: gsap.core.Tween[] = []

  elements.forEach((element) => {
    const randomDirection = Math.random() > 0.5 ? 1 : -1
    
    const randomDelay = delay + Math.random() * 2

    const tween = gsap.fromTo(element as Element, 
      {
        y: 0
      },
      {
        y: amplitude * randomDirection, 
        duration: duration,
        delay: randomDelay,
        ease: "sine.inOut",
        yoyo: true,      
        repeat: -1,      
        repeatDelay: 0   
      }
    )

    tweens.push(tween)
  })

  if (section === undefined) return

  const syncSectionPlayback = (isActiveSection: boolean) => {
    tweens.forEach((tween) => {
      if (isActiveSection) {
        tween.play()
      } else {
        tween.pause()
      }
    })
  }

  syncSectionPlayback(currentSection.value === section)

  onSectionStatesChange((_, { current, previous }) => {
    if (current === section) {
      syncSectionPlayback(true)
    } else if (previous === section) {
      syncSectionPlayback(false)
    }
  })
}
