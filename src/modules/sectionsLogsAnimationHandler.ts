import { gsap } from "gsap";
import { breakpoints } from "@modules/animationHandler";
import {
  onSectionEnterLeaveAnimation,
  type SectionTransitionMeta,
} from "./sectionsStateMachine";
import { getSectionIndexById } from "./sectionsRegistry";
import { SECTION_ENTER_DELAY } from "./sectionsTransition";

gsap.defaults({ immediateRender: false });

const FRONT_CARD_SELECTOR = ".card1, .card2, .card3, .card4";
const BACK_CARD_SELECTOR = ".back-card1, .back-card2, .back-card3, .back-card4";

// Desktop (>= smallDesktop) now shows Cubes.vue, which drives its own
// enter/leave animations internally. This handler only owns the mobile
// (< smallDesktop) card-stack layout.
export function registerLogsAnimations() {
  const logsIndex = getSectionIndexById('logs');

  const isEnter = (meta: SectionTransitionMeta) => meta.isEnteringSection(logsIndex);
  const isLeave = (meta: SectionTransitionMeta) => meta.isLeavingSection(logsIndex);

  LogsMobile(logsIndex, isEnter, isLeave);
}

function RegisterLogsMobile(
  config: { mediaQuery: string; selector: string },
  isEnter: (meta: SectionTransitionMeta) => boolean,
  isLeave: (meta: SectionTransitionMeta) => boolean,
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

function LogsMobile(
  logsIndex: number,
  isEnter: (meta: SectionTransitionMeta) => boolean,
  isLeave: (meta: SectionTransitionMeta) => boolean
) {
  const mobileVariants = [
    {
      mediaQuery: `(max-width: ${breakpoints.smallDesktop - 1}px)`,
      selector: `${FRONT_CARD_SELECTOR}, ${BACK_CARD_SELECTOR}`,
    },
  ];

  mobileVariants.forEach(variant => RegisterLogsMobile(variant, isEnter, isLeave, logsIndex));
}
