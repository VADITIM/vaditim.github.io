import { gsap } from "gsap/gsap-core";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ immediateRender: false });

export function InfoPageAnimations() {
  ScrollTrigger.matchMedia({
    // Desktop
    "(min-width: 842px)": function() {

      if (document.querySelector(".contact-container")) {
        gsap.to(".contact-container",
        {
          rotateX: 0,
          rotateY: 0,
          rotateZ: 0,
          top: "50%",
          left: "80%",

          scrollTrigger: { trigger: ".info-scroller-top", scrub: false, toggleActions: "play none none reverse",
            start: "top 35%", 
            end: "bottom 0%",
            // markers: true,
        }})
      }
    },


    // Tablet
    "(min-width: 436px) and (max-width: 841px)": function() {
      if (document.querySelector(".contact-container")) {
        gsap.to(".contact-container",
        {
          rotateX: 0,
          rotateY: 0,
          rotateZ: 0,
          top: "45%",
          left: "85%",

          scrollTrigger: { trigger: ".info-scroller-top", scrub: true, toggleActions: "play none none reverse",
            start: "top 20%", 
            end: "bottom 0%",
        }})
      }
    },

    // Mobile ----------------------------------------------------------
    "(max-width: 435px)": function() {
      if (document.querySelector(".contact-container")) {
        gsap.to(".contact-container",
        {
          rotateX: 0,
          rotateY: 0,
          rotateZ: 0,
          top: "85%",
          left: "15%",

          scrollTrigger: { trigger: ".info-scroller-top", scrub: true, toggleActions: "play none none reverse",
            start: "top 20%", 
            end: "bottom 0%",
        }})
      }
    }
  });
}