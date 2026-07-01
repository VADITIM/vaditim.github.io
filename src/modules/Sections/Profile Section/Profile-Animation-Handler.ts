import { gsap } from "gsap";
import { breakpoints } from "@modules/animations/animation-handler";
import {
  onSectionEnterLeaveAnimation,
  onSectionStatesChange,
  type SectionTransitionMeta,
} from "../section-state-machine";
import { getSectionIndexById } from "../section-registry";
import { SECTION_ENTER_DELAY } from "../section-transition";

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

function KillTimeline(timeline: gsap.core.Timeline | null) {
  if (timeline) timeline.kill();
}

function SetCardStates(
  selectors: Record<CardKey, string>,
  states: Record<CardKey, gsap.TweenVars>
) {
  CARD_KEYS.forEach((key) => {
    gsap.set(selectors[key], states[key]);
  });
}

// `delay` gates enter timelines behind the section-cut curtain; leave timelines
// pass 0 so they fire immediately at the hook.
function CreateTimeline(build: (timeline: gsap.core.Timeline) => void, delay = 0) {
  const timeline = gsap.timeline({ delay });
  build(timeline);
  return timeline;
}

type ContactDesktopVariant = { mediaQuery: string };
type FrontCardsDesktopVariant = { mediaQuery: string };
type BackCardsDesktopVariant = { mediaQuery: string };

export function registerProfileAnimations() {
  const profileIdx = getSectionIndexById('profile');
  const perksIdx = getSectionIndexById('perks');
  const projectsIdx = getSectionIndexById('projects');

  const isEnter = (meta: SectionTransitionMeta) => meta.isEnteringSection(profileIdx);
  const isLeave = (meta: SectionTransitionMeta) => meta.isLeavingSection(profileIdx);

  ProfileMobile(profileIdx, isEnter, isLeave);
  ContactDesktop(profileIdx, perksIdx, projectsIdx);
  FrontCardsDesktop(profileIdx, perksIdx, projectsIdx);
  BackCardsDesktop(profileIdx, perksIdx, projectsIdx);
}

function RegisterProfileM(
  config: { mediaQuery: string; selector: string },
  isEnter: (m: SectionTransitionMeta) => boolean,
  isLeave: (m: SectionTransitionMeta) => boolean,
  initialSection: number
) {
  gsap.matchMedia().add(config.mediaQuery, () => {
    if (!document.querySelector(config.selector)) return;

    let tween: gsap.core.Tween | null = null;

    const playEnter = () => {
      if (tween) tween.kill();
      tween = gsap.to(config.selector, {
        opacity: 1,
        y: 0,
        duration: 0.45,
        stagger: 0.03,
        delay: SECTION_ENTER_DELAY,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const playLeave = () => {
      if (tween) tween.kill();
      tween = gsap.to(config.selector, {
        opacity: 0,
        y: -20,
        duration: 0.25,
        stagger: 0.02,
        ease: "power2.in",
        overwrite: "auto",
      });
    };

    gsap.set(config.selector, { opacity: 0, y: 20 });

    const cleanup = onSectionEnterLeaveAnimation({
      isEnter,
      isLeave,
      onEnter: playEnter,
      onLeave: playLeave,
      initialSection,
    });

    return () => {
      cleanup();
      if (tween) tween.kill();
    };
  });
}

function ProfileMobile(
  profileIdx: number,
  isEnter: (m: SectionTransitionMeta) => boolean,
  isLeave: (m: SectionTransitionMeta) => boolean
) {
  const mobileVariants = [
    {
      mediaQuery: `(max-width: ${breakpoints.tabletLandscape}px)`,
      selector: `.contact-container, ${FRONT_CARD_SELECTOR}, ${BACK_CARD_SELECTOR}`,
    },
  ];

  mobileVariants.forEach(v => RegisterProfileM(v, isEnter, isLeave, profileIdx));
}

function RegisterContactD(
  config: ContactDesktopVariant,
  profileIdx: number,
  perksIdx: number,
  projectsIdx: number
) {
  gsap.matchMedia().add(config.mediaQuery, () => {
    if (!document.querySelector(".contact-container")) return;

    let contactAnimation: gsap.core.Tween | null = null;

    const cleanupStates = onSectionStatesChange((meta) => {
      const EnterFromPerks = meta.isEnteringSection(profileIdx) && meta.isFromSection(perksIdx);
      const LeaveToPerks   = meta.isLeavingSection(profileIdx) && meta.isToSection(perksIdx);
      const LeaveToProjects = meta.isLeavingSection(profileIdx) && meta.isToSection(projectsIdx);
      const EnterFromProjects = meta.isEnteringSection(profileIdx) && meta.isFromSection(projectsIdx);
      const skipped = meta.isSkippingSection(profileIdx);

      if (skipped) {
        if (contactAnimation) contactAnimation.kill();
        gsap.set(".contact-container", { opacity: 0 });
      } else if (EnterFromPerks) {
        if (contactAnimation) contactAnimation.kill();
        contactAnimation = gsap.to(".contact-container", {
          opacity: 1,
          top: "50%",
          left: "80%",
          duration: 0.6,
          delay: SECTION_ENTER_DELAY + 0.3,
          ease: "power2.out"
        });
      } else if (LeaveToPerks) {
        if (contactAnimation) contactAnimation.kill();
        contactAnimation = gsap.to(".contact-container", {
          opacity: 1,
          top: "50%",
          left: "180%",
          duration: 0.6,
          ease: "power2.in"
        });
      } else if (LeaveToProjects) {
        if (contactAnimation) contactAnimation.kill();
        contactAnimation = gsap.to(".contact-container", {
          opacity: 1,
          top: "-100%",
          ease: "elastic.inOut(.3, 0.3)",
          duration: 0.7
        });
      } else if (EnterFromProjects) {
        if (contactAnimation) contactAnimation.kill();
        contactAnimation = gsap.to(".contact-container", {
          opacity: 1,
          top: "50%",
          left: "80%",
          duration: 0.7,
          delay: SECTION_ENTER_DELAY + 0.3,
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

function ContactDesktop(profileIdx: number, perksIdx: number, projectsIdx: number) {
  const desktopVariants: ContactDesktopVariant[] = [
    { mediaQuery: `(min-width: ${breakpoints.smallDesktop}px)` },
  ];

  desktopVariants.forEach(v => RegisterContactD(v, profileIdx, perksIdx, projectsIdx));
}


function RegisterFrontCardsD(
  config: FrontCardsDesktopVariant,
  profileIdx: number,
  perksIdx: number,
  projectsIdx: number
) {
  gsap.matchMedia().add(config.mediaQuery, () => {
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

    SetCardStates(FRONT_SELECTORS, {
      card1: { ...startPosition.card1, opacity: 1 },
      card2: { ...startPosition.card2, opacity: 1 },
      card3: { ...startPosition.card3, opacity: 1 },
      card4: { ...startPosition.card4, opacity: 1 },
    });

    const cleanupStates = onSectionStatesChange((meta) => {
      const EnterFromPerks    = meta.isEnteringSection(profileIdx) && meta.isFromSection(perksIdx);
      const LeaveToPerks      = meta.isLeavingSection(profileIdx) && meta.isToSection(perksIdx);
      const LeaveToProjects   = meta.isLeavingSection(profileIdx) && meta.isToSection(projectsIdx);
      const EnterFromProjects = meta.isEnteringSection(profileIdx) && meta.isFromSection(projectsIdx);
      const skipped           = meta.isSkippingSection(profileIdx);

      const enteringProfile = EnterFromPerks || EnterFromProjects;
      if (enteringProfile) {
        lastProfileEnterAt = performance.now();
      }

      const leavingProfile = LeaveToPerks || LeaveToProjects;
      const rapidPassThrough =
        leavingProfile &&
        lastProfileEnterAt !== null &&
        performance.now() - lastProfileEnterAt <= RAPID_PROFILE_PASS_WINDOW_MS;

      if (rapidPassThrough) {
        KillTimeline(frontCardsTimeline);

        if (LeaveToPerks) {
          SetCardStates(FRONT_SELECTORS, {
            card1: { ...startPosition.card1, opacity: 1 },
            card2: { ...startPosition.card2, opacity: 1 },
            card3: { ...startPosition.card3, opacity: 1 },
            card4: { ...startPosition.card4, opacity: 1 },
          });
        } else {
          SetCardStates(FRONT_SELECTORS, {
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
        KillTimeline(frontCardsTimeline);
        gsap.set(FRONT_CARD_SELECTOR, { opacity: 0 });
        lastProfileEnterAt = null;

      } else if (EnterFromPerks)  {
        KillTimeline(frontCardsTimeline);
        SetCardStates(FRONT_SELECTORS, {
          card1: { ...startPosition.card1, opacity: 1 },
          card2: { ...startPosition.card2, opacity: 1 },
          card3: { ...startPosition.card3, opacity: 1 },
          card4: { ...startPosition.card4, opacity: 1 },
        });
        frontCardsTimeline = CreateTimeline((timeline) => {
          timeline.fromTo(".card1", startPosition.card1, { ...finalPosition.card1, opacity: 1, duration: 0.48, ease: "power2.out" }, 0.55);
          timeline.fromTo(".card2", startPosition.card2, { ...finalPosition.card2, opacity: 1, duration: 0.46, ease: "power2.out" }, 0.55);
          timeline.fromTo(".card3", startPosition.card3, { ...finalPosition.card3, opacity: 1, duration: 0.44, ease: "power2.out" }, 0.60);
          timeline.fromTo(".card4", startPosition.card4, { ...finalPosition.card4, opacity: 1, duration: 0.42, ease: "power2.out" }, 0.65);
        }, SECTION_ENTER_DELAY);

      } else if (LeaveToPerks) {
        KillTimeline(frontCardsTimeline);
        frontCardsTimeline = CreateTimeline((timeline) => {
          timeline.to(".card1", { ...startPosition.card1, opacity: 1, duration: 0.42, ease: "power2.out" }, 0.21);
          timeline.to(".card2", { ...startPosition.card2, opacity: 1, duration: 0.44, ease: "power2.out" }, 0.20);
          timeline.to(".card3", { ...startPosition.card3, opacity: 1, duration: 0.46, ease: "power2.out" }, 0.12);
          timeline.to(".card4", { ...startPosition.card4, opacity: 1, duration: 0.48, ease: "power2.out" }, 0.14);
        });
        lastProfileEnterAt = null;

      } else if (EnterFromProjects) {
        KillTimeline(frontCardsTimeline);
        SetCardStates(FRONT_SELECTORS, {
          card1: { ...finalPosition.card1, ...hideUpPosition.card1, opacity: 1 },
          card2: { ...finalPosition.card2, ...hideUpPosition.card2, opacity: 1 },
          card3: { ...finalPosition.card3, ...hideUpPosition.card3, opacity: 1 },
          card4: { ...finalPosition.card4, ...hideUpPosition.card4, opacity: 1 },
        });
        frontCardsTimeline = CreateTimeline((timeline) => {
          timeline.fromTo(".card1", { ...finalPosition.card1, ...hideUpPosition.card1 }, { ...finalPosition.card1, opacity: 1, duration: 0.3 }, 0.70);
          timeline.fromTo(".card2", { ...finalPosition.card2, ...hideUpPosition.card2 }, { ...finalPosition.card2, opacity: 1, duration: 0.3 }, 0.70);
          timeline.fromTo(".card3", { ...finalPosition.card3, ...hideUpPosition.card3 }, { ...finalPosition.card3, opacity: 1, duration: 0.3 }, 0.61);
          timeline.fromTo(".card4", { ...finalPosition.card4, ...hideUpPosition.card4 }, { ...finalPosition.card4, opacity: 1, duration: 0.3 }, 0.61);
        }, SECTION_ENTER_DELAY);

      } else if (LeaveToProjects) {
        KillTimeline(frontCardsTimeline);
        frontCardsTimeline = CreateTimeline((timeline) => {
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
      KillTimeline(frontCardsTimeline);
    };
  });
}

function FrontCardsDesktop(profileIdx: number, perksIdx: number, projectsIdx: number) {
  const desktopVariants: FrontCardsDesktopVariant[] = [
    { mediaQuery: `(min-width: ${breakpoints.smallDesktop}px)` },
  ];

  desktopVariants.forEach(v => RegisterFrontCardsD(v, profileIdx, perksIdx, projectsIdx));
}


function RegisterBackCardsD(
  config: BackCardsDesktopVariant,
  profileIdx: number,
  perksIdx: number,
  projectsIdx: number
) {
  gsap.matchMedia().add(config.mediaQuery, () => {
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

    SetCardStates(BACK_SELECTORS, {
      card1: { ...startPosition.card1, opacity: 1 },
      card2: { ...startPosition.card2, opacity: 1 },
      card3: { ...startPosition.card3, opacity: 1 },
      card4: { ...startPosition.card4, opacity: 1 },
    });

    const cleanupStates = onSectionStatesChange((meta) => {
      const EnterFromPerks    = meta.isEnteringSection(profileIdx) && meta.isFromSection(perksIdx);
      const LeaveToPerks      = meta.isLeavingSection(profileIdx) && meta.isToSection(perksIdx);
      const LeaveToProjects   = meta.isLeavingSection(profileIdx) && meta.isToSection(projectsIdx);
      const EnterFromProjects = meta.isEnteringSection(profileIdx) && meta.isFromSection(projectsIdx);
      const skipped           = meta.isSkippingSection(profileIdx);

      const enteringProfile = EnterFromPerks || EnterFromProjects;
      if (enteringProfile) {
        lastProfileEnterAt = performance.now();
      }

      const leavingProfile = LeaveToPerks || LeaveToProjects;
      const rapidPassThrough =
        leavingProfile &&
        lastProfileEnterAt !== null &&
        performance.now() - lastProfileEnterAt <= RAPID_PROFILE_PASS_WINDOW_MS;

      if (rapidPassThrough) {
        KillTimeline(backCardsTimeline);

        if (LeaveToPerks) {
          SetCardStates(BACK_SELECTORS, {
            card1: { ...finalPosition.card1, ...hideUpPosition.card1, opacity: 1 },
            card2: { ...finalPosition.card2, ...hideUpPosition.card2, opacity: 1 },
            card3: { ...finalPosition.card3, ...hideUpPosition.card3, opacity: 1 },
            card4: { ...finalPosition.card4, ...hideUpPosition.card4, opacity: 1 },
          });
        } else {
          SetCardStates(BACK_SELECTORS, {
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
        KillTimeline(backCardsTimeline);
        gsap.set(BACK_CARD_SELECTOR, { opacity: 0 });
        lastProfileEnterAt = null;

      } else if (EnterFromPerks) {
        KillTimeline(backCardsTimeline);
        SetCardStates(BACK_SELECTORS, {
          card1: { ...finalPosition.card1, ...hideUpPosition.card1, opacity: 1 },
          card2: { ...finalPosition.card2, ...hideUpPosition.card2, opacity: 1 },
          card3: { ...finalPosition.card3, ...hideUpPosition.card3, opacity: 1 },
          card4: { ...finalPosition.card4, ...hideUpPosition.card4, opacity: 1 },
        });
        backCardsTimeline = CreateTimeline((timeline) => {
          timeline.fromTo(".back-card1", { ...finalPosition.card1, ...hideUpPosition.card1 }, { ...finalPosition.card1, opacity: 1, duration: 0.48, ease: "power2.out" }, 0.84);
          timeline.fromTo(".back-card4", { ...finalPosition.card4, ...hideUpPosition.card4 }, { ...finalPosition.card4, opacity: 1, duration: 0.46, ease: "power2.out" }, 0.8);
          timeline.fromTo(".back-card3", { ...finalPosition.card3, ...hideUpPosition.card3 }, { ...finalPosition.card3, opacity: 1, duration: 0.44, ease: "power2.out" }, 0.73);
          timeline.fromTo(".back-card2", { ...finalPosition.card2, ...hideUpPosition.card2 }, { ...finalPosition.card2, opacity: 1, duration: 0.42, ease: "power2.out" }, 0.76);
        }, SECTION_ENTER_DELAY);

      } else if (LeaveToPerks) {
        KillTimeline(backCardsTimeline);
        backCardsTimeline = CreateTimeline((timeline) => {
          timeline.fromTo(".back-card1", finalPosition.card1, { ...hideUpPosition.card1, opacity: 1, duration: 0.42, ease: "power2.out" }, 0.12);
          timeline.fromTo(".back-card4", finalPosition.card2, { ...hideUpPosition.card4, opacity: 1, duration: 0.43, ease: "power2.out" }, 0.10);
          timeline.fromTo(".back-card3", finalPosition.card3, { ...hideUpPosition.card3, opacity: 1, duration: 0.46, ease: "power2.out" }, 0.15);
          timeline.fromTo(".back-card2", finalPosition.card4, { ...hideUpPosition.card2, opacity: 1, duration: 0.48, ease: "power2.out" }, 0.20);
        });
        lastProfileEnterAt = null;

      } else if (EnterFromProjects) {
        KillTimeline(backCardsTimeline);
        SetCardStates(BACK_SELECTORS, {
          card1: { ...finalPosition.card1, ...hideDownPosition.card1, opacity: 1 },
          card2: { ...finalPosition.card2, ...hideDownPosition.card2, opacity: 1 },
          card3: { ...finalPosition.card3, ...hideDownPosition.card3, opacity: 1 },
          card4: { ...finalPosition.card4, ...hideDownPosition.card4, opacity: 1 },
        });
        backCardsTimeline = CreateTimeline((timeline) => {
          timeline.fromTo(".back-card1", { ...finalPosition.card1, ...hideDownPosition.card1 }, { ...finalPosition.card1, opacity: 1, duration: 0.3 }, 0.60);
          timeline.fromTo(".back-card2", { ...finalPosition.card2, ...hideDownPosition.card2 }, { ...finalPosition.card2, opacity: 1, duration: 0.3 }, 0.55);
          timeline.fromTo(".back-card3", { ...finalPosition.card3, ...hideDownPosition.card3 }, { ...finalPosition.card3, opacity: 1, duration: 0.3 }, 0.42);
          timeline.fromTo(".back-card4", { ...finalPosition.card4, ...hideDownPosition.card4 }, { ...finalPosition.card4, opacity: 1, duration: 0.3 }, 0.58);
        }, SECTION_ENTER_DELAY);

      } else if (LeaveToProjects) {
        KillTimeline(backCardsTimeline);
        backCardsTimeline = CreateTimeline((timeline) => {
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
      KillTimeline(backCardsTimeline);
    };
  });
}

function BackCardsDesktop(profileIdx: number, perksIdx: number, projectsIdx: number) {
  const desktopVariants: BackCardsDesktopVariant[] = [
    { mediaQuery: `(min-width: ${breakpoints.smallDesktop}px)` },
  ];

  desktopVariants.forEach(v => RegisterBackCardsD(v, profileIdx, perksIdx, projectsIdx));
}
