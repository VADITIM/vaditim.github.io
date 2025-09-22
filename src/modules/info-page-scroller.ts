import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)


export function ScrollInfoPage() {

  gsap.fromTo(".backgroundInfoTop", 
    {
      autoAlpha: 0,
    },
    {
      autoAlpha: 1,
      left: 0,
      duration: 1,
      stagger: 0.1,
      scrollTrigger: {
        trigger: ".scroller",
        start: "top 50%", 
        end: "bottom 20%",
      //   markers: true,
        scrub: true,
        toggleActions: "play none none reverse"
      },
    }
  ),
  
  gsap.fromTo(".backgroundInfoBottom", 
    {
      autoAlpha: 0,
    },
    {
      autoAlpha: 1,
      left: 0,
      duration: 1,
      stagger: 0.1,
      scrollTrigger: {
        trigger: ".scroller",
        start: "top 30%", 
        end: "bottom 0%",
      //   markers: true,
        scrub: true,
        toggleActions: "play none none reverse"
      },
    }
  )
}
