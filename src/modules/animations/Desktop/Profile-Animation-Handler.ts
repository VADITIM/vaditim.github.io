import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { breakpoints, onSectionStatesChange } from "../animation-handler";

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ immediateRender: false });

const RAPID_PROFILE_PASS_WINDOW_MS = 200;



export function ProfileAnimationDesktop() {
  ContactAnimation();
  FrontCardsAnimation();
  BackCardsAnimation();
}

function ContactAnimation() {
  gsap.matchMedia().add(`(min-width: ${breakpoints.desktop}px)`, () => {

    if (document.querySelector(".contact-container")) {
      let contactAnimation: gsap.core.Tween | null = null;
      
      onSectionStatesChange(({ 
        enterProfileFromPerks: EnterFromPerksSection,
        leaveProfileToPerks: LeaveToPerksSection,
        leaveProfileToProjects: LeaveToProjectsSection,
        enterProfileFromProjects: EnterFromProjectsSection,
        skipProfile: skipped,
      }) => {
        
        if (skipped) {
          if (contactAnimation) contactAnimation.kill();
          gsap.set(".contact-container", { opacity: 0 });
        } else if (EnterFromPerksSection) {
          if (contactAnimation) contactAnimation.kill();
          
          contactAnimation = gsap.to(".contact-container", {
            opacity: 1,
            top: "50%",
            left: "80%",
            duration: 0.6,
            delay: .3,
            ease: "power2.out"
          });
        } else if (LeaveToPerksSection) {
          if (contactAnimation) contactAnimation.kill();
          
          contactAnimation = gsap.to(".contact-container", {
            opacity: 1,
            top: "50%",
            left: "180%",
            duration: 0.6,
            ease: "power2.in"
          });
        } else if (LeaveToProjectsSection) {
          if (contactAnimation) contactAnimation.kill();
          
          contactAnimation = gsap.to(".contact-container", {
            opacity: 1,
            top: "-100%",
            ease: "elastic.inOut(.3, 0.3)",
            duration: 0.7
          });
        } else if (EnterFromProjectsSection) {
          if (contactAnimation) contactAnimation.kill();
          
          contactAnimation = gsap.to(".contact-container", {
            opacity: 1,
            top: "50%",
            left: "80%",
            duration: 0.7,
            delay: .3,
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
    let lastProfileEnterAt: number | null = null;
    
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

    onSectionStatesChange(({
        enterProfileFromPerks: EnterFromPerksSection,
        leaveProfileToPerks: LeaveToPerksSection,
        leaveProfileToProjects: LeaveToProjectsSection,
        enterProfileFromProjects: EnterFromProjectsSection,
        skipProfile: skipped,
      }) => {

      const enteringProfile = EnterFromPerksSection || EnterFromProjectsSection;
      if (enteringProfile) {
        lastProfileEnterAt = performance.now();
      }

      const leavingProfile = LeaveToPerksSection || LeaveToProjectsSection;
      const rapidPassThrough =
        leavingProfile &&
        lastProfileEnterAt !== null &&
        performance.now() - lastProfileEnterAt <= RAPID_PROFILE_PASS_WINDOW_MS;

      if (rapidPassThrough) {
        if (frontCardsTimeline) frontCardsTimeline.kill();

        if (LeaveToPerksSection) {
          gsap.set(".card1", { ...startPosition.card1, opacity: 1 });
          gsap.set(".card2", { ...startPosition.card2, opacity: 1 });
          gsap.set(".card3", { ...startPosition.card3, opacity: 1 });
          gsap.set(".card4", { ...startPosition.card4, opacity: 1 });
        } else {
          gsap.set(".card1", { ...finalPosition.card1, ...hideUpPosition.card1, opacity: 1 });
          gsap.set(".card2", { ...finalPosition.card2, ...hideUpPosition.card2, opacity: 1 });
          gsap.set(".card3", { ...finalPosition.card3, ...hideUpPosition.card3, opacity: 1 });
          gsap.set(".card4", { ...finalPosition.card4, ...hideUpPosition.card4, opacity: 1 });
        }

        lastProfileEnterAt = null;
        return;
      }
      
      if (skipped) {
        if (frontCardsTimeline) frontCardsTimeline.kill();
        gsap.set(".card1, .card2, .card3, .card4", { opacity: 0 });
        lastProfileEnterAt = null;
      } else if (EnterFromPerksSection  ) {
        if (frontCardsTimeline) frontCardsTimeline.kill();
        
          frontCardsTimeline = gsap.timeline();
          frontCardsTimeline.fromTo(".card1", startPosition.card1, { ...finalPosition.card1, opacity: 1, duration: 0.3 }, 0.50);
          frontCardsTimeline.fromTo(".card2", startPosition.card2, { ...finalPosition.card2, opacity: 1, duration: 0.3 }, 0.50);
          frontCardsTimeline.fromTo(".card3", startPosition.card3, { ...finalPosition.card3, opacity: 1, duration: 0.3 }, 0.41);
          frontCardsTimeline.fromTo(".card4", startPosition.card4, { ...finalPosition.card4, opacity: 1, duration: 0.3 }, 0.41);
      } else if (LeaveToProjectsSection) {
        if (frontCardsTimeline) frontCardsTimeline.kill();
        
          frontCardsTimeline = gsap.timeline();
          frontCardsTimeline.fromTo(".card1", finalPosition.card1, { ...hideUpPosition.card1, opacity: 1, duration: 0.6 }, 0.12);
          frontCardsTimeline.fromTo(".card2", finalPosition.card2, { ...hideUpPosition.card2, opacity: 1, duration: 0.6 }, 0.17);
          frontCardsTimeline.fromTo(".card3", finalPosition.card3, { ...hideUpPosition.card3, opacity: 1, duration: 0.6 }, 0.28);
        frontCardsTimeline.fromTo(".card4", finalPosition.card4, { ...hideUpPosition.card4, opacity: 1, duration: 0.6 }, 0.21);
        lastProfileEnterAt = null;
      } else if (LeaveToPerksSection) {
        if (frontCardsTimeline) frontCardsTimeline.kill();
        
          frontCardsTimeline = gsap.timeline();
          frontCardsTimeline.to(".card1", { ...startPosition.card1, opacity: 1, duration: 0.3 }, 0);
          frontCardsTimeline.to(".card2", { ...startPosition.card2, opacity: 1, duration: 0.3 }, 0);
          frontCardsTimeline.to(".card3", { ...startPosition.card3, opacity: 1, duration: 0.3 }, 0);
          frontCardsTimeline.to(".card4", { ...startPosition.card4, opacity: 1, duration: 0.3 }, 0);
            lastProfileEnterAt = null;
      }
       else if (EnterFromProjectsSection) {
        if (frontCardsTimeline) frontCardsTimeline.kill();
        
          frontCardsTimeline = gsap.timeline();
          frontCardsTimeline.fromTo(".card1", hideUpPosition.card1, { ...finalPosition.card1, opacity: 1, duration: 0.3 }, 0.70);
          frontCardsTimeline.fromTo(".card2", hideUpPosition.card2, { ...finalPosition.card2, opacity: 1, duration: 0.3 }, 0.70);
          frontCardsTimeline.fromTo(".card3", hideUpPosition.card3, { ...finalPosition.card3, opacity: 1, duration: 0.3 }, 0.61);
          frontCardsTimeline.fromTo(".card4", hideUpPosition.card4, { ...finalPosition.card4, opacity: 1, duration: 0.3 }, 0.61);
       }
    });
  });
}


function BackCardsAnimation() {
  gsap.matchMedia().add(`(min-width: ${breakpoints.desktop}px)`, () => {
    
    if (!document.querySelector(".back-card1")) return;
    
    let backCardsTimeline: gsap.core.Timeline | null = null;
    let lastProfileEnterAt: number | null = null;
    
    const startPosition = {
      card1: { left: "18%", bottom: "200%" },
      card2: { right: "18%", bottom: "200%" },
      card3: { left: "18%", bottom: "150%" },
      card4: { right: "18%", bottom: "150%" },
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

    onSectionStatesChange(({
        enterProfileFromPerks: EnterFromPerksSection,
        leaveProfileToPerks: LeaveToPerksSection,
        leaveProfileToProjects: LeaveToProjectsSection,
        enterProfileFromProjects: EnterFromProjectsSection,
        skipProfile: skipped,
      }) => {

      const enteringProfile = EnterFromPerksSection || EnterFromProjectsSection;
      if (enteringProfile) {
        lastProfileEnterAt = performance.now();
      }

      const leavingProfile = LeaveToPerksSection || LeaveToProjectsSection;
      const rapidPassThrough =
        leavingProfile &&
        lastProfileEnterAt !== null &&
        performance.now() - lastProfileEnterAt <= RAPID_PROFILE_PASS_WINDOW_MS;

      if (rapidPassThrough) {
        if (backCardsTimeline) backCardsTimeline.kill();

        if (LeaveToPerksSection) {
          gsap.set(".back-card1", { ...finalPosition.card1, ...hideUpPosition.card1, opacity: 1 });
          gsap.set(".back-card2", { ...finalPosition.card2, ...hideUpPosition.card2, opacity: 1 });
          gsap.set(".back-card3", { ...finalPosition.card3, ...hideUpPosition.card3, opacity: 1 });
          gsap.set(".back-card4", { ...finalPosition.card4, ...hideUpPosition.card4, opacity: 1 });
        } else {
          gsap.set(".back-card1", { ...finalPosition.card1, ...hideDownPosition.card1, opacity: 1 });
          gsap.set(".back-card2", { ...finalPosition.card2, ...hideDownPosition.card2, opacity: 1 });
          gsap.set(".back-card3", { ...finalPosition.card3, ...hideDownPosition.card3, opacity: 1 });
          gsap.set(".back-card4", { ...finalPosition.card4, ...hideDownPosition.card4, opacity: 1 });
        }

        lastProfileEnterAt = null;
        return;
      }
      
      if (skipped) {
        if (backCardsTimeline) backCardsTimeline.kill();
        gsap.set(".back-card1, .back-card2, .back-card3, .back-card4", { opacity: 0 });
        lastProfileEnterAt = null;
        
      } else if (EnterFromPerksSection) {
        if (backCardsTimeline) backCardsTimeline.kill();
        backCardsTimeline = gsap.timeline();
        backCardsTimeline.fromTo(".back-card1", hideUpPosition.card1, { ...finalPosition.card1, opacity: 1, duration: 0.4, ease: "power2.out" }, 0.77);
        backCardsTimeline.fromTo(".back-card4", hideUpPosition.card2, { ...finalPosition.card4, opacity: 1, duration: 0.4, ease: "power2.out" }, 0.55);
        backCardsTimeline.fromTo(".back-card3", hideUpPosition.card3, { ...finalPosition.card3, opacity: 1, duration: 0.4, ease: "power2.out" }, 0.60);
        backCardsTimeline.fromTo(".back-card2", hideUpPosition.card4, { ...finalPosition.card2, opacity: 1, duration: 0.4, ease: "power2.out" }, 0.65);
        
      } else if (LeaveToPerksSection) {
        if (backCardsTimeline) backCardsTimeline.kill();
        backCardsTimeline = gsap.timeline();
        backCardsTimeline.fromTo(".back-card1", finalPosition.card1, { ...hideUpPosition.card1, opacity: 1, duration: 0.4, ease: "power2.out" }, 0.12);
        backCardsTimeline.fromTo(".back-card4", finalPosition.card2, { ...hideUpPosition.card4, opacity: 1, duration: 0.4, ease: "power2.out" }, 0.10);
        backCardsTimeline.fromTo(".back-card3", finalPosition.card3, { ...hideUpPosition.card3, opacity: 1, duration: 0.4, ease: "power2.out" }, 0.15);
        backCardsTimeline.fromTo(".back-card2", finalPosition.card4, { ...hideUpPosition.card2, opacity: 1, duration: 0.4, ease: "power2.out" }, 0.20);
        lastProfileEnterAt = null;

      } else if (LeaveToProjectsSection) {
        if (backCardsTimeline) backCardsTimeline.kill();
        backCardsTimeline = gsap.timeline();
        backCardsTimeline.fromTo(".back-card1", finalPosition.card1, { ...hideDownPosition.card1, opacity: 1, duration: 0.7 }, 0.29);
        backCardsTimeline.fromTo(".back-card2", finalPosition.card2, { ...hideDownPosition.card2, opacity: 1, duration: 0.7 }, 0.20);
        backCardsTimeline.fromTo(".back-card3", finalPosition.card3, { ...hideDownPosition.card3, opacity: 1, duration: 0.7 }, 0.1);
        backCardsTimeline.fromTo(".back-card4", finalPosition.card4, { ...hideDownPosition.card4, opacity: 1, duration: 0.7 }, 0.16);
        lastProfileEnterAt = null;

      } else if (EnterFromProjectsSection) {
        if (backCardsTimeline) backCardsTimeline.kill();
        backCardsTimeline = gsap.timeline();
        backCardsTimeline.fromTo(".back-card1" ,hideDownPosition.card1, { ...finalPosition.card1, opacity: 1, duration: 0.3 }, 0.60);
        backCardsTimeline.fromTo(".back-card2" ,hideDownPosition.card2, { ...finalPosition.card2, opacity: 1, duration: 0.3 }, 0.55);
        backCardsTimeline.fromTo(".back-card3" ,hideDownPosition.card3, { ...finalPosition.card3, opacity: 1, duration: 0.3 }, 0.42);
        backCardsTimeline.fromTo(".back-card4" ,hideDownPosition.card4, { ...finalPosition.card4, opacity: 1, duration: 0.3 }, 0.58);
      }
    });
  });
}