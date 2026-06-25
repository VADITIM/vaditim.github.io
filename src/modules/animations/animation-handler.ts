import { gsap } from "gsap";
import type { SectionDefinition } from "@modules/Sections/section-registry";

export {
	onSectionStatesChange,
	onSectionEnter,
	onSectionLeave,
	buildTransitionMeta,
	SECTION_INDEX,
} from "../Sections/section-state-machine";
export type {
	SectionTransitionMeta,
	SectionDirection,
} from "../Sections/section-state-machine";

gsap.defaults({ immediateRender: false });

export function PageAnimations(sections: SectionDefinition[]) {
	sections.forEach(s => s.registerAnimations());
}

export const breakpoints = {
	mobile: 360,
	tablet: 768,
	tabletLandscape: 1024,
	smallDesktop: 1200,
	midDesktop: 1550,
	desktop: 1825,
} as const;
