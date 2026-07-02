<template>
	<div ref="loadingContainer" class="landing-container" data-loading-page>
		<div class="top-background"></div>
		<div class="bottom-background"></div>

		<div class="landing-greeting">
			<div class="greet-line greet-1">
				<div class="pc-label-inner">
					<div class="pc-label-text">Greetings User.</div>
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
	import { getSectionIndexById } from '@modules/sectionsRegistry';
	import { isMobile } from '@modules/miscIsMobile';
	import { buildLabelReveal, playLabelLeave } from '@modules/miscLabelReveal';

	const loadingContainer = ref<HTMLElement | null>(null);

	function Finished() {
		if (!finished.value) {
			if (!isMobile.value) {
				gsap.set(".name-container", { right: "-100%" });
				gsap.set(".skills-line-container", { x: "-1000" });
				gsap.set(".skill", { x: "-210%" });
			}
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
	// button snaps in last. PORTFOLIO itself keeps its char-pop — it's the hero
	// centrepiece, not a label (same exception as the Playground's kickable title).
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
		gsap.set('.explore-button', { scale: 0, opacity: 0 });

		const tl = gsap.timeline({ delay: baseDelay });

		// 1. "Greetings User." uncovers, then "Enjoy your experience!" follows
		const greetStagger = 0.2;
		const greetRevealDur = 0.42 + 0.5;
		if (greet1) tl.add(buildLabelReveal(greet1), 0);
		if (greet2) tl.add(buildLabelReveal(greet2), greetStagger);

		// 2. once both labels have finished, each lifts away and fades on its own —
		// staggered by the same gap they started with, so greet-1 (which started
		// first) also fades out first.
		const fadeStart = greetStagger + greetRevealDur + 0.15;
		const fadeDur = 0.35;
		tl.to('.greet-1', { y: -40, opacity: 0, duration: fadeDur, ease: 'power2.in' }, fadeStart);
		tl.to('.greet-2', { y: -40, opacity: 0, duration: fadeDur, ease: 'power2.in' }, fadeStart + greetStagger);

		// 3. only now — after a little extra breathing room — does PORTFOLIO pop in
		// one character at a time…
		const portfolioStart = fadeStart + greetStagger + fadeDur + 0.3;
		tl.to(chars, { scale: 1, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'back.out(3)' }, portfolioStart);

		// …and the subtitle + credit uncover via the label-reveal bar sweep as
		// PORTFOLIO becomes visible — top line first, the credit (lowest and
		// right-anchored) last, matching the pattern's top-left-first ordering.
		if (rv1) tl.add(buildLabelReveal(rv1), portfolioStart);
		if (rv2) tl.add(buildLabelReveal(rv2), portfolioStart + 0.15);
		tl.to('.rv-ul', { scaleX: 1, duration: 0.6, ease: 'power3.inOut' }, portfolioStart + 0.2);

		if (credit) tl.add(buildLabelReveal(credit), portfolioStart + 0.35);

		// 4. EXPLORE button snaps in last (rendered by Start-Transition)
		tl.fromTo('.explore-button',
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

	onMounted(() => {
		if (!loadingContainer.value) return;

		loadingContainer.value.addEventListener('play-animation', () => {
			PlayLoadingAnimation();
		});

		// Set hidden states for first section elements (they're underneath the landing page)
		Finished();

		// Play the intro reveal
		PlayEnterAnimation();
	});

	onBeforeUnmount(() => {
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
		flex-direction: column;
		align-items: center;
		text-align: center;
		z-index: 306;
	}

	// ── label-reveal structure (system-wide pattern — see CLAUDE.md), coloured
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

	.greet-line {
		position: relative;
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
		margin-top: 0.4rem;

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
