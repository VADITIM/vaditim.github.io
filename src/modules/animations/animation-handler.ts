import { gsap } from "gsap";
import { PerksAnimationDesktop } from "./Desktop/Perks-Animation-Handler";
import { ProfileAnimationDesktop } from "./Desktop/Profile-Animation-Handler";
import { ProjectAnimationDesktop } from "./Desktop/Projects-Animation-Handler";
import { breakpoints } from "./animation-config";

export { breakpoints } from "./animation-config";
export {
	SECTION_INDEX,
	getSectionTransitionStates,
	onSectionStatesChange,
	onSectionEnter,
	onSectionLeave,
} from "./section-state-machine";
export type {
	SectionIndex,
	SectionTransitionMeta,
	SectionTransitionStates,
} from "./section-state-machine";

gsap.defaults({ immediateRender: false });

export function PageAnimations() 
{
	if (breakpoints.mobile) {
		// PerksAnimationMobile();
		// ProfileAnimationMobile();
		// ProjectAnimationMobile();
	}
	if (breakpoints.tablet) {
		// PerksAnimationTablet();
		// ProfileAnimationTablet();
		// ProjectAnimationTablet();
	}
	if (breakpoints.smallDesktop) {
		// PerksAnimationSmallDesktop();
		// ProfileAnimationSmallDesktop();
		// ProjectAnimationSmallDesktop();
	}
	if (breakpoints.midDesktop) {
		// PerksAnimationMid();
		// ProfileAnimationMid();
		// ProjectAnimationMid();
	}
	if (breakpoints.desktop) {
		PerksAnimationDesktop();
		ProfileAnimationDesktop();
		ProjectAnimationDesktop();
	}
}
  

