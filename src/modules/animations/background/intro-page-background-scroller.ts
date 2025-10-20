import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)


export function ScrollIntroPage() {

  gsap.fromTo(".intro-intro-background", 
  { x: 0 },
  {
    left: "-20%",
    duration: 1,
    stagger: 0.1,
    scrollTrigger: { trigger: ".scroller", scrub: true, toggleActions: "play none none reverse",
      start: "top 40%", 
      end: "bottom 0%",
      // markers: true,
    },
  })

  gsap.fromTo(".intro-info-background-front", 
  { },
  {
    left: 0,
    duration: 1,
    stagger: 0.1,
    scrollTrigger: { trigger: ".scroller", scrub: true, toggleActions: "play none none reverse",
      start: "top 50%", 
      end: "bottom 0%",
      markers: true,
    },
  }),

  gsap.fromTo(".intro-info-background-back", 
  { },
  {
    left: 0,
    duration: 1,
    stagger: 0.1,
    scrollTrigger: { trigger: ".scroller", scrub: true, toggleActions: "play none none reverse",
      start: "top 80%", 
      end: "bottom 0%",
      // markers: true,
    },
  })  
}
