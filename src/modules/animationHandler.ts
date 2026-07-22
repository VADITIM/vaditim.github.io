import { gsap } from "gsap";
import type { SectionDefinition } from "@modules/sectionsRegistry";

export {
	onSectionStatesChange,
	onSectionEnter,
	onSectionLeave,
	buildTransitionMeta,
	SECTION_INDEX,
} from "./sectionsStateMachine";
export type {
	SectionTransitionMeta,
	SectionDirection,
} from "./sectionsStateMachine";

gsap.defaults({ immediateRender: false });

export function PageAnimations(sections: SectionDefinition[]) {
	sections.forEach(section => section.registerAnimations());
}

export const breakpoints = {
	mobile: 360,
	tablet: 768,
	tabletLandscape: 1024,
	smallDesktop: 1200,
	midDesktop: 1550,
	desktop: 1825,
} as const;
