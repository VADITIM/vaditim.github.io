import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { currentSection } from '@modules/sections'
import { watch } from 'vue'

gsap.defaults({ immediateRender: false })

export function ScrollBackgroundSections() {
  watch(currentSection, (newSection) => {
    if (newSection === 0) {
      const targets = [
        ".perks-section-background",
        ".profile-section-background-back",
        ".profile-section-background-front",
        ".projects-section-background-back",
        ".projects-section-background-front",
      ];
      const els = gsap.utils.toArray(targets);
      els.forEach((el: any) => el.classList && el.classList.add('gsap--no-transition'));

      const tl = gsap.timeline({
        onComplete: () => els.forEach((el: any) => el.classList && el.classList.remove('gsap--no-transition'))
      });

      tl.to(".perks-section-background", { left: "-10%", ease: "back.out", duration: 0.45 }, 0);
      tl.to(".profile-section-background-back", { left: "-30%", ease: "back.out", duration: 0.45 }, 0);
      tl.to(".profile-section-background-front", { left: "-30%", ease: "back.out", duration: 0.45 }, 0.1);
      tl.to(".projects-section-background-back", { right: "-40%", ease: "back.in", duration: 0.45 }, 0);
      tl.to(".projects-section-background-front", { right: "-40%", ease: "back.in", duration: 0.45 }, 0.1);
    }
    
    if (newSection === 1) {
      const targets = [
        ".perks-section-background",
        ".profile-section-background-back",
        ".profile-section-background-front",
        ".projects-section-background-back",
        ".projects-section-background-front",
      ];
      const els = gsap.utils.toArray(targets);
      els.forEach((el: any) => el.classList && el.classList.add('gsap--no-transition'));

      const tl = gsap.timeline({
        onComplete: () => els.forEach((el: any) => el.classList && el.classList.remove('gsap--no-transition'))
      });

      tl.to(".perks-section-background", { left: "-30%", ease: "back.in", duration: 0.45 }, 0);
      tl.to(".profile-section-background-back", { left: "-10%", ease: "back.out", duration: 0.45 }, 0);
      tl.to(".profile-section-background-front", { left: "-10%", ease: "back.out", duration: 0.45 }, 0.1);
      tl.to(".projects-section-background-back", { right: "-40%", ease: "back.in", duration: 0.45 }, 0);
      tl.to(".projects-section-background-front", { right: "-40%", ease: "back.in", duration: 0.45 }, 0.1);
    }
    
    if (newSection === 2) {
      const targets = [
        ".perks-section-background",
        ".profile-section-background-back",
        ".profile-section-background-front",
        ".projects-section-background-back",
        ".projects-section-background-front",
      ];
      const els = gsap.utils.toArray(targets);
      els.forEach((el: any) => el.classList && el.classList.add('gsap--no-transition'));

      const tl = gsap.timeline({
        onComplete: () => els.forEach((el: any) => el.classList && el.classList.remove('gsap--no-transition'))
      });

      tl.to(".perks-section-background", { left: "-30%", ease: "back.in", duration: 0.45 }, 0);
      tl.to(".profile-section-background-back", { left: "-30%", ease: "back.in", duration: 0.45 }, 0);
      tl.to(".profile-section-background-front", { left: "-30%", ease: "back.in", duration: 0.45 }, 0.05);
      tl.to(".projects-section-background-back", { right: "-10%", ease: "back.out", duration: 0.45 }, 0);
      tl.to(".projects-section-background-front", { right: "-10%", ease: "back.out", duration: 0.45 }, 0.1);
    }
  });
}
  
export function ScrollBackgroundSectionsOld() {
	ScrollTrigger.matchMedia({
		"(min-width: 1800px)": function() {
      
      // gsap.fromTo(".perks-section-background", 
      // { left: "200%",}, 
      // {
      //   left: "0%",
      //   delay: 1.4,
      //   duration: .7,
      // });

      // gsap.to(".perks-section-background", {
      //   width: "20%",
      //   delay: 2.1,
      //   duration: .7,
      // });

      // const timeline = gsap.timeline({
      //   scrollTrigger: { trigger: ".scrollerBackgrounds", 
      //     start: "top 50%",
          // markers: true,
      //   }
      // });

      // timeline.fromTo(".perks-section-background", { left: "200%",}, 
      // {
      //   left: "0%",
      //   delay: 2.1,
      //   duration: .3,
      // });

      // timeline.fromTo(".perks-section-background", { width: "100%",}, 
      // {
      //   width: "20%",
      //   delay: .2,
      //   duration: .1,
      // });

      
      // timeline.play();
      

      // INTRO ---------------------------------
			// In / Out
			gsap.fromTo(".perks-section-background", {}, 
      {
				left: "-30%",
        ease: "back.in",
				scrollTrigger: { trigger: ".scrollerBackgrounds2", scrub: false, toggleActions: "play none none reverse",
					start: "top 50%", 
					// end: "bottom 0%",
					// markers: true,
        },
      }),


      // INFO ---------------------------------
			// In
      gsap.to(".profile-section-background-back", 
      {
       left: "-10%",
        ease: "back.out",
        scrollTrigger: { trigger: ".scrollerBackgrounds2", scrub: false, toggleActions: "play none none reverse",
          start: "top 40%", 
          // end: "bottom 100%",
          // markers: true,
        },
      })

      gsap.to(".profile-section-background-front", 
      {
       left: "-10%",
        ease: "back.out",
        scrollTrigger: { trigger: ".scrollerBackgrounds2", scrub: false, toggleActions: "play none none reverse",
          start: "top 35%", 
          // end: "bottom 100%",
          // markers: true,
        },
      })

			// Out
      gsap.fromTo(".profile-section-background-back", 
			{},
      {
       left: "-30%",
        ease: "back.in",
        scrollTrigger: { trigger: ".scrollerBackgrounds", scrub: false, toggleActions: "play none none reverse",
          start: "top 40%", 
          // end: "bottom 0%",
          // markers: true,
        },
      })

      gsap.fromTo(".profile-section-background-front", 
			{},
      {
       left: "-30%",
        ease: "back.in",
        scrollTrigger: { trigger: ".scrollerBackgrounds", scrub: false, toggleActions: "play none none reverse",
          start: "top 45%", 
          // end: "bottom 0%",
          // markers: true,
        },
      })


      // WORK ---------------------------------
			// In / Out
			gsap.fromTo(".projects-section-background-back", 
			{},
      {
       right: "-10%",
        ease: "back.out",
        scrollTrigger: { trigger: ".scrollerBackgrounds", scrub: false, toggleActions: "play none none reverse",
          start: "top 40%", 
          // end: "bottom 20%",
          // markers: true,
        },
      })

			// In / Out
      gsap.fromTo(".projects-section-background-front", 
			{},
      {
       right: "-10%",
        ease: "back.out",
        scrollTrigger: { trigger: ".scrollerBackgrounds", scrub: false, toggleActions: "play none none reverse",
          start: "top 30%", 
          // end: "bottom 0%",
          // markers: true,
        },
      })
    }})
	}