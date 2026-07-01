import { ref, watch, type CSSProperties } from 'vue';
import { currentSection, onSectionChange } from "@modules/Sections/sections";

export const finished = ref<boolean>(false);

export const SECTION_INDEX = {
	NONE: -1,
} as const;

export type SectionDirection = 'forward' | 'backward' | 'none';

export type SectionTransitionMeta = {
	current: number;
	previous: number;
	direction: SectionDirection;
	/** True when this section is now the active one (and wasn't before). */
	isEnteringSection: (i: number) => boolean;
	/** True when this section was active and is no longer. */
	isLeavingSection: (i: number) => boolean;
	/** True when this was the previous section. */
	isFromSection: (i: number) => boolean;
	/** True when this is the current section. */
	isToSection: (i: number) => boolean;
	/** True when the section sits between previous and current but is neither (was skipped). */
	isSkippingSection: (i: number) => boolean;
};

export function buildTransitionMeta(
	current: number,
	previous: number,
	direction: SectionDirection
): SectionTransitionMeta {
	return {
		current,
		previous,
		direction,
		isEnteringSection: (i) => current === i && previous !== i,
		isLeavingSection: (i) => previous === i && current !== i,
		isFromSection: (i) => previous === i,
		isToSection: (i) => current === i,
		isSkippingSection: (i) => {
			if (current === i || previous === i) return false;
			const lo = Math.min(current, previous);
			const hi = Math.max(current, previous);
			return lo < i && i < hi;
		},
	};
}

export type SectionEnterLeaveAnimationOptions = {
	isEnter: (meta: SectionTransitionMeta) => boolean;
	isLeave: (meta: SectionTransitionMeta) => boolean;
	onEnter: () => void;
	onLeave: () => void;
	initialSection?: number;
};

type SectionStatesChangeCallback = (meta: SectionTransitionMeta) => void;

export function onSectionStatesChange(callback: SectionStatesChangeCallback) {
	return onSectionChange((current, previous, direction) => {
		callback(buildTransitionMeta(current, previous, direction));
	});
}

export function onSectionEnter(
	section: number,
	callback: SectionStatesChangeCallback
) {
	return onSectionStatesChange((meta) => {
		if (meta.isEnteringSection(section)) {
			callback(meta);
		}
	});
}

export function onSectionLeave(
	section: number,
	callback: SectionStatesChangeCallback
) {
	return onSectionStatesChange((meta) => {
		if (meta.isLeavingSection(section)) {
			callback(meta);
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
	const cleanup = onSectionStatesChange((meta) => {
		if (isEnter(meta)) onEnter();
		else if (isLeave(meta)) onLeave();
	});

	if (initialSection !== undefined && currentSection.value === initialSection) {
		onEnter();
	}

	return cleanup;
}

export type SectionLayerStyleControllerOptions = {
	lingerMs?: number;
	fadeMs?: number;
	/**
	 * How long the *leaving* section stays stacked above the entering one at the
	 * start of a transition, so its exit animation is visible before the
	 * section-cut curtain closes over the swap. Without this, entering an opaque
	 * section (e.g. Playground) instantly covers the leaving section and its exit
	 * animation plays invisibly underneath. Kept shorter than the curtain's close
	 * time so the swap itself is never revealed.
	 */
	leaveLiftMs?: number;
};

export type SectionLayerStyleController = {
	GetSectionLayerStyle: (sectionIndex: number) => CSSProperties;
	cleanup: () => void;
};

export function CreateSectionLayerStyleController(
	options: SectionLayerStyleControllerOptions = {}
): SectionLayerStyleController {
	const lingerMs = options.lingerMs ?? 1500;
	const fadeMs = options.fadeMs ?? 150;
	const leaveLiftMs = options.leaveLiftMs ?? 450;

	const lingeringSection = ref<number | null>(null);
	const fadingSection = ref<number | null>(null);
	// The section currently leaving — held above the entering one for `leaveLiftMs`
	// so its exit animation is visible until the curtain closes over the swap.
	const liftedSection = ref<number | null>(null);

	let fadeTimer: number | null = null;
	let clearTimer: number | null = null;
	let liftTimer: number | null = null;

	const GetSectionLayerStyle = (sectionIndex: number): CSSProperties => {
		const isCurrent = currentSection.value === sectionIndex;
		const isLingering = lingeringSection.value === sectionIndex;
		const isFading = fadingSection.value === sectionIndex && !isCurrent;
		const isLifted = liftedSection.value === sectionIndex && !isCurrent;

		const visible = isCurrent || isLingering;
		const opacity = visible ? (isFading ? 0 : 1) : 0;

		return {
			// Lifted (leaving) section sits above the entering one so its exit plays
			// in view; the curtain (z-index 40) still masks the actual swap.
			zIndex: isLifted ? 3 : isCurrent ? 2 : isLingering ? 1 : -100,
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
			liftedSection.value = oldSection;

			if (fadeTimer !== null) window.clearTimeout(fadeTimer);
			if (clearTimer !== null) window.clearTimeout(clearTimer);
			if (liftTimer !== null) window.clearTimeout(liftTimer);

			liftTimer = window.setTimeout(() => {
				if (liftedSection.value === oldSection) liftedSection.value = null;
				liftTimer = null;
			}, leaveLiftMs);

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
		if (liftTimer !== null) window.clearTimeout(liftTimer);
		fadeTimer = null;
		clearTimer = null;
		liftTimer = null;
		lingeringSection.value = null;
		fadingSection.value = null;
		liftedSection.value = null;
	};

	return { GetSectionLayerStyle, cleanup };
}
