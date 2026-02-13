import { gsap } from "gsap";
import { PerksAnimationDesktop } from "./Desktop/Perks-Animation-Handler";
import { ProfileAnimationDesktop } from "./Desktop/Profile-Animation-Handler";
import { ProjectAnimationDesktop } from "./Desktop/Projects-Animation-Handler";
import { onSectionChange } from "@modules/sections";

gsap.defaults({ immediateRender: false });

export const breakpoints = {
	mobile: 435,
	tablet: 840,
	tabletLandscape: 1200,
	smallDesktop: 1500,
	desktop: 1800,
	largeDesktop: 2140,
} as const;

export function getSectionTransitionStates(current: number, previous: number) {
	const enterPerksFromProfile = current === 0 && previous === 1;
	const leavePerksToProfile = current === 1 && previous === 0;
	const enterPerksFromProjects = current === 0 && previous === 2;
	const leavePerksToProjects = current === 2 && previous === 0;

	const enterProfileFromPerks = current === 1 && previous === 0;
	const leaveProfileToPerks = current === 0 && previous === 1;
	const leaveProfileToProjects = current === 2 && previous === 1;
	const enterProfileFromProjects = current === 1 && previous === 2;

	const enterProjectsFromProfile = current === 2 && previous === 1;
	const leaveProjectsToProfile = current === 1 && previous === 2;

	const skipProfile = (current === 0 && previous === 2) || (current === 2 && previous === 0);

	return {
		enterPerksFromProfile,
		leavePerksToProfile,
		enterPerksFromProjects,
		leavePerksToProjects,
		enterProfileFromPerks,
		leaveProfileToPerks,
		leaveProfileToProjects,
		enterProfileFromProjects,
		enterProjectsFromProfile,
		leaveProjectsToProfile,
		skipProfile,
	};
}

export type SectionTransitionStates = ReturnType<typeof getSectionTransitionStates>;

type SectionStatesChangeCallback = (
	states: SectionTransitionStates,
	meta: {
		current: number;
		previous: number;
		direction: 'forward' | 'backward' | 'none';
	}
) => void;

export function onSectionStatesChange(callback: SectionStatesChangeCallback) {
	return onSectionChange((current, previous, direction) => {
		const states = getSectionTransitionStates(current, previous);
		callback(states, { current, previous, direction });
	});
}

export function PageAnimations() 
{
	PerksAnimationDesktop();
	ProfileAnimationDesktop();
	ProjectAnimationDesktop();
}
  

