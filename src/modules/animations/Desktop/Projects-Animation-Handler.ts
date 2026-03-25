import { gsap } from "gsap";
import { activeProjectIndex, closeActiveProject, currentProjectIndex } from "@modules/Projects Section/projects";
import { watch } from "vue";
import { breakpoints } from "../animation-config";
import {
  onSectionEnterLeaveAnimation,
  type SectionTransitionStates,
  SECTION_INDEX,
} from "../section-state-machine";

gsap.defaults({ immediateRender: false });

const isProjectsEnter = (states: SectionTransitionStates) => states.enterProjectsFromProfile;
const isProjectsLeave = (states: SectionTransitionStates) => states.leaveProjectsToProfile;
    
export function ProjectAnimationDesktop() {
	Projects();
	ProjectList();
	PaginationDots();
	InteractiveDot();
}

function Projects() {
  gsap.matchMedia().add(`(min-width: ${breakpoints.desktop}px)`, () => {
    if (!document.querySelector(".projects-container")) return;

    let projectsAnimation: gsap.core.Tween | null = null;

    const playEnter = () => {
      gsap.set(".projects-container", { transition: "none" });
      if (projectsAnimation) projectsAnimation.kill();
      projectsAnimation = gsap.to(".projects-container", {
        right: "10%",
        duration: 0.6,
        delay: 0.3,
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
        duration: 0.6,
        delay: 0,
        ease: "power4.inOut",
        overwrite: "auto",
        onComplete: () => { gsap.set(".projects-container", { clearProps: "transition" }); },
      });
    };

    gsap.set(".projects-container", { right: "-50%" });

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

function ProjectList() {
  gsap.matchMedia().add(`(min-width: ${breakpoints.desktop}px)`, () => {

    if (!document.querySelector(".project-list")) return;

    let listAnimation: gsap.core.Tween | null = null;

    const playEnter = () => {
      gsap.set(".project-list", { transition: "none", clearProps: "left" });
      if (listAnimation) listAnimation.kill();
      listAnimation = gsap.to(".project-list", {
        x: "-70vw",
        duration: 0.6,
        delay: 0.3,
        ease: "power4.inOut",
        overwrite: "auto",
        onComplete: () => { gsap.set(".project-list", { clearProps: "transition,left" }); }
      });
    };

    const playLeave = () => {
      gsap.set(".project-list", { transition: "none", clearProps: "left" });
      if (listAnimation) listAnimation.kill();
      listAnimation = gsap.to(".project-list", {
        x: "0vw",
        duration: 0.6,
        delay: 0,
        ease: "power4.inOut",
        overwrite: "auto",
        onComplete: () => { gsap.set(".project-list", { clearProps: "transition,left" }); }
      });
    };

    gsap.set(".project-list", { x: "0vw", clearProps: "left" });

    const cleanupStates = onSectionEnterLeaveAnimation({
      isEnter: isProjectsEnter,
      isLeave: isProjectsLeave,
      onEnter: playEnter,
      onLeave: playLeave,
      initialSection: SECTION_INDEX.PROJECTS,
    });

    const stopWatch = watch(activeProjectIndex, (projectIndex) => {
      if (projectIndex !== null) {
        gsap.set(".project-list", { x: "-70vw", clearProps: "left" });
      }
    });

    return () => {
      cleanupStates();
      stopWatch();
      if (listAnimation) listAnimation.kill();
    };
  });
}

function InteractiveDot() {
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


function PaginationDots() {
  gsap.matchMedia().add(`(min-width: ${breakpoints.desktop}px)`, () => {

    if (!document.querySelector(".pagination-dots")) return;

    let dotsAnimation: gsap.core.Tween | null = null;

    const playEnter = () => {
      gsap.set(".pagination-dots", { transition: "none" });
      if (dotsAnimation) dotsAnimation.kill();
      dotsAnimation = gsap.to(".pagination-dots", {
        opacity: 1,
        left: "98.5%",
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