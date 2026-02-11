import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { currentProjectIndex } from "@modules/Projects Section/projects";
import { watch } from "vue";
import { breakpoints } from "../animation-handler";
import { onSectionChange } from "@modules/sections";

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ immediateRender: false });
    
export function ProjectAnimationDesktop() {
    Projects();
    PaginationDots();
}

function Projects() {
  gsap.matchMedia().add(`(min-width: ${breakpoints.desktop}px)`, () => {

    if (document.querySelector(".projects-container")) {
      gsap.to(".projects-container",
        { 
          top: "0%",
          duration: .6,
          scrollTrigger: { trigger: ".project-section-trigger", scrub: false, toggleActions: "play none none reverse",
            start: "top 20%",
            end: "bottom 100%",
          },
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