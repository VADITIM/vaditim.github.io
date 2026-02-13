import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { breakpoints, onSectionStatesChange } from "../animation-handler";

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ immediateRender: false });

let hasPlayedInitialPerksAnimations = false;
let isScrollLockedForInitialAnimations = false;
let previousBodyOverflow = "";
let previousHtmlOverflow = "";

const blockedScrollKeys = new Set([
	"ArrowUp",
	"ArrowDown",
	"PageUp",
	"PageDown",
	"Home",
	"End",
	" ",
]);

const preventScrollEvent = (event: Event) => {
	event.preventDefault();
};

const preventScrollKey = (event: KeyboardEvent) => {
	if (blockedScrollKeys.has(event.key)) {
		event.preventDefault();
	}
};

function lockScrollForInitialAnimations() {
	if (isScrollLockedForInitialAnimations) return;
	isScrollLockedForInitialAnimations = true;

	previousBodyOverflow = document.body.style.overflow;
	previousHtmlOverflow = document.documentElement.style.overflow;

	document.body.style.overflow = "hidden";
	document.documentElement.style.overflow = "hidden";

	window.addEventListener("wheel", preventScrollEvent, { passive: false });
	window.addEventListener("touchmove", preventScrollEvent, { passive: false });
	window.addEventListener("keydown", preventScrollKey, { passive: false });
}

function unlockScrollForInitialAnimations() {
	if (!isScrollLockedForInitialAnimations) return;
	isScrollLockedForInitialAnimations = false;

	document.body.style.overflow = previousBodyOverflow;
	document.documentElement.style.overflow = previousHtmlOverflow;

	window.removeEventListener("wheel", preventScrollEvent);
	window.removeEventListener("touchmove", preventScrollEvent);
	window.removeEventListener("keydown", preventScrollKey);
}

export function PerksAnimationDesktop() {
	InitialAnimations();
	Skills();
	Name();
}

function Skills() 
{
  gsap.matchMedia().add(`(min-width: ${breakpoints.desktop}px)`, () => {
	if (document.querySelector(".skill")) {
		let skillsAnimation: gsap.core.Tween | null = null;
		let lineAnimation: gsap.core.Tween | null = null;

		if (hasPlayedInitialPerksAnimations) {
			gsap.set(".skill", { x: "0%", opacity: 1 });
			if (document.querySelector(".skills-line-container")) {
				gsap.set(".skills-line-container", { y: 0 });
			}
		}

		const skillsTimeline = gsap.timeline({
			scrollTrigger: {
				trigger: ".perks-section-trigger",
				toggleActions: "play none none reverse",
				start: "top 40%",
				end: "bottom 0%",
				// markers: true,
			},
		});

		skillsTimeline.fromTo(".skill", { },
			{
				x: "-210%",
				duration: 0.21,
				stagger: 0.12,
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

		onSectionStatesChange(({
			enterPerksFromProfile,
			enterPerksFromProjects,
			leavePerksToProfile,
			leavePerksToProjects,
		}) => {
			if (enterPerksFromProfile || enterPerksFromProjects) {
				if (skillsAnimation) skillsAnimation.kill();
				if (lineAnimation) lineAnimation.kill();

				skillsAnimation = gsap.to(".skill", {
					x: "0%",
					opacity: 1,
					duration: 0.35,
					delay: .5,
					ease: "power2.out",
					overwrite: "auto",
				});

				if (document.querySelector(".skills-line-container")) {
					lineAnimation = gsap.to(".skills-line-container", {
						y: 0,
						duration: 0.35,
						ease: "power2.out",
						overwrite: "auto",
					});
				}
			} else if (leavePerksToProfile || leavePerksToProjects) {
				if (skillsAnimation) skillsAnimation.kill();
				if (lineAnimation) lineAnimation.kill();

				skillsAnimation = gsap.to(".skill", {
					x: "-210%",
					opacity: 1,
					duration: 0.21,
					stagger: 0.12,
					ease: "power2.inOut",
					overwrite: "auto",
				});

				if (document.querySelector(".skills-line-container")) {
					lineAnimation = gsap.to(".skills-line-container", {
						y: -1000,
						duration: 0.2,
						ease: "power2.inOut",
						overwrite: "auto",
					});
				}
			}
		});
	}
  })
};

function InitialAnimations() {
	if (hasPlayedInitialPerksAnimations) return;

	const hasPerksName = !!document.querySelector(".name-container");
	const hasSkills = !!document.querySelector(".skill");
	const hasPerksBackground = !!document.querySelector(".perks-section-background");
	if (!hasPerksName && !hasSkills && !hasPerksBackground) return;

	lockScrollForInitialAnimations();

	gsap.set(".name-container", { right: "-100%" });
	gsap.set(".skill", { x: "-210%", opacity: 1 });
	if (document.querySelector(".skills-line-container")) {
		gsap.set(".skills-line-container", { y: -1000 });
	}

	gsap.set(".perks-section-background", { left: "-30%" });
	gsap.set(".profile-section-background-back", { left: "-45%" });
	gsap.set(".profile-section-background-front", { left: "-45%" });
	gsap.set(".projects-section-background-back", { right: "-70%" });
	gsap.set(".projects-section-background-front", { right: "-70%" });

	const initialTimeline = gsap.timeline({
		onComplete: () => {
			hasPlayedInitialPerksAnimations = true;
			unlockScrollForInitialAnimations();
		},
		onInterrupt: () => {
			hasPlayedInitialPerksAnimations = true;
			unlockScrollForInitialAnimations();
		},
	});

	initialTimeline.to(".name-container", {
		right: "18%",
		duration: 0.5,
		delay: 2.6,
		ease: "power2.out",
	}, 0);

	initialTimeline.to(".skill", {
		x: "0%",
		duration: 0.3,
		stagger: 0.12,
		delay: 2.28,
		ease: "power2.out",
	}, 0);

	if (document.querySelector(".skills-line-container")) {
		initialTimeline.to(".skills-line-container", {
			y: 0,
			duration: 0.25,
			delay: 2.7,
			ease: "power2.out",
		}, 0);
	}

	initialTimeline.to(".perks-section-background", {
		left: "-10%",
		duration: 0.45,
		delay: 2.4,
		ease: "back.out",
	}, 0);

}


function Name() {
  gsap.matchMedia().add(`(min-width: ${breakpoints.desktop}px)`, () => {

	if (document.querySelector(".name-container")) {
		let nameAnimation: gsap.core.Tween | null = null;

		gsap.fromTo(".name-container", { },
		{
			right: "18%",
			duration: 0.5,
			scrollTrigger: { trigger: ".perks-section-trigger", scrub: false, toggleActions: "play none none reverse",
				start: "top 40%", 
				end: "bottom 0%",
				// markers: true,
},})

		onSectionStatesChange(({
			enterPerksFromProfile,
			enterPerksFromProjects,
			leavePerksToProfile,
			leavePerksToProjects,
		}) => {
			if (enterPerksFromProfile || enterPerksFromProjects) {
				if (nameAnimation) nameAnimation.kill();
				nameAnimation = gsap.to(".name-container", {
					right: "18%",
					duration: 0.35,
					delay: .4,
					ease: "power2.out",
					overwrite: "auto",
				});
			} else if (leavePerksToProfile || leavePerksToProjects) {
				if (nameAnimation) nameAnimation.kill();
				nameAnimation = gsap.to(".name-container", {
					right: "-100%",
					duration: 0.5,
					ease: "power2.inOut",
					overwrite: "auto",
				});
			}
		});
	}
  })
};
