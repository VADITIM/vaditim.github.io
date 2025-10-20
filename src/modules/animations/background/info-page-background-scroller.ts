import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)


export function ScrollInfoPage() {
  ScrollTrigger.matchMedia({
    // Desktop
    "(min-width: 1800px)": function() {
      // IN
      gsap.fromTo(".info-info-background-front", 
      { },
      {
        left: 0,
        scrollTrigger: { trigger: ".scroller", scrub: true, toggleActions: "play none none reverse",
          start: "top 50%", 
          end: "bottom 0%",
          markers: true,
        },
      }),
      
      gsap.fromTo(".info-info-background-back", 
      { },
      {
        left: 0,
        scrollTrigger: { trigger: ".scroller", scrub: true, toggleActions: "play none none reverse",
          start: "top 80%", 
          end: "bottom 0%",
          // markers: true,
        },
      }),


      // OUT
      gsap.fromTo(".info-info-background-front", 
      { },
      {
        left: "-20%",
        scrollTrigger: { trigger: ".info-scroller-bottom", scrub: true, toggleActions: "play none none reverse",
          start: "top 30%", 
          end: "bottom 10%",
          // markers: true,
        },
      }),

      gsap.fromTo(".info-info-background-back", 
      { },
      {
        left: "-20%",
        scrollTrigger: { trigger: ".info-scroller-bottom", scrub: true, toggleActions: "play none none reverse",
          start: "top 35%", 
          end: "bottom 0%",
          // markers: true,
        },
      }),

      
      // OTHER
      gsap.fromTo(".info-intro-background", 
      { },
      {
        left: "-20%",
        scrollTrigger: { trigger: ".scroller", scrub: true, toggleActions: "play none none reverse",
          start: "top 40%", 
          end: "bottom 0%",
          // markers: true,
        },
      }),

      gsap.fromTo(".info-work-background-back", 
      { },
      {
       right: "0%",
        scrollTrigger: {
          trigger: ".info-scroller-bottom",
          scrub: true,
          toggleActions: "play none none reverse",
          start: "top 45%", 
          end: "bottom 15%",
          // markers: true,
        },
      }),

      gsap.fromTo(".info-work-background-front", 
      { },
      {
       right: "0%",
        scrollTrigger: { trigger: ".info-scroller-bottom", scrub: true, toggleActions: "play none none reverse",
          start: "top 25%", 
          end: "bottom 10%",
          // markers: true,
        },
      })
    },
    // Tablet Landscape ---------------------------------------------------------------
    // Tablet Landscape ---------------------------------------------------------------
    // Tablet Landscape ---------------------------------------------------------------
		"(min-width: 845px) and (max-width: 1205px)": function() {
      // IN
      gsap.fromTo(".info-info-background-front", 
      { },
      {
        left: 0,
        scrollTrigger: { trigger: ".scroller", scrub: true, toggleActions: "play none none reverse",
          start: "top 60%", 
          end: "bottom 0%",
          // markers: true,
        },
      }),
      
      gsap.fromTo(".info-info-background-back", 
      { },
      {
        left: 0,
        scrollTrigger: { trigger: ".scroller", scrub: true, toggleActions: "play none none reverse",
          start: "top 60%", 
          end: "bottom 10%",
          // markers: true,
        },
      }),


      // OUT
      gsap.fromTo(".info-info-background-front", 
      { },
      {
        left: "-20%",
        scrollTrigger: { trigger: ".info-scroller-bottom", scrub: true, toggleActions: "play none none reverse",
          start: "top 30%", 
          end: "bottom 10%",
          // markers: true,
        },
      }),

      gsap.fromTo(".info-info-background-back", 
      { },
      {
        left: "-20%",
        scrollTrigger: { trigger: ".info-scroller-bottom", scrub: true, toggleActions: "play none none reverse",
          start: "top 35%", 
          end: "bottom 0%",
          // markers: true,
        },
      }),

      
      // OTHER
      gsap.fromTo(".info-intro-background", 
      { },
      {
        xPercent: -108.2,
        scrollTrigger: { trigger: ".scroller", scrub: true, toggleActions: "play none none reverse",
          start: "top 40%", 
          end: "bottom 0%",
          // markers: true,
        },
      }),

      gsap.fromTo(".info-work-background-back", 
      { },
      {
       right: "0%",
        scrollTrigger: {
          trigger: ".info-scroller-bottom",
          scrub: true,
          toggleActions: "play none none reverse",
          start: "top 45%", 
          end: "bottom 15%",
          // markers: true,
        },
      }),

      gsap.fromTo(".info-work-background-front", 
      { },
      {
       right: "0%",
        scrollTrigger: { trigger: ".info-scroller-bottom", scrub: true, toggleActions: "play none none reverse",
          start: "top 25%", 
          end: "bottom 10%",
          // markers: true,
        },
      })
    },

    // Tablet ---------------------------------------------------------------
    // Tablet ---------------------------------------------------------------
    // Tablet ---------------------------------------------------------------
		"(min-width: 436px) and (max-width: 845px)": function() {
      // IN
      gsap.fromTo(".info-info-background-front", 
      { left: "-100%"},
      {
        left: 0,
        scrollTrigger: { trigger: ".scroller", scrub: true, toggleActions: "play none none reverse",
          start: "top 60%", 
          end: "bottom 0%",
          // markers: true,
        },
      }),
      
      gsap.fromTo(".info-info-background-back", 
      { left: "-100%"},
      {
        left: 0,
        scrollTrigger: { trigger: ".scroller", scrub: true, toggleActions: "play none none reverse",
          start: "top 60%", 
          end: "bottom 10%",
          // markers: true,
        },
      }),


      // OUT
      gsap.fromTo(".info-info-background-front", 
      { },
      {
        left: "-50%",
        scrollTrigger: { trigger: ".info-scroller-bottom", scrub: true, toggleActions: "play none none reverse",
          start: "top 30%", 
          end: "bottom 10%",
          // markers: true,
        },
      }),

      gsap.fromTo(".info-info-background-back", 
      { },
      {
        left: "-50%",
        scrollTrigger: { trigger: ".info-scroller-bottom", scrub: true, toggleActions: "play none none reverse",
          start: "top 35%", 
          end: "bottom 0%",
          // markers: true,
        },
      })

      gsap.fromTo(".info-intro-background", 
      { },
      {
        xPercent: -108.2,
        scrollTrigger: { trigger: ".scroller", scrub: true, toggleActions: "play none none reverse",
          start: "top 40%", 
          end: "bottom 0%",
          // markers: true,
        },
      })

      
      gsap.fromTo(".info-work-background-back", 
      { },
      {
       right: "0%",
        scrollTrigger: {
          trigger: ".info-scroller-bottom",
          scrub: true,
          toggleActions: "play none none reverse",
          start: "top 45%", 
          end: "bottom 15%",
          // markers: true,
        },
      }),

      gsap.fromTo(".info-work-background-front", 
      { },
      {
       right: "0%",
        scrollTrigger: { trigger: ".info-scroller-bottom", scrub: true, toggleActions: "play none none reverse",
          start: "top 25%", 
          end: "bottom 10%",
          // markers: true,
        },
      })

    },
    
    // Mobile ------------------------------------------------------------------------------------
    // Mobile ------------------------------------------------------------------------------------
    // Mobile ------------------------------------------------------------------------------------
    "(max-width: 435px)": function() {
      // IN
      gsap.fromTo(".info-info-background-front", 
      { left: "-100%"},
      {
        left: 0,
        scrollTrigger: { trigger: ".scroller", scrub: true, toggleActions: "play none none reverse",
          start: "top 60%", 
          end: "bottom 0%",
          // markers: true,
        },
      }),
      
      gsap.fromTo(".info-info-background-back", 
      { left: "-100%"},
      {
        left: 0,
        scrollTrigger: { trigger: ".scroller", scrub: true, toggleActions: "play none none reverse",
          start: "top 60%", 
          end: "bottom 10%",
          // markers: true,
        },
      }),

      // OUT
      gsap.fromTo(".info-info-background-front", 
      { },
      {
        left: "-40%",
        scrollTrigger: { trigger: ".info-scroller-bottom", scrub: true, toggleActions: "play none none reverse",
          start: "top 30%", 
          end: "bottom 10%",
          // markers: true,
        },
      }),

      gsap.fromTo(".info-info-background-back", 
      { },
      {
        left: "-51%",
        scrollTrigger: { trigger: ".info-scroller-bottom", scrub: true, toggleActions: "play none none reverse",
          start: "top 35%", 
          end: "bottom 0%",
          // markers: true,
        },
      }),

      
      // OTHER
      gsap.fromTo(".info-intro-background", 
      { },
      {
        xPercent: -108.2,
        scrollTrigger: { trigger: ".scroller", scrub: true, toggleActions: "play none none reverse",
          start: "top 40%", 
          end: "bottom 0%",
          // markers: true,
        },
      }),

      gsap.fromTo(".info-work-background-back", 
      { },
      {
       right: "0%",
        scrollTrigger: {
          trigger: ".info-scroller-bottom",
          scrub: true,
          toggleActions: "play none none reverse",
          start: "top 45%", 
          end: "bottom 15%",
          // markers: true,
        },
      }),

      gsap.fromTo(".info-work-background-front", 
      { },
      {
       right: "0%",
        scrollTrigger: { trigger: ".info-scroller-bottom", scrub: true, toggleActions: "play none none reverse",
          start: "top 40%", 
          end: "bottom 10%",
          // markers: true,
        },
      })
    },
  });
}
