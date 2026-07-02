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
	import { finished } from '@modules/Sections/section-state-machine';
	import { ChangeSection } from '@modules/Sections/sections';
	import { getSectionIndexById } from '@modules/Sections/section-registry';
	import { isMobile } from '@modules/Misc/is-mobile';
	import { buildLabelReveal, playLabelLeave } from '@modules/Misc/label-reveal';

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

	// Label reveal (system-wide label-reveal pattern — see CLAUDE.md), coloured
	// with the section's main accent (green) rather than the pattern's default.
	function buildGreetReveal(el: HTMLElement | null) {
		const tl = gsap.timeline();
		if (!el) return tl;
		const text = el.querySelector<HTMLElement>('.greet-text');
		const bar = el.querySelector<HTMLElement>('.greet-bar');
		if (!text || !bar) return tl;
		gsap.set(text, { clipPath: 'inset(0 100% 0 0)' });
		gsap.set(bar, { scaleX: 0, opacity: 1, transformOrigin: 'left center' });
		tl.to(bar, { scaleX: 1, duration: 0.42, ease: 'power3.inOut' })
			.set(text, { clipPath: 'inset(0 0% 0 0)' })
			.set(bar, { transformOrigin: 'right center' })
			.to(bar, { scaleX: 0, duration: 0.5, ease: 'power3.inOut' })
			.set(bar, { opacity: 0 });
		return tl;
	}

	// ── enter reveal (design "01 · Landing / Signature Reveal") ──
	// The two greeting lines uncover via the label-reveal pattern, then lift away
	// and fade out before PORTFOLIO pops in one character at a time (the subtitle
	// fades in alongside it), and the EXPLORE button snaps in last.
	function PlayEnterAnimation() {
		if (!loadingContainer.value) return;

		const chars = Array.from(loadingContainer.value.querySelectorAll<HTMLElement>('.portfolio-text .portfolio-char'));
		const lines = Array.from(loadingContainer.value.querySelectorAll<HTMLElement>('.rv-l1, .rv-l2'));
		const greet1 = loadingContainer.value.querySelector<HTMLElement>('.greet-1');
		const greet2 = loadingContainer.value.querySelector<HTMLElement>('.greet-2');

		const baseDelay = 1;

		// Initial hidden states
		gsap.set('.landing-greeting', { y: 0, opacity: 1 });
		gsap.set(chars, { scale: 0, opacity: 0, transformOrigin: 'center center' });
		gsap.set(lines, { yPercent: 115, skewY: 5, opacity: 0 });
		gsap.set('.rv-ul', { scaleX: 0 });
		gsap.set('.landing-credit', { opacity: 0, y: 10 });
		gsap.set('.explore-button', { scale: 0, opacity: 0 });

		const tl = gsap.timeline({ delay: baseDelay });

		// 1. "Greetings User." uncovers, then "Enjoy your experience!" follows
		const greetStagger = 0.2;
		const greetRevealDur = 0.42 + 0.5;
		tl.add(buildGreetReveal(greet1), 0);
		tl.add(buildGreetReveal(greet2), greetStagger);

		// 2. once both labels have finished, each lifts away and fades on its own —
		// staggered by the same gap they started with, so greet-1 (which started
		// first) also fades out first.
		const fadeStart = greetStagger + greetRevealDur + 0.15;
		const fadeDur = 0.35;
		tl.to(greet1, { y: -40, opacity: 0, duration: fadeDur, ease: 'power2.in' }, fadeStart);
		tl.to(greet2, { y: -40, opacity: 0, duration: fadeDur, ease: 'power2.in' }, fadeStart + greetStagger);

		// 3. only now — after a little extra breathing room — does PORTFOLIO pop in
		// one character at a time…
		const portfolioStart = fadeStart + greetStagger + fadeDur + 0.3;
		tl.to(chars, { scale: 1, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'back.out(3)' }, portfolioStart);

		// …and the subtitle reveals at the same moment PORTFOLIO becomes visible
		tl.to(lines, { yPercent: 0, skewY: 0, opacity: 1, duration: 0.85, stagger: 0.1, ease: 'expo.out' }, portfolioStart);
		tl.to('.rv-ul', { scaleX: 1, duration: 0.6, ease: 'power3.inOut' }, portfolioStart + 0.2);

		tl.to('.landing-credit', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, portfolioStart + 0.2);

		// 4. EXPLORE button snaps in last (rendered by Explore-Fullscreen-Toggle)
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

		timeline
			.to('.greet-line', { opacity: 0, y: -20, duration: 0.3, ease: 'power2.in' }, 0)
			.to('.rv-subtitle', { opacity: 0, y: -20, duration: 0.35, ease: 'power2.in' }, 0)
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

	// ── greeting labels (system-wide label-reveal pattern) ──
	.greet-line {
		position: relative;
	}

	.greet-inner {
		position: relative;
		display: inline-block;
		overflow: hidden;
	}

	.greet-text {
		font-family: 'Mono';
		color: #fff;
		white-space: nowrap;
		clip-path: inset(0 100% 0 0);
	}

	.greet-bar {
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

	.greet-1 .greet-text {
		font-size: 1.6rem;
		letter-spacing: 3px;

		@include mobile {
			font-size: 1.1rem;
			letter-spacing: 2px;
		}
	}

	.greet-2 {
		margin-top: 0.4rem;

		.greet-text {
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

	.rv-line-clip {
		overflow: hidden;
		padding: 2px 0;
	}

	.rv-l1 {
		font-family: 'Mono';
		font-size: 15px;
		letter-spacing: 4px;
		color: #fff;
		white-space: nowrap;

		@include mobile {
			font-size: 11px;
			letter-spacing: 2px;
		}
	}

	.rv-l2 {
		font-family: 'Mono';
		font-size: 12px;
		letter-spacing: 3px;
		color: #888;
		white-space: nowrap;

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
		font-family: 'Mono';
		font-size: 17px;
		letter-spacing: 2px;
		color: #666;
		z-index: 306;
		white-space: nowrap;

		@include mobile {
			font-size: 13px;
			right: 1rem;
			bottom: 1rem;
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
