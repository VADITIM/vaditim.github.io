<template>
	<div ref="loadingContainer" class="loading-container">
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
	import { onMounted, ref } from 'vue';
	import { finished } from '@modules/animations/section-state-machine';
	import { SECTION_INDEX } from '@modules/animations/section-state-machine';
	import { triggerSectionChange } from '@modules/sections';
	const loadingContainer = ref<HTMLElement | null>(null);
	let resizeHandler: (() => void) | null = null;

	interface TextItem {
		content: string;
		top: string;
		left: string;
	}

	function Finished() {
		if (!finished.value) {
			gsap.set(".name-container", { right: "-100%"});
			gsap.set(".skills-line-container", { y: "-1000"});
			gsap.set(".skill", { x: "-210%"});
		}
		else {
			setTimeout(() => {
			triggerSectionChange(SECTION_INDEX.PERKS, SECTION_INDEX.NONE, 'none');
			}, 10);
		}
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

		Finished();

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
	});

	const texts: TextItem[] = [
		{ content: "Creating digital experiences", top: "20%", left: "45%" },
		{ content: "Bringing ideas to life", top: "40%", left: "85%" },
		{ content: "Innovating through design", top: "55%", left: "10%" },
		{ content: "Crafting seamless interfaces", top: "80%", left: "25%" },
		{ content: "Transforming visions into reality", top: "15%", left: "15%" },
		{ content: "Transforming visions into reality", top: "10%", left: "85%" },
		{ content: "Innovating through design", top: "70%", left: "70%" },
		{ content: "Innovating through design", top: "90%", left: "50%" },
	];
</script>

<style scoped lang="scss">
	@use "@styleVariables" as *;

	.loading-container {
		@extend .disable-selection;
		position: absolute;
		top: 0;
		left: 0;
		min-width: 100%;
		min-height: 100%;
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
	}

	.bottom-background {
		top: 50%;
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