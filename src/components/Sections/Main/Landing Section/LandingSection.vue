<template>
	<div ref="loadingContainer" class="landing-container" data-loading-page>
		<div class="top-background"></div>
		<div class="bottom-background"></div>

		<div class="landing-greeting">
			<div class="greet-line greet-1">Greetings User.</div>
			<div class="greet-line greet-2">Enjoy the experience!</div>
		</div>

		<div class="landing-content">
			<div class="portfolio-text">
				<span v-for="(char, i) in 'PORTFOLIO'" :key="i" class="portfolio-char">{{ char }}</span>
			</div>

			<div class="rv-subtitle">
				<div class="rv-line-clip"><div class="rv-l1">CREATIVE&nbsp;DEVELOPER&nbsp;·&nbsp;DESIGNER</div></div>
				<div class="rv-line-clip"><div class="rv-l2">BRINGING&nbsp;IDEAS&nbsp;TO&nbsp;LIFE</div></div>
				<div class="rv-ul"></div>
			</div>
		</div>

		<div class="landing-credit">/ created by VADITIM</div>
	</div>
</template>

<script setup lang="ts">
	import { gsap } from 'gsap';
	import { onBeforeUnmount, onMounted, ref } from 'vue';
	import { finished } from '@modules/Sections/section-state-machine';
	import { ChangeSection } from '@modules/Sections/sections';
	import { getSectionIndexById } from '@modules/Sections/section-registry';
	import { isMobile } from '@modules/Misc/is-mobile';

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
	// Each paragraph animates on its own: the greeting builds up, then PORTFOLIO
	// pops one character at a time (the subtitle fades in alongside it), and the
	// EXPLORE button snaps in last.
	function PlayEnterAnimation() {
		if (!loadingContainer.value) return;

		const chars = Array.from(loadingContainer.value.querySelectorAll<HTMLElement>('.portfolio-text .portfolio-char'));
		const lines = Array.from(loadingContainer.value.querySelectorAll<HTMLElement>('.rv-l1, .rv-l2'));

		const baseDelay = 1;

		// Initial hidden states
		gsap.set('.greet-line', { y: 24, opacity: 0 });
		gsap.set(chars, { scale: 0, opacity: 0, transformOrigin: 'center center' });
		gsap.set(lines, { yPercent: 115, skewY: 5, opacity: 0 });
		gsap.set('.rv-ul', { scaleX: 0 });
		gsap.set('.landing-credit', { opacity: 0, y: 10 });
		gsap.set('.explore-button', { scale: 0, opacity: 0 });

		const tl = gsap.timeline({ delay: baseDelay });

		// 1. "Greetings User." rises in on its own
		tl.to('.greet-1', { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, 0);

		// 2. "Enjoy the experience!" rises in next — lingers before the title
		tl.to('.greet-2', { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, 1.4);

		// 3. PORTFOLIO pops one character at a time…
		tl.to(chars, { scale: 1, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'back.out(3)' }, 2.75);

		// …and the subtitle reveals at the same moment PORTFOLIO becomes visible
		tl.to(lines, { yPercent: 0, skewY: 0, opacity: 1, duration: 0.85, stagger: 0.1, ease: 'expo.out' }, 2.75);
		tl.to('.rv-ul', { scaleX: 1, duration: 0.6, ease: 'power3.inOut' }, 2.95);

		tl.to('.landing-credit', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 2.95);

		// 4. EXPLORE button snaps in last (rendered by Explore-Fullscreen-Toggle)
		tl.fromTo('.explore-button',
			{ scale: 0, opacity: 0, y: 12 },
			{ scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(3.5)' },
			3.6
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

	.greet-line {
		font-family: 'Mono';
		color: #fff;
		white-space: nowrap;
	}

	.greet-1 {
		font-size: 1.6rem;
		letter-spacing: 3px;

		@include mobile {
			font-size: 1.1rem;
			letter-spacing: 2px;
		}
	}

	.greet-2 {
		font-size: 1rem;
		letter-spacing: 4px;
		color: #888;
		margin-top: 0.4rem;

		@include mobile {
			font-size: 0.8rem;
			letter-spacing: 2px;
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
