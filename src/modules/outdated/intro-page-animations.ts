import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ immediateRender: false });

export function IntroPageAnimations() {

	if (document.querySelector(".skill")) {
		const skillsTimeline = gsap.timeline({
			scrollTrigger: {
				trigger: ".intro-scroller",
				toggleActions: "play none none reverse",
				start: "top 40%",
				end: "bottom 0%",
				// markers: true,
			},
		});

		skillsTimeline.fromTo(
			".skill",
			{ x: 0 },
			{
				x: -1000,
				duration: 0.1,
				stagger: 0.1,
			}
		);

		if (document.querySelector(".skills-line-container")) {
			skillsTimeline.fromTo(
				".skills-line-container",
				{ y: 0 },
				{
					y: -1000,
					duration: 0.2,
				},
				0
			);
		}
	}
	
	if (document.querySelector(".name-container")) {
		gsap.fromTo(".name-container", 
		{ xPercent: 0, },
		{
			xPercent: 150,
			duration: .5,
			scrollTrigger: { trigger: ".intro-scroller", scrub: false, toggleActions: "play none none reverse",
				start: "top 40%", 
				end: "bottom 0%",
				// markers: true,
			},
		})
	}

	if (document.querySelector(".intro-header-container")) {
		gsap.to(".intro-header-container", 
		{
			left: "-15%",
			ease: "elastic.inOut(.3, 0.3)",
			
			scrollTrigger: { trigger: ".intro-scroller", scrub: true, toggleActions: "play none none reverse",
				start: "top 30%", 
				end: "bottom 0%",
				// markers: true,
			},
		})
	}
}