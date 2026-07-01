<template>
	  <div class="content-list-container" :class="[{ active: activeProjectIndex !== null }, isMobile ? 'is-mobile' : 'is-desktop', { 'dragging': isDragging && isMobile }]" :style="dragStyle">
			<div class="line"></div>
			<div v-if="isMobile" class="rect-container">
				<div
					v-for="(section, i) in SECTIONS"
					:key="section.id + '-rect'"
					class="rect"
					:class="getEntryClasses(i)"
					:style="getEntryDragStyle(i, 'rect')"
					@click="onEntryClick(i)"
				></div>
			</div>
			<div
				v-for="(section, i) in SECTIONS"
				:key="section.id"
				class="section-header-list"
				:class="[`${section.id}-header-list`, getEntryClasses(i)]"
				:style="[{ '--accent': section.color }, getEntryDragStyle(i, 'text')]"
				@click="onEntryClick(i)"
			>
				<span class="shl-marker"></span>
				<span class="shl-index">{{ String(i + 1).padStart(2, '0') }}</span>
				<span class="shl-label">{{ section.label }}</span>
			</div>
	  </div>

</template>

<script setup lang="ts">
	import { onMounted, onUnmounted, ref, computed, watch } from 'vue'
	import { currentSection, InitializeSectionTracking, cleanupSectionTracking, ChangeToSectionID } from '@modules/Sections/sections'
	import { SECTIONS } from '@modules/Sections/section-registry'
	import { activeProjectIndex } from '@modules/Sections/Projects Section/projects'
	import { isMobile } from '@modules/Misc/is-mobile'
	import { navigationLockRef } from '@modules/Misc/navigation-lock'
	import { InitializeMobileDragNavigation, CleanupMobileDragNavigation, dragOffset, isDragging, dragDirection, thresholdReached } from '@modules/Misc/mobile-drag-navigation'

	const thresholdAnimating = ref(false)
	let thresholdAnimTimeout: ReturnType<typeof setTimeout> | null = null
	const isReturning = ref(false)
	type EntryType = 'rect' | 'text'
	const returnEntryTransforms = ref<Record<string, string>>({})
	const currentEntryTransforms = ref<Record<string, string>>({})

	const ACTIVE_BASE_OFFSET_PX = -9.6
	const INACTIVE_RECT_SCALE = 0.8
	const INACTIVE_TEXT_SCALE = 1

	const getEntryKey = (sectionIndex: number, entryType: EntryType) => `${entryType}-${sectionIndex}`

	const getEntryDefaultTransform = (sectionIndex: number, entryType: EntryType) => {
		const isCurrent = sectionIndex === currentSection.value

		if (entryType === 'rect') {
			const baseY = isCurrent ? ACTIVE_BASE_OFFSET_PX : 0
			const baseScale = isCurrent ? 1.1 : INACTIVE_RECT_SCALE
			const baseRotate = isCurrent ? ' rotate(135deg)' : ''
			return `translateY(${baseY}px) scale(${baseScale})${baseRotate}`
		}

		const textY = isCurrent ? ACTIVE_BASE_OFFSET_PX : 0
		return `translateY(${textY}px) scale(${INACTIVE_TEXT_SCALE})`
	}

	watch(thresholdReached, () => {
		thresholdAnimating.value = true
		if (thresholdAnimTimeout) {
			clearTimeout(thresholdAnimTimeout)
		}
		thresholdAnimTimeout = setTimeout(() => {
			thresholdAnimating.value = false
			thresholdAnimTimeout = null
		}, 180)
	})

	watch(isDragging, (newVal) => {
		if (newVal || !isMobile.value) {
			isReturning.value = false
			return
		}

		isReturning.value = true
		const seededTransforms: Record<string, string> = {}
		for (let sectionIndex = 0; sectionIndex < SECTIONS.length; sectionIndex++) {
			const rectKey = getEntryKey(sectionIndex, 'rect')
			const textKey = getEntryKey(sectionIndex, 'text')
			seededTransforms[rectKey] = currentEntryTransforms.value[rectKey] ?? getEntryDefaultTransform(sectionIndex, 'rect')
			seededTransforms[textKey] = currentEntryTransforms.value[textKey] ?? getEntryDefaultTransform(sectionIndex, 'text')
		}
		returnEntryTransforms.value = seededTransforms

		requestAnimationFrame(() => {
			const nextTransforms: Record<string, string> = {}
			for (let sectionIndex = 0; sectionIndex < SECTIONS.length; sectionIndex++) {
				nextTransforms[getEntryKey(sectionIndex, 'rect')] = getEntryDefaultTransform(sectionIndex, 'rect')
				nextTransforms[getEntryKey(sectionIndex, 'text')] = getEntryDefaultTransform(sectionIndex, 'text')
			}
			returnEntryTransforms.value = nextTransforms
		})

		setTimeout(() => {
			isReturning.value = false
			returnEntryTransforms.value = {}
			currentEntryTransforms.value = {}
		}, 240)
	}, { flush: 'sync' })

	const dragStyle = computed(() => {
		if (!isDragging.value || !isMobile.value) return {}
		
		return {
			opacity: 0.8 + dragOffset.value / 500,
			transition: (thresholdReached.value || thresholdAnimating.value) ? "opacity 0.15s ease-out" : "none"
		}
	})

	const getEntryClasses = (sectionIndex: number) => {
		return {
			active: currentSection.value === sectionIndex,
		}
	}

	function getTargetSectionIndex() {
		if (!dragDirection.value) return null
		const delta = dragDirection.value === 'down' ? 1 : -1
		const nextSection = currentSection.value + delta
		if (nextSection < 0 || nextSection >= SECTIONS.length) return null
		return nextSection
	}

	const getEntryDragStyle = (sectionIndex: number, entryType: 'rect' | 'text') => {
		const entryKey = getEntryKey(sectionIndex, entryType)

		if (isReturning.value && isMobile.value) {
			const returnTransform = returnEntryTransforms.value[entryKey]
			if (!returnTransform) return {}

			return {
				transform: returnTransform,
				transition: 'transform 0.22s ease-out',
			}
		}

		if (!isMobile.value || !isDragging.value || !dragDirection.value) return {}
		const targetSection = getTargetSectionIndex()
		if (targetSection === null) return {}

		const dragProgressPx = Math.min(dragOffset.value, window.innerHeight * .2)
		const downMovement = 6 + Math.min(dragProgressPx * 0.05, 22)
		const upMovement = 6 + Math.min(dragProgressPx * 0.05, 24)
		const isTarget = sectionIndex === targetSection
		const sectionMoveY = isTarget ? -upMovement : downMovement
		const popAmount = (thresholdReached.value || thresholdAnimating.value) ? 8 : 0
		const targetY = isTarget ? sectionMoveY - popAmount : sectionMoveY

		if (entryType === 'rect') {
			const isCurrent = sectionIndex === currentSection.value
			const baseOffsetY = 0
			const targetScale = isTarget
				? (INACTIVE_RECT_SCALE + Math.min(dragProgressPx / 1000, 0.12) + (thresholdReached.value ? 0.06 : 0))
				: INACTIVE_RECT_SCALE
			const rotate = isCurrent ? ' rotate(135deg)' : ''
			const useTransition = true
			const isActiveScalingDown = isCurrent && !isTarget
			const transitionDuration = isActiveScalingDown ? '0.24s' : '0.14s'
			const transform = `translateY(${baseOffsetY + targetY}px) scale(${targetScale})${rotate}`
			currentEntryTransforms.value[entryKey] = transform

			return {
				transform,
				transition: useTransition ? `transform ${transitionDuration} cubic-bezier(0.22, 1, 0.36, 1)` : 'none',
			}
		}

		const baseTextOffset = 0
		const textScale = isTarget
			? (INACTIVE_TEXT_SCALE + Math.min(dragProgressPx / 1400, .08) + (thresholdReached.value ? .04 : .0))
			: INACTIVE_TEXT_SCALE
		const useTransition = true
		const textTransform = `translateY(${baseTextOffset + targetY}px) scale(${textScale})`
		currentEntryTransforms.value[entryKey] = textTransform

		return {
			transform: textTransform,
			transition: useTransition ? 'transform 0.24s cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
		}
	}

	const vibrateClick = () => {
		if (navigationLockRef.value) return;
		if (typeof navigator === 'undefined') return;
		if (!('vibrate' in navigator)) return;
		navigator.vibrate(10);
	};

	const onEntryClick = (sectionIndex: number) => {
		vibrateClick();
		ChangeToSectionID(sectionIndex);
	};

	onMounted(() => {
		InitializeSectionTracking()
		if (isMobile.value) {
			InitializeMobileDragNavigation()
		}
	})

	onUnmounted(() => {
		if (thresholdAnimTimeout) {
			clearTimeout(thresholdAnimTimeout)
			thresholdAnimTimeout = null
		}
		cleanupSectionTracking()
		if (isMobile.value) {
			CleanupMobileDragNavigation()
		}
	})
</script>

<style scoped lang="scss">
	@use "@styleVariables" as *;

	.rect-container {
		position: absolute;
		display: grid;
		grid-template-columns: repeat(v-bind('SECTIONS.length'), 1fr);
		justify-items: center;
		align-items: center;
		top: -3.2rem;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	.rect {
		display: flex;
		flex-direction: row;
		border: 4px solid white;
		border-radius: 10px;
		width: 3rem;
		height: 3rem;
		pointer-events: auto;
		width: 2rem;
		height: 2rem;
		transform: translateY(0) scale(0.8) rotate(0deg);

		transition:
			.6s all .1s;

		&.active {
			border-color: $red;
			transform: translateY(-30%)
			scale(1.1)
			rotate(135deg);

			transition:
				.2s all .1s;
		}

		&.locked {
			transform: translateY(20px) scale(.95) rotate(0deg);
			border: 4px solid rgb(179, 179, 179);

			transition:
				.6s all .1s;
		}

		@include tablet {
			width: 2.5rem;
			height: 2.5rem;
			
			&.active {
				border-color: $red;
				transform: translateY(-60%)
				scale(1.3)
				rotate(135deg);
		}
		}
	}

	.content-list-container {
		@extend .disable-selection;
		display: flex;
		position: fixed;
		flex-direction: column;
		font-family: Wosker;
		z-index: 20;

		transition:
			.5s ease all;

		&.dragging {
			transition: none;
		}
	}

	// ── desktop: modern top-right section index ──
	.content-list-container.is-desktop {
		top: 2.1rem;
		right: 2.2rem;
		left: auto;
		bottom: auto;
		width: auto;
		align-items: flex-end;
		gap: 0.15rem;
		filter: drop-shadow(0 6px 22px rgba(0, 0, 0, 0.55));

		// slide out of view while a project detail window is open
		&.active {
			opacity: 0;
			transform: translateX(46px);
			pointer-events: none;
		}
	}

	.content-list-container.is-mobile {
		flex-direction: row;
		justify-content: space-between;
		left: 50%;
		bottom: -2%;
		width: min(92vw, 23rem);
		transform: translateX(-50%);
		perspective: none;

		@include mobile {
			width: min(94vw, 13rem);
		}
	}

	.section-header-list {
		position: relative;
		display: flex;
		cursor: pointer;
		text-wrap: nowrap;
		transition: .3s all;
	}

	// ── desktop entry: [label] [index] [diamond marker], right-aligned ──
	.content-list-container.is-desktop .section-header-list {
		align-items: center;
		justify-content: flex-end;
		gap: 0.7rem;
		padding: 0.32rem 0;
		color: #6a6a6a;
		transition: color .3s ease, transform .35s cubic-bezier(0.22, 1, 0.36, 1);

		.shl-label {
			font-family: 'Wosker';
			font-size: 1.45rem;
			line-height: 1;
			letter-spacing: 1px;
			transition: font-size .35s cubic-bezier(0.22, 1, 0.36, 1), color .3s ease, text-shadow .3s ease;
		}

		.shl-index {
			font-family: 'Audiowide';
			font-size: 0.66rem;
			letter-spacing: 2px;
			color: #4f4f4f;
			transition: color .3s ease;
		}

		.shl-marker {
			width: 9px;
			height: 9px;
			flex-shrink: 0;
			border: 2px solid #4f4f4f;
			border-radius: 2px;
			transform: rotate(45deg);
			transition: all .35s cubic-bezier(0.22, 1, 0.36, 1);
		}

		// hover — lift toward white, nudge left
		&:hover:not(.active) {
			color: #cfcfcf;
			transform: translateX(-4px);

			.shl-label { font-size: 1.6rem; color: #fff; }
			.shl-index { color: #9a9a9a; }
			.shl-marker { border-color: #fff; }
		}

		// active — section accent colour, enlarged, glowing diamond
		&.active {
			.shl-label {
				font-size: 2.5rem;
				color: var(--accent, #{$red});
				text-shadow: 0 0 22px var(--accent, #{$red});
			}
			.shl-index { color: var(--accent, #{$red}); }
			.shl-marker {
				background: var(--accent, #{$red});
				border-color: var(--accent, #{$red});
				box-shadow: 0 0 14px var(--accent, #{$red});
			}
		}
	}

	// the old vertical bar is only used by the mobile layout
	.content-list-container.is-desktop .line { display: none; }

	.content-list-container.is-mobile .shl-index,
	.content-list-container.is-mobile .shl-marker { display: none; }

	.line {
		display: flex;
		position: absolute;
		width: .4rem;
		height: 100%;
		background-color: $black;
		background-color: rgb(224, 224, 224);
		border: solid 1px black;
		border-radius: 5px;
		top: -2%;
		left: 0;

		@include allMobile {
			visibility: hidden;
		}

	}


	.content-list-container.is-mobile .section-header-list {
		@include rotate(0, 0, 0);
		@include outline(black);
		flex: 1;
		width: auto;
		justify-content: center;
		text-align: center;
		height: 3rem;
		transform: translateY(0);

		@include mobile {
			margin: 0;
			padding: 0.4rem 0.25rem;
			line-height: 1.1rem;
			font-size: .8rem;
			padding: 0.35rem 0rem;

			&.active {
				font-size: 1.1rem;
				padding: 0.35rem 0rem;
			}
		}

		@include tablet {
			margin: 0;
			padding: 0.4rem 0.25rem;
			line-height: 1.1rem;
			font-size: .8rem;
			padding: 0.35rem 0rem;

			&.active {
				font-size: 2rem;
				padding: 0.35rem 0rem;
			}
		}
	}

	.content-list-container.is-mobile .section-header-list.active {
		transform: translateY(-0.6rem) scale(1);
	}
</style>