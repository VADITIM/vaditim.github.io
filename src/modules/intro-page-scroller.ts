import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)


export function ScrollIntroPage() {
gsap.fromTo(".skill", 
  {
    autoAlpha: 1,
    x: 0
  },
  {
    autoAlpha: 0,
    x: -1000,
    duration: .4,
    stagger: 0.1, 
    scrollTrigger: {
      trigger: ".scroller",
      start: "top 80%", 
      end: "bottom 0%",
      // markers: true,
      scrub: true,
      toggleActions: "play none none reverse"
    },
  }),

  gsap.fromTo(".skills-line-container", 
  {
    autoAlpha: 1,
    y: 0
  },
  {
    y: -1000,
    duration: 1.4,
    scrollTrigger: {
      trigger: ".scroller",
      start: "top 90%", 
      end: "bottom 0%",
      // markers: true,
      scrub: true,
      toggleActions: "play none none reverse"
    },
  }),

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

  gsap.fromTo(".name-container", 
  {
    autoAlpha: 1,
    xPercent: 0
  },
  {
    autoAlpha: 0,
    xPercent: 100,
    duration: .5,
    scrollTrigger: {
      trigger: ".scroller",
      start: "top 70%", 
      end: "bottom 0%",
      scrub: true,
      // markers: true,
      toggleActions: "play none none reverse"
    },
  }),

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
