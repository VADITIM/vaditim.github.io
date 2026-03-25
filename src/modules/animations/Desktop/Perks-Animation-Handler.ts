import { gsap } from "gsap";
import { breakpoints } from "../animation-config";
import {
	onSectionEnterLeaveAnimation,
	SECTION_INDEX,
	type SectionTransitionStates,
} from "../section-state-machine";

gsap.defaults({ immediateRender: false });

const isPerksEnter = (states: SectionTransitionStates) =>
	states.enterPerksFromProfile || states.enterPerksFromProjects;

const isPerksLeave = (states: SectionTransitionStates) =>
	states.leavePerksToProfile || states.leavePerksToProjects;

export function PerksAnimationDesktop() {
	Skills();
	Name();
}

//---------------------------------------------------------------------------------------------------------

function Skills() {
	gsap.matchMedia().add(`(min-width: ${breakpoints.desktop}px)`, () => {
		if (!document.querySelector(".skill")) return;

		let skillsAnimation: gsap.core.Tween | null = null;
		let lineAnimation: gsap.core.Tween | null = null;

		const hasSkillsLine = !!document.querySelector(".skills-line-container");

		const playEnter = () => {
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

			if (hasSkillsLine) {
				lineAnimation = gsap.to(".skills-line-container", {
					y: 0,
				duration: 0.35,
				delay: .75,
					ease: "power2.out",
					overwrite: "auto",
				});
			}
		};

		const playLeave = () => {
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

			if (hasSkillsLine) {
				lineAnimation = gsap.to(".skills-line-container", {
					y: -1000,
					duration: 0.5,
					ease: "power2.inOut",
					overwrite: "auto",
				});
			}
		};

		gsap.set(".skill", { x: "-210%", opacity: 1 });
		if (hasSkillsLine) {
			gsap.set(".skills-line-container", { y: -1000 });
		}

		const cleanupStates = onSectionEnterLeaveAnimation({
			isEnter: isPerksEnter,
			isLeave: isPerksLeave,
			onEnter: playEnter,
			onLeave: playLeave,
			initialSection: SECTION_INDEX.PERKS,
		});

		return () => {
			cleanupStates();
			if (skillsAnimation) skillsAnimation.kill();
			if (lineAnimation) lineAnimation.kill();
		};
	});
}

//---------------------------------------------------------------------------------------------------------

function Name() {
  gsap.matchMedia().add(`(min-width: ${breakpoints.desktop}px)`, () => {
	if (!document.querySelector(".name-container")) return;

	let nameAnimation: gsap.core.Tween | null = null;

	const playEnter = () => {
		if (nameAnimation) nameAnimation.kill();
		nameAnimation = gsap.to(".name-container", {
			right: "-15%",
			duration: 0.35,
			delay: 0.4,
			ease: "power2.out",
			overwrite: "auto",
		});
	};

	const playLeave = () => {
		if (nameAnimation) nameAnimation.kill();
		nameAnimation = gsap.to(".name-container", {
			right: "-100%",
			duration: 0.5,
			ease: "power2.inOut",
			overwrite: "auto",
		});
	};

	gsap.set(".name-container", { right: "-100%" });

	const cleanupStates = onSectionEnterLeaveAnimation({
		isEnter: isPerksEnter,
		isLeave: isPerksLeave,
		onEnter: playEnter,
		onLeave: playLeave,
		initialSection: SECTION_INDEX.PERKS,
	});

	return () => {
		cleanupStates();
		if (nameAnimation) nameAnimation.kill();
	};
  })
}
