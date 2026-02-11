import { gsap } from "gsap/gsap-core";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ immediateRender: false });

export function CardsAnimations() {
  ScrollTrigger.matchMedia({
    // Desktop
    "(min-width: 1800px)": function() {
      gsap.fromTo(".card1", 
        { left: "-100%", bottom: "100%" }, 
        {
          left: "18%",
          bottom: "39%",
          
          duration: 0.3,
          scrollTrigger: { trigger: ".info-scroller-top", toggleActions: "play none none reverse",
            start: "top 40%",
            end: "bottom 5%",
            // markers: true,
          },
        }
      );
			gsap.fromTo(".card2", 
        { right: "-100%", bottom: "100%" }, 
        {
          right: "18%",
          bottom: "39%",

          duration: 0.3,
          scrollTrigger: { trigger: ".info-scroller-top", toggleActions: "play none none reverse",
            start: "top 40%",
            end: "bottom 5%",
            // markers: true,
          },
        }
      );
				gsap.fromTo(".card3", 
        {  left: "-100%",  bottom: "-100%"  }, 
        {
          left: "18%",
          bottom: "5%",

          duration: 0.3,
          scrollTrigger: { trigger: ".info-scroller-top", toggleActions: "play none none reverse",
            start: "top 40%",
            end: "bottom 5%",
            // markers: true,
          },
        }
      );
			gsap.fromTo(".card4", 
        {  right: "-100%",  bottom: "-100%"  }, 
        {
          right: "18%",
          bottom: "5%",

          duration: 0.3,
          scrollTrigger: { trigger: ".info-scroller-top", toggleActions: "play none none reverse",
            start: "top 40%",
            end: "bottom 5%",
            // markers: true,
          },
        }
      );
    },
    // Mobile ----------------------------------------------------------------------------------------------------------------------------------------
    "(max-width: 435px)": function() {
      gsap.fromTo(".card1", 
        { left: "-100%", bottom: "100%" }, 
        {
          left: "37.5%",
          bottom: "37.5%",

          scrollTrigger: { trigger: ".info-scroller-top", toggleActions: "play none none reverse",
            start: "top 20%",
            end: "bottom 5%",
            // markers: true,
          },
        }
      );
      gsap.fromTo(".card2", 
        { right: "-100%", bottom: "100%" }, 
        {
          right: "22.5%",
          bottom: "37.5%",

          scrollTrigger: { trigger: ".info-scroller-top", toggleActions: "play none none reverse",
            start: "top 20%",
            end: "bottom 5%",
            // markers: true,
          },
        }
      );
      gsap.fromTo(".card3", 
        { left: "-100%", bottom: "-100%" }, 
        {
          left: "37.5%",
          bottom: "16.5%",

          scrollTrigger: { trigger: ".info-scroller-top", toggleActions: "play none none reverse",
            start: "top 20%",
            end: "bottom 5%",
            // markers: true,
          },
        }
      );
      gsap.fromTo(".card4", 
        { right: "-100%", bottom: "-100%" }, 
        {
          right: "22.5%",
          bottom: "16.5%",

          scrollTrigger: { trigger: ".info-scroller-top", toggleActions: "play none none reverse",
            start: "top 20%",
            end: "bottom 5%",
            // markers: true,
          },
        }
      );
    },
    // Tablet ----------------------------------------------------------------------------------------------------------------------------------------
    "(min-width: 436px) and (max-width: 841px)": function() {
      gsap.fromTo(".card1", 
        { left: "-100%", bottom: "100%" }, 
        {
          left: "25%",
          bottom: "36%",

          stagger: 0.1,
          scrollTrigger: { trigger: ".info-scroller-top", toggleActions: "play none none reverse",
            start: "top 20%",
            end: "bottom 5%",
          },
        }
      );
      gsap.fromTo(".card2", 
        { right: "-100%", bottom: "100%" }, 
        {
          right: "25%",
          bottom: "36%",

          stagger: 0.1,
          scrollTrigger: { trigger: ".info-scroller-top", toggleActions: "play none none reverse",
            start: "top 20%",
            end: "bottom 5%",
          },
        }
      );
      gsap.fromTo(".card3", 
        {  left: "-100%",  bottom: "-100%"  }, 
        {
          left: "25%",
          bottom: "9%",

          stagger: 0.1,
          scrollTrigger: { trigger: ".info-scroller-top", toggleActions: "play none none reverse",
            start: "top 20%",
            end: "bottom 5%",
          },
        }
      );
      gsap.fromTo(".card4", 
        {  right: "-100%",  bottom: "-100%"  }, 
        {
          right: "25%",
          bottom: "9%",

          stagger: 0.1,
          scrollTrigger: { trigger: ".info-scroller-top", toggleActions: "play none none reverse",
            start: "top 20%",
            end: "bottom 5%",
          },
        }
      );
    },
    // Tablet Landscape ----------------------------------------------------------------------------------------------------------------------------------------
    "(min-width: 842px) and (max-width: 1201px)": function() {
      gsap.fromTo(".card1", 
        { left: "-100%", bottom: "100%" }, 
        {
          left: "17.7%",
          bottom: "34.5%",

          stagger: 0.1,
          scrollTrigger: { trigger: ".info-scroller-top", toggleActions: "play none none reverse",
            start: "top 20%",
            end: "bottom 5%",
          },
        }
      );
      gsap.fromTo(".card2", 
        { right: "-100%", bottom: "100%" }, 
        {
          right: "17.7%",
          bottom: "34.5%",

          stagger: 0.1,
          scrollTrigger: { trigger: ".info-scroller-top", toggleActions: "play none none reverse",
            start: "top 20%",
            end: "bottom 5%",
          },
        }
      );
      gsap.fromTo(".card3", 
        {  left: "-100%",  bottom: "-100%"  }, 
        {
          left: "18%",
          bottom: "0%",

          stagger: 0.1,
          scrollTrigger: { trigger: ".info-scroller-top", toggleActions: "play none none reverse",
            start: "top 20%",
            end: "bottom 5%",
          },
        }
      );
      gsap.fromTo(".card4", 
        {  right: "-100%",  bottom: "-100%"  }, 
        {
          right: "18%",
          bottom: "0%",

          stagger: 0.1,
          scrollTrigger: { trigger: ".info-scroller-top", toggleActions: "play none none reverse",
            start: "top 20%",
            end: "bottom 5%",
          },
        }
      );
    },
    // Small Desktop ----------------------------------------------------------------------------------------------------------------------------------------
    "(min-width: 1202px) and (max-width: 1601px)": function() {
      // gsap.fromTo(".card1", 
      //   { left: "-100%", bottom: "100%" }, 
      //   {
      //     left: "18%",
      //     bottom: "39%",

      //     stagger: 0.1,
      //     scrollTrigger: { trigger: ".info-scroller-top", toggleActions: "play none none reverse",
      //       start: "top 20%",
      //       end: "bottom 5%",
      //     },
      //   }
      // );
      // gsap.fromTo(".card2", 
      //   { right: "-100%", bottom: "100%" }, 
      //   {
      //     right: "18%",
      //     bottom: "39%",

      //     stagger: 0.1,
      //     scrollTrigger: { trigger: ".info-scroller-top", toggleActions: "play none none reverse",
      //       start: "top 20%",
      //       end: "bottom 5%",
      //     },
      //   }
      // );
      // gsap.fromTo(".card3", 
      //   {  left: "-100%",  bottom: "-100%"  }, 
      //   {
      //     left: "18%",
      //     bottom: "5%",

      //     stagger: 0.1,
      //     scrollTrigger: { trigger: ".info-scroller-top", toggleActions: "play none none reverse",
      //       start: "top 20%",
      //       end: "bottom 5%",
      //     },
      //   }
      // );
      // gsap.fromTo(".card4", 
      //   {  right: "-100%",  bottom: "-100%"  }, 
      //   {
      //     right: "18%",
      //     bottom: "5%",

      //     stagger: 0.1,
      //     scrollTrigger: { trigger: ".info-scroller-top", toggleActions: "play none none reverse",
      //       start: "top 20%",
      //       end: "bottom 5%",
      //     },
      //   }
      // );
    },
    // Large Desktop ----------------------------------------------------------------------------------------------------------------------------------------
    "(min-width: 1602px)": function() {
    //   gsap.fromTo(".card1", 
    //     { left: "-100%", bottom: "100%" }, 
    //     {
    //       left: "18%",
    //       bottom: "39%",

    //       stagger: 0.1,
    //       scrollTrigger: { trigger: ".info-scroller-top", toggleActions: "play none none reverse",
    //         start: "top 20%",
    //         end: "bottom 5%",
    //       },
    //     }
    //   );
    //   gsap.fromTo(".card2", 
    //     { right: "-100%", bottom: "100%" }, 
    //     {
    //       right: "18%",
    //       bottom: "39%",

    //       stagger: 0.1,
    //       scrollTrigger: { trigger: ".info-scroller-top", toggleActions: "play none none reverse",
    //         start: "top 20%",
    //         end: "bottom 5%",
    //       },
    //     }
    //   );
    //   gsap.fromTo(".card3", 
    //     {  left: "-100%",  bottom: "-100%"  }, 
    //     {
    //       left: "18%",
    //       bottom: "5%",

    //       stagger: 0.1,
    //       scrollTrigger: { trigger: ".info-scroller-top", toggleActions: "play none none reverse",
    //         start: "top 20%",
    //         end: "bottom 5%",
    //       },
    //     }
    //   );
    //   gsap.fromTo(".card4", 
    //     {  right: "-100%",  bottom: "-100%"  }, 
    //     {
    //       right: "18%",
    //       bottom: "5%",

    //       stagger: 0.1,
    //       scrollTrigger: { trigger: ".info-scroller-top", toggleActions: "play none none reverse",
    //         start: "top 20%",
    //         end: "bottom 5%",
    //       },
    //     }
    //   );
    }
  });
}

