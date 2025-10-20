import { gsap } from "gsap/gsap-core";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ScrollWorkPage() {
  ScrollTrigger.matchMedia({
    // Desktop
    "(min-width: 1800px)": function() {
      gsap.fromTo(".work-work-background-back", 
       { right: "-20%", },
       {
          right: "0%",
          scrollTrigger: { trigger: ".scrollerW", scrub: true, toggleActions: "play none none reverse",
             end: "bottom 15%",
             start: "top 45%", 
             // markers: true,
          },
       }),

       gsap.fromTo(".work-work-background-front", 
       { right: "-20%", },
       {
          right: "0%",
          scrollTrigger: { trigger: ".scrollerW", scrub: true, toggleActions: "play none none reverse",
             end: "bottom 10%",
             start: "top 25%", 
             // markers: true,
          },
       })

      gsap.fromTo(".work-info-background-front", 
       { },
       {
          left: "-20%",
          scrollTrigger: { trigger: ".scrollerW", scrub: true, toggleActions: "play none none reverse",
             end: "bottom 10%",
             start: "top 30%", 
             // markers: true,
          },
       }),
       
    gsap.fromTo(".work-info-background-back", 
       { },
       {
          left: "-20%",
          scrollTrigger: { trigger: ".scrollerW", scrub: true, toggleActions: "play none none reverse",
             end: "bottom 0%",
             start: "top 35%", 
             // markers: true,
          },
       })
    },
		
    // Tablet Landscape ---------------------------------------------------------------
    // Tablet Landscape ---------------------------------------------------------------
    // Tablet Landscape ---------------------------------------------------------------
		"(min-width: 845px) and (max-width: 1205px)": function() {
      gsap.fromTo(".backgroundWorkTop", 
       { right: "-20%", },
       {
          right: "0%",
          scrollTrigger: { trigger: ".scrollerW", scrub: true, toggleActions: "play none none reverse",
             end: "bottom 15%",
             start: "top 45%", 
             // markers: true,
          },
       }),

       gsap.fromTo(".backgroundWorkBottom", 
       { right: "-20%", },
       {
          right: "0%",
          scrollTrigger: { trigger: ".scrollerW", scrub: true, toggleActions: "play none none reverse",
             end: "bottom 10%",
             start: "top 25%", 
             // markers: true,
          },
       })

      gsap.fromTo(".info-background-top", 
       { },
       {
          left: "-20%",
          scrollTrigger: { trigger: ".scrollerW", scrub: true, toggleActions: "play none none reverse",
             end: "bottom 10%",
             start: "top 30%", 
             // markers: true,
          },
       }),
       
    gsap.fromTo(".info-background-bottom", 
       { },
       {
          left: "-20%",
          scrollTrigger: { trigger: ".scrollerW", scrub: true, toggleActions: "play none none reverse",
             end: "bottom 0%",
             start: "top 35%", 
             // markers: true,
          },
       })
    },

    // Tablet ---------------------------------------------------------------
    // Tablet ---------------------------------------------------------------
    // Tablet ---------------------------------------------------------------
		"(min-width: 436px) and (max-width: 845px)": function() {
			gsap.fromTo(".backgroundWorkTop", 
       { right: "-30%", },
       {
          right: "0%",
          scrollTrigger: { trigger: ".scrollerW", scrub: true, toggleActions: "play none none reverse",
             end: "bottom 15%",
             start: "top 45%", 
             // markers: true,
          },
       }),

       gsap.fromTo(".backgroundWorkBottom", 
       { right: "-30%", },
       {
          right: "0%",
          scrollTrigger: { trigger: ".scrollerW", scrub: true, toggleActions: "play none none reverse",
             end: "bottom 10%",
             start: "top 25%", 
             // markers: true,
          },
       })

      gsap.fromTo(".info-background-top", 
       { },
       {
          left: "-50%",
          scrollTrigger: { trigger: ".scrollerW", scrub: true, toggleActions: "play none none reverse",
             end: "bottom 10%",
             start: "top 30%", 
            //  markers: true,
          },
       }),
       
    gsap.fromTo(".info-background-bottom", 
       { },
       {
          left: "-50%",
          scrollTrigger: { trigger: ".scrollerW", scrub: true, toggleActions: "play none none reverse",
             end: "bottom 0%",
             start: "top 35%", 
             // markers: true,
          },
       })
		},
    
    // Mobile ---------------------------------------------------------------
    // Mobile ---------------------------------------------------------------
    // Mobile ---------------------------------------------------------------
    "(max-width: 435px)": function() {
      gsap.fromTo(".backgroundWorkTop", 
       { right: "-40%", },
       {
          right: "0%",
          scrollTrigger: { trigger: ".scrollerW", scrub: true, toggleActions: "play none none reverse",
             end: "bottom 15%",
             start: "top 45%", 
             // markers: true,
          },
       }),

       gsap.fromTo(".backgroundWorkBottom", 
       { right: "-40%", },
       {
          right: "0%",
          scrollTrigger: { trigger: ".scrollerW", scrub: true, toggleActions: "play none none reverse",
             end: "bottom 10%",
             start: "top 40%", 
            //  markers: true,
          },
       })

      gsap.fromTo(".info-background-top", 
       {  },
       {
          left: "-40%",
          scrollTrigger: { trigger: ".scrollerW", scrub: true, toggleActions: "play none none reverse",
             end: "bottom 10%",
             start: "top 30%", 
             // markers: true,
          },
       }),
       
    gsap.fromTo(".info-background-bottom", 
      { },
      {
         left: "-51%",
         scrollTrigger: { trigger: ".scrollerW", scrub: true, toggleActions: "play none none reverse",
            end: "bottom 0%",
            start: "top 35%", 
            // markers: true,
         },
      }) 
   } 
  });
}
