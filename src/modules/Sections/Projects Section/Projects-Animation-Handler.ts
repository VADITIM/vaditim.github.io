import { gsap } from "gsap";
import { activeProjectIndex, closeActiveProject, currentProjectIndex } from "@modules/Sections/Projects Section/projects";
import { watch } from "vue";
import { breakpoints } from "@modules/animations/animation-handler";
import {
  onSectionEnterLeaveAnimation,
  type SectionTransitionMeta,
} from "../section-state-machine";
import { getSectionIndexById } from "../section-registry";

gsap.defaults({ immediateRender: false });

export function registerProjectsAnimations() {
  const myIndex = getSectionIndexById('projects');

  const isEnter = (meta: SectionTransitionMeta) => meta.isEnteringSection(myIndex);
  const isLeave = (meta: SectionTransitionMeta) => meta.isLeavingSection(myIndex);

  ProjectsMobile(myIndex, isEnter, isLeave);
  ProjectsDesktop(myIndex, isEnter, isLeave);
  ProjectListDesktop(myIndex, isEnter, isLeave);
  PaginationDotsDesktop(myIndex, isEnter, isLeave);
}

type ProjectsMobileVariant = { mediaQuery: string; selector: string };
type ProjectsDesktopVariant = {
  mediaQuery: string;
  enterRight: string;
  enterTop: string;
  leaveRight: string;
  leaveTop: string;
};

function RegisterProjectsM(
  config: ProjectsMobileVariant,
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
        stagger: 0.04,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const playLeave = () => {
      closeActiveProject();
      currentProjectIndex.value = 0;

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

    const cleanupStates = onSectionEnterLeaveAnimation({
      isEnter,
      isLeave,
      onEnter: playEnter,
      onLeave: playLeave,
      initialSection,
    });

    return () => {
      cleanupStates();
      if (tween) tween.kill();
    };
  });
}

function RegisterProjectsD(
  config: ProjectsDesktopVariant,
  isEnter: (m: SectionTransitionMeta) => boolean,
  isLeave: (m: SectionTransitionMeta) => boolean,
  initialSection: number
) {
  gsap.matchMedia().add(config.mediaQuery, () => {
    if (!document.querySelector(".projects-container")) return;

    let projectsAnimation: gsap.core.Tween | null = null;

    const playEnter = () => {
      gsap.set(".projects-container", { transition: "none" });
      gsap.set(".projects-container", { top: "90%" });
      gsap.set(".helix", { transition: "none" });

      if (projectsAnimation) projectsAnimation.kill();
      projectsAnimation = gsap.to(".projects-container", {
        right: config.enterRight,
        top: config.enterTop,
        duration: 1.6,
        ease: "power4.inOut",
        overwrite: "auto",
        onComplete: () => { gsap.set(".projects-container", { clearProps: "transition" }); },
      });
    };

    const playLeave = () => {
      closeActiveProject();
      currentProjectIndex.value = 0;
      gsap.set(".projects-container", { transition: "none" });
      if (projectsAnimation) projectsAnimation.kill();
      projectsAnimation = gsap.to(".projects-container", {
        right: config.leaveRight,
        top: config.leaveTop,
        duration: 0.6,
        delay: 0,
        ease: "power4.inOut",
        overwrite: "auto",
        onComplete: () => { gsap.set(".projects-container", { clearProps: "transition" }); },
      });
    };

    const cleanupStates = onSectionEnterLeaveAnimation({
      isEnter,
      isLeave,
      onEnter: playEnter,
      onLeave: playLeave,
      initialSection,
    });

    return () => {
      cleanupStates();
      if (projectsAnimation) projectsAnimation.kill();
    };
  });
}

function ProjectsMobile(
  initialSection: number,
  isEnter: (m: SectionTransitionMeta) => boolean,
  isLeave: (m: SectionTransitionMeta) => boolean
) {
  const mobileVariants: ProjectsMobileVariant[] = [
    {
      mediaQuery: `(max-width: ${breakpoints.tabletLandscape}px)`,
      selector: ".projects-container, .project-list, .pagination-dots",
    },
  ];

  mobileVariants.forEach(v => RegisterProjectsM(v, isEnter, isLeave, initialSection));
}

function ProjectsDesktop(
  initialSection: number,
  isEnter: (m: SectionTransitionMeta) => boolean,
  isLeave: (m: SectionTransitionMeta) => boolean
) {
  const desktopVariants: ProjectsDesktopVariant[] = [
    {
      mediaQuery: `(min-width: ${breakpoints.smallDesktop}px)`,
      enterRight: "10%",
      enterTop: "0%",
      leaveRight: "-50%",
      leaveTop: "-90%",
    },
  ];

  desktopVariants.forEach(v => RegisterProjectsD(v, isEnter, isLeave, initialSection));
}

type ProjectListDesktopVariant = { mediaQuery: string };

function RegisterProjectListD(
  config: ProjectListDesktopVariant,
  isEnter: (m: SectionTransitionMeta) => boolean,
  isLeave: (m: SectionTransitionMeta) => boolean,
  initialSection: number
) {
  gsap.matchMedia().add(config.mediaQuery, () => {
    if (!document.querySelector(".project-list")) return;

    let listAnimation: gsap.core.Timeline | null = null;

    const playEnter = () => {
      gsap.set(".project-list", { transition: "none", left: "55%", opacity: 0 });
      gsap.set(".project-list", { clearProps: "transition" });
      gsap.set(
        ".project-list-item.position--2, .project-list-item.position--1, .project-list-item.position-0, .project-list-item.position-1, .project-list-item.position-2",
        { x: 120, opacity: 0 }
      );
      if (listAnimation) listAnimation.kill();
      listAnimation = gsap.timeline({ delay: 0.3 });

      listAnimation.to(
        ".project-list",
        { opacity: 1, duration: 0.22, ease: "power2.out", overwrite: "auto" },
        1.35
      );

      listAnimation.fromTo(
        ".project-list-item.position-0",
        { x: 120, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: "back.out", overwrite: "auto" },
        1.5
      );

      listAnimation.fromTo(
        ".project-list-item.position--1, .project-list-item.position-1",
        { x: 120, opacity: 0 },
        { x: 0, opacity: 0.8, duration: 0.8, ease: "back.out", overwrite: "auto" },
        1.8
      );

      listAnimation.fromTo(
        ".project-list-item.position--2, .project-list-item.position-2",
        { x: 120, opacity: 0 },
        { x: 0, opacity: 0.5, duration: 0.8, ease: "back.out", overwrite: "auto" },
        2.1
      );

      listAnimation.eventCallback("onComplete", () => {
        gsap.set(
          ".project-list-item.position--2, .project-list-item.position--1, .project-list-item.position-0, .project-list-item.position-1, .project-list-item.position-2",
          { clearProps: "x,opacity" }
        );
      });
    };

    const playLeave = () => {
      gsap.set(".project-list", { transition: "none" });
      if (listAnimation) listAnimation.kill();
      gsap.set(".project-list-item.position--2, .project-list-item.position--1, .project-list-item.position-0, .project-list-item.position-1, .project-list-item.position-2", { clearProps: "x,opacity" });
      listAnimation = gsap.timeline();
      listAnimation.to(".project-list", {
        opacity: 0,
        duration: 0.4,
        overwrite: "auto",
        onComplete: () => { gsap.set(".project-list", { clearProps: "transition" }); }
      });
    };

    gsap.set(".project-list", { left: "150%" });
    gsap.set(".project-list-item.position--2, .project-list-item.position--1, .project-list-item.position-0, .project-list-item.position-1, .project-list-item.position-2", { x: 120, opacity: 0 });

    const cleanupStates = onSectionEnterLeaveAnimation({
      isEnter,
      isLeave,
      onEnter: playEnter,
      onLeave: playLeave,
      initialSection,
    });

    const stopWatch = watch(activeProjectIndex, () => {
      // Let CSS handle the active state
    });

    return () => {
      cleanupStates();
      stopWatch();
      if (listAnimation) listAnimation.kill();
    };
  });
}

function ProjectListDesktop(
  initialSection: number,
  isEnter: (m: SectionTransitionMeta) => boolean,
  isLeave: (m: SectionTransitionMeta) => boolean
) {
  const desktopVariants: ProjectListDesktopVariant[] = [
    { mediaQuery: `(min-width: ${breakpoints.smallDesktop}px)` },
  ];

  desktopVariants.forEach(v => RegisterProjectListD(v, isEnter, isLeave, initialSection));
}

type PaginationDotsDesktopVariant = {
  mediaQuery: string;
  enterLeft: string;
  leaveLeft: string;
};

function RegisterPaginationDotsD(
  config: PaginationDotsDesktopVariant,
  isEnter: (m: SectionTransitionMeta) => boolean,
  isLeave: (m: SectionTransitionMeta) => boolean,
  initialSection: number
) {
  gsap.matchMedia().add(config.mediaQuery, () => {
    if (!document.querySelector(".pagination-dots")) return;

    let dotsAnimation: gsap.core.Tween | null = null;

    const playEnter = () => {
      gsap.set(".pagination-dots", { transition: "none" });
      if (dotsAnimation) dotsAnimation.kill();
      dotsAnimation = gsap.to(".pagination-dots", {
        opacity: 1,
        left: config.enterLeft,
        duration: 1.6,
        delay: 0.5,
        overwrite: "auto",
        onComplete: () => { gsap.set(".pagination-dots", { clearProps: "transition" }); }
      });
    };

    const playLeave = () => {
      gsap.set(".pagination-dots", { transition: "none" });
      if (dotsAnimation) dotsAnimation.kill();
      dotsAnimation = gsap.to(".pagination-dots", {
        opacity: 0,
        left: config.leaveLeft,
        duration: 1.6,
        delay: 0,
        overwrite: "auto",
        onComplete: () => { gsap.set(".pagination-dots", { clearProps: "transition" }); }
      });
    };

    gsap.set(".pagination-dots", { opacity: 0, left: config.leaveLeft });

    const cleanupStates = onSectionEnterLeaveAnimation({
      isEnter,
      isLeave,
      onEnter: playEnter,
      onLeave: playLeave,
      initialSection,
    });

    return () => {
      cleanupStates();
      if (dotsAnimation) dotsAnimation.kill();
    };
  });
}

function PaginationDotsDesktop(
  initialSection: number,
  isEnter: (m: SectionTransitionMeta) => boolean,
  isLeave: (m: SectionTransitionMeta) => boolean
) {
  const desktopVariants: PaginationDotsDesktopVariant[] = [
    {
      mediaQuery: `(min-width: ${breakpoints.smallDesktop}px)`,
      enterLeft: "95.5%",
      leaveLeft: "110%",
    },
  ];

  desktopVariants.forEach(v => RegisterPaginationDotsD(v, isEnter, isLeave, initialSection));
}
