import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function ScrollBackgroundSections() {
	ScrollTrigger.matchMedia({
		"(min-width: 1800px)": function() {
			// In
			gsap.to(".intro-background", 
      {
				left: "-20%",
				scrollTrigger: { trigger: ".scrollerBackgrounds", scrub: true, toggleActions: "play none none reverse",
					start: "top 145%", 
					end: "bottom 100%",
					// markers: true,
        },
      }),


			// In
      gsap.to(".info-background-back", 
      {
       left: "0%",
        scrollTrigger: { trigger: ".scrollerBackgrounds", scrub: true, toggleActions: "play none none reverse",
          start: "top 155%", 
          end: "bottom 100%",
          // markers: true,
        },
      })

			// In
      gsap.to(".info-background-front", 
      {
       left: "0%",
        scrollTrigger: { trigger: ".scrollerBackgrounds", scrub: true, toggleActions: "play none none reverse",
          start: "top 155%", 
          end: "bottom 100%",
          // markers: true,
        },
      })

			// Out
      gsap.fromTo(".info-background-back", 
			{},
      {
       left: "-20%",
        scrollTrigger: { trigger: ".scrollerBackgrounds", scrub: true, toggleActions: "play none none reverse",
          start: "top 35%", 
          end: "bottom 0%",
          // markers: true,
        },
      })

			// Out
      gsap.fromTo(".info-background-front", 
			{},
      {
       left: "-20%",
        scrollTrigger: { trigger: ".scrollerBackgrounds", scrub: true, toggleActions: "play none none reverse",
          start: "top 45%", 
          end: "bottom 0%",
          // markers: true,
        },
      })


			gsap.fromTo(".work-background-back", 
			{},
      {
       right: "-0%",
        scrollTrigger: { trigger: ".scrollerBackgrounds", scrub: true, toggleActions: "play none none reverse",
          start: "top 50%", 
          end: "bottom 20%",
          // markers: true,
        },
      })

			// Out
      gsap.fromTo(".work-background-front", 
			{},
      {
       right: "-0%",
        scrollTrigger: { trigger: ".scrollerBackgrounds", scrub: true, toggleActions: "play none none reverse",
          start: "top 75%", 
          end: "bottom 0%",
          // markers: true,
        },
      })
    }})
	}