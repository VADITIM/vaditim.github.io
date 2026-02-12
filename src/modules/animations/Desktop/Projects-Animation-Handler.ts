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
    InteractiveDot();
}

function Projects() {
  gsap.matchMedia().add(`(min-width: ${breakpoints.desktop}px)`, () => {

    if (document.querySelector(".projects-container")) {
      gsap.to(".projects-container",
        { 
          right: "0%",
          duration: 1.6,
          ease: "back.inOut",
          scrollTrigger: { trigger: ".project-section-trigger", scrub: false, toggleActions: "play none none reverse",
            start: "top 20%",
            end: "bottom 100%",
          },
        })
    }
  });
}

function InteractiveDot() {
    gsap.matchMedia().add(`(min-width: ${breakpoints.desktop}px)`, () => {

    if (document.querySelector(".magnetic-dots-container")) {
        let dotsAnimation: gsap.core.Tween | null = null;
        
        onSectionChange((current, previous, direction) => {
          const isEnteringWorkSection = current === 2 && previous === 1;
          const isLeavingWorkSection = current === 1 && previous === 2;
          
          if (isEnteringWorkSection) {
            gsap.set(".magnetic-dots-container", { transition: "none" });
            
            if (dotsAnimation) dotsAnimation.kill();
            
            dotsAnimation = gsap.to(".magnetic-dots-container", {
              opacity: 1,
              duration: 1,
              delay: 0,
              overwrite: "auto",
              
              onComplete: () => { gsap.set(".magnetic-dots-container", { clearProps: "transition" }); }
            });} 
			else if (isLeavingWorkSection) 
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