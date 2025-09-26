import { gsap } from "gsap/gsap-core";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export function InfoPageAnimations() {

   gsap.fromTo(".name-headline-container",
  {
    scale: 2,
  },
  {
    scale: 1,
    top: 0,
    left: 0,
    ease: "elastic.inOut(.3, 0.3)",

    scrollTrigger: {
      trigger: ".scroller",
      start: "top 60%", 
      end: "bottom 5%",
      // markers: true,
      scrub: true,
      toggleActions: "play none none reverse"
    },
  })  

	gsap.to(".name",
  { 
    rotateX: -10,
    rotateY: 40,
    rotateZ: 5,
    top: 0,
    left: 0,

    scrollTrigger: { trigger: ".scroller", scrub: true, toggleActions: "play none none reverse",
      start: "top 60%", 
      end: "bottom 5%",
      // markers: true,
    }})  

  gsap.to(".about-me-container",
  {
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    top: "75%",
    left: "20%",
    duration: 1,
    delay: 2.2,

    scrollTrigger: { trigger: ".scroller", scrub: false, toggleActions: "play none none reverse",
      start: "top 20%", 
      end: "bottom 0%",
      // markers: true,
    }})
}