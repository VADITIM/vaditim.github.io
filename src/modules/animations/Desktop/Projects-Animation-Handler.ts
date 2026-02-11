import { gsap } from "gsap/gsap-core";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { currentProjectIndex } from "../../3 Work Page/work-projects";
import { watch } from "vue";
import { breakpoints } from "../animation-handler";
import { onSectionChange } from "../../sections";

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ immediateRender: false });
    
export function ProjectAnimationDesktop() {
    Projects();
    PaginationDots();
}


function Projects() {
  gsap.matchMedia().add(`(min-width: ${breakpoints.desktop}px)`, () => {

    if (document.querySelector(".projects-carousel-container")) {
        gsap.set(".projects-container", { top: "0%" });
        
        let carouselAnimation: gsap.core.Tween | null = null;
        
        // State machine: listen to section changes
        onSectionChange((current, previous, direction) => {
          const isEnteringWorkSection = current === 2 && previous === 1;
          const isLeavingWorkSection = current === 1 && previous === 2;
          
          if (isEnteringWorkSection) {
            // Entering work section from info section - use delay
            if (carouselAnimation) carouselAnimation.kill();
            
            carouselAnimation = gsap.to(".projects-carousel-container", {
              opacity: 1,
              top: "100%",
              duration: 0.6,
              delay: 0.5,
              onStart: () => {
                const items = document.querySelectorAll(".carousel-project");
                const current = items[currentProjectIndex.value];
                if (current) {
                  const pName = current.querySelector(".project-name");
                  if (pName) gsap.to(pName, { opacity: 1, duration: 0.5, delay: 0.8 });
                }
              }
            });
          } else if (isLeavingWorkSection) {
            // Leaving work section backwards - no delay
            if (carouselAnimation) carouselAnimation.kill();
            
            carouselAnimation = gsap.to(".projects-carousel-container", {
              opacity: 0,
              top: "150%",
              duration: 0.6,
              delay: 0,
              onStart: () => {
                gsap.set(".carousel-project .project-name", { opacity: 0 });
              }
            });
          }
        });

        watch(currentProjectIndex, (newIndex, oldIndex) => {
            const items = document.querySelectorAll(".carousel-project");
            if (items[oldIndex]) {
                const oldPName = items[oldIndex].querySelector(".project-name");
                if (oldPName) gsap.to(oldPName, { opacity: 0, duration: 0.2 });
            }
            if (items[newIndex]) {
                const newPName = items[newIndex].querySelector(".project-name");
                if (newPName) gsap.to(newPName, { opacity: 1, duration: 0.5, delay: 0.2 });
            }
        })
    }
  });
}


function PaginationDots() {
  gsap.matchMedia().add(`(min-width: ${breakpoints.desktop}px)`, () => {

    if (document.querySelector(".pagination-dots")) {
        let dotsAnimation: gsap.core.Tween | null = null;
        
        onSectionChange((current, previous, direction) => {
          const isEnteringWorkSection = current === 2 && previous === 1;
          const isLeavingWorkSection = current === 1 && previous === 2;
          
          if (isEnteringWorkSection) {
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
			else if (isLeavingWorkSection) 
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