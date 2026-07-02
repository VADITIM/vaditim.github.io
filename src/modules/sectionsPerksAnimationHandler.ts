import { gsap } from "gsap";
import { breakpoints } from "@modules/animationHandler";
import {
	onSectionEnterLeaveAnimation,
	type SectionTransitionMeta,
} from "./sectionsStateMachine";
import { getSectionIndexById } from "./sectionsRegistry";
import { SECTION_ENTER_DELAY } from "./sectionsTransition";

gsap.defaults({ immediateRender: false });

/** Stagger of the skills line behind the skills themselves, preserved from the original tuning. */
const SKILLS_LINE_OFFSET = 0.25;

export function registerPerksAnimations() {
	const myIndex = getSectionIndexById('perks');

	const isEnter = (meta: SectionTransitionMeta) => meta.isEnteringSection(myIndex);
	const isLeave = (meta: SectionTransitionMeta) => meta.isLeavingSection(myIndex);

	SkillsMobile(myIndex, isEnter, isLeave);
	SkillsDesktop(myIndex, isEnter, isLeave);
	NameMobile(myIndex, isEnter, isLeave);
	NameDesktop(myIndex, isEnter, isLeave);
}

type SkillsMobileVariant = {
	mediaQuery: string;
	skillEnterLeft: string;
	lineEnterLeft: string;
	enterDelay: number;
	lineDelay: number;
};

type SkillsDesktopVariant = {
	mediaQuery: string;
	skillEnterX: string;
	lineEnterX: number;
};

function RegisterSkillsM(
	config: SkillsMobileVariant,
	isEnter: (m: SectionTransitionMeta) => boolean,
	isLeave: (m: SectionTransitionMeta) => boolean,
	initialSection: number
) {
	gsap.matchMedia().add(config.mediaQuery, () => {
		if (!document.querySelector(".skill")) return;

		let skillsAnimation: gsap.core.Tween | null = null;
		let lineAnimation: gsap.core.Tween | null = null;

		const hasSkillsLine = !!document.querySelector(".skills-line-container");

		gsap.set(".skill", { left: "-200%", opacity: 1 });
		gsap.set(".skills-line-container", { left: "-100%" });

		const playEnter = () => {
			if (skillsAnimation) skillsAnimation.kill();
			if (lineAnimation) lineAnimation.kill();

			skillsAnimation = gsap.to(".skill", {
				left: config.skillEnterLeft,
				opacity: 1,
				duration: 0.35,
				stagger: 0.12,
				delay: SECTION_ENTER_DELAY + config.enterDelay,
				ease: "power2.out",
				overwrite: "auto",
			});

			if (hasSkillsLine) {
				lineAnimation = gsap.to(".skills-line-container", {
					left: config.lineEnterLeft,
					duration: 0.35,
					delay: SECTION_ENTER_DELAY + config.lineDelay,
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
			isEnter,
			isLeave,
			onEnter: playEnter,
			onLeave: playLeave,
			initialSection,
		});

		return () => {
			cleanupStates();
			if (skillsAnimation) skillsAnimation.kill();
			if (lineAnimation) lineAnimation.kill();
		};
	});
}

function RegisterSkillsD(
	config: SkillsDesktopVariant,
	isEnter: (m: SectionTransitionMeta) => boolean,
	isLeave: (m: SectionTransitionMeta) => boolean,
	initialSection: number
) {
	gsap.matchMedia().add(config.mediaQuery, () => {
		if (!document.querySelector(".skill")) return;

		let skillsAnimation: gsap.core.Tween | null = null;
		let lineAnimation: gsap.core.Tween | null = null;

		const hasSkillsLine = !!document.querySelector(".skills-line-container");

		const playEnter = () => {
			if (skillsAnimation) skillsAnimation.kill();
			if (lineAnimation) lineAnimation.kill();

			skillsAnimation = gsap.to(".skill", {
				x: config.skillEnterX,
				opacity: 1,
				duration: 0.35,
				stagger: 0.12,
				delay: SECTION_ENTER_DELAY,
				ease: "power2.out",
				overwrite: "auto",
			});

			if (hasSkillsLine) {
				lineAnimation = gsap.to(".skills-line-container", {
					x: config.lineEnterX,
					duration: 0.35,
					delay: SECTION_ENTER_DELAY + SKILLS_LINE_OFFSET,
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
			isEnter,
			isLeave,
			onEnter: playEnter,
			onLeave: playLeave,
			initialSection,
		});

		return () => {
			cleanupStates();
			if (skillsAnimation) skillsAnimation.kill();
			if (lineAnimation) lineAnimation.kill();
		};
	});
}

function SkillsMobile(
	initialSection: number,
	isEnter: (m: SectionTransitionMeta) => boolean,
	isLeave: (m: SectionTransitionMeta) => boolean
) {
	const mobileVariants: SkillsMobileVariant[] = [
		{
			mediaQuery: `(max-width: ${breakpoints.tablet - 1}px)`,
			skillEnterLeft: "95%",
			lineEnterLeft: "100%",
			enterDelay: 0,
			lineDelay: SKILLS_LINE_OFFSET,
		},
		{
			mediaQuery: `(min-width: ${breakpoints.tablet}px) and (max-width: ${breakpoints.smallDesktop - 1}px)`,
			skillEnterLeft: "0%",
			lineEnterLeft: "0",
			enterDelay: 0,
			lineDelay: SKILLS_LINE_OFFSET,
		},
	];

	mobileVariants.forEach(v => RegisterSkillsM(v, isEnter, isLeave, initialSection));
}

function SkillsDesktop(
	initialSection: number,
	isEnter: (m: SectionTransitionMeta) => boolean,
	isLeave: (m: SectionTransitionMeta) => boolean
) {
	const desktopVariants: SkillsDesktopVariant[] = [
		{
			mediaQuery: `(min-width: ${breakpoints.desktop}px)`,
			skillEnterX: "0%",
			lineEnterX: 0,
		},
		{
			mediaQuery: `(min-width: ${breakpoints.midDesktop}px) and (max-width: ${breakpoints.desktop - 1}px)`,
			skillEnterX: "30%",
			lineEnterX: 150,
		},
		{
			mediaQuery: `(min-width: ${breakpoints.smallDesktop}px) and (max-width: ${breakpoints.midDesktop - 1}px)`,
			skillEnterX: "65%",
			lineEnterX: 330,
		},
	];

	desktopVariants.forEach(v => RegisterSkillsD(v, isEnter, isLeave, initialSection));
}

//---------------------------------------------------------------------------------------------------------

type NameMobileVariant = {
	mediaQuery: string;
	clearProps: string;
	enterTop: string;
	enterDuration: number;
	enterDelay: number;
	leaveDuration: number;
};

type NameDesktopVariant = {
	mediaQuery: string;
	enterRight: string;
};

function RegisterNameM(
	config: NameMobileVariant,
	isEnter: (m: SectionTransitionMeta) => boolean,
	isLeave: (m: SectionTransitionMeta) => boolean,
	initialSection: number
) {
	gsap.matchMedia().add(config.mediaQuery, () => {
		if (!document.querySelector(".name-container")) return;

		let nameAnimation: gsap.core.Tween | null = null;

		gsap.set(".name-container", { clearProps: config.clearProps });

		const playEnter = () => {
			if (nameAnimation) nameAnimation.kill();
			nameAnimation = gsap.to(".name-container", {
				top: config.enterTop,
				duration: config.enterDuration,
				delay: SECTION_ENTER_DELAY + config.enterDelay,
				ease: "power2.out",
				overwrite: "auto",
			});
		};

		const playLeave = () => {
			if (nameAnimation) nameAnimation.kill();
			nameAnimation = gsap.to(".name-container", {
				top: "-100%",
				duration: config.leaveDuration,
				ease: "power2.inOut",
				overwrite: "auto",
			});
		};

		gsap.set(".name-container", { top: "-100%" });

		const cleanupStates = onSectionEnterLeaveAnimation({
			isEnter,
			isLeave,
			onEnter: playEnter,
			onLeave: playLeave,
			initialSection,
		});

		return () => {
			cleanupStates();
			if (nameAnimation) nameAnimation.kill();
		};
	});
}

function RegisterNameD(
	config: NameDesktopVariant,
	isEnter: (m: SectionTransitionMeta) => boolean,
	isLeave: (m: SectionTransitionMeta) => boolean,
	initialSection: number
) {
	gsap.matchMedia().add(config.mediaQuery, () => {
		if (!document.querySelector(".name-container")) return;

		let nameAnimation: gsap.core.Tween | null = null;

		const playEnter = () => {
			if (nameAnimation) nameAnimation.kill();
			nameAnimation = gsap.to(".name-container", {
				right: config.enterRight,
				duration: 0.35,
				delay: SECTION_ENTER_DELAY,
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
			isEnter,
			isLeave,
			onEnter: playEnter,
			onLeave: playLeave,
			initialSection,
		});

		return () => {
			cleanupStates();
			if (nameAnimation) nameAnimation.kill();
		};
	});
}

function NameMobile(
	initialSection: number,
	isEnter: (m: SectionTransitionMeta) => boolean,
	isLeave: (m: SectionTransitionMeta) => boolean
) {
	const mobileVariants: NameMobileVariant[] = [
		{
			mediaQuery: `(max-width: ${breakpoints.tablet}px)`,
			clearProps: "right,left",
			enterTop: "10%",
			enterDuration: 0.65,
			enterDelay: 0,
			leaveDuration: 0.25,
		},
		{
			mediaQuery: `(min-width: ${breakpoints.tablet + 1}px) and (max-width: ${breakpoints.smallDesktop - 1}px)`,
			clearProps: "top",
			enterTop: "10%",
			enterDuration: 0.65,
			enterDelay: 0,
			leaveDuration: 0.5,
		},
	];

	mobileVariants.forEach(v => RegisterNameM(v, isEnter, isLeave, initialSection));
}

function NameDesktop(
	initialSection: number,
	isEnter: (m: SectionTransitionMeta) => boolean,
	isLeave: (m: SectionTransitionMeta) => boolean
) {
	const desktopVariants: NameDesktopVariant[] = [
		{
			mediaQuery: `(min-width: ${breakpoints.desktop}px)`,
			enterRight: "-15%",
		},
		{
			mediaQuery: `(min-width: ${breakpoints.midDesktop}px) and (max-width: ${breakpoints.desktop - 1}px)`,
			enterRight: "-25%",
		},
		{
			mediaQuery: `(min-width: ${breakpoints.smallDesktop}px) and (max-width: ${breakpoints.midDesktop - 1}px)`,
			enterRight: "-25%",
		},
	];

	desktopVariants.forEach(v => RegisterNameD(v, isEnter, isLeave, initialSection));
}
