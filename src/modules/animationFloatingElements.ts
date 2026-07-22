import { gsap } from 'gsap'
import { currentSection } from '@modules/sectionsCore'
import { prefersReducedMotion } from './miscReducedMotion'
import { isLiteMode } from './miscAnimationMode'
import { onSectionStatesChange } from './sectionsStateMachine'

gsap.defaults({ immediateRender: false })

export function createFloatingAnimation(selector: string, options: {
  amplitude?: number,
  duration?: number,
  delay?: number,
  section?: number
} = {}) {
  // An endless drift is pure ambience, and under the reduced-motion time scale it
  // would shake rather than drift. Leave the elements resting where they are.
  // Lite mode drops it for the same reason it drops every other endless tween:
  // it holds a composited layer forever and reads as pure decoration.
  if (prefersReducedMotion.value || isLiteMode.value) return

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

  onSectionStatesChange((meta) => {
    if (meta.current === section) {
      syncSectionPlayback(true)
    } else if (meta.previous === section) {
      syncSectionPlayback(false)
    }
  })
}
