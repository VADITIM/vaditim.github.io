<template>
	<div ref="loadingContainer" class="loading-container" data-loading-page>
		<div class="top-background"></div>
		<div class="bottom-background"></div>

		<div class="portfolio-text-top">
			<span v-for="(char, i) in 'PORTFOLIO'" :key="'t' + i" class="portfolio-char">{{ char }}</span>
		</div>
		<div class="portfolio-text-bottom">
			<span v-for="(char, i) in 'PORTFOLIO'" :key="'b' + i" class="portfolio-char">{{ char }}</span>
		</div>

		<div v-for="(text, index) in texts" :key="index" class="text"
			:style="{ top: text.top, left: text.left }">
			{{ text.content }}
		</div>
		<div v-for="(text, index) in texts" :key="`hidder-${index}`" class="hidder"
			:style="{ top: text.top, left: text.left }">
		</div>
	</div>
</template>

<script setup lang="ts">
	import { gsap } from 'gsap';
	import { onBeforeUnmount, onMounted, ref, computed } from 'vue';
	import { finished } from '@modules/Sections/section-state-machine';
	import { ChangeSection } from '@modules/Sections/sections';
	import { getSectionIndexById } from '@modules/Sections/section-registry';
	import { playLoadingGlow } from '@modules/animations/loading-glow';
	import { breakpoints } from '@modules/animations/animation-handler';
	import { isMobile } from '@modules/Misc/is-mobile';
	const loadingContainer = ref<HTMLElement | null>(null);
	let resizeHandler: (() => void) | null = null;
	import type { GlowHandle } from '@modules/animations/loading-glow';
	let glowInstance: GlowHandle | null = null;

	interface TextItem {
		content: string;
		top: string;
		left: string;
	}

	function Finished() {
		if (!finished.value) {
			if (!isMobile.value) {
				gsap.set(".name-container", { right: "-100%"});
				gsap.set(".skills-line-container", { x: "-1000"});
				gsap.set(".skill", { x: "-210%"});
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

	function PlayEnterAnimation() {
		if (!loadingContainer.value) return;

		const textElements = Array.from(loadingContainer.value.querySelectorAll<HTMLElement>('.text'));
		const topChars = Array.from(loadingContainer.value.querySelectorAll<HTMLElement>('.portfolio-text-top .portfolio-char'));
		const bottomChars = Array.from(loadingContainer.value.querySelectorAll<HTMLElement>('.portfolio-text-bottom .portfolio-char'));

		const baseDelay = 1;

		// Initial hidden states
		gsap.set(topChars, { scaleY: 0, transformOrigin: 'center bottom' });
		gsap.set(bottomChars, { scaleY: 0, transformOrigin: 'center top' });
		gsap.set(textElements, { opacity: 0, y: 80 });
		gsap.set('.explore-button', { scale: 0, opacity: 0 });

		// 1. Portfolio chars grow from the split line outward
		const charOpts = { scaleY: 1, duration: 0.48, stagger: 0.05, ease: 'back.out(3)', delay: baseDelay };
		gsap.to(topChars, charOpts);
		gsap.to(bottomChars, charOpts);

		// 2. Notes drift up from below with increasing momentum, opacity fades in independently
		const notesTl = gsap.timeline({ delay: baseDelay + 0.2 });
		notesTl
			.fromTo(textElements,
				{ y: 80 },
				{ y: 0, duration: 2.2, stagger: { each: 0.2, from: 'random' }, ease: 'power4.inOut' },
				0
			)
			.fromTo(textElements,
				{ opacity: 0 },
				{ opacity: 1, duration: 1.6, stagger: { each: 0.2, from: 'random' }, ease: 'power2.in' },
				0
			);

		// 3. Explore button snaps in after the title finishes
		gsap.fromTo('.explore-button',
			{ scale: 0, opacity: 0, y: 12 },
			{ scale: 1, opacity: 1, y: 0, duration: 0.3, delay: baseDelay + 0.65, ease: 'back.out(3.5)' }
		);

		// 4. Viewport-wide glow sweeps across the loading page
		if (loadingContainer.value) {
			glowInstance?.cleanup();
			glowInstance = playLoadingGlow(loadingContainer.value, baseDelay);
		}
	}

	function RunLoadingAnimation() {
		if (!loadingContainer.value) return;

		const textElements = Array.from(loadingContainer.value.querySelectorAll<HTMLElement>('.text'));
		const hiderElements = Array.from(loadingContainer.value.querySelectorAll<HTMLElement>('.hidder'));

		const randomDelays = hiderElements.map(() => Math.random() * 0.5);
		const backgroundDelay = 1.50;

		const hiderStartPosition = -300;
		const timeline = gsap.timeline();
		const backgroundTimeline = gsap.timeline();

		gsap.set(textElements, { opacity: 1 });
		const sectionColor = getComputedStyle(document.documentElement).getPropertyValue('--section-color').trim();
		gsap.set(hiderElements, {
			opacity: 1,
			backgroundColor: sectionColor,
			xPercent: hiderStartPosition,
			width: 0,
			padding: 0,
		});

		backgroundTimeline
			.to('.top-background', {
				height: '51%',
				top: '0%',
				duration: 1.25,
				ease: 'power4.inOut',
			}, backgroundDelay)
			.to('.bottom-background', {
				height: '51%',
				bottom: '0%',
				duration: 1.25,
				ease: 'power4.inOut',
			}, backgroundDelay)
			.to('.portfolio-text-top', {
				top: '48%',
				duration: 0.55,
				ease: 'back.inOut',
			}, backgroundDelay + 0.05)
			.to('.portfolio-text-bottom', {
				top: '52%',
				duration: 0.55,
				ease: 'back.inOut',
			}, backgroundDelay + 0.05);

		hiderElements.forEach((hidder, index) => {
			const textElement = textElements[index];
			const itemStart = randomDelays[index];
			const widthGrowDuration = 0.5;
			const firstLegDuration = 1;
			const secondLegDuration = 2;
			const targetWidth = `${textElement?.offsetWidth ?? 0}px`;
			const overlapAt = itemStart + widthGrowDuration + firstLegDuration;

			timeline.fromTo(hidder, {
				xPercent: hiderStartPosition,
				width: 0,
				padding: 0,
			}, {
				width: targetWidth,
				padding: '0 3rem',
				duration: widthGrowDuration,
				ease: 'power4.in',
			}, itemStart)
			.to(hidder, { xPercent: -50, duration: firstLegDuration }, '>')
			.to(hidder, { xPercent: 600, duration: secondLegDuration, ease: 'power4.out' }, '>');

			if (textElement) {
				timeline.set(textElement, { opacity: 0 }, overlapAt);
			}
		});

		timeline.to('.loading-container', {
			yPercent: -110,
			duration: 0.5,
			ease: 'power4.inOut',
			onComplete: () => {
				finished.value = true;
				Finished();
			},
		}, 2.3);
	}

	function PlayLoadingAnimation() {
		glowInstance?.cleanup();
		glowInstance = null;
		RunLoadingAnimation();
	}

	onMounted(() => {
		if (!loadingContainer.value) return;

		const textElements = Array.from(loadingContainer.value.querySelectorAll<HTMLElement>('.text'));
		const hiderElements = Array.from(loadingContainer.value.querySelectorAll<HTMLElement>('.hidder'));

		const syncHiderSizeToText = () => {
			hiderElements.forEach((hidder, index) => {
				const textElement = textElements[index];
				if (!textElement) return;
				hidder.style.height = `${textElement.offsetHeight}px`;
			});
		};

		syncHiderSizeToText();
		resizeHandler = syncHiderSizeToText;
		window.addEventListener('resize', resizeHandler);

		loadingContainer.value.addEventListener('play-animation', () => {
			PlayLoadingAnimation();
		});

		// Set hidden states for first section elements (they're underneath the loading page)
		Finished();

		// Play the intro animation for the loading page texts
		PlayEnterAnimation();
	});

	onBeforeUnmount(() => {
		glowInstance?.cleanup();
		glowInstance = null;
		if (resizeHandler) window.removeEventListener('resize', resizeHandler);
	});

	const tabletTexts: TextItem[] = [
		{ content: "Creating digital experiences", top: "15%", left: "70%" },
		{ content: "Bringing ideas to life", top: "35%", left: "20%" },
		{ content: "Innovating through design", top: "60%", left: "75%" },
		{ content: "Crafting seamless interfaces", top: "10%", left: "50%" },
		{ content: "Transforming visions into reality", top: "20%", left: "25%" },
		{ content: "Transforming visions into reality", top: "30%", left: "60%" },
		{ content: "Innovating through design", top: "70%", left: "40%" },
		{ content: "Innovating through design", top: "90%", left: "75%" },
	];

	const mobileTexts: TextItem[] = [
		{ content: "Creating digital experiences", top: "10%", left: "50%" },
		{ content: "Bringing ideas to life", top: "25%", left: "50%" },
		{ content: "Innovating through design", top: "40%", left: "50%" },
		{ content: "Innovating through design", top: "77%", left: "50%" },
		{ content: "Crafting seamless interfaces", top: "90%", left: "50%" },
	];

	const desktopTexts: TextItem[] = [
		{ content: "Creating digital experiences", top: "20%", left: "45%" },
		{ content: "Bringing ideas to life", top: "40%", left: "85%" },
		{ content: "Innovating through design", top: "55%", left: "10%" },
		{ content: "Crafting seamless interfaces", top: "80%", left: "25%" },
		{ content: "Transforming visions into reality", top: "15%", left: "15%" },
		{ content: "Transforming visions into reality", top: "10%", left: "85%" },
		{ content: "Innovating through design", top: "70%", left: "70%" },
		{ content: "Innovating through design", top: "90%", left: "50%" },
	];

	const texts = computed(() => {
		const width = window.innerWidth;
		if (width <= breakpoints.mobile) return mobileTexts;
		if (width <= breakpoints.tabletLandscape) return tabletTexts;
		return desktopTexts;
	});
</script>

<style scoped lang="scss">
	@use "@styleVariables" as *;

	.loading-container {
		@extend .disable-selection;
		position: absolute;
		top: 0;
		left: 0;
		min-width: 100vw;
		min-height: 100dvh;
		background-color: #181818;
		z-index: 300;
	}

	.portfolio-text-top,
	.portfolio-text-bottom {
		@include absoluteCenter(50%, 50%);
		display: flex;
		align-self: center;
		justify-self: center;
		line-height: 5rem;
		padding-top: 2rem;
		height: fit-content;
		color: rgb(91, 253, 91);
		text-align: center;
		font-size: 10rem;
		font-family: Wosker;
		z-index: inherit;

		@include mobile {
			font-size: 4.5rem;
		}
	}

	.portfolio-text-top {
		top: 50.2%;
		clip-path: inset(-300% 0 50% 0);
	}

	.portfolio-text-bottom {
		top: 49.8%;
		clip-path: inset(50% 0 -300% 0);
	}

	.top-background,
	.bottom-background {
		position: absolute;
		width: 100%;
		height: 0%;
		background-color: rgb(91, 253, 91);
		z-index: 301;
	}

	.top-background {
		bottom: 50%;
		border-radius: 0;
	}

	.bottom-background {
		top: 50%;
		border-radius: 0;
	}

	.text {
		position: absolute;
		display: inline-block;
		width: max-content;
		transform: translate(-50%, -50%);
		color: white;
		font-size: 2rem;
		font-family: Wosker;
		white-space: nowrap;
		z-index: 306;
		opacity: 1;

		@include allMobile {
			font-size: 1.2rem;
		}
	}

	.hidder {
		position: absolute;
		display: inline-block;
		width: 0;
		height: 0;
		transform: translate(50%, -50%);
		background-color: var(--section-color);
		border-radius: 0;
		z-index: 304;
		padding: 0;
	}

	.portfolio-char {
		display: inline-block;
	}
</style>
