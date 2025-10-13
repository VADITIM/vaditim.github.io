import { gsap } from "gsap/gsap-core";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export function CardsAnimations() {
  ScrollTrigger.matchMedia({
    // Desktop
    "(min-width: 1800px)": function() {
      gsap.fromTo(".card1", 
        { left: "-100%", bottom: "100%" }, 
        {
          left: "18%",
          bottom: "39%",
          
          stagger: 0.1,
          scrollTrigger: { trigger: ".scroller", toggleActions: "play none none reverse",
            start: "top 20%",
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

          stagger: 0.1,
          scrollTrigger: { trigger: ".scroller", toggleActions: "play none none reverse",
            start: "top 20%",
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

          stagger: 0.1,
          scrollTrigger: { trigger: ".scroller", toggleActions: "play none none reverse",
            start: "top 20%",
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

          stagger: 0.1,
          scrollTrigger: { trigger: ".scroller", toggleActions: "play none none reverse",
            start: "top 20%",
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

          scrollTrigger: { trigger: ".scroller", toggleActions: "play none none reverse",
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

          scrollTrigger: { trigger: ".scroller", toggleActions: "play none none reverse",
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

          scrollTrigger: { trigger: ".scroller", toggleActions: "play none none reverse",
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

          scrollTrigger: { trigger: ".scroller", toggleActions: "play none none reverse",
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
          scrollTrigger: { trigger: ".scroller", toggleActions: "play none none reverse",
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
          scrollTrigger: { trigger: ".scroller", toggleActions: "play none none reverse",
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
          scrollTrigger: { trigger: ".scroller", toggleActions: "play none none reverse",
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
          scrollTrigger: { trigger: ".scroller", toggleActions: "play none none reverse",
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
          scrollTrigger: { trigger: ".scroller", toggleActions: "play none none reverse",
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
          scrollTrigger: { trigger: ".scroller", toggleActions: "play none none reverse",
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
          scrollTrigger: { trigger: ".scroller", toggleActions: "play none none reverse",
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
          scrollTrigger: { trigger: ".scroller", toggleActions: "play none none reverse",
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
      //     scrollTrigger: { trigger: ".scroller", toggleActions: "play none none reverse",
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
      //     scrollTrigger: { trigger: ".scroller", toggleActions: "play none none reverse",
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
      //     scrollTrigger: { trigger: ".scroller", toggleActions: "play none none reverse",
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
      //     scrollTrigger: { trigger: ".scroller", toggleActions: "play none none reverse",
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
    //       scrollTrigger: { trigger: ".scroller", toggleActions: "play none none reverse",
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
    //       scrollTrigger: { trigger: ".scroller", toggleActions: "play none none reverse",
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
    //       scrollTrigger: { trigger: ".scroller", toggleActions: "play none none reverse",
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
    //       scrollTrigger: { trigger: ".scroller", toggleActions: "play none none reverse",
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
    "(min-width: 1800px)": function () {

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

      // state
      let currentEnterTl: gsap.core.Timeline | null = null;
      let pendingEnterDelay = false; 
      let isAnimating = false;       
      let atStart = true;
      let atFinal = false;

      // stable initial set
      gsap.set(".back-card1", startPos.card1);
      gsap.set(".back-card2", startPos.card2);
      gsap.set(".back-card3", startPos.card3);
      gsap.set(".back-card4", startPos.card4);

      function createEnterTimeline() {
        const tl = gsap.timeline({ defaults: { overwrite: "auto" } });

        tl.to(".back-card1", { ...finalPos.card1, duration: 0.8, ease: "power2.înOut" }, 1.55);
        tl.to(".back-card2", { ...finalPos.card2, duration: 0.8, ease: "power2.înOut" }, 1.4);
        tl.to(".back-card3", { ...finalPos.card3, duration: 0.8, ease: "power2.înOut" }, 1.25);
        tl.to(".back-card4", { ...finalPos.card4, duration: 0.8, ease: "power2.înOut" }, 1.1);

        tl.eventCallback("onStart", () => {
          pendingEnterDelay = false; 
          isAnimating = true;
          atStart = false;
        });

        tl.eventCallback("onComplete", () => {
          isAnimating = false;
          atFinal = true;
        });

        return tl;
      }

      function playEnterWithDelay() {
        if (currentEnterTl) {
          currentEnterTl.kill();
          currentEnterTl = null;
        }
        gsap.killTweensOf([
          ".back-card1",
          ".back-card2",
          ".back-card3",
          ".back-card4",
        ]);

        pendingEnterDelay = true; 

        currentEnterTl = createEnterTimeline();
        currentEnterTl.restart();
      }

      function playEnterNoDelay() {
        if (currentEnterTl) {
          currentEnterTl.kill();
          currentEnterTl = null;
          pendingEnterDelay = false;
        }
        gsap.killTweensOf([
          ".back-card1",
          ".back-card2",
          ".back-card3",
          ".back-card4",
        ]);

        isAnimating = true;
        atStart = false;
        atFinal = false;

        gsap.timeline({
          onComplete: () => {
            isAnimating = false;
            atFinal = true;
          },
        })
          .to(".back-card1", { ...finalPos.card1, duration: 0.8, ease: "power2.înOut" }, 0)
          .to(".back-card2", { ...finalPos.card2, duration: 0.8, ease: "power2.înOut" }, 0)
          .to(".back-card3", { ...finalPos.card3, duration: 0.8, ease: "power2.înOut" }, 0)
          .to(".back-card4", { ...finalPos.card4, duration: 0.8, ease: "power2.înOut" }, 0);
      }

      function animateToStartNoDelay() {
        if (currentEnterTl) {
          currentEnterTl.kill();
          currentEnterTl = null;
        }

        gsap.killTweensOf([
          ".back-card1",
          ".back-card2",
          ".back-card3",
          ".back-card4",
        ]);

        pendingEnterDelay = false;
        isAnimating = true;
        atFinal = false;

        gsap.timeline({
          onComplete: () => {
            isAnimating = false;
            atStart = true;
          },
        })
          .to(".back-card1", { ...startPos.card1, duration: 0.4, ease: "power2.inOut" }, 0)
          .to(".back-card2", { ...startPos.card2, duration: 0.4, ease: "power2.inOut" }, 0)
          .to(".back-card3", { ...startPos.card3, duration: 0.4, ease: "power2.inOut" }, 0)
          .to(".back-card4", { ...startPos.card4, duration: 0.4, ease: "power2.inOut" }, 0);
      }

      function handleEnter() {
        if (pendingEnterDelay) {
          return;
        }

        if (isAnimating) {
          playEnterNoDelay();
          return;
        }

        if (atStart) {
          playEnterWithDelay();
          return;
        }

        if (atFinal) {
          playEnterWithDelay();
          return;
        }
      }

      function handleLeave() {
        animateToStartNoDelay();
      }

      ScrollTrigger.create({
        trigger: ".scroller",
        start: "top 20%",
        end: "top -200%",
        // markers: true,
        onEnter: handleEnter,
        onEnterBack: handleEnter,
        onLeave: handleLeave,
        onLeaveBack: handleLeave,
      });
    },

    // Tablet Back Cards
    "(min-width: 436px) and (max-width: 841px)": function () {

      const startPos = {
        card1: { left: "-100%", bottom: "100%" },
        card2: { right: "-100%", bottom: "100%" },
        card3: { left: "-100%", bottom: "50%" },
        card4: { right: "-100%", bottom: "50%" },
      };

      const finalPos = {
        card1: { left: "25%", bottom: "47.5%" },
        card2: { right: "25%", bottom: "47.5%" },
        card3: { left: "25%", bottom: "20.5%" },
        card4: { right: "25%", bottom: "20.5%" },
      };

      // state
      let currentEnterTl: gsap.core.Timeline | null = null;
      let pendingEnterDelay = false; 
      let isAnimating = false;       
      let atStart = true;
      let atFinal = false;

      // stable initial set
      gsap.set(".back-card1", startPos.card1);
      gsap.set(".back-card2", startPos.card2);
      gsap.set(".back-card3", startPos.card3);
      gsap.set(".back-card4", startPos.card4);

      function createEnterTimeline() {
        const tl = gsap.timeline({ defaults: { overwrite: "auto" } });

        tl.to(".back-card1", { ...finalPos.card1, duration: 0.8, ease: "power2.out" }, 1.55);
        tl.to(".back-card2", { ...finalPos.card2, duration: 0.8, ease: "power2.out" }, 1.4);
        tl.to(".back-card3", { ...finalPos.card3, duration: 0.8, ease: "power2.out" }, 1.25);
        tl.to(".back-card4", { ...finalPos.card4, duration: 0.8, ease: "power2.out" }, 1.1);

        tl.eventCallback("onStart", () => {
          pendingEnterDelay = false; 
          isAnimating = true;
          atStart = false;
        });

        tl.eventCallback("onComplete", () => {
          isAnimating = false;
          atFinal = true;
        });

        return tl;
      }

      function playEnterWithDelay() {
        if (currentEnterTl) {
          currentEnterTl.kill();
          currentEnterTl = null;
        }
        gsap.killTweensOf([
          ".back-card1",
          ".back-card2",
          ".back-card3",
          ".back-card4",
        ]);

        pendingEnterDelay = true; 

        currentEnterTl = createEnterTimeline();
        currentEnterTl.restart();
      }

      function playEnterNoDelay() {
        if (currentEnterTl) {
          currentEnterTl.kill();
          currentEnterTl = null;
          pendingEnterDelay = false;
        }
        gsap.killTweensOf([
          ".back-card1",
          ".back-card2",
          ".back-card3",
          ".back-card4",
        ]);

        isAnimating = true;
        atStart = false;
        atFinal = false;

        gsap.timeline({
          onComplete: () => {
            isAnimating = false;
            atFinal = true;
          },
        })
          .to(".back-card1", { ...finalPos.card1, duration: 0.8, ease: "power2.out" }, 0)
          .to(".back-card2", { ...finalPos.card2, duration: 0.8, ease: "power2.out" }, 0)
          .to(".back-card3", { ...finalPos.card3, duration: 0.8, ease: "power2.out" }, 0)
          .to(".back-card4", { ...finalPos.card4, duration: 0.8, ease: "power2.out" }, 0);
      }

      function animateToStartNoDelay() {
        if (currentEnterTl) {
          currentEnterTl.kill();
          currentEnterTl = null;
        }

        gsap.killTweensOf([
          ".back-card1",
          ".back-card2",
          ".back-card3",
          ".back-card4",
        ]);

        pendingEnterDelay = false;
        isAnimating = true;
        atFinal = false;

        gsap.timeline({
          onComplete: () => {
            isAnimating = false;
            atStart = true;
          },
        })
          .to(".back-card1", { ...startPos.card1, duration: 0.4, ease: "power2.inOut" }, 0)
          .to(".back-card2", { ...startPos.card2, duration: 0.4, ease: "power2.inOut" }, 0)
          .to(".back-card3", { ...startPos.card3, duration: 0.4, ease: "power2.inOut" }, 0)
          .to(".back-card4", { ...startPos.card4, duration: 0.4, ease: "power2.inOut" }, 0);
      }

      function handleEnter() {
        if (pendingEnterDelay) {
          return;
        }

        if (isAnimating) {
          playEnterNoDelay();
          return;
        }

        if (atStart) {
          playEnterWithDelay();
          return;
        }

        if (atFinal) {
          playEnterWithDelay();
          return;
        }
      }

      function handleLeave() {
        animateToStartNoDelay();
      }

      ScrollTrigger.create({
        trigger: ".scroller",
        start: "top 20%",
        end: "top -200%",
        // markers: true, // Removed markers for tablet
        onEnter: handleEnter,
        onEnterBack: handleEnter,
        onLeave: handleLeave,
        onLeaveBack: handleLeave,
      });
    },

    // Tablet Landscape Back Cards
    "(min-width: 842px) and (max-width: 1201px)": function () {

      const startPos = {
        card1: { left: "-100%", bottom: "100%" },
        card2: { right: "-100%", bottom: "100%" },
        card3: { left: "-100%", bottom: "50%" },
        card4: { right: "-100%", bottom: "50%" },
      };

      const finalPos = {
        card1: { left: "17.7%", bottom: "49.2%" },
        card2: { right: "17.7%", bottom: "49.2%" },
        card3: { left: "17.7%", bottom: "14.7%" },
        card4: { right: "17.7%", bottom: "14.7%" },
      };

      // state
      let currentEnterTl: gsap.core.Timeline | null = null;
      let pendingEnterDelay = false; 
      let isAnimating = false;       
      let atStart = true;
      let atFinal = false;

      // stable initial set
      gsap.set(".back-card1", startPos.card1);
      gsap.set(".back-card2", startPos.card2);
      gsap.set(".back-card3", startPos.card3);
      gsap.set(".back-card4", startPos.card4);

      function createEnterTimeline() {
        const tl = gsap.timeline({ defaults: { overwrite: "auto" } });

        tl.to(".back-card1", { ...finalPos.card1, duration: 0.8, ease: "power2.out" }, 1.55);
        tl.to(".back-card2", { ...finalPos.card2, duration: 0.8, ease: "power2.out" }, 1.4);
        tl.to(".back-card3", { ...finalPos.card3, duration: 0.8, ease: "power2.out" }, 1.25);
        tl.to(".back-card4", { ...finalPos.card4, duration: 0.8, ease: "power2.out" }, 1.1);

        tl.eventCallback("onStart", () => {
          pendingEnterDelay = false; 
          isAnimating = true;
          atStart = false;
        });

        tl.eventCallback("onComplete", () => {
          isAnimating = false;
          atFinal = true;
        });

        return tl;
      }

      function playEnterWithDelay() {
        if (currentEnterTl) {
          currentEnterTl.kill();
          currentEnterTl = null;
        }
        gsap.killTweensOf([
          ".back-card1",
          ".back-card2",
          ".back-card3",
          ".back-card4",
        ]);

        pendingEnterDelay = true; 

        currentEnterTl = createEnterTimeline();
        currentEnterTl.restart();
      }

      function playEnterNoDelay() {
        if (currentEnterTl) {
          currentEnterTl.kill();
          currentEnterTl = null;
          pendingEnterDelay = false;
        }
        gsap.killTweensOf([
          ".back-card1",
          ".back-card2",
          ".back-card3",
          ".back-card4",
        ]);

        isAnimating = true;
        atStart = false;
        atFinal = false;

        gsap.timeline({
          onComplete: () => {
            isAnimating = false;
            atFinal = true;
          },
        })
          .to(".back-card1", { ...finalPos.card1, duration: 0.8, ease: "power2.out" }, 0)
          .to(".back-card2", { ...finalPos.card2, duration: 0.8, ease: "power2.out" }, 0)
          .to(".back-card3", { ...finalPos.card3, duration: 0.8, ease: "power2.out" }, 0)
          .to(".back-card4", { ...finalPos.card4, duration: 0.8, ease: "power2.out" }, 0);
      }

      function animateToStartNoDelay() {
        if (currentEnterTl) {
          currentEnterTl.kill();
          currentEnterTl = null;
        }

        gsap.killTweensOf([
          ".back-card1",
          ".back-card2",
          ".back-card3",
          ".back-card4",
        ]);

        pendingEnterDelay = false;
        isAnimating = true;
        atFinal = false;

        gsap.timeline({
          onComplete: () => {
            isAnimating = false;
            atStart = true;
          },
        })
          .to(".back-card1", { ...startPos.card1, duration: 0.4, ease: "power2.inOut" }, 0)
          .to(".back-card2", { ...startPos.card2, duration: 0.4, ease: "power2.inOut" }, 0)
          .to(".back-card3", { ...startPos.card3, duration: 0.4, ease: "power2.inOut" }, 0)
          .to(".back-card4", { ...startPos.card4, duration: 0.4, ease: "power2.inOut" }, 0);
      }

      function handleEnter() {
        if (pendingEnterDelay) {
          return;
        }

        if (isAnimating) {
          playEnterNoDelay();
          return;
        }

        if (atStart) {
          playEnterWithDelay();
          return;
        }

        if (atFinal) {
          playEnterWithDelay();
          return;
        }
      }

      function handleLeave() {
        animateToStartNoDelay();
      }

      ScrollTrigger.create({
        trigger: ".scroller",
        start: "top 20%",
        end: "top -200%",
        // markers: true, // Removed markers for tablet landscape
        onEnter: handleEnter,
        onEnterBack: handleEnter,
        onLeave: handleLeave,
        onLeaveBack: handleLeave,
      });
    },

    // Mobile Back Cards
    "(max-width: 435px)": function () {

      const startPos = {
        card1: { left: "-100%", bottom: "100%" },
        card2: { right: "-100%", bottom: "100%" },
        card3: { left: "-100%", bottom: "50%" },
        card4: { right: "-100%", bottom: "50%" },
      };

      const finalPos = {
        card1: { left: "37.5%", bottom: "46.5%" },
        card2: { right: "22.5%", bottom: "46.5%" },
        card3: { left: "37.5%", bottom: "25.5%" },
        card4: { right: "22.5%", bottom: "25.5%" },
      };

      // state
      let currentEnterTl: gsap.core.Timeline | null = null;
      let pendingEnterDelay = false; 
      let isAnimating = false;       
      let atStart = true;
      let atFinal = false;

      // stable initial set
      gsap.set(".back-card1", startPos.card1);
      gsap.set(".back-card2", startPos.card2);
      gsap.set(".back-card3", startPos.card3);
      gsap.set(".back-card4", startPos.card4);

      function createEnterTimeline() {
        const tl = gsap.timeline({ defaults: { overwrite: "auto" } });

        tl.to(".back-card1", { ...finalPos.card1, duration: 0.8, ease: "power2.out" }, 1.55);
        tl.to(".back-card2", { ...finalPos.card2, duration: 0.8, ease: "power2.out" }, 1.4);
        tl.to(".back-card3", { ...finalPos.card3, duration: 0.8, ease: "power2.out" }, 1.25);
        tl.to(".back-card4", { ...finalPos.card4, duration: 0.8, ease: "power2.out" }, 1.1);

        tl.eventCallback("onStart", () => {
          pendingEnterDelay = false; 
          isAnimating = true;
          atStart = false;
        });

        tl.eventCallback("onComplete", () => {
          isAnimating = false;
          atFinal = true;
        });

        return tl;
      }

      function playEnterWithDelay() {
        if (currentEnterTl) {
          currentEnterTl.kill();
          currentEnterTl = null;
        }
        gsap.killTweensOf([
          ".back-card1",
          ".back-card2",
          ".back-card3",
          ".back-card4",
        ]);

        pendingEnterDelay = true; 

        currentEnterTl = createEnterTimeline();
        currentEnterTl.restart();
      }

      function playEnterNoDelay() {
        if (currentEnterTl) {
          currentEnterTl.kill();
          currentEnterTl = null;
          pendingEnterDelay = false;
        }
        gsap.killTweensOf([
          ".back-card1",
          ".back-card2",
          ".back-card3",
          ".back-card4",
        ]);

        isAnimating = true;
        atStart = false;
        atFinal = false;

        gsap.timeline({
          onComplete: () => {
            isAnimating = false;
            atFinal = true;
          },
        })
          .to(".back-card1", { ...finalPos.card1, duration: 0.8, ease: "power2.out" }, 0)
          .to(".back-card2", { ...finalPos.card2, duration: 0.8, ease: "power2.out" }, 0)
          .to(".back-card3", { ...finalPos.card3, duration: 0.8, ease: "power2.out" }, 0)
          .to(".back-card4", { ...finalPos.card4, duration: 0.8, ease: "power2.out" }, 0);
      }

      function animateToStartNoDelay() {
        if (currentEnterTl) {
          currentEnterTl.kill();
          currentEnterTl = null;
        }

        gsap.killTweensOf([
          ".back-card1",
          ".back-card2",
          ".back-card3",
          ".back-card4",
        ]);

        pendingEnterDelay = false;
        isAnimating = true;
        atFinal = false;

        gsap.timeline({
          onComplete: () => {
            isAnimating = false;
            atStart = true;
          },
        })
          .to(".back-card1", { ...startPos.card1, duration: 0.4, ease: "power2.inOut" }, 0)
          .to(".back-card2", { ...startPos.card2, duration: 0.4, ease: "power2.inOut" }, 0)
          .to(".back-card3", { ...startPos.card3, duration: 0.4, ease: "power2.inOut" }, 0)
          .to(".back-card4", { ...startPos.card4, duration: 0.4, ease: "power2.inOut" }, 0);
      }

      function handleEnter() {
        if (pendingEnterDelay) {
          return;
        }

        if (isAnimating) {
          playEnterNoDelay();
          return;
        }

        if (atStart) {
          playEnterWithDelay();
          return;
        }

        if (atFinal) {
          playEnterWithDelay();
          return;
        }
      }

      function handleLeave() {
        animateToStartNoDelay();
      }

      ScrollTrigger.create({
        trigger: ".scroller",
        start: "top 20%",
        end: "top -200%",
        // markers: true, // Removed markers for mobile
        onEnter: handleEnter,
        onEnterBack: handleEnter,
        onLeave: handleLeave,
        onLeaveBack: handleLeave,
      });
    },
  });
}
