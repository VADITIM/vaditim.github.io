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
