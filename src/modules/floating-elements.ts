import { gsap } from 'gsap'

export function createFloatingAnimation(selector: string, options: {
  amplitude?: number,
  duration?: number,
  delay?: number
} = {}) {
  const {
    amplitude = 20, 
    duration = 3,   
    delay = 0       
  } = options

  const elements = gsap.utils.toArray(selector)

  elements.forEach((element) => {
    const randomDirection = Math.random() > 0.5 ? 1 : -1
    
    const randomDelay = delay + Math.random() * 2

    gsap.fromTo(element as Element, 
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
  })
}

export function createAdvancedFloating(selector: string, options: {
  minAmplitude?: number,
  maxAmplitude?: number,
  minDuration?: number,
  maxDuration?: number,
  rotationRange?: number
} = {}) {
  const {
    minAmplitude = 10,
    maxAmplitude = 30,
    minDuration = 2,
    maxDuration = 4,
    rotationRange = 5
  } = options

  const elements = gsap.utils.toArray(selector)

  elements.forEach((element) => {
    const amplitude = gsap.utils.random(minAmplitude, maxAmplitude)
    const duration = gsap.utils.random(minDuration, maxDuration)
    const rotation = gsap.utils.random(-rotationRange, rotationRange)
    const startDirection = Math.random() > 0.5 ? 1 : -1
    const randomDelay = Math.random() * 2

    const tl = gsap.timeline({ repeat: -1, delay: randomDelay })
    
    tl.to(element as Element, {
      y: amplitude * startDirection,
      rotation: rotation,
      duration: duration,
      ease: "sine.inOut"
    })
    .to(element as Element, {
      y: -amplitude * startDirection,
      rotation: -rotation,
      duration: duration,
      ease: "sine.inOut"
    })
  })
}
