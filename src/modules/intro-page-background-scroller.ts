import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)


export function ScrollIntroPage() {

  gsap.fromTo(".background", 
  {
    x: 0
  },
  {
    xPercent: -100,
    duration: 1,
    stagger: 0.1,
    scrollTrigger: {
      trigger: ".scroller",
      start: "top 40%", 
      end: "bottom 0%",
      // markers: true,
      scrub: true,
      toggleActions: "play none none reverse"
    },
  })

  gsap.fromTo(".info-background-top", 
  {
  },
  {
    left: 1.5,
    duration: 1,
    stagger: 0.1,
    scrollTrigger: {
      trigger: ".scroller",
      start: "top 60%", 
      end: "bottom -5.9%",
      // markers: true,
      scrub: true,
      toggleActions: "play none none reverse"
    },
  }),

  gsap.fromTo(".info-background-bottom", 
  {
  },
  {
    left: 0,
    duration: 1,
    stagger: 0.1,
    scrollTrigger: {
      trigger: ".scroller",
      start: "top 60%", 
      end: "bottom 5%",
      // markers: true,
      scrub: true,
      toggleActions: "play none none reverse"
    },
  })  
}
