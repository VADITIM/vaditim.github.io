import { gsap } from "gsap/gsap-core";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollToProject, scrollToProjectTime } from "../projects";
gsap.registerPlugin(ScrollTrigger);

export function WorkPageAnimations() {
  ScrollTrigger.matchMedia({
    // Desktop
    "(min-width: 842px)": function() {

      gsap.fromTo(".projects-header-container",
      { },
      { 
        left: "1%",
        ease: "elastic.inOut(.3, 0.3)",

        scrollTrigger: { trigger: ".work-scroller", scrub: true, toggleActions: "play none none reverse",
          start: "top 10%", 
          end: "bottom 0%",
          // markers: true,
      }})  






      const staggeredTimeline = gsap.timeline({ paused: true });
      staggeredTimeline.to(".project", {
        top: 0,
        ease: "elastic.out(1, 0.8)",
        stagger: { each: 0.4, from: "end" },
        duration: 2,
      });

      const instantTimeline = gsap.timeline({ paused: true });
      instantTimeline.to(".project", {
        top: "100%",
        duration: .5,
      });

      let animationState = "idle"; 

      ScrollTrigger.create({
        trigger: ".work-scroller",
        start: "top 20%",
        markers: true,

        onEnter: () => {
          const con = document.getElementById('con') as HTMLElement;
          con.classList.add('no-snap');
          scrollToProjectTime(0)
          instantTimeline.pause();
          animationState = "staggered";
          
          staggeredTimeline.progress(0).play();
        },
        onLeaveBack: () => {
          staggeredTimeline.pause();
          animationState = "instant";
          
          instantTimeline.progress(0).play();
        }
      });
  },







    // Tablet
    "(min-width: 436px) and (max-width: 841px)": function() {
      gsap.fromTo(".name-headline-container",
      { },
      {

        scrollTrigger: { trigger: ".work-scroller", scrub: true, toggleActions: "play none none reverse",
          start: "top 10%", 
          end: "bottom 5%",
        }})  
    },

    // Mobile ----------------------------------------------------------
    "(max-width: 435px)": function() {
      gsap.fromTo(".name-headline-container",
      { },
      {
        scrollTrigger: { trigger: ".work-scroller", scrub: true, toggleActions: "play none none reverse",
          start: "top 60%", 
          end: "bottom 5%",
        }})  
    }
  });
}