import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)


export function ScrollInfoPage() {

  // IN
  gsap.fromTo(".backgroundInfoTop", 
  { },
  {
    left: 0,
    duration: 1,
    stagger: 0.1,
    scrollTrigger: { trigger: ".scroller", scrub: true, toggleActions: "play none none reverse",
      start: "top 60%", 
      end: "bottom 0%",
      // markers: true,
    },
  }),
  
  gsap.fromTo(".backgroundInfoBottom", 
  { },
  {
    left: 0,
    duration: 1,
    stagger: 0.1,
    scrollTrigger: { trigger: ".scroller", scrub: true, toggleActions: "play none none reverse",
      start: "top 60%", 
      end: "bottom 10%",
      // markers: true,
    },
  }),


  // OUT
  gsap.fromTo(".backgroundInfoTop", 
  { },
  {
    left: "-20%",
    duration: 1,
    stagger: 0.1,
    scrollTrigger: { trigger: ".info-scroller-bottom", scrub: true, toggleActions: "play none none reverse",
      start: "top 30%", 
      end: "bottom 10%",
      // markers: true,
    },
  }),

  gsap.fromTo(".backgroundInfoBottom", 
  { },
  {
    left: "-20%",
    duration: 1,
    stagger: 0.1,
    scrollTrigger: { trigger: ".info-scroller-bottom", scrub: true, toggleActions: "play none none reverse",
      start: "top 35%", 
      end: "bottom 0%",
      // markers: true,
    },
  }),

  
  // OTHER
  gsap.fromTo(".intro-background", 
  { },
  {
    xPercent: -108.2,
    scrollTrigger: { trigger: ".scroller", scrub: true, toggleActions: "play none none reverse",
      start: "top 40%", 
      end: "bottom 0%",
      // markers: true,
    },
  }),

  gsap.fromTo(".work-background-top", 
  { right: "-20%", },
  {
   right: "0%",
    scrollTrigger: {
      trigger: ".info-scroller-bottom",
      scrub: true,
      toggleActions: "play none none reverse",
      start: "top 45%", 
      end: "bottom 15%",
      // markers: true,
    },
  }),

  gsap.fromTo(".work-background-bottom", 
  { right: "-20%", },
  {
   right: "0%",
    scrollTrigger: { trigger: ".info-scroller-bottom", scrub: true, toggleActions: "play none none reverse",
      start: "top 25%", 
      end: "bottom 10%",
      // markers: true,
    },
  })

}
