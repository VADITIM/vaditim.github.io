import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function IntroPageAnimations() {

   gsap.fromTo(".skill", 
   { x: 0 },
   {
      x: -1000,
      duration: .4,
      stagger: 0.1, 
      scrollTrigger: { trigger: ".scroller", scrub: true, toggleActions: "play none none reverse",
         start: "top 80%", 
         end: "bottom 0%",
         // markers: true,
      },
   }),

   gsap.fromTo(".skills-line-container", 
   { y: 0 },
   {
      y: -1000,
      duration: 1.4,
      scrollTrigger: { trigger: ".scroller", toggleActions: "play none none reverse", scrub: true, 
         start: "top 90%", 
         end: "bottom 0%",
         // markers: true,
      },
   }),
   
   gsap.fromTo(".name-container", 
   { xPercent: 0, },
   {
      xPercent: 100,
      duration: .5,
      scrollTrigger: { trigger: ".scroller", scrub: true, toggleActions: "play none none reverse",
      start: "top 70%", 
      end: "bottom 0%",
      // markers: true,
		},
	})
}