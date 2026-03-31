import { ref, watch, type CSSProperties } from 'vue';
import { currentSection, onSectionChange } from "@modules/Sections/sections";

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
	const enterProjectsFromPerks = current === SECTION_INDEX.PROJECTS && previous === SECTION_INDEX.PERKS;
	const leaveProjectsToPerks = current === SECTION_INDEX.PERKS && previous === SECTION_INDEX.PROJECTS;

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
		enterProjectsFromPerks,
		leaveProjectsToPerks,
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

export type SectionLayerStyleControllerOptions = {
	lingerMs?: number;
	fadeMs?: number;
};

export type SectionLayerStyleController = {
	GetSectionLayerStyle: (sectionIndex: number) => CSSProperties;
	cleanup: () => void;
};

/**
 * Centralized section visibility styling.
 * - Current section: visible immediately
 * - Previous section: stays visible for `lingerMs`, then fades out over `fadeMs`
 */
export function CreateSectionLayerStyleController(
	options: SectionLayerStyleControllerOptions = {}
): SectionLayerStyleController {
	const lingerMs = options.lingerMs ?? 1500;
	const fadeMs = options.fadeMs ?? 150;

	const lingeringSection = ref<number | null>(null);
	const fadingSection = ref<number | null>(null);

	let fadeTimer: number | null = null;
	let clearTimer: number | null = null;

	const GetSectionLayerStyle = (sectionIndex: number): CSSProperties => {
		const isCurrent = currentSection.value === sectionIndex;
		const isLingering = lingeringSection.value === sectionIndex;
		const isFading = fadingSection.value === sectionIndex && !isCurrent;

		const visible = isCurrent || isLingering;
		const opacity = visible ? (isFading ? 0 : 1) : 0;

		return {
			zIndex: isCurrent ? 2 : isLingering ? 1 : 0,
			position: 'relative',
			pointerEvents: isCurrent ? 'auto' : 'none',
			opacity,
			transition: `opacity ${fadeMs}ms linear`,
		};
	};

	const stopWatch = watch(
		currentSection,
		(newSection, oldSection) => {
			if (newSection === oldSection) return;

			lingeringSection.value = oldSection;
			fadingSection.value = null;

			if (fadeTimer !== null) window.clearTimeout(fadeTimer);
			if (clearTimer !== null) window.clearTimeout(clearTimer);

			fadeTimer = window.setTimeout(() => {
				if (lingeringSection.value === oldSection) {
					fadingSection.value = oldSection;
				}
			}, lingerMs);

			clearTimer = window.setTimeout(() => {
				if (lingeringSection.value === oldSection) lingeringSection.value = null;
				if (fadingSection.value === oldSection) fadingSection.value = null;
				fadeTimer = null;
				clearTimer = null;
			}, lingerMs + fadeMs);
		},
		{ flush: 'sync' }
	);

	const cleanup = () => {
		stopWatch();
		if (fadeTimer !== null) window.clearTimeout(fadeTimer);
		if (clearTimer !== null) window.clearTimeout(clearTimer);
		fadeTimer = null;
		clearTimer = null;
		lingeringSection.value = null;
		fadingSection.value = null;
	};

	return { GetSectionLayerStyle, cleanup };
}