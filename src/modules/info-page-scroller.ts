import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)


export function ScrollInfoPage() {

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
    }
  ),
  
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
    }
  )  

  gsap.fromTo(".intro-background", 
    {
    },
    {
      xPercent: -108.2,
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
    }
  )
}
