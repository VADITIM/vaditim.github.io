<template>
	<div ref="loadingContainer" class="landing-container" data-loading-page>
		<div class="top-background"></div>
		<div class="bottom-background"></div>

		<div class="landing-greeting">
			<div class="greet-line greet-1">
				<div class="pc-label-inner">
					<div class="pc-label-text">Greetings {{ visitorName ?? 'User' }}.</div>
					<div class="pc-label-bar"></div>
				</div>
			</div>
			<div class="greet-line greet-2">
				<div class="pc-label-inner">
					<div class="pc-label-text">Enjoy your experience!</div>
					<div class="pc-label-bar"></div>
				</div>
			</div>
		</div>

		<div class="landing-content">
			<div class="portfolio-text">
				<span v-for="(char, i) in 'PORTFOLIO'" :key="i" class="portfolio-char">{{ char }}</span>
			</div>

			<div class="rv-subtitle">
				<div class="rv-line rv-1">
					<div class="pc-label-inner">
						<div class="pc-label-text">CREATIVE&nbsp;DEVELOPER&nbsp;·&nbsp;DESIGNER</div>
						<div class="pc-label-bar"></div>
					</div>
				</div>
				<div class="rv-line rv-2">
					<div class="pc-label-inner">
						<div class="pc-label-text">BRINGING&nbsp;IDEAS&nbsp;TO&nbsp;LIFE</div>
						<div class="pc-label-bar"></div>
					</div>
				</div>
				<div class="rv-ul"></div>
			</div>
		</div>

		<div class="landing-credit">
			<div class="pc-label-inner">
				<div class="pc-label-text">/ created by VADITIM</div>
				<div class="pc-label-bar"></div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { gsap } from 'gsap';
	import { onBeforeUnmount, onMounted, ref } from 'vue';
	import { finished } from '@modules/sectionsStateMachine';
	import { ChangeSection } from '@modules/sectionsCore';
	import { getSectionIndexById } from '@modules/sectionLookup';
	import { buildLabelReveal, playLabelLeave } from '@modules/miscLabelReveal';
	import { visitorName } from '@modules/extraComments';

	const loadingContainer = ref<HTMLElement | null>(null);
	let enterTl: gsap.core.Timeline | null = null;
	let lastSKeyTime = 0;
	const DOUBLE_PRESS_WINDOW = 600; // ms

	function Finished() {
		if (!finished.value) {
			// The Perks components (Name / Perks-Node-Graph) hide themselves on
			// mount, so nothing needs pre-hiding here anymore.
		}
		else {
			// Transition to the first section (perks) after the loading exit animation completes
			setTimeout(() => {
				const perksIndex = getSectionIndexById('perks');
				ChangeSection(perksIndex, -1, 'none');
			}, 10);
		}
	}

	// ── enter reveal (design "01 · Landing / Signature Reveal") ──
	// The two greeting lines uncover via the shared label-reveal API, then lift
	// away and fade out before PORTFOLIO pops in one character at a time (the
	// subtitle and credit uncover via the same API alongside it), and the EXPLORE
	// button snaps in last. PORTFOLIO itself keeps its char-pop; it's the hero
	// centrepiece, not a label (same exception as the Sandbox's kickable title).
	function PlayEnterAnimation() {
		if (!loadingContainer.value) return;

		const chars = Array.from(loadingContainer.value.querySelectorAll<HTMLElement>('.portfolio-text .portfolio-char'));
		const greet1 = loadingContainer.value.querySelector<HTMLElement>('.greet-1 .pc-label-inner');
		const greet2 = loadingContainer.value.querySelector<HTMLElement>('.greet-2 .pc-label-inner');
		const rv1 = loadingContainer.value.querySelector<HTMLElement>('.rv-1 .pc-label-inner');
		const rv2 = loadingContainer.value.querySelector<HTMLElement>('.rv-2 .pc-label-inner');
		const credit = loadingContainer.value.querySelector<HTMLElement>('.landing-credit .pc-label-inner');

		const baseDelay = 1;

		// Initial hidden states (label text/bars are hidden by buildLabelReveal)
		gsap.set('.landing-greeting', { y: 0, opacity: 1 });
		gsap.set(chars, { scale: 0, opacity: 0, transformOrigin: 'center center' });
		gsap.set('.rv-ul', { scaleX: 0 });
		gsap.set('.explore-mag-pos .mag-btn', { scale: 0, opacity: 0 });

		const timeline = gsap.timeline({ delay: baseDelay });
		enterTl = timeline;
		// Dev-only hook so the intro choreography can be scrubbed/inspected.
		if (import.meta.env.DEV) (window as any).__introTl = timeline;

		// Collapse a single label back to hidden (clip + bar), independent of the
		// shared playLabelLeave helper since these two lines cycle through the
		// same on-screen slot one at a time rather than leaving together.
		// No killTweensOf here; the reveal is long finished by leave time, and
		// a kill scheduled at the same position would cancel this very tween.
		function leaveOne(label: HTMLElement | null, at: number, duration: number) {
			if (!label) return;
			const text = label.querySelector('.pc-label-text');
			const bar = label.querySelector('.pc-label-bar');
			const line = label.closest('.greet-line');
			if (!text || !bar) return;
			timeline.to(text, { clipPath: 'inset(0 100% 0 0)', duration: duration, ease: 'power2.in' }, at);
			timeline.set(bar, { opacity: 0 }, at);
			if (line) timeline.to(line, { y: -20, opacity: 0, duration: duration, ease: 'power2.in' }, at);
		}

		// 1. "Greetings User." reveals, holds a full second, then fully leaves; only
		// after that leave has finished, and a 0.35s beat of empty slot, does the
		// second line cycle into the same position, hold its own second, and leave
		// too. Only then does the rest of the intro proceed.
		const revealDuration = (0.42 + 0.5) / 2; // buildLabelReveal at timeScale(2)
		const hold = 1;
		const gap = 0.35;
		const leaveDuration = 0.15;

		const greet1RevealAt = 0;
		if (greet1) timeline.add(buildLabelReveal(greet1).timeScale(2), greet1RevealAt);
		const greet1LeaveAt = greet1RevealAt + revealDuration + hold;
		leaveOne(greet1, greet1LeaveAt, leaveDuration);

		const greet2RevealAt = greet1LeaveAt + leaveDuration + gap;
		if (greet2) timeline.add(buildLabelReveal(greet2).timeScale(2), greet2RevealAt);
		const greet2LeaveAt = greet2RevealAt + revealDuration + hold;
		leaveOne(greet2, greet2LeaveAt, leaveDuration);

		// 2. only now; after a little extra breathing room; does PORTFOLIO pop in
		// one character at a time…
		const portfolioStart = greet2LeaveAt + leaveDuration + 0.3;
		timeline.to(chars, { scale: 1, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'back.out(3)' }, portfolioStart);

		// …and the subtitle + credit uncover via the label-reveal bar sweep as
		// PORTFOLIO becomes visible; top line first, the credit (lowest and
		// right-anchored) last, matching the pattern's top-left-first ordering.
		if (rv1) timeline.add(buildLabelReveal(rv1), portfolioStart);
		if (rv2) timeline.add(buildLabelReveal(rv2), portfolioStart + 0.15);
		timeline.to('.rv-ul', { scaleX: 1, duration: 0.6, ease: 'power3.inOut' }, portfolioStart + 0.2);

		if (credit) timeline.add(buildLabelReveal(credit), portfolioStart + 0.35);

		// 4. EXPLORE button snaps in last (rendered by Start-Transition)
		timeline.fromTo('.explore-mag-pos .mag-btn',
			{ scale: 0, opacity: 0, y: 12 },
			{ scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(3.5)' },
			portfolioStart + 0.85
		);
	}

	// ── exit (green curtain close + slide away) ──
	function RunLoadingAnimation() {
		if (!loadingContainer.value) return;

		const backgroundDelay = 0.1;
		const timeline = gsap.timeline();

		// Labels re-collapse via the shared API leave (instant, no stagger); the
		// containers keep a slight lift so the exit still reads as upward motion.
		const labelInners = Array.from(loadingContainer.value.querySelectorAll<HTMLElement>('.pc-label-inner'));
		playLabelLeave(labelInners);

		timeline
			.to('.explore-mag-pos .mag-btn', { scale: 0, opacity: 0, duration: 0.6, ease: 'back.in', overwrite: 'auto' }, 0)
			.to('.greet-line', { opacity: 0, y: -20, duration: 0.3, ease: 'power2.in' }, 0)
			.to('.rv-subtitle', { opacity: 0, y: -20, duration: 0.35, ease: 'power2.in' }, 0)
			.to('.rv-ul', { scaleX: 0, duration: 0.3, ease: 'power2.in' }, 0)
			.to('.landing-credit', { opacity: 0, duration: 0.3, ease: 'power2.in' }, 0)
			.to('.top-background', { height: '51%', top: '0%', duration: 1.0, ease: 'power4.inOut' }, backgroundDelay)
			.to('.bottom-background', { height: '51%', bottom: '0%', duration: 1.0, ease: 'power4.inOut' }, backgroundDelay)
			.to('.portfolio-text', { scale: 1.05, duration: 0.55, ease: 'back.inOut' }, backgroundDelay + 0.05)
			.to('.landing-container', {
				yPercent: -110,
				duration: 0.6,
				ease: 'power4.inOut',
				onComplete: () => {
					finished.value = true;
					Finished();
				},
			}, 1.15);
	}

	function PlayLoadingAnimation() {
		RunLoadingAnimation();
	}

	// Debug shortcut: pressing "S" twice in quick succession abandons the intro
	// wherever it currently is (regardless of how far each element's timeline
	// has progressed) and jumps straight to the leave animation; makes
	// iterating on later sections much faster without waiting out the intro.
	function handleSkipKeydown(event: KeyboardEvent) {
		if (event.key.toLowerCase() !== 's') return;
		if (finished.value) return; // already left, nothing to skip

		const now = performance.now();
		if (now - lastSKeyTime <= DOUBLE_PRESS_WINDOW) {
			lastSKeyTime = 0;
			enterTl?.kill();
			enterTl = null;
			RunLoadingAnimation();
		} else {
			lastSKeyTime = now;
		}
	}

	onMounted(() => {
		if (!loadingContainer.value) return;

		loadingContainer.value.addEventListener('play-animation', () => {
			PlayLoadingAnimation();
		});

		window.addEventListener('keydown', handleSkipKeydown);

		// Set hidden states for first section elements (they're underneath the landing page)
		Finished();

		// Play the intro reveal
		PlayEnterAnimation();
	});

	onBeforeUnmount(() => {
		window.removeEventListener('keydown', handleSkipKeydown);
	});
</script>

<style scoped lang="scss">
	@use "@styleVariables" as *;

	.landing-container {
		@extend .disable-selection;
		position: absolute;
		top: 0;
		left: 0;
		min-width: 100vw;
		min-height: 100dvh;
		background-color: #181818;
		z-index: 300;

		// style.scss rounds every element by default via `*`; the landing page is
		// built from hard edges — full-bleed curtains and bars — so it opts out.
		&, * {
			border-radius: 0;
		}
	}

	.landing-content {
		@include absoluteCenter(50%, 50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		z-index: inherit;
	}

	.landing-greeting {
		position: absolute;
		top: 30%;
		left: 50%;
		transform: translate(-50%, -50%);
		display: flex;
		align-items: center;
		text-align: center;
		z-index: 306;
	}

	// ── label-reveal structure (system-wide pattern; see CLAUDE.md), coloured
	// with the landing accent (green) rather than the pattern's default.
	.pc-label-inner {
		position: relative;
		display: inline-block;
		overflow: hidden;
	}

	.pc-label-text {
		font-family: 'Mono';
		color: #fff;
		white-space: nowrap;
		clip-path: inset(0 100% 0 0);
	}

	.pc-label-bar {
		position: absolute;
		top: -10%;
		bottom: -10%;
		left: 0;
		width: 100%;
		background: #5bfd5b;
		box-shadow: 0 0 26px #5bfd5b;
		border-radius: 0;
		transform-origin: left center;
		transform: scaleX(0);
	}

	// Both lines share the same anchor (cycled in place, one at a time) rather
	// than stacking; the absolute position takes them out of flex flow, and
	// the flex parent's align/justify centres each one identically.
	.greet-line {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		white-space: nowrap;
	}

	.greet-1 .pc-label-text {
		font-size: 1.6rem;
		letter-spacing: 3px;

		@include mobile {
			font-size: 1.1rem;
			letter-spacing: 2px;
		}
	}

	.greet-2 {
		.pc-label-text {
			font-size: 1rem;
			letter-spacing: 4px;
			color: #888;

			@include mobile {
				font-size: 0.8rem;
				letter-spacing: 2px;
			}
		}
	}

	.portfolio-text {
		display: flex;
		justify-content: center;
		line-height: 5rem;
		padding-top: 1.5rem;
		height: fit-content;
		color: #5bfd5b;
		text-align: center;
		font-size: 9rem;
		font-family: Wosker;
		z-index: inherit;

		@include mobile {
			font-size: 4.5rem;
			line-height: 3rem;
		}
	}

	.rv-subtitle {
		margin-top: 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		z-index: 306;
		text-align: center;
	}

	.rv-line {
		padding: 2px 0;
	}

	.rv-1 .pc-label-text {
		font-size: 15px;
		letter-spacing: 4px;

		@include mobile {
			font-size: 11px;
			letter-spacing: 2px;
		}
	}

	.rv-2 .pc-label-text {
		font-size: 12px;
		letter-spacing: 3px;
		color: #888;

		@include mobile {
			font-size: 9px;
			letter-spacing: 2px;
		}
	}

	.rv-ul {
		height: 3px;
		width: 220px;
		max-width: 60vw;
		background: #5bfd5b;
		transform: scaleX(0);
		transform-origin: left;
		margin-top: 8px;
	}

	.landing-credit {
		position: absolute;
		right: 1.5rem;
		bottom: 1.2rem;
		z-index: 306;

		.pc-label-text {
			font-size: 17px;
			letter-spacing: 2px;
			color: #666;
		}

		@include mobile {
			right: 1rem;
			bottom: 1rem;

			.pc-label-text {
				font-size: 13px;
			}
		}
	}

	.top-background,
	.bottom-background {
		position: absolute;
		width: 100%;
		height: 0%;
		background-color: #5bfd5b;
		z-index: 301;
	}

	.top-background {
		bottom: 50%;
	}

	.bottom-background {
		top: 50%;
	}

	.portfolio-char {
		display: inline-block;
	}
</style>
