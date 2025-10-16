import { gsap } from "gsap/gsap-core";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { currentProjectIndex, activeProjectIndex } from "../projects";
gsap.registerPlugin(ScrollTrigger);

export function WorkPageAnimations() {
  ScrollTrigger.matchMedia({
    // Desktop
    "(min-width: 842px)": function() {

      gsap.fromTo(".projects-header-container",
      { },
      { 
        left: "1%",
        ease: "elastic.inOut(.3, 0.3)",

        scrollTrigger: { trigger: ".scrollerW", scrub: true, toggleActions: "play none none reverse",
          start: "top 10%", 
          end: "bottom 0%",
          markers: true,
          onEnter: () => {
            currentProjectIndex.value = 0;
            activeProjectIndex.value = null;
          },
          onLeave: () => {
            currentProjectIndex.value = 0;
            activeProjectIndex.value = null;
          },
          onEnterBack: () => {
            currentProjectIndex.value = 0;
            activeProjectIndex.value = null;
          },
          onLeaveBack: () => {
            currentProjectIndex.value = 0;
            activeProjectIndex.value = null;
          }
      }})  
  },


    // Tablet
    "(min-width: 436px) and (max-width: 841px)": function() {
      gsap.fromTo(".name-headline-container",
      { },
      {

        scrollTrigger: { trigger: ".scrollerW", scrub: true, toggleActions: "play none none reverse",
          start: "top 10%", 
          end: "bottom 5%",
        }})  
    },

    // Mobile ----------------------------------------------------------
    "(max-width: 435px)": function() {
      gsap.fromTo(".name-headline-container",
      { },
      {
        scrollTrigger: { trigger: ".scrollerW", scrub: true, toggleActions: "play none none reverse",
          start: "top 60%", 
          end: "bottom 5%",
        }})  
    }
  });
}