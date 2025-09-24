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

export function CardsAnimations() {
  ScrollTrigger.matchMedia({
    // Desktop
    "(min-width: 436px)": function() {
      gsap.fromTo(".card1:not(.card1-open)", 
        { 
          left: "-100%", 
          bottom: "100%" 
        }, 
        {
          left: "18%",
          bottom: "39%",

          stagger: 0.1,
          scrollTrigger: {
            trigger: ".scroller",
            start: "top 60%",
            end: "bottom 5%",
            markers: true,
						toggleActions: "play none none reverse"
          },
        }
      );
			gsap.fromTo(".card2", 
        { 
          right: "-100%", 
          bottom: "100%" 
        }, 
        {
          right: "18%",
          bottom: "39%",

          stagger: 0.1,
          scrollTrigger: {
            trigger: ".scroller",
            start: "top 60%",
            end: "bottom 5%",
            markers: true,
						toggleActions: "play none none reverse"
          },
        }
      );
				gsap.fromTo(".card3", 
        { 
          left: "-100%", 
          bottom: "0%" 
        }, 
        {
          left: "18%",
          bottom: "5%",

          stagger: 0.1,
          scrollTrigger: {
            trigger: ".scroller",
            start: "top 60%",
            end: "bottom 5%",
            markers: true,
						toggleActions: "play none none reverse"
          },
        }
      );
			gsap.fromTo(".card4", 
        { 
          right: "-100%", 
          bottom: "0%" 
        }, 
        {
          right: "18%",
          bottom: "5%",

          stagger: 0.1,
          scrollTrigger: {
            trigger: ".scroller",
            start: "top 60%",
            end: "bottom 5%",
            markers: true,
						toggleActions: "play none none reverse"
          },
        }
      );


    },
		

    // Mobile
    "(max-width: 435px)": function() {
      gsap.fromTo(".card1", 
        { 
          left: "-100%", 
          top: "100%" 
        }, 
        {
          left: "0%",
          top: "0%",

          stagger: 0.1,
          scrollTrigger: {
            trigger: ".scroller",
            start: "top 80%",
            end: "bottom 20%",
            scrub: true,
          },
        }
      );
    }
  });
}