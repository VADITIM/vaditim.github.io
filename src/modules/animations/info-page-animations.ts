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

    scrollTrigger: { trigger: ".scroller", scrub: true, toggleActions: "play none none reverse",
      start: "top 60%", 
      end: "bottom 5%",
      // markers: true,
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
    
  ScrollTrigger.create({
    trigger: ".scroller",
    start: "top 20%", 
    end: "bottom 20%",

    onEnter: () => {
      gsap.to(".about-me-container", {
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        top: "75%",
        left: "15%",
        ease: "bounce.Out",
        duration: 2.4,
        delay: 1.5,
      });
    },
    onLeave: () => {
      gsap.to(".about-me-container", {
        rotateX: 0,
        rotateY: 180,
        rotateZ: 0,
        top: "55%",
        left: "120%",
        ease: "bounce.Out",
        duration: 0.4,
        delay: 0,
      });
    },
  });

  gsap.to(".contact-container",
  {
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    top: "50%",
    left: "90%",

    scrollTrigger: { trigger: ".scroller", scrub: true, toggleActions: "play none none reverse",
      start: "top 20%", 
      end: "bottom 0%",
      // markers: true,
  }})
}