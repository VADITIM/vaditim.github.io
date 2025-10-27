import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { currentSection } from '../sections'
import { watch } from 'vue'

export function ScrollBackgroundSections() {
  // Watch for section changes and trigger animations
  watch(currentSection, (newSection) => {
    // Animate when entering section 0 (Intro)
    if (newSection === 0) {
      gsap.to(".intro-background", {
        left: "-10%",
        ease: "back.out"
      });

      gsap.to(".info-background-back", {
        left: "-30%",
        ease: "back.out"
      });
      
      gsap.to(".info-background-front", {
        left: "-30%",
        ease: "back.out",
        delay: 0.1
      });

      gsap.to(".work-background-back", {
        right: "-40%",
        ease: "back.in"
      });
      
      gsap.to(".work-background-front", {
        right: "-40%",
        ease: "back.in",
        delay: 0.1
      });
    }
    
    // Animate when entering section 1 (Info)
    if (newSection === 1) {
      gsap.to(".intro-background", {
        left: "-30%",
        ease: "back.in"
      });
      
      gsap.to(".info-background-back", {
        left: "-10%",
        ease: "back.out"
      });
      
      gsap.to(".info-background-front", {
        left: "-10%",
        ease: "back.out",
        delay: 0.1
      });
            
      gsap.to(".work-background-back", {
        right: "-40%",
        ease: "back.in"
      });
      
      gsap.to(".work-background-front", {
        right: "-40%",
        ease: "back.in",
        delay: 0.1
      });
    }
    
    // Animate when entering section 2 (Work)
    if (newSection === 2) {
      gsap.to(".intro-background", {
        left: "-30%",
        ease: "back.in"
      });
      

      gsap.to(".info-background-back", {
        left: "-30%",
        ease: "back.in"
      });
      
      gsap.to(".info-background-front", {
        left: "-30%",
        ease: "back.in"
      });
      
      gsap.to(".work-background-back", {
        right: "-10%",
        ease: "back.out"
      });
      
      gsap.to(".work-background-front", {
        right: "-10%",
        ease: "back.out",
        delay: 0.1
      });
    }
  });
}
  
export function ScrollBackgroundSectionsOld() {
	ScrollTrigger.matchMedia({
		"(min-width: 1800px)": function() {
      
      // gsap.fromTo(".intro-background", 
      // { left: "200%",}, 
      // {
      //   left: "0%",
      //   delay: 1.4,
      //   duration: .7,
      // });

      // gsap.to(".intro-background", {
      //   width: "20%",
      //   delay: 2.1,
      //   duration: .7,
      // });

      // const timeline = gsap.timeline({
      //   scrollTrigger: { trigger: ".scrollerBackgrounds", 
      //     start: "top 50%",
      //     // markers: true,
      //   }
      // });

      // timeline.fromTo(".intro-background", { left: "200%",}, 
      // {
      //   left: "0%",
      //   delay: 2.1,
      //   duration: .3,
      // });

      // timeline.fromTo(".intro-background", { width: "100%",}, 
      // {
      //   width: "20%",
      //   delay: .2,
      //   duration: .1,
      // });

      
      // timeline.play();
      

      // INTRO ---------------------------------
			// In / Out
			gsap.fromTo(".intro-background", {}, 
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
      gsap.to(".info-background-back", 
      {
       left: "-10%",
        ease: "back.out",
        scrollTrigger: { trigger: ".scrollerBackgrounds2", scrub: false, toggleActions: "play none none reverse",
          start: "top 40%", 
          // end: "bottom 100%",
          // markers: true,
        },
      })

      gsap.to(".info-background-front", 
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
      gsap.fromTo(".info-background-back", 
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

      gsap.fromTo(".info-background-front", 
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
			gsap.fromTo(".work-background-back", 
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
      gsap.fromTo(".work-background-front", 
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