import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)


export function ScrollInfoPage() {

  // IN
  gsap.fromTo(".backgroundInfoTop", 
  {
  },
  {
    left: 0,
    duration: 1,
    stagger: 0.1,
    scrollTrigger: {
      trigger: ".scroller",
      start: "top 60%", 
      end: "bottom 0%",
      // markers: true,
      scrub: true,
      toggleActions: "play none none reverse"
    },
  }),
  
  gsap.fromTo(".backgroundInfoBottom", 
  {
  },
  {
    left: 0,
    duration: 1,
    stagger: 0.1,
    scrollTrigger: {
      trigger: ".scroller",
      start: "top 60%", 
      end: "bottom 10%",
      // markers: true,
      scrub: true,
      toggleActions: "play none none reverse"
    },
  }),


  // OUT
  gsap.fromTo(".backgroundInfoTop", 
  {
  },
  {
    left: "-20%",
    duration: 1,
    stagger: 0.1,
    scrollTrigger: {
      trigger: ".info-scroller-bottom",
      start: "top 30%", 
      end: "bottom 10%",
      // markers: true,
      scrub: true,
      toggleActions: "play none none reverse"
    },
  }),

  gsap.fromTo(".backgroundInfoBottom", 
  {
  },
  {
    left: "-20%",
    duration: 1,
    stagger: 0.1,
    scrollTrigger: {
      trigger: ".info-scroller-bottom",
      start: "top 35%", 
      end: "bottom 0%",
      // markers: true,
      scrub: true,
      toggleActions: "play none none reverse"
    },
  }),

  
  // OTHER
  gsap.fromTo(".intro-background", 
  {
  },
  {
    xPercent: -108.2,
    scrollTrigger: {
      trigger: ".scroller",
      start: "top 40%", 
      end: "bottom 0%",
      // markers: true,
      scrub: true,
      toggleActions: "play none none reverse"
    },
  }),

  gsap.fromTo(".work-background-top", 
  {
      right: "-20%",
  },
  {
   right: "0%",
    scrollTrigger: {
      trigger: ".info-scroller-bottom",
      start: "top 45%", 
      end: "bottom 15%",
      // markers: true,
      scrub: true,
      toggleActions: "play none none reverse"
    },
  }),

  gsap.fromTo(".work-background-bottom", 
  {
      right: "-20%",
  },
  {
   right: "0%",
    scrollTrigger: {
      trigger: ".info-scroller-bottom",
      start: "top 25%", 
      end: "bottom 10%",
      // markers: true,
      scrub: true,
      toggleActions: "play none none reverse"
    },
  })

}
