import { gsap } from "gsap/gsap-core";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export function InfoPageAnimationsOut() {
  ScrollTrigger.matchMedia({
    // Desktop
    "(min-width: 842px)": function() {

      gsap.fromTo(".about-me-container",
      {

      },
      { 
				top: "75%",
				left: "-50%",
        ease: "elastic.inOut(.3, 0.3)",

        scrollTrigger: { trigger: ".info-scroller-bottom", scrub: true, toggleActions: "play none none reverse",
          start: "top 70%", 
          end: "bottom 5%",
          // markers: true,
      }})  
        
      gsap.fromTo(".contact-container",
      {

      },
      {
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        top: "0%",
        left: "90%",
        ease: "elastic.inOut(.3, 0.3)",

        scrollTrigger: { trigger: ".info-scroller-bottom", scrub: true, toggleActions: "play none none reverse",
          start: "top 90%", 
          end: "bottom 20%",
          markers: true,
      }})
    },




    // Tablet
    "(min-width: 436px) and (max-width: 841px)": function() {
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
            top: "70%",
            left: "10%",
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
            top: "50%",
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
        top: "45%",
        left: "85%",

        scrollTrigger: { trigger: ".scroller", scrub: true, toggleActions: "play none none reverse",
          start: "top 20%", 
          end: "bottom 0%",
      }})
    },

    // Mobile ----------------------------------------------------------
    "(max-width: 435px)": function() {
      gsap.fromTo(".name-headline-container",
      {
        scale: 1.5,
      },
      {
        scale: 1,
        top: 0,
        left: 0,
        ease: "elastic.inOut(.3, 0.3)",

        scrollTrigger: { trigger: ".scroller", scrub: true, toggleActions: "play none none reverse",
          start: "top 60%", 
          end: "bottom 5%",
        },
      })  

      gsap.to(".name",
      { 
        rotateX: -5,
        rotateY: 20,
        rotateZ: 2,
        top: 0,
        left: 0,

        scrollTrigger: { trigger: ".scroller", scrub: true, toggleActions: "play none none reverse",
          start: "top 60%", 
          end: "bottom 5%",
      }})  

        gsap.to(".about-me-container", 
        {
          rotateX: 0,
          rotateY: 0,
          rotateZ: 0,
          top: "15%",
          left: "30%",
          ease: "bounce.Out",
          duration: 2.4,
          delay: 1.5,

          scrollTrigger: { trigger: ".scroller", scrub: true, toggleActions: "play none none reverse",
            start: "top 40%", 
            end: "bottom 0%",
          },
      });

      gsap.to(".contact-container",
      {
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        top: "85%",
        left: "15%",

        scrollTrigger: { trigger: ".scroller", scrub: true, toggleActions: "play none none reverse",
          start: "top 20%", 
          end: "bottom 0%",
      }})


    }
  });
}