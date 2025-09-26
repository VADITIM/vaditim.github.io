import { gsap } from "gsap/gsap-core";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export function CardsAnimations() {
  ScrollTrigger.matchMedia({
    // Desktop
    "(min-width: 436px)": function() {
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
    
    // Mobile
    "(max-width: 435px)": function() {
      gsap.fromTo(".card1", 
        { left: "-100%", top: "100%" }, 
        {
          left: "0%",
          top: "0%",

          scrollTrigger: { trigger: ".scroller",
            start: "top 80%",
            end: "bottom 100%",
          },
        }
      );
    }
  });
}

export function BackCardsAnimations() {
  ScrollTrigger.matchMedia({
    "(min-width: 436px)": function () {

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
      let pendingEnterDelay = false; // timeline started but waiting on the stagger delays
      let isAnimating = false;       // true when the first tween has started and until complete
      let atStart = true;
      let atFinal = false;

      // stable initial set
      gsap.set(".back-card1", startPos.card1);
      gsap.set(".back-card2", startPos.card2);
      gsap.set(".back-card3", startPos.card3);
      gsap.set(".back-card4", startPos.card4);

      function createEnterTimeline() {
        const tl = gsap.timeline({ defaults: { overwrite: "auto" } });

        // schedule with the delays you had
        tl.to(".back-card1", { ...finalPos.card1, duration: 0.8 }, 1.55);
        tl.to(".back-card2", { ...finalPos.card2, duration: 0.8 }, 1.4);
        tl.to(".back-card3", { ...finalPos.card3, duration: 0.8 }, 1.25);
        tl.to(".back-card4", { ...finalPos.card4, duration: 0.8 }, 1.1);

        // when the very first tween actually begins this fires
        tl.eventCallback("onStart", () => {
          pendingEnterDelay = false; // delay window is over
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
        // clear any previous plan or tweens so we start clean
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

        pendingEnterDelay = true; // lock the delay now

        // create a fresh timeline and start it. the scheduled delays will hold the actual motion.
        currentEnterTl = createEnterTimeline();
        currentEnterTl.restart();
      }

      function playEnterNoDelay() {
        // used when we want to move immediately toward final from current position
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
          .to(".back-card1", { ...finalPos.card1, duration: 0.8 }, 0)
          .to(".back-card2", { ...finalPos.card2, duration: 0.8 }, 0)
          .to(".back-card3", { ...finalPos.card3, duration: 0.8 }, 0)
          .to(".back-card4", { ...finalPos.card4, duration: 0.8 }, 0);
      }

      function animateToStartNoDelay() {
        // stop any pending enter timeline so no stray callbacks or delayed starts happen
        if (currentEnterTl) {
          currentEnterTl.kill();
          currentEnterTl = null;
        }

        // stop other tweens so we animate cleanly from current live values
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
          .to(".back-card1", { ...startPos.card1, duration: 0.4 }, 0)
          .to(".back-card2", { ...startPos.card2, duration: 0.4 }, 0)
          .to(".back-card3", { ...startPos.card3, duration: 0.4 }, 0)
          .to(".back-card4", { ...startPos.card4, duration: 0.4 }, 0);
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
        markers: true,
        onEnter: handleEnter,
        onEnterBack: handleEnter,
        onLeave: handleLeave,
        onLeaveBack: handleLeave,
      });
    },
  });
}
