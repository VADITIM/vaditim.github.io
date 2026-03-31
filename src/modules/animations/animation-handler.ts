import { gsap } from "gsap";
import { PerksAnimationDesktop as PerksAnimation } from "@modules/Sections/Perks Section/Perks-Animation-Handler";
import { ProfileAnimationDesktop } from "@modules/Sections/Profile Section/Profile-Animation-Handler";
import { ProjectAnimationDesktop } from "@modules/Sections/Projects Section/Projects-Animation-Handler";

export {
	SECTION_INDEX,
	getSectionTransitionStates,
	onSectionStatesChange,
	onSectionEnter,
	onSectionLeave,
} from "../Sections/section-state-machine";
export type {
	SectionIndex,
	SectionTransitionMeta,
	SectionTransitionStates,
} from "../Sections/section-state-machine";

gsap.defaults({ immediateRender: false });

export function PageAnimations() 
{
		PerksAnimation();
		ProfileAnimationDesktop();
		ProjectAnimationDesktop();
}

export const breakpoints = {
	mobile: 360,
	tablet: 768,
	tabletLandscape: 1024,
	smallDesktop: 1200,
	midDesktop: 1550,
	desktop: 1825,
} as const;
  

