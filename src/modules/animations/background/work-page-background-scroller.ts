import { gsap } from "gsap/gsap-core";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ScrollWorkPage() {

  gsap.fromTo(".backgroundWorkTop", 
   { right: "-20%", },
   {
      right: "0%",
      scrollTrigger: { trigger: ".scrollerW", scrub: true, toggleActions: "play none none reverse",
         end: "bottom 15%",
         start: "top 45%", 
         // markers: true,
      },
   }),

   gsap.fromTo(".backgroundWorkBottom", 
   { right: "-20%", },
   {
      right: "0%",
      scrollTrigger: { trigger: ".scrollerW", scrub: true, toggleActions: "play none none reverse",
         end: "bottom 10%",
         start: "top 25%", 
         // markers: true,
      },
   })

  gsap.fromTo(".info-background-top", 
   { },
   {
      left: "-20%",
      scrollTrigger: { trigger: ".scrollerW", scrub: true, toggleActions: "play none none reverse",
         end: "bottom 10%",
         start: "top 30%", 
         // markers: true,
      },
   }),
   
gsap.fromTo(".info-background-bottom", 
   { },
   {
      left: "-20%",
      scrollTrigger: { trigger: ".scrollerW", scrub: true, toggleActions: "play none none reverse",
         end: "bottom 0%",
         start: "top 35%", 
         // markers: true,
      },
   })
}
