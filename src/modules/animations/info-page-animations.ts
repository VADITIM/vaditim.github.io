import { gsap } from "gsap/gsap-core";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ immediateRender: false });

export function InfoPageAnimations() {
  ScrollTrigger.matchMedia({
    // Desktop
    "(min-width: 842px)": function() {
      if (document.querySelector(".about-me-header-container")) {
        gsap.to(".about-me-header-container",
        {
          left: "1%",
          ease: "elastic.inOut(.3, 0.3)",

          scrollTrigger: { trigger: ".info-scroller-top", scrub: true, toggleActions: "play none none reverse",
            start: "top 40%", 
            end: "bottom 0%",
            // markers: true,
          },
        })
      }

      if (document.querySelector(".about-me-header")) {
        gsap.to(".about-me-header",
        { 
          top: 0,
          left: 0,

          scrollTrigger: { trigger: ".info-scroller-top", scrub: true, toggleActions: "play none none reverse",
            start: "top 60%", 
            end: "bottom 5%",
            // markers: true,
        }})
      }

      if (document.querySelector(".contact-container")) {
        gsap.to(".contact-container",
        {
          rotateX: 0,
          rotateY: 0,
          rotateZ: 0,
          top: "50%",
          left: "80%",

          scrollTrigger: { trigger: ".info-scroller-top", scrub: true, toggleActions: "play none none reverse",
            start: "top 25%", 
            end: "bottom 0%",
            // markers: true,
        }})
      }
    },




    // Tablet
    "(min-width: 436px) and (max-width: 841px)": function() {
      if (document.querySelector(".about-me-header-container")) {
        gsap.fromTo(".about-me-header-container",
        {
          scale: 2,
        },
        {
          scale: 1,
          top: 0,
          left: 0,
          ease: "elastic.inOut(.3, 0.3)",

          scrollTrigger: { trigger: ".info-scroller-top", scrub: true, toggleActions: "play none none reverse",
            start: "top 60%", 
            end: "bottom 5%",
          },
        })
      }

      if (document.querySelector(".about-me-header")) {
        gsap.to(".about-me-header",
        { 
          rotateX: -10,
          rotateY: 40,
          rotateZ: 5,
          top: 0,
          left: 0,

          scrollTrigger: { trigger: ".info-scroller-top", scrub: true, toggleActions: "play none none reverse",
            start: "top 60%", 
            end: "bottom 5%",
        }})
      }

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
      if (document.querySelector(".about-me-header-container")) {
        gsap.fromTo(".about-me-header-container",
        {
          scale: 1.5,
        },
        {
          scale: 1,
          top: 0,
          left: 0,
          ease: "elastic.inOut(.3, 0.3)",

          scrollTrigger: { trigger: ".info-scroller-top", scrub: true, toggleActions: "play none none reverse",
            start: "top 60%", 
            end: "bottom 5%",
          },
        })
      }

      if (document.querySelector(".about-me-header")) {
        gsap.to(".about-me-header",
        { 
          rotateX: -5,
          rotateY: 20,
          rotateZ: 2,
          top: 0,
          left: 0,

          scrollTrigger: { trigger: ".info-scroller-top", scrub: true, toggleActions: "play none none reverse",
            start: "top 60%", 
            end: "bottom 5%",
        }})
      }

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