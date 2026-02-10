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

export function BackCardsAnimations() {
  ScrollTrigger.matchMedia({
    "(min-width: 700px)": function () {

      const startPos = {
        card1: { left: "-100%", bottom: "100%" },
        card2: { right: "-100%", bottom: "100%" },
        card3: { left: "-100%", bottom: "50%" },
        card4: { right: "-100%", bottom: "50%" },
      };

      const finalPos = {
        card1: { left: "18%", bottom: "53.5%" },
        card2: { right: "18%", bottom: "53.5%" },
        card3: { left: "18%", bottom: "19.5%" },
        card4: { right: "18%", bottom: "19.5%" },
      };

      gsap.set(".back-card1", startPos.card1);
      gsap.set(".back-card2", startPos.card2);
      gsap.set(".back-card3", startPos.card3);
      gsap.set(".back-card4", startPos.card4);

      // Stagger order: 1 → 4 → 3 → 2
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".info-scroller-top",
          toggleActions: "play none none reverse",
          start: "top 40%",
          end: "bottom 5%",
        },
      });

      tl.to(".back-card1", { ...finalPos.card1, duration: 0.4, ease: "power2.out" }, 0.30);
      tl.to(".back-card4", { ...finalPos.card4, duration: 0.4, ease: "power2.out" }, 0.20);
      tl.to(".back-card3", { ...finalPos.card3, duration: 0.4, ease: "power2.out" }, 0.25);
      tl.to(".back-card2", { ...finalPos.card2, duration: 0.4, ease: "power2.out" }, 0.30);
    },
  });
}
