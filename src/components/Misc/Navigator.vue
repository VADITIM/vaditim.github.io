<template>
	  <div class="content-list-container" :class="[{ active: activeProjectIndex !== null }, isVertical ? 'is-vertical' : 'is-desktop']">
			<template v-for="(section, index) in SECTIONS" :key="section.id">
				<Transition :css="false" @enter="onNavEntryEnter">
					<div
						v-if="!isSectionLocked(index)"
						class="section-header-list"
						:class="[`${section.id}-header-list`, getEntryClasses(index)]"
						:style="[{ '--accent': section.color }, getWindowedEntryStyle(index)]"
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
	import { onMounted, onUnmounted, computed } from 'vue'
	import { gsap } from 'gsap'
	import { currentSection, InitializeSectionTracking, cleanupSectionTracking, ChangeToSectionID } from '@modules/sectionsCore'
	import { SECTIONS } from '@modules/sectionsRegistry'
	import { isSectionLocked } from '@modules/sectionLookup'
	import { activeProjectIndex } from '@modules/sectionsProjects'
	import { isVertical } from '@modules/miscIsVertical'
	import { navigationLockRef } from '@modules/miscNavigationLock'
	import { InitializeMobileDragNavigation, CleanupMobileDragNavigation } from '@modules/miscMobileDragNavigation'

	const getEntryClasses = (sectionIndex: number) => {
		return {
			active: currentSection.value === sectionIndex,
		}
	}

	// ── windowed nav: every entry moves as one vertical column anchored on the
	// current section, which stays centred at 50%. Distance from it drives a
	// progressive falloff (shrink, fade, bow outward) so the column reads as an
	// arch with the current section biggest at its apex. Shared by desktop and
	// mobile — only the container placement and sizes differ (see <style>).
	const WINDOW_SPACING_REM = 2.9

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
			total += WINDOW_SPACING_REM * averageScale
		}
		return relative < 0 ? -total : total
	}

	const getWindowedEntryStyle = (sectionIndex: number) => {
		// Mobile is a plain bottom-anchored flex column — no arch, no absolute
		// transform. CSS owns its layout; the windowing below is desktop-only.
		if (isVertical.value) return {}
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
		if (isVertical.value) {
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
		if (isVertical.value) {
			InitializeMobileDragNavigation()
		}
	})

	onUnmounted(() => {
		cleanupSectionTracking()
		if (isVertical.value) {
			CleanupMobileDragNavigation()
		}
	})
</script>

<style scoped lang="scss">
	@use "@styleVariables" as *;

	.content-list-container {
		@extend .disable-selection;
		display: flex;
		position: fixed;
		flex-direction: column;
		font-family: Wosker;
		z-index: 20;

		transition:
			.5s ease all;
	}

	// ── desktop windowed layout: entries are absolutely positioned and moved by
	// an inline transform so the column slides as the section changes
	// (see getWindowedEntryStyle).
	.content-list-container.is-desktop {
		display: block;
		top: 50%;
		right: 1.2rem;
		left: auto;
		bottom: auto;
		width: auto;
		height: 0;
		transform: none;
		filter: drop-shadow(0 6px 22px rgba(0, 0, 0, 0.55));

		// slide out of view while a project detail window is open
		&.active {
			opacity: 0;
			transform: translateX(46px);
			pointer-events: none;
		}
	}

	// ── mobile/vertical: a horizontal row centred along the bottom edge; each
	// entry is its own column (name atop, number below). No arch, no absolute
	// transform (getWindowedEntryStyle returns {} on mobile).
	.content-list-container.is-vertical {
		flex-direction: row;
		align-items: flex-end;
		justify-content: center;
		gap: 4vw;
		top: auto;
		right: 0;
		left: 0;
		bottom: 2.5vh;
		width: 100%;
		height: auto;
		transform: none;
		filter: drop-shadow(0 6px 22px rgba(0, 0, 0, 0.55));

		&.active {
			opacity: 0;
			transform: translateY(24px);
			pointer-events: none;
		}
	}

	.section-header-list {
		position: relative;
		display: flex;
		cursor: pointer;
		text-wrap: nowrap;
		transition: .3s all;
	}

	// ── entry: [label] [index] [diamond marker], right-aligned. --dist-scale
	//    (set inline per entry, see getWindowedEntryStyle) drives real
	//    font-size/dimensions rather than a transform: scale() on the row, so the
	//    gap shrinks along with the content instead of looking oversized, and the
	//    text stays crisp instead of blurring under a CSS scale transform. ──
	// Desktop-only: the windowed layout absolutely positions each entry.
	.content-list-container.is-desktop .section-header-list {
		position: absolute;
		right: 0;
		top: 0;
	}

	.content-list-container.is-desktop .section-header-list,
	.content-list-container.is-vertical .section-header-list {
		align-items: center;
		justify-content: flex-end;
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

	// Mobile/vertical: stack each entry as a column — name on top, number below —
	// and size proportionally so the row scales to every portrait width. The
	// diamond marker is dropped; the row reads as labelled columns.
	.content-list-container.is-vertical .section-header-list {
		position: relative;
		flex-direction: column;
		align-items: center;
		justify-content: flex-end;
		gap: 0.4vh;

		.shl-label { font-size: 3.2vw; }
		.shl-index { font-size: 2.2vw; }
		.shl-marker { display: none; }

		&.active {
			.shl-label { font-size: 4vw; }
			.shl-index { font-size: 2.6vw; }
		}
	}
</style>
