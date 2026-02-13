import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { activeProjectIndex } from "@modules/Projects Section/projects";
import { watch } from "vue";
import { breakpoints, onSectionStatesChange } from "../animation-handler";

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ immediateRender: false });
    
export function ProjectAnimationDesktop() {
	Projects();
	ProjectList();
	PaginationDots();
	InteractiveDot();
}

function Projects() {
  gsap.matchMedia().add(`(min-width: ${breakpoints.desktop}px)`, () => {

    if (document.querySelector(".projects-container")) {
			let projectsAnimation: gsap.core.Tween | null = null;



			onSectionStatesChange(({
				enterProjectsFromProfile: EnterProjectsSection,
				leaveProjectsToProfile: LeaveProjectsSection,
			}) => {
				if (EnterProjectsSection) {
					gsap.set(".projects-container", { transition: "none" });

					if (projectsAnimation) projectsAnimation.kill();

					projectsAnimation = gsap.to(".projects-container", {
						right: "0%",
						duration: 0.6,
						delay: .3,
						ease: "power4.inOut",
						overwrite: "auto",

						onComplete: () => { gsap.set(".projects-container", { clearProps: "transition" }); }
					});
				}
				else if (LeaveProjectsSection)
				{
					gsap.set(".projects-container", { transition: "none" });

					if (projectsAnimation) projectsAnimation.kill();

					projectsAnimation = gsap.to(".projects-container", {
						right: "-50%",
						duration: 0.6,
						delay: 0,
						ease: "power4.inOut",
						overwrite: "auto",

						onComplete: () => { gsap.set(".projects-container", { clearProps: "transition" }); }
					});
				}
			});
    }
  });
}

function ProjectList() {
  gsap.matchMedia().add(`(min-width: ${breakpoints.desktop}px)`, () => {

    if (document.querySelector(".project-list")) {
      let listAnimation: gsap.core.Tween | null = null;

      gsap.set(".project-list", { clearProps: "left" });

      gsap.fromTo(".project-list",
        {
          x: "0vw",
        },
        {
          x: "-60vw",
          duration: .6,
          ease: "power4.inOut",
          scrollTrigger: { trigger: ".project-section-trigger", scrub: false, toggleActions: "play none none reverse",
            start: "top 30%",
            end: "bottom 100%",
          },
        })

      onSectionStatesChange(({
          enterProjectsFromProfile: EnterProjectsSection,
          leaveProjectsToProfile: LeaveProjectsSection,
        }) => {

        if (EnterProjectsSection) {
          gsap.set(".project-list", { transition: "none", clearProps: "left" });

          if (listAnimation) listAnimation.kill();

          listAnimation = gsap.to(".project-list", {
            x: "-60vw",
            duration: 0.6,
            delay: .3,
            ease: "power4.inOut",
            overwrite: "auto",

            onComplete: () => { gsap.set(".project-list", { clearProps: "transition,left" }); }
          });
        }
        else if (LeaveProjectsSection)
        {
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
        }
      });

      watch(activeProjectIndex, (projectIndex) => {
        if (projectIndex !== null) {
          gsap.set(".project-list", { x: "-60vw", clearProps: "left" });
        }
      });
    }
  });
}

function InteractiveDot() {
    gsap.matchMedia().add(`(min-width: ${breakpoints.desktop}px)`, () => {

    if (document.querySelector(".magnetic-dots-container")) {
        let dotsAnimation: gsap.core.Tween | null = null;
        
        onSectionStatesChange(({
            enterProjectsFromProfile: EnterProjectsSection,
            leaveProjectsToProfile: LeaveProjectsSection,
          }) => {
          
          if (EnterProjectsSection) {
            gsap.set(".magnetic-dots-container", { transition: "none" });
            
            if (dotsAnimation) dotsAnimation.kill();
            
            dotsAnimation = gsap.to(".magnetic-dots-container", {
              opacity: 1,
              duration: .5,
              delay: 0,
              overwrite: "auto",
              
              onComplete: () => { gsap.set(".magnetic-dots-container", { clearProps: "transition" }); }
            });} 
			else if (LeaveProjectsSection) 
			{
				gsap.set(".magnetic-dots-container", { transition: "none" });
				
				if (dotsAnimation) dotsAnimation.kill();
				
				dotsAnimation = gsap.to(".magnetic-dots-container", {
					opacity: 0,
					duration: 1,
					delay: 0,
					overwrite: "auto",

					onComplete: () => { gsap.set(".magnetic-dots-container", { clearProps: "transition" }); }
				});
			}
        });
    }
  });
}


function PaginationDots() {
  gsap.matchMedia().add(`(min-width: ${breakpoints.desktop}px)`, () => {

    if (document.querySelector(".pagination-dots")) {
        let dotsAnimation: gsap.core.Tween | null = null;
        
        onSectionStatesChange(({
            enterProjectsFromProfile: EnterProjectsSection,
            leaveProjectsToProfile: LeaveProjectsSection,
          }) => {
          
          if (EnterProjectsSection) {
            gsap.set(".pagination-dots", { transition: "none" });
            
            if (dotsAnimation) dotsAnimation.kill();
            
            dotsAnimation = gsap.to(".pagination-dots", {
              opacity: 1,
              top: "50%",
              duration: 0.6,
              delay: 0.5,
              overwrite: "auto",
              
              onComplete: () => { gsap.set(".pagination-dots", { clearProps: "transition" }); }
            });} 
			else if (LeaveProjectsSection) 
			{
				gsap.set(".pagination-dots", { transition: "none" });
				
				if (dotsAnimation) dotsAnimation.kill();
				
				dotsAnimation = gsap.to(".pagination-dots", {
					opacity: 0,
					top: "150%",
					duration: 0.6,
					delay: 0,
					overwrite: "auto",

					onComplete: () => { gsap.set(".pagination-dots", { clearProps: "transition" }); }
				});
			}
        });
    }
  });
}