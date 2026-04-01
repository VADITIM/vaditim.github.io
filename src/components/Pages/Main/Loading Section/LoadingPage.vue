<template>
	<div ref="loadingContainer" class="loading-container" data-loading-page>
		<div class="top-background"></div>
		<div class="bottom-background"></div>

		<div class="portfolio-text-top">PORTFOLIO</div>
		<div class="portfolio-text-bottom">PORTFOLIO</div>

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
	import { onMounted, ref, computed } from 'vue';
	import { finished } from '@modules/Sections/section-state-machine';
	import { SECTION_INDEX } from '@modules/Sections/section-state-machine';
	import { ChangeSection } from '@modules/Sections/sections';
	import { breakpoints } from '@modules/animations/animation-handler';
	import { isMobile } from '@modules/Misc/is-mobile';
	const loadingContainer = ref<HTMLElement | null>(null);
	let resizeHandler: (() => void) | null = null;

	interface TextItem {
		content: string;
		top: string;
		left: string;
	}

	function Finished() {
		if (!finished.value) {
			if (isMobile.value) {
				
			}
			else 
			{
				gsap.set(".name-container", { right: "-100%"});
				gsap.set(".skills-line-container", { x: "-1000"});
				gsap.set(".skill", { x: "-210%"});
			}
		}
		else {
			setTimeout(() => {
			ChangeSection(SECTION_INDEX.PERKS, SECTION_INDEX.NONE, 'none');
			}, 10);
		}
	}

	function PlayLoadingAnimation() {
		if (!loadingContainer.value) return;

		const textElements = Array.from(loadingContainer.value.querySelectorAll<HTMLElement>('.text'));
		const hiderElements = Array.from(loadingContainer.value.querySelectorAll<HTMLElement>('.hidder'));

		const randomDelays = hiderElements.map(() => Math.random() * 0.5);
		const backgroundDelay = 1.50;

		const hiderStartPosition =  -300;
		const timeline = gsap.timeline();
		const backgroundTimeline = gsap.timeline();

		gsap.set(textElements, { opacity: 1 });
		gsap.set(hiderElements, {
			opacity: 1,
			backgroundColor: 'rgb(91, 253, 91)',
			xPercent:  hiderStartPosition,
			width: 0,
			padding: 0,
		});

		backgroundTimeline
			.to(".top-background", {
				height: '51%',
				top: '0%',
				duration: 1.25,
				ease: 'power4.inOut',
			}, backgroundDelay)
			.to(".bottom-background", {
				height: '51%',
				bottom: '0%',
				duration: 1.25,
				ease: 'power4.inOut',
			}, backgroundDelay)
			.to('.portfolio-text-top', {
				top: "48%",
				duration: 0.55,
				ease: 'back.inOut',
			}, backgroundDelay + 0.05)
			.to('.portfolio-text-bottom', {
				top:"52%",
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
				xPercent:  hiderStartPosition,
				width: 0,
				padding: 0,
			}, {
				width: targetWidth,
				padding: "0 3rem",
				duration: widthGrowDuration,
				ease: 'power4.in',
			}, itemStart)
			.to(hidder, {
				xPercent: -50,
				duration: firstLegDuration,
			}, ">")
			.to(hidder, {
				xPercent: 600,
				duration: secondLegDuration,
				ease: 'power4.out',
			},">")

			if (textElement) {
				timeline.set(textElement, {
					opacity: 0,
				}, overlapAt);
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

		// Listen for play-animation event from App.vue
		loadingContainer.value.addEventListener('play-animation', () => {
			PlayLoadingAnimation();
		});

		// Initialize without playing animations
		Finished();
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
		clip-path: polygon(0 50%, 100% 50%, 100% 0, 0 0);

	}

	.portfolio-text-bottom {
		top: 49.8%;
		clip-path: polygon(0 50%, 100% 50%, 100% 100%, 0% 100%);

	}

	.top-background,
	.bottom-background {
		position: absolute;
		width: 100%;
		height: 0%;
		height: 0%;
		background-color: #242424;
		background-color: rgb(91, 253, 91);
		z-index: 301;
	}

	.top-background {
		bottom: 50%;
		border-radius: 2rem 2rem 0 0;
	}

	.bottom-background {
		top: 50%;
		border-radius: 0 0 2rem 2rem;
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
		z-index: 304;
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
		background-color: rgb(91, 253, 91);
		z-index: 305;
		padding: 0;
	}
</style>