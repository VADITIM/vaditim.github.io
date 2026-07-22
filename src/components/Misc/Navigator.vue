<template>
	  <div class="content-list-container" :class="[{ active: activeProjectIndex !== null }, isMobile ? 'is-mobile' : 'is-desktop', { 'dragging': isDragging && isMobile }]" :style="dragStyle">
			<div class="line"></div>
			<div v-if="isMobile" class="rect-container">
				<template v-for="(section, index) in SECTIONS" :key="section.id + '-rect'">
					<div
						v-if="!isSectionLocked(index)"
						class="rect"
						:class="getEntryClasses(index)"
						:style="getEntryDragStyle(index, 'rect')"
						@click="onEntryClick(index)"
					></div>
				</template>
			</div>
			<template v-for="(section, index) in SECTIONS" :key="section.id">
				<Transition :css="false" @enter="onNavEntryEnter">
					<div
						v-if="!isSectionLocked(index)"
						class="section-header-list"
						:class="[`${section.id}-header-list`, getEntryClasses(index)]"
						:style="[{ '--accent': section.color }, isMobile ? getEntryDragStyle(index, 'text') : getDesktopEntryStyle(index)]"
						@click="onEntryClick(index)"
					>
						<span class="shl-label">{{ section.label }}</span>
						<span class="shl-index">{{ String(index + 1).padStart(2, '0') }}</span>
						<span class="shl-marker"></span>
					</div>
				</Transition>
			</template>
	  </div>

</template>

<script setup lang="ts">
	import { onMounted, onUnmounted, ref, computed, watch } from 'vue'
	import { gsap } from 'gsap'
	import { currentSection, InitializeSectionTracking, cleanupSectionTracking, ChangeToSectionID } from '@modules/sectionsCore'
	import { SECTIONS } from '@modules/sectionsRegistry'
	import { isSectionLocked } from '@modules/sectionLookup'
	import { activeProjectIndex } from '@modules/sectionsProjects'
	import { isMobile } from '@modules/miscIsMobile'
	import { navigationLockRef } from '@modules/miscNavigationLock'
	import { InitializeMobileDragNavigation, CleanupMobileDragNavigation, dragOffset, isDragging, dragDirection, thresholdReached } from '@modules/miscMobileDragNavigation'

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

	// ── desktop: sliding 3-wide window of diamond + index indicators ──
	// Only three entries are shown at once; the window slides so the active
	// section stays centred, clamping at the list ends so it always stays full.
	const DESKTOP_WINDOW_SPACING_REM = 2.9

	const visibleSectionIndices = computed(() =>
		SECTIONS.map((_, index) => index).filter((index) => !isSectionLocked(index))
	)

	const currentVisiblePos = computed(() =>
		visibleSectionIndices.value.indexOf(currentSection.value)
	)


	// Scale falls off with distance from the current section; shared by the
	// label/index/marker font-sizes (via --dist-scale, see <style>) and by the
	// cumulative spacing below, so nothing scales in isolation.
	const scaleForDistance = (distance: number) => Math.max(0.45, 1 - distance * 0.15)

	// Vertical spacing between consecutive entries shrinks along with them
	// (averaging each pair's scale) so the gaps don't look oversized once the
	// entries themselves have shrunk - a flat per-step spacing would.
	const cumulativeSpacingRem = (relative: number) => {
		const steps = Math.abs(relative)
		let total = 0
		for (let step = 1; step <= steps; step++) {
			const averageScale = (scaleForDistance(step - 1) + scaleForDistance(step)) / 2
			total += DESKTOP_WINDOW_SPACING_REM * averageScale
		}
		return relative < 0 ? -total : total
	}

	// Every entry stays visible and moves as one vertical column, anchored on the
	// current section so it's always centred at 50%. Distance from the current
	// section drives a progressive falloff: entries shrink, fade and bow outward
	// (translateX grows super-linearly) so the column reads as an arch with the
	// current section biggest at its apex.
	const getDesktopEntryStyle = (sectionIndex: number) => {
		const position = visibleSectionIndices.value.indexOf(sectionIndex)
		if (position === -1) return { opacity: 0, pointerEvents: 'none' as const }
		const relative = position - currentVisiblePos.value
		const distance = Math.abs(relative)
		const scale = scaleForDistance(distance)
		const archX = -Math.pow(distance, 1.5) * 0.38 // rem; bows the column leftward
		const opacity = Math.max(0.4, 1 - distance * 0.16)
		return {
			'--dist-scale': scale,
			// --enter-x is the slide-in offset owned by onNavEntryEnter; composing it here
			// keeps the windowed layout the single author of the transform.
			transform: `translate(calc(${archX}rem + var(--enter-x, 0px)), calc(-50% + ${cumulativeSpacingRem(relative)}rem))`,
			opacity,
			zIndex: 10 - distance,
		}
	}

	function getTargetSectionIndex() {
		if (!dragDirection.value) return null
		const delta = dragDirection.value === 'down' ? 1 : -1
		const nextSection = currentSection.value + delta
		if (nextSection < 0 || nextSection >= SECTIONS.length) return null
		if (isSectionLocked(nextSection)) return null
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

	// Newly unlocked nav entries (currently just Classified) mount straight into the
	// list and slide in from beyond the right edge. On desktop the windowed layout
	// owns each entry's transform, so the slide travels through --enter-x, which that
	// transform composes in; the layout's own transform transition is suspended for
	// the tween so it doesn't chase every frame and smear the landing.
	const onNavEntryEnter = (element: Element, done: () => void) => {
		if (isMobile.value) {
			gsap.fromTo(element, { x: 120, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.5)', onComplete: done, overwrite: 'auto' })
			return
		}

		// Measured rather than guessed, so the entry starts just past the edge whatever
		// the label's width or the viewport's size.
		const offscreenX = window.innerWidth - element.getBoundingClientRect().left
		element.classList.add('is-entering')
		gsap.fromTo(element,
			{ '--enter-x': `${offscreenX}px` },
			{
				'--enter-x': '0px',
				duration: 0.65,
				ease: 'back.out(1.4)',
				overwrite: 'auto',
				onComplete: () => {
					element.classList.remove('is-entering')
					done()
				},
			})
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

	// ── desktop: sliding 3-wide window of diamond + index indicators ──
	// Entries are absolutely positioned and moved by an inline translateY so the
	// window slides as the section changes (see getDesktopEntryStyle).
	.content-list-container.is-desktop {
		display: block;
		top: 50%;
		right: 1.2rem;
		left: auto;
		bottom: auto;
		width: auto;
		height: 0;
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

	// ── desktop entry: [index] [diamond marker], right-aligned. Labels are
	//    dropped here to de-clutter; only the windowed diamonds + numbers show. ──
	.content-list-container.is-desktop .section-header-list {
		position: absolute;
		right: 0;
		top: 0;
		align-items: center;
		justify-content: flex-end;
		// --dist-scale (set inline per entry, see getDesktopEntryStyle) drives real
		// font-size/dimensions here rather than a transform: scale() on the row, so
		// the gap shrinks along with the content instead of looking oversized, and
		// the text stays crisp instead of blurring under a CSS scale transform.
		gap: calc(0.7rem * var(--dist-scale, 1));
		color: #6a6a6a;
		will-change: transform, opacity;
		transition:
			transform .45s cubic-bezier(0.22, 1, 0.36, 1),
			opacity .4s ease,
			color .3s ease;

		.shl-label {
			font-family: 'Wosker';
			font-size: calc(1.35rem * var(--dist-scale, 1));
			line-height: 1;
			letter-spacing: 1px;
			color: #6a6a6a;
			transition:
				font-size .35s cubic-bezier(0.22, 1, 0.36, 1),
				color .3s ease,
				text-shadow .3s ease;
		}

		.shl-index {
			font-family: 'Audiowide';
			font-size: calc(0.6rem * var(--dist-scale, 1));
			letter-spacing: 2px;
			color: #5a5a5a;
			transition: color .3s ease, font-size .35s cubic-bezier(0.22, 1, 0.36, 1), text-shadow .3s ease;
		}

		.shl-marker {
			width: calc(7px * var(--dist-scale, 1));
			height: calc(7px * var(--dist-scale, 1));
			flex-shrink: 0;
			border: 2px solid #5a5a5a;
			border-radius: 2px;
			transform: rotate(45deg);
			transition: width .35s cubic-bezier(0.22, 1, 0.36, 1), height .35s cubic-bezier(0.22, 1, 0.36, 1), background .3s ease, border-color .3s ease, box-shadow .3s ease;
		}

		// While a newly unlocked entry slides in, GSAP drives the offset frame by frame;
		// the transition would lag a third of a second behind every one of them.
		&.is-entering { transition: opacity .4s ease, color .3s ease; }

		// hover; brighten the name + diamond + number (transform is owned by the window)
		&:hover:not(.active) {
			.shl-label { color: #fff; }
			.shl-index { color: #cfcfcf; }
			.shl-marker { border-color: #fff; }
		}

		// active; section accent colour, enlarged glowing name + diamond + number
		&.active {
			.shl-label {
				font-size: 2rem;
				color: var(--accent, #{$red});
				text-shadow: 0 0 22px var(--accent, #{$red});
			}
			.shl-index {
				font-size: 0.78rem;
				color: var(--accent, #{$red});
				text-shadow: 0 0 16px var(--accent, #{$red});
			}
			.shl-marker {
				width: 11px;
				height: 11px;
				background: var(--accent, #{$red});
				border-color: var(--accent, #{$red});
				box-shadow: 0 0 16px var(--accent, #{$red});
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