import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { breakpoints } from "../animation-handler";
import { onSectionChange } from "@modules/sections";

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ immediateRender: false });

let sectionChangeCount = 0;
let sectionChangeTimeout: number | null = null;
const RAPID_CHANGE_THRESHOLD = 300;

function trackRapidSectionChange(): boolean {
  sectionChangeCount++;
  
  const isRapidChange = sectionChangeCount >= 2;
  
  if (sectionChangeTimeout) {
    clearTimeout(sectionChangeTimeout);
  }
  
  sectionChangeTimeout = window.setTimeout(() => {
    sectionChangeCount = 0;
    sectionChangeTimeout = null;
  }, RAPID_CHANGE_THRESHOLD);
  
  return isRapidChange;
}

export function ProfileAnimationDesktop() {
  ContactAnimation();
  FrontCardsAnimation();
  BackCardsAnimation();
}

function ContactAnimation() {
  gsap.matchMedia().add(`(min-width: ${breakpoints.desktop}px)`, () => {

    if (document.querySelector(".contact-container")) {
      let contactAnimation: gsap.core.Tween | null = null;
      
      onSectionChange((current, previous, direction) => {
        const isEnteringFromIntro = current === 1 && previous === 0; 
        const isLeavingToIntro = current === 0 && previous === 1;    
        const isLeavingToWork = current === 2 && previous === 1;     
        const isReturningFromWork = current === 1 && previous === 2; 
        const isSkippingProfile = (current === 0 && previous === 2) || (current === 2 && previous === 0); // Projects ↔ Perks
        
        if (isSkippingProfile) {
          if (contactAnimation) contactAnimation.kill();
          gsap.set(".contact-container", { opacity: 0 });
        } else if (isEnteringFromIntro) {
          if (contactAnimation) contactAnimation.kill();
          
          contactAnimation = gsap.to(".contact-container", {
            opacity: 1,
            top: "50%",
            left: "80%",
            duration: 0.6,
            ease: "power2.out"
          });
        } else if (isLeavingToIntro) {
          if (contactAnimation) contactAnimation.kill();
          
          contactAnimation = gsap.to(".contact-container", {
            opacity: 1,
            top: "50%",
            left: "180%",
            duration: 0.6,
            ease: "power2.in"
          });
        } else if (isLeavingToWork) {
          if (contactAnimation) contactAnimation.kill();
          
          contactAnimation = gsap.to(".contact-container", {
            opacity: 1,
            top: "-100%",
            ease: "elastic.inOut(.3, 0.3)",
            duration: 0.7
          });
        } else if (isReturningFromWork) {
          if (contactAnimation) contactAnimation.kill();
          
          contactAnimation = gsap.to(".contact-container", {
            opacity: 1,
            top: "50%",
            left: "80%",
            duration: 0.7,
            ease: "elastic.inOut(.3, 0.3)"
          });
        }
      });
    }
  });
}


function FrontCardsAnimation() {
  gsap.matchMedia().add(`(min-width: ${breakpoints.desktop}px)`, () => {
    
    if (!document.querySelector(".card1")) return;
    
    let frontCardsTimeline: gsap.core.Timeline | null = null;
    
    const startPosition = {
      card1: { left: "-100%", bottom: "100%" },
      card2: { right: "-100%", bottom: "100%" },
      card3: { left: "-100%", bottom: "50%" },
      card4: { right: "-100%", bottom: "50%" },
    };

    const finalPosition = {
      card1: { left: "18%", bottom: "39%" },
      card2: { right: "18%", bottom: "39%" },
      card3: { left: "18%", bottom: "5%" },
      card4: { right: "18%", bottom: "5%" },
    };
    
    const hideUpPosition = {
      card1: { bottom: "200%" },
      card2: { bottom: "200%" },
      card3: { bottom: "200%" },
      card4: { bottom: "200%" },
    };
    
    const hideDownPosition = {
      card1: { bottom: "-200%" },
      card2: { bottom: "-200%" },
      card3: { bottom: "-200%" },
      card4: { bottom: "-200%" },
    };

    onSectionChange((current, previous, direction) => {
      const isEnteringFromIntro = current === 1 && previous === 0; 
      const isLeavingToIntro = current === 0 && previous === 1;    
      const isLeavingToWork = current === 2 && previous === 1;     
      const isReturningFromWork = current === 1 && previous === 2; 
      const isSkippingProfile = (current === 0 && previous === 2) || (current === 2 && previous === 0); // Projects ↔ Perks
      
      if (isSkippingProfile) {
        if (frontCardsTimeline) frontCardsTimeline.kill();
        gsap.set(".card1, .card2, .card3, .card4", { opacity: 0 });
      } else if (isEnteringFromIntro || isReturningFromWork) {
        if (frontCardsTimeline) frontCardsTimeline.kill();
        
        frontCardsTimeline = gsap.timeline();
        frontCardsTimeline.fromTo(".card1", startPosition.card1, { ...finalPosition.card1, opacity: 1, duration: 0.3 }, 0.20);
        frontCardsTimeline.fromTo(".card2", startPosition.card2, { ...finalPosition.card2, opacity: 1, duration: 0.3 }, 0.20);
        frontCardsTimeline.fromTo(".card3", startPosition.card3, { ...finalPosition.card3, opacity: 1, duration: 0.3 }, 0.11);
        frontCardsTimeline.fromTo(".card4", startPosition.card4, { ...finalPosition.card4, opacity: 1, duration: 0.3 }, 0.11);
      } else if (isLeavingToWork) {
        if (frontCardsTimeline) frontCardsTimeline.kill();
        
        frontCardsTimeline = gsap.timeline();
        frontCardsTimeline.fromTo(".card1", finalPosition.card1, { ...hideUpPosition.card1, opacity: 1, duration: 0.6 }, 0.12);
        frontCardsTimeline.fromTo(".card2", finalPosition.card2, { ...hideUpPosition.card2, opacity: 1, duration: 0.6 }, 0.17);
        frontCardsTimeline.fromTo(".card3", finalPosition.card3, { ...hideUpPosition.card3, opacity: 1, duration: 0.6 }, 0.28);
        frontCardsTimeline.fromTo(".card4", finalPosition.card4, { ...hideUpPosition.card4, opacity: 1, duration: 0.6 }, 0.21);
      } else if (isLeavingToIntro) {
        if (frontCardsTimeline) frontCardsTimeline.kill();
        
        frontCardsTimeline = gsap.timeline();
        frontCardsTimeline.to(".card1", { ...startPosition.card1, opacity: 1, duration: 0.3 }, 0);
        frontCardsTimeline.to(".card2", { ...startPosition.card2, opacity: 1, duration: 0.3 }, 0);
        frontCardsTimeline.to(".card3", { ...startPosition.card3, opacity: 1, duration: 0.3 }, 0);
        frontCardsTimeline.to(".card4", { ...startPosition.card4, opacity: 1, duration: 0.3 }, 0);
      }
    });
  });
}

function BackCardsAnimation() {
  gsap.matchMedia().add(`(min-width: ${breakpoints.desktop}px)`, () => {
    
    if (!document.querySelector(".back-card1")) return;
    
    let backCardsTimeline: gsap.core.Timeline | null = null;
    
    const startPosition = {
      card1: { left: "-100%", bottom: "100%" },
      card2: { right: "-100%", bottom: "100%" },
      card3: { left: "-100%", bottom: "50%" },
      card4: { right: "-100%", bottom: "50%" },
    };

    const finalPosition = {
      card1: { left: "18%", bottom: "53.5%" },
      card2: { right: "18%", bottom: "53.5%" },
      card3: { left: "18%", bottom: "19.5%" },
      card4: { right: "18%", bottom: "19.5%" },
    };
    
    const hideUpPosition = {
      card1: { bottom: "200%" },
      card2: { bottom: "200%" },
      card3: { bottom: "200%" },
      card4: { bottom: "200%" },
    };
    
    const hideDownPosition = {
      card1: { bottom: "-200%" },
      card2: { bottom: "-200%" },
      card3: { bottom: "-200%" },
      card4: { bottom: "-200%" },
    };
    
    gsap.set(".back-card1", startPosition.card1);
    gsap.set(".back-card2", startPosition.card2);
    gsap.set(".back-card3", startPosition.card3);
    gsap.set(".back-card4", startPosition.card4);

    onSectionChange((current, previous, direction) => {
      const isEnteringFromIntro = current === 1 && previous === 0; 
      const isLeavingToIntro = current === 0 && previous === 1;    
      const isLeavingToWork = current === 2 && previous === 1;     
      const isReturningFromWork = current === 1 && previous === 2; 
      const isSkippingProfile = (current === 0 && previous === 2) || (current === 2 && previous === 0); // Projects ↔ Perks
      
      if (isSkippingProfile) {
        if (backCardsTimeline) backCardsTimeline.kill();
        gsap.set(".back-card1, .back-card2, .back-card3, .back-card4", { opacity: 0 });
      } else if (isEnteringFromIntro || isReturningFromWork) {
        if (backCardsTimeline) backCardsTimeline.kill();
        
        backCardsTimeline = gsap.timeline();
        backCardsTimeline.to(".back-card1", { ...finalPosition.card1, opacity: 1, duration: 0.4, ease: "power2.out" }, 0.37);
        backCardsTimeline.to(".back-card4", { ...finalPosition.card4, opacity: 1, duration: 0.4, ease: "power2.out" }, 0.25);
        backCardsTimeline.to(".back-card3", { ...finalPosition.card3, opacity: 1, duration: 0.4, ease: "power2.out" }, 0.30);
        backCardsTimeline.to(".back-card2", { ...finalPosition.card2, opacity: 1, duration: 0.4, ease: "power2.out" }, 0.35);
      } else if (isLeavingToWork) {
        if (backCardsTimeline) backCardsTimeline.kill();
        
        backCardsTimeline = gsap.timeline();
        backCardsTimeline.fromTo(".back-card1", finalPosition.card1, { ...hideDownPosition.card1, opacity: 1, duration: 0.7 }, 0.29);
        backCardsTimeline.fromTo(".back-card2", finalPosition.card2, { ...hideDownPosition.card2, opacity: 1, duration: 0.7 }, 0.20);
        backCardsTimeline.fromTo(".back-card3", finalPosition.card3, { ...hideDownPosition.card3, opacity: 1, duration: 0.7 }, 0.1);
        backCardsTimeline.fromTo(".back-card4", finalPosition.card4, { ...hideDownPosition.card4, opacity: 1, duration: 0.7 }, 0.16);
      } else if (isLeavingToIntro) {
        if (backCardsTimeline) backCardsTimeline.kill();
        
        backCardsTimeline = gsap.timeline();
        backCardsTimeline.to(".back-card1", { ...startPosition.card1, opacity: 1, duration: 0.3 }, 0);
        backCardsTimeline.to(".back-card2", { ...startPosition.card2, opacity: 1, duration: 0.3 }, 0);
        backCardsTimeline.to(".back-card3", { ...startPosition.card3, opacity: 1, duration: 0.3 }, 0);
        backCardsTimeline.to(".back-card4", { ...startPosition.card4, opacity: 1, duration: 0.3 }, 0);
      }
    });
  });
}