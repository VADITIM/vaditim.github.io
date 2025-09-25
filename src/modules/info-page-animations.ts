import { gsap } from "gsap/gsap-core";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export function InfoPageAnimations() {

   gsap.fromTo(".name-headline-container",
  {
  },
  {
    left: 0,
    top: 0,
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

	gsap.fromTo(".name",
  {
  },
  {
		rotateX: -10,
    rotateY: 40,
    rotateZ: 5,
    left: 0,
    top: 0,
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