import { gsap } from "gsap";
import { breakpoints } from "@modules/animations/animation-handler";
import {
  onSectionEnterLeaveAnimation,
  onSectionStatesChange,
  SECTION_INDEX,
  type SectionTransitionStates,
} from "../section-state-machine";

gsap.defaults({ immediateRender: false });

const RAPID_PROFILE_PASS_WINDOW_MS = 500;
const FRONT_CARD_SELECTOR = ".card1, .card2, .card3, .card4";
const BACK_CARD_SELECTOR = ".back-card1, .back-card2, .back-card3, .back-card4";

type CardKey = "card1" | "card2" | "card3" | "card4";

const FRONT_SELECTORS: Record<CardKey, string> = {
  card1: ".card1",
  card2: ".card2",
  card3: ".card3",
  card4: ".card4",
};

const BACK_SELECTORS: Record<CardKey, string> = {
  card1: ".back-card1",
  card2: ".back-card2",
  card3: ".back-card3",
  card4: ".back-card4",
};

const CARD_KEYS: CardKey[] = ["card1", "card2", "card3", "card4"];

const isProfileEnter = (states: SectionTransitionStates) =>
  states.enterProfileFromPerks ||
  states.enterProfileFromProjects ||
  states.enterProfileFromNone;

const isProfileLeave = (states: SectionTransitionStates) =>
  states.leaveProfileToPerks || states.leaveProfileToProjects;

function killTimeline(timeline: gsap.core.Timeline | null) {
  if (timeline) timeline.kill();
}

function setCardStates(
  selectors: Record<CardKey, string>,
  states: Record<CardKey, gsap.TweenVars>
) {
  CARD_KEYS.forEach((key) => {
    gsap.set(selectors[key], states[key]);
  });
}

function createTimeline(build: (timeline: gsap.core.Timeline) => void) {
  const timeline = gsap.timeline();
  build(timeline);
  return timeline;
}



export function ProfileAnimationDesktop() {
  ProfileMobile();
  ContactDesktop();
  FrontCardsDesktop();
  BackCardsDesktop();
}

function ProfileMobile() {
  gsap.matchMedia().add(`(max-width: ${breakpoints.tabletLandscape}px)`, () => {
    const PROFILE_MOBILE_SELECTOR = `.contact-container, ${FRONT_CARD_SELECTOR}, ${BACK_CARD_SELECTOR}`;
    if (!document.querySelector(PROFILE_MOBILE_SELECTOR)) return;

    let tween: gsap.core.Tween | null = null;

    const playEnter = () => {
      if (tween) tween.kill();
      tween = gsap.to(PROFILE_MOBILE_SELECTOR, {
        opacity: 1,
        y: 0,
        duration: 0.45,
        stagger: 0.03,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const playLeave = () => {
      if (tween) tween.kill();
      tween = gsap.to(PROFILE_MOBILE_SELECTOR, {
        opacity: 0,
        y: -20,
        duration: 0.25,
        stagger: 0.02,
        ease: "power2.in",
        overwrite: "auto",
      });
    };

    gsap.set(PROFILE_MOBILE_SELECTOR, { opacity: 0, y: 20 });

    const cleanup = onSectionEnterLeaveAnimation({
      isEnter: isProfileEnter,
      isLeave: isProfileLeave,
      onEnter: playEnter,
      onLeave: playLeave,
      initialSection: SECTION_INDEX.PROFILE,
    });

    return () => {
      cleanup();
      if (tween) tween.kill();
    };
  });
}

function ContactDesktop() {
  gsap.matchMedia().add(`(min-width: ${breakpoints.desktop}px)`, () => {
    if (!document.querySelector(".contact-container")) return;

    let contactAnimation: gsap.core.Tween | null = null;

    const cleanupStates = onSectionStatesChange(({ 
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
            delay: 0.3,
            ease: "elastic.inOut(.3, 0.3)"
          });
        }
      });

    return () => {
      cleanupStates();
      if (contactAnimation) contactAnimation.kill();
    };
  });
}


function FrontCardsDesktop() {
  gsap.matchMedia().add(`(min-width: ${breakpoints.desktop}px)`, () => {
    if (!document.querySelector(".card1")) return;

    let frontCardsTimeline: gsap.core.Timeline | null = null;
    let lastProfileEnterAt: number | null = null;

    const startPosition = {
      card1: { left: "18%", bottom: "-200%" },
      card2: { right: "18%", bottom: "-200%" },
      card3: { left: "18%", bottom: "-150%" },
      card4: { right: "18%", bottom: "-150%" },
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

    setCardStates(FRONT_SELECTORS, {
      card1: { ...startPosition.card1, opacity: 1 },
      card2: { ...startPosition.card2, opacity: 1 },
      card3: { ...startPosition.card3, opacity: 1 },
      card4: { ...startPosition.card4, opacity: 1 },
    });

    const cleanupStates = onSectionStatesChange(({
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
        killTimeline(frontCardsTimeline);

        if (LeaveToPerksSection) {
          setCardStates(FRONT_SELECTORS, {
            card1: { ...startPosition.card1, opacity: 1 },
            card2: { ...startPosition.card2, opacity: 1 },
            card3: { ...startPosition.card3, opacity: 1 },
            card4: { ...startPosition.card4, opacity: 1 },
          });
        } else {
          setCardStates(FRONT_SELECTORS, {
            card1: { ...finalPosition.card1, ...hideUpPosition.card1, opacity: 1 },
            card2: { ...finalPosition.card2, ...hideUpPosition.card2, opacity: 1 },
            card3: { ...finalPosition.card3, ...hideUpPosition.card3, opacity: 1 },
            card4: { ...finalPosition.card4, ...hideUpPosition.card4, opacity: 1 },
          });
        }

        lastProfileEnterAt = null;
        return;
      }
      
      if (skipped) {
        killTimeline(frontCardsTimeline);
        gsap.set(FRONT_CARD_SELECTOR, { opacity: 0 });
        lastProfileEnterAt = null;
        
      } else if (EnterFromPerksSection)  {
        killTimeline(frontCardsTimeline);
        setCardStates(FRONT_SELECTORS, {
          card1: { ...startPosition.card1, opacity: 1 },
          card2: { ...startPosition.card2, opacity: 1 },
          card3: { ...startPosition.card3, opacity: 1 },
          card4: { ...startPosition.card4, opacity: 1 },
        });
        frontCardsTimeline = createTimeline((timeline) => {
          timeline.fromTo(".card1", startPosition.card1, { ...finalPosition.card1, opacity: 1, duration: 0.48, ease: "power2.out" }, 0.55);
          timeline.fromTo(".card2", startPosition.card2, { ...finalPosition.card2, opacity: 1, duration: 0.46, ease: "power2.out" }, 0.55);
          timeline.fromTo(".card3", startPosition.card3, { ...finalPosition.card3, opacity: 1, duration: 0.44, ease: "power2.out" }, 0.60);
          timeline.fromTo(".card4", startPosition.card4, { ...finalPosition.card4, opacity: 1, duration: 0.42, ease: "power2.out" }, 0.65);
        });
        // ---------------------------------------------------------------------------------------------------------------------------------------
      } else if (LeaveToPerksSection) {
        killTimeline(frontCardsTimeline);
        frontCardsTimeline = createTimeline((timeline) => {
          timeline.to(".card1", { ...startPosition.card1, opacity: 1, duration: 0.42, ease: "power2.out" }, 0.21);
          timeline.to(".card2", { ...startPosition.card2, opacity: 1, duration: 0.44, ease: "power2.out" }, 0.20);
          timeline.to(".card3", { ...startPosition.card3, opacity: 1, duration: 0.46, ease: "power2.out" }, 0.12);
          timeline.to(".card4", { ...startPosition.card4, opacity: 1, duration: 0.48, ease: "power2.out" }, 0.14);
        });
        lastProfileEnterAt = null;

      } else if (EnterFromProjectsSection) {
        killTimeline(frontCardsTimeline);
        setCardStates(FRONT_SELECTORS, {
          card1: { ...finalPosition.card1, ...hideUpPosition.card1, opacity: 1 },
          card2: { ...finalPosition.card2, ...hideUpPosition.card2, opacity: 1 },
          card3: { ...finalPosition.card3, ...hideUpPosition.card3, opacity: 1 },
          card4: { ...finalPosition.card4, ...hideUpPosition.card4, opacity: 1 },
        });
        frontCardsTimeline = createTimeline((timeline) => {
          timeline.fromTo(".card1", { ...finalPosition.card1, ...hideUpPosition.card1 }, { ...finalPosition.card1, opacity: 1, duration: 0.3 }, 0.70);
          timeline.fromTo(".card2", { ...finalPosition.card2, ...hideUpPosition.card2 }, { ...finalPosition.card2, opacity: 1, duration: 0.3 }, 0.70);
          timeline.fromTo(".card3", { ...finalPosition.card3, ...hideUpPosition.card3 }, { ...finalPosition.card3, opacity: 1, duration: 0.3 }, 0.61);
          timeline.fromTo(".card4", { ...finalPosition.card4, ...hideUpPosition.card4 }, { ...finalPosition.card4, opacity: 1, duration: 0.3 }, 0.61);
        });
        // ---------------------------------------------------------------------------------------------------------------------------------------
       
      } else if (LeaveToProjectsSection) {
        killTimeline(frontCardsTimeline);
        frontCardsTimeline = createTimeline((timeline) => {
          timeline.fromTo(".card1", finalPosition.card1, { ...hideUpPosition.card1, opacity: 1, duration: 0.48, ease: "power2.out" }, 0.1);
          timeline.fromTo(".card2", finalPosition.card2, { ...hideUpPosition.card2, opacity: 1, duration: 0.46, ease: "power2.out" }, 0.13);
          timeline.fromTo(".card3", finalPosition.card3, { ...hideUpPosition.card3, opacity: 1, duration: 0.44, ease: "power2.out" }, 0.19);
          timeline.fromTo(".card4", finalPosition.card4, { ...hideUpPosition.card4, opacity: 1, duration: 0.42, ease: "power2.out" }, 0.22);
        });
        lastProfileEnterAt = null;
      }
    });

    return () => {
      cleanupStates();
      killTimeline(frontCardsTimeline);
    };
  });
}


function BackCardsDesktop() {
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

    setCardStates(BACK_SELECTORS, {
      card1: { ...startPosition.card1, opacity: 1 },
      card2: { ...startPosition.card2, opacity: 1 },
      card3: { ...startPosition.card3, opacity: 1 },
      card4: { ...startPosition.card4, opacity: 1 },
    });

    const cleanupStates = onSectionStatesChange(({
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
        killTimeline(backCardsTimeline);

        if (LeaveToPerksSection) {
          setCardStates(BACK_SELECTORS, {
            card1: { ...finalPosition.card1, ...hideUpPosition.card1, opacity: 1 },
            card2: { ...finalPosition.card2, ...hideUpPosition.card2, opacity: 1 },
            card3: { ...finalPosition.card3, ...hideUpPosition.card3, opacity: 1 },
            card4: { ...finalPosition.card4, ...hideUpPosition.card4, opacity: 1 },
          });
        } else {
          setCardStates(BACK_SELECTORS, {
            card1: { ...finalPosition.card1, ...hideDownPosition.card1, opacity: 1 },
            card2: { ...finalPosition.card2, ...hideDownPosition.card2, opacity: 1 },
            card3: { ...finalPosition.card3, ...hideDownPosition.card3, opacity: 1 },
            card4: { ...finalPosition.card4, ...hideDownPosition.card4, opacity: 1 },
          });
        }

        lastProfileEnterAt = null;
        return;
      }
      
      if (skipped) {
        killTimeline(backCardsTimeline);
        gsap.set(BACK_CARD_SELECTOR, { opacity: 0 });
        lastProfileEnterAt = null;
        
      } else if (EnterFromPerksSection) {
        killTimeline(backCardsTimeline);
        setCardStates(BACK_SELECTORS, {
          card1: { ...finalPosition.card1, ...hideUpPosition.card1, opacity: 1 },
          card2: { ...finalPosition.card2, ...hideUpPosition.card2, opacity: 1 },
          card3: { ...finalPosition.card3, ...hideUpPosition.card3, opacity: 1 },
          card4: { ...finalPosition.card4, ...hideUpPosition.card4, opacity: 1 },
        });
        backCardsTimeline = createTimeline((timeline) => {
          timeline.fromTo(".back-card1", { ...finalPosition.card1, ...hideUpPosition.card1 }, { ...finalPosition.card1, opacity: 1, duration: 0.48, ease: "power2.out" }, 0.84);
          timeline.fromTo(".back-card4", { ...finalPosition.card4, ...hideUpPosition.card4 }, { ...finalPosition.card4, opacity: 1, duration: 0.46, ease: "power2.out" }, 0.8);
          timeline.fromTo(".back-card3", { ...finalPosition.card3, ...hideUpPosition.card3 }, { ...finalPosition.card3, opacity: 1, duration: 0.44, ease: "power2.out" }, 0.73);
          timeline.fromTo(".back-card2", { ...finalPosition.card2, ...hideUpPosition.card2 }, { ...finalPosition.card2, opacity: 1, duration: 0.42, ease: "power2.out" }, 0.76);
        });
        // ---------------------------------------------------------------------------------------------------------------------------------------
      } else if (LeaveToPerksSection) {
        killTimeline(backCardsTimeline);
        backCardsTimeline = createTimeline((timeline) => {
          timeline.fromTo(".back-card1", finalPosition.card1, { ...hideUpPosition.card1, opacity: 1, duration: 0.42, ease: "power2.out" }, 0.12);
          timeline.fromTo(".back-card4", finalPosition.card2, { ...hideUpPosition.card4, opacity: 1, duration: 0.43, ease: "power2.out" }, 0.10);
          timeline.fromTo(".back-card3", finalPosition.card3, { ...hideUpPosition.card3, opacity: 1, duration: 0.46, ease: "power2.out" }, 0.15);
          timeline.fromTo(".back-card2", finalPosition.card4, { ...hideUpPosition.card2, opacity: 1, duration: 0.48, ease: "power2.out" }, 0.20);
        });
        lastProfileEnterAt = null;

      } else if (EnterFromProjectsSection) {
        killTimeline(backCardsTimeline);
        setCardStates(BACK_SELECTORS, {
          card1: { ...finalPosition.card1, ...hideDownPosition.card1, opacity: 1 },
          card2: { ...finalPosition.card2, ...hideDownPosition.card2, opacity: 1 },
          card3: { ...finalPosition.card3, ...hideDownPosition.card3, opacity: 1 },
          card4: { ...finalPosition.card4, ...hideDownPosition.card4, opacity: 1 },
        });
        backCardsTimeline = createTimeline((timeline) => {
          timeline.fromTo(".back-card1", { ...finalPosition.card1, ...hideDownPosition.card1 }, { ...finalPosition.card1, opacity: 1, duration: 0.3 }, 0.60);
          timeline.fromTo(".back-card2", { ...finalPosition.card2, ...hideDownPosition.card2 }, { ...finalPosition.card2, opacity: 1, duration: 0.3 }, 0.55);
          timeline.fromTo(".back-card3", { ...finalPosition.card3, ...hideDownPosition.card3 }, { ...finalPosition.card3, opacity: 1, duration: 0.3 }, 0.42);
          timeline.fromTo(".back-card4", { ...finalPosition.card4, ...hideDownPosition.card4 }, { ...finalPosition.card4, opacity: 1, duration: 0.3 }, 0.58);
        });
        // ---------------------------------------------------------------------------------------------------------------------------------------

      } else if (LeaveToProjectsSection) {
        killTimeline(backCardsTimeline);
        backCardsTimeline = createTimeline((timeline) => {
          timeline.fromTo(".back-card1", finalPosition.card1, { ...hideDownPosition.card1, opacity: 1, duration: 0.48 }, 0.20);
          timeline.fromTo(".back-card2", finalPosition.card2, { ...hideDownPosition.card2, opacity: 1, duration: 0.46 }, 0.18);
          timeline.fromTo(".back-card3", finalPosition.card3, { ...hideDownPosition.card3, opacity: 1, duration: 0.44 }, 0.11);
          timeline.fromTo(".back-card4", finalPosition.card4, { ...hideDownPosition.card4, opacity: 1, duration: 0.42 }, 0.14);
        });
        lastProfileEnterAt = null;
      }
    });

    return () => {
      cleanupStates();
      killTimeline(backCardsTimeline);
    };
  });
}