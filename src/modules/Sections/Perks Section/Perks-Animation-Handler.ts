import { gsap } from "gsap";
import { breakpoints } from "@modules/animations/animation-handler";
import {
	onSectionEnterLeaveAnimation,
	SECTION_INDEX,
	type SectionTransitionStates,
} from "../section-state-machine";

gsap.defaults({ immediateRender: false });

const isPerksEnter = (states: SectionTransitionStates) =>
	states.enterPerksFromProfile || states.enterPerksFromProjects || states.enterPerksFromNone;

const isPerksLeave = (states: SectionTransitionStates) =>
	states.leavePerksToProfile || states.leavePerksToProjects;

export function PerksAnimationDesktop() {
	SkillsMobile();
	SkillsTablet();
	SkillsDesktop();

	NameMobile();
	NameTablet();
	NameDesktop();
}

function SkillsMobile() {
	gsap.matchMedia().add(`(max-width: ${breakpoints.tablet - 1}px)`, () => {
		if (!document.querySelector(".skill")) return;

		let skillsAnimation: gsap.core.Tween | null = null;
		let lineAnimation: gsap.core.Tween | null = null;

		const hasSkillsLine = !!document.querySelector(".skills-line-container");

		gsap.set(".skill", { left: "-200%", opacity: 1 });
		gsap.set(".skills-line-container", { left: "-100%" });

		const playEnter = () => {
			if (skillsAnimation) skillsAnimation.kill();
			if (lineAnimation) lineAnimation.kill();

			gsap.to(".skill", {
				left: "95%",
				opacity: 1,
				duration: 0.35,
				stagger: 0.12,
				delay: 1,
				ease: "power2.out",
				overwrite: "auto",
			});

			const hasSkillsLine = !!document.querySelector(".skills-line-container");
			if (hasSkillsLine) {
				gsap.to(".skills-line-container", {
					left: "100%",
					duration: 0.35,
					delay: 1.25,
					ease: "power2.out",
					overwrite: "auto",
				});
			}		
		};

		const playLeave = () => {
			if (skillsAnimation) skillsAnimation.kill();
			if (lineAnimation) lineAnimation.kill();

			skillsAnimation = gsap.to(".skill", {
				left: "-200%",
				opacity: 1,
				duration: 0.21,
				stagger: 0.12,
				ease: "power2.inOut",
				overwrite: "auto",
			});

			if (hasSkillsLine) {
				lineAnimation = gsap.to(".skills-line-container", {
					left: "-100%",
					duration: 0.5,
					ease: "power2.inOut",
					overwrite: "auto",
				});
			}
		};

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

function SkillsTablet() {
	gsap.matchMedia().add(`(min-width: ${breakpoints.tablet}px) and (max-width: ${breakpoints.smallDesktop - 1}px)`, () => {
		if (!document.querySelector(".skill")) return;

		let skillsAnimation: gsap.core.Tween | null = null;
		let lineAnimation: gsap.core.Tween | null = null;

		const hasSkillsLine = !!document.querySelector(".skills-line-container");

		gsap.set(".skill", { left: "-200%", opacity: 1 });
		gsap.set(".skills-line-container", { left: "-100%" });

		const playEnter = () => {
			if (skillsAnimation) skillsAnimation.kill();
			if (lineAnimation) lineAnimation.kill();

			gsap.to(".skill", {
				left: "0%",
				opacity: 1,
				duration: 0.35,
				stagger: 0.12,
				delay: 1.5,
				ease: "power2.out",
				overwrite: "auto",
			});

			const hasSkillsLine = !!document.querySelector(".skills-line-container");
			if (hasSkillsLine) {
				gsap.to(".skills-line-container", {
					left: "0",
					duration: 0.35,
					delay: 1.75,
					ease: "power2.out",
					overwrite: "auto",
				});
			}		
		};

		const playLeave = () => {
			if (skillsAnimation) skillsAnimation.kill();
			if (lineAnimation) lineAnimation.kill();

			skillsAnimation = gsap.to(".skill", {
				left: "-200%",
				opacity: 1,
				duration: 0.21,
				stagger: 0.12,
				ease: "power2.inOut",
				overwrite: "auto",
			});

			if (hasSkillsLine) {
				lineAnimation = gsap.to(".skills-line-container", {
					left: "-100%",
					duration: 0.5,
					ease: "power2.inOut",
					overwrite: "auto",
				});
			}
		};


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

function SkillsDesktop() {
	gsap.matchMedia().add(`(min-width: ${breakpoints.desktop}px)`, () => {
		if (!document.querySelector(".skill")) return;

		let skillsAnimation: gsap.core.Tween | null = null;
		let lineAnimation: gsap.core.Tween | null = null;

		const hasSkillsLine = !!document.querySelector(".skills-line-container");

		const playEnter = () => {
			if (skillsAnimation) skillsAnimation.kill();
			if (lineAnimation) lineAnimation.kill();

			gsap.to(".skill", {
				x: "0%",
				opacity: 1,
				duration: 0.35,
				stagger: 0.12,
				delay: 0.5,
				ease: "power2.out",
				overwrite: "auto",
			});

			const hasSkillsLine = !!document.querySelector(".skills-line-container");
			if (hasSkillsLine) {
				gsap.to(".skills-line-container", {
					x: 0,
					duration: 0.35,
					delay: 0.75,
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
					x: -1000,
					duration: 0.5,
					ease: "power2.inOut",
					overwrite: "auto",
				});
			}
		};

		gsap.set(".skill", { x: "-210%", opacity: 1 });
		if (hasSkillsLine) {
			gsap.set(".skills-line-container", { x: -1000 });
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

function NameMobile() {
	gsap.matchMedia().add(`(max-width: ${breakpoints.tablet}px)`, () => {
		if (!document.querySelector(".name-container")) return;

		let nameAnimation: gsap.core.Tween | null = null;

		gsap.set(".name-container", { clearProps: "right,left" });

		const playEnter = () => {
			if (nameAnimation) nameAnimation.kill();
			nameAnimation = gsap.to(".name-container", {
				top: "10%",
				duration: 0.65,
				delay: .8,
				ease: "power2.out",
				overwrite: "auto",
			});
		};

		const playLeave = () => {
			if (nameAnimation) nameAnimation.kill();
			nameAnimation = gsap.to(".name-container", {
				top: "-100%",
				duration: 0.25,
				ease: "power2.inOut",
				overwrite: "auto",
			});
		};

		gsap.set(".name-container", { top: "-100%" });

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
	});
}

function NameTablet() {
  gsap.matchMedia().add(`(min-width: ${breakpoints.tablet + 1}px) and (max-width: ${breakpoints.smallDesktop - 1}px)`, () => {
	if (!document.querySelector(".name-container")) return;

	let nameAnimation: gsap.core.Tween | null = null;

	gsap.set(".name-container", { clearProps: "top", });

	const playEnter = () => {
		if (nameAnimation) nameAnimation.kill();
		nameAnimation = gsap.to(".name-container", {
			top: "10%",
			duration: .65,
			delay: .85,
			ease: "power2.out",
			overwrite: "auto",
		});
	};

	const playLeave = () => {
		if (nameAnimation) nameAnimation.kill();
		nameAnimation = gsap.to(".name-container", {
			top: "-100%",
			duration: 0.5,
			ease: "power2.inOut",
			overwrite: "auto",
		});
	};

	gsap.set(".name-container", { top: "-100%" });

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

function NameDesktop() {
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
