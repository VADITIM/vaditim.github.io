import { ref } from 'vue';
import { currentSection, onSectionChange } from "@modules/sections";

export const finished = ref<boolean>(false);

export const SECTION_INDEX = {
	NONE: -1,
	PERKS: 0,
	PROFILE: 1,
	PROJECTS: 2,
} as const;

export type SectionIndex = typeof SECTION_INDEX[keyof typeof SECTION_INDEX];
export type SectionDirection = 'forward' | 'backward' | 'none';

export function getSectionTransitionStates(current: number, previous: number) {
	const enterPerksFromNone = current === SECTION_INDEX.PERKS && previous === SECTION_INDEX.NONE;
	const enterProfileFromNone = current === SECTION_INDEX.PROFILE && previous === SECTION_INDEX.NONE;
	const enterProjectsFromNone = current === SECTION_INDEX.PROJECTS && previous === SECTION_INDEX.NONE;

	const enterPerksFromProfile = current === SECTION_INDEX.PERKS && previous === SECTION_INDEX.PROFILE;
	const leavePerksToProfile = current === SECTION_INDEX.PROFILE && previous === SECTION_INDEX.PERKS;
	const enterPerksFromProjects = current === SECTION_INDEX.PERKS && previous === SECTION_INDEX.PROJECTS;
	const leavePerksToProjects = current === SECTION_INDEX.PROJECTS && previous === SECTION_INDEX.PERKS;

	const enterProfileFromPerks = current === SECTION_INDEX.PROFILE && previous === SECTION_INDEX.PERKS;
	const leaveProfileToPerks = current === SECTION_INDEX.PERKS && previous === SECTION_INDEX.PROFILE;
	const leaveProfileToProjects = current === SECTION_INDEX.PROJECTS && previous === SECTION_INDEX.PROFILE;
	const enterProfileFromProjects = current === SECTION_INDEX.PROFILE && previous === SECTION_INDEX.PROJECTS;

	const enterProjectsFromProfile = current === SECTION_INDEX.PROJECTS && previous === SECTION_INDEX.PROFILE;
	const leaveProjectsToProfile = current === SECTION_INDEX.PROFILE && previous === SECTION_INDEX.PROJECTS;

	const skipProfile =
		(current === SECTION_INDEX.PERKS && previous === SECTION_INDEX.PROJECTS) ||
		(current === SECTION_INDEX.PROJECTS && previous === SECTION_INDEX.PERKS);

	return {
		enterPerksFromNone,
		enterProfileFromNone,
		enterProjectsFromNone,
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

export type SectionTransitionMeta = {
	current: number;
	previous: number;
	direction: SectionDirection;
};

export type SectionAnimationPredicate = (states: SectionTransitionStates) => boolean;

export type SectionEnterLeaveAnimationOptions = {
	isEnter: SectionAnimationPredicate;
	isLeave: SectionAnimationPredicate;
	onEnter: () => void;
	onLeave: () => void;
	initialSection?: SectionIndex;
};

type SectionStatesChangeCallback = (
	states: SectionTransitionStates,
	meta: SectionTransitionMeta
) => void;

export function onSectionStatesChange(callback: SectionStatesChangeCallback) {
	return onSectionChange((current, previous, direction) => {
		const states = getSectionTransitionStates(current, previous);
		callback(states, { current, previous, direction });
	});
}

export function onSectionEnter(
	section: SectionIndex,
	callback: SectionStatesChangeCallback
) {
	return onSectionStatesChange((states, meta) => {
		if (meta.current === section && meta.previous !== section) {
			callback(states, meta);
		}
	});
}

export function onSectionLeave(
	section: SectionIndex,
	callback: SectionStatesChangeCallback
) {
	return onSectionStatesChange((states, meta) => {
		if (meta.previous === section && meta.current !== section) {
			callback(states, meta);
		}
	});
}

export function onSectionEnterLeaveAnimation({
	isEnter,
	isLeave,
	onEnter,
	onLeave,
	initialSection,
}: SectionEnterLeaveAnimationOptions) {
	const cleanup = onSectionStatesChange((states) => {
		if (isEnter(states)) onEnter();
		else if (isLeave(states)) onLeave();
	});

	if (initialSection !== undefined && currentSection.value === initialSection) {
		onEnter();
	}

	return cleanup;
}