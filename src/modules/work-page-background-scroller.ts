import { gsap } from "gsap/gsap-core";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ScrollWorkPage() {

  gsap.fromTo(".backgroundWorkTop", 
   {
      right: "-20%",
   },
   {
   right: "0%",
   scrollTrigger: {
      trigger: ".scrollerW",
      start: "top 45%", 
      end: "bottom 15%",
      // markers: true,
      scrub: true,
      toggleActions: "play none none reverse"
   },
   }),

gsap.fromTo(".backgroundWorkBottom", 
   {
      right: "-20%",
   },
   {
   right: "0%",
   scrollTrigger: {
      trigger: ".scrollerW",
      start: "top 25%", 
      end: "bottom 10%",
      // markers: true,
      scrub: true,
      toggleActions: "play none none reverse"
   },
   })

  gsap.fromTo(".info-background-top", 
   {
   },
   {
   left: "-20%",
   scrollTrigger: {
      trigger: ".scrollerW",
      start: "top 30%", 
      end: "bottom 10%",
      // markers: true,
      scrub: true,
      toggleActions: "play none none reverse"
   },
   }),
   
gsap.fromTo(".info-background-bottom", 
   {
   },
   {
   left: "-20%",
   scrollTrigger: {
      trigger: ".scrollerW",
      start: "top 35%", 
      end: "bottom 0%",
      // markers: true,
      scrub: true,
      toggleActions: "play none none reverse"
   },
   })
}
