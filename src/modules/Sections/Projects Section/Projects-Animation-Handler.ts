import { gsap } from "gsap";
import { activeProjectIndex, closeActiveProject, currentProjectIndex } from "@modules/Sections/Projects Section/projects";
import { watch } from "vue";
import { breakpoints } from "@modules/animations/animation-handler";
import {
  onSectionEnterLeaveAnimation,
  type SectionTransitionStates,
  SECTION_INDEX,
} from "../section-state-machine";

gsap.defaults({ immediateRender: false });

const isProjectsEnter = (states: SectionTransitionStates) =>
  states.enterProjectsFromProfile || states.enterProjectsFromPerks;
const isProjectsLeave = (states: SectionTransitionStates) =>
  states.leaveProjectsToProfile || states.leaveProjectsToPerks;
    
export function ProjectAnimationDesktop() {
  ProjectsMobile();
	ProjectsDesktop();
	ProjectListDesktop();
	PaginationDotsDesktop();
	InteractiveDotsDesktop();
}

function ProjectsMobile() {
  gsap.matchMedia().add(`(max-width: ${breakpoints.tabletLandscape}px)`, () => {
    const MOBILE_SELECTOR =
      ".projects-container, .project-list, .pagination-dots, .magnetic-dots-container";

    if (!document.querySelector(MOBILE_SELECTOR)) return;

    let tween: gsap.core.Tween | null = null;

    const playEnter = () => {
      if (tween) tween.kill();
      tween = gsap.to(MOBILE_SELECTOR, {
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
      tween = gsap.to(MOBILE_SELECTOR, {
        opacity: 0,
        y: -20,
        duration: 0.25,
        stagger: 0.02,
        ease: "power2.in",
        overwrite: "auto",
      });
    };

    gsap.set(MOBILE_SELECTOR, { opacity: 0, y: 20 });

    const cleanupStates = onSectionEnterLeaveAnimation({
      isEnter: isProjectsEnter,
      isLeave: isProjectsLeave,
      onEnter: playEnter,
      onLeave: playLeave,
      initialSection: SECTION_INDEX.PROJECTS,
    });

    return () => {
      cleanupStates();
      if (tween) tween.kill();
    };
  });
}

function ProjectsDesktop() {
  gsap.matchMedia().add(`(min-width: ${breakpoints.desktop}px)`, () => {
    if (!document.querySelector(".projects-container")) return;

    let projectsAnimation: gsap.core.Tween | null = null;

    const playEnter = () => {
      gsap.set(".projects-container", { transition: "none" });
      gsap.set(".projects-container", { top: "90%" });
      gsap.set(".helix", { transition: "none" });

      if (projectsAnimation) projectsAnimation.kill();
      projectsAnimation = gsap.to(".projects-container", {
        right: "10%",
        top: "0%",
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
        right: "-50%",
        top: "-90%",
        duration: 0.6,
        delay: 0,
        ease: "power4.inOut",
        overwrite: "auto",
        onComplete: () => { gsap.set(".projects-container", { clearProps: "transition" }); },
      });
    };
    
    const cleanupStates = onSectionEnterLeaveAnimation({
      isEnter: isProjectsEnter,
      isLeave: isProjectsLeave,
      onEnter: playEnter,
      onLeave: playLeave,
      initialSection: SECTION_INDEX.PROJECTS,
    });

    return () => {
      cleanupStates();
      if (projectsAnimation) projectsAnimation.kill();
    };
  });
}

function ProjectListDesktop() {
  gsap.matchMedia().add(`(min-width: ${breakpoints.desktop}px)`, () => {

    if (!document.querySelector(".project-list")) return;

    let listAnimation: gsap.core.Timeline | null = null;

    const playEnter = () => {
      gsap.set(".project-list", { transition: "none", left: "55%", opacity: 0 });
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
        gsap.set(".project-list", { clearProps: "transition" });
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
      isEnter: isProjectsEnter,
      isLeave: isProjectsLeave,
      onEnter: playEnter,
      onLeave: playLeave,
      initialSection: SECTION_INDEX.PROJECTS,
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

function InteractiveDotsDesktop() {
    gsap.matchMedia().add(`(min-width: ${breakpoints.desktop}px)`, () => {
    if (!document.querySelector(".magnetic-dots-container")) return;

    let dotsAnimation: gsap.core.Tween | null = null;

    const playEnter = () => {
      gsap.set(".magnetic-dots-container", { transition: "none" });
      if (dotsAnimation) dotsAnimation.kill();
      dotsAnimation = gsap.to(".magnetic-dots-container", {
        opacity: 1,
        duration: 0.5,
        delay: 0,
        overwrite: "auto",
        onComplete: () => { gsap.set(".magnetic-dots-container", { clearProps: "transition" }); }
      });
    };

    const playLeave = () => {
      gsap.set(".magnetic-dots-container", { transition: "none" });
      if (dotsAnimation) dotsAnimation.kill();
      dotsAnimation = gsap.to(".magnetic-dots-container", {
        opacity: 0,
        duration: 1,
        delay: 0,
        overwrite: "auto",
        onComplete: () => { gsap.set(".magnetic-dots-container", { clearProps: "transition" }); }
      });
    };

    gsap.set(".magnetic-dots-container", { opacity: 0 });

    const cleanupStates = onSectionEnterLeaveAnimation({
      isEnter: isProjectsEnter,
      isLeave: isProjectsLeave,
      onEnter: playEnter,
      onLeave: playLeave,
      initialSection: SECTION_INDEX.PROJECTS,
    });

    return () => {
      cleanupStates();
      if (dotsAnimation) dotsAnimation.kill();
    };
  });
}


function PaginationDotsDesktop() {
  gsap.matchMedia().add(`(min-width: ${breakpoints.desktop}px)`, () => {

    if (!document.querySelector(".pagination-dots")) return;

    let dotsAnimation: gsap.core.Tween | null = null;

    const playEnter = () => {
      gsap.set(".pagination-dots", { transition: "none" });
      if (dotsAnimation) dotsAnimation.kill();
      dotsAnimation = gsap.to(".pagination-dots", {
        opacity: 1,
        left: "95.5%",
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
        left: "110%",
        duration: 1.6,
        delay: 0,
        overwrite: "auto",
        onComplete: () => { gsap.set(".pagination-dots", { clearProps: "transition" }); }
      });
    };

    gsap.set(".pagination-dots", { opacity: 0, left: "110%" });

    const cleanupStates = onSectionEnterLeaveAnimation({
      isEnter: isProjectsEnter,
      isLeave: isProjectsLeave,
      onEnter: playEnter,
      onLeave: playLeave,
      initialSection: SECTION_INDEX.PROJECTS,
    });

    return () => {
      cleanupStates();
      if (dotsAnimation) dotsAnimation.kill();
    };
  });
}