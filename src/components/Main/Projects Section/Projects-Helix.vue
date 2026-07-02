<template>
<div class="helix-container" :class="{ active: activeProjectIndex !== null }">
			<div class="helix">
				<div
					v-for="strang in 17"
					:key="strang"
					:ref="el => { if (el) strangRefs[strang - 1] = el as HTMLElement; }"
					class="strang"
				>
					<div class="strang-body"></div>
			</div>
	</div>
</div>
</template>

<script setup lang="ts">
	import { gsap } from 'gsap';
	import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
	import { onSectionEnterLeaveAnimation, SECTION_INDEX, type SectionTransitionStates } from '@modules/sectionsStateMachine';
	import { activeProjectIndex } from '@modules/sectionsProjects';

	const strangRefs = ref<HTMLElement[]>([]);
	let helixIntro: gsap.core.Timeline | null = null;
	let strandRefsData: HTMLElement[] = [];
	let activeStateTimeline: gsap.core.Timeline | null = null;

	const LEAVE_TIMESCALE = 20; 
	const ENTER_TIMESCALE = 10;
	
	const DELAY_AFTER_LEAVE = 0; 
	const DELAY_BEFORE_ENTER = 0; 

	const isProjectsEnter = (states: SectionTransitionStates) =>
		states.enterProjectsFromProfile || states.enterProjectsFromPerks || states.enterProjectsFromNone;

	const isProjectsLeave = (states: SectionTransitionStates) =>
		states.leaveProjectsToProfile || states.leaveProjectsToPerks;

	const startHelixAnimation = () => {
		if (!strandRefsData.length) return;

		if (!helixIntro) {
			const strands = strandRefsData;
			const strandBodies = strands
				.map((strand) => strand.querySelector('.strang-body') as HTMLElement | null)
				.filter((body): body is HTMLElement => !!body);

			const sampleStyles = window.getComputedStyle(strands[0]);
			const marginY = parseFloat(sampleStyles.marginTop) + parseFloat(sampleStyles.marginBottom);
			const finalHeight = parseFloat(sampleStyles.height) || 75;
			const extraSpacing = 14;
			const strandSpacing = marginY + finalHeight + extraSpacing;
			const centerIndex = (strands.length - 1) / 2;

			const strandTargets = strands.map((_, index) => ({
				y: (index - centerIndex) * strandSpacing,
				xStart: index % 2 === 0 ? -26 : 26,
			}));

			const timeline = gsap.timeline({ paused: true });
			helixIntro = timeline;

			strandTargets.forEach((target, index) => {
				const startAt = index * 0.08;
				const finalTop = `calc(50% + ${target.y}px)`;
				const startLeft = `calc(50% + ${index === 0 ? 0 : target.xStart}px)`;

				timeline.fromTo(
					strands[index],
					{ left: startLeft, top: '50%' },
					{
						left: '50%',
						top: finalTop,
						duration: 2,
						ease: 'power2.out',
					},
					startAt
				);

				timeline.to(
					strandBodies[index],
					{
						scaleX: 1,
						duration: 2.22,
						ease: 'power2.out',
					},
					startAt + 2
				);
			});
		}

		helixIntro?.timeScale(2).play();
	};

	const leaveHelixAnimation = () => {
		helixIntro?.timeScale(LEAVE_TIMESCALE).reverse();
	};

	onMounted(async () => {
		await nextTick();
		await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

		const strands = strangRefs.value.filter(Boolean);
		if (!strands.length) return;

		strandRefsData = strands;

		const strandBodies = strands
			.map((strand) => strand.querySelector('.strang-body') as HTMLElement | null)
			.filter((body): body is HTMLElement => !!body);

		gsap.set(strands, { left: '50%', top: '50%', transformOrigin: 'center center', });

		gsap.set(strandBodies, { scaleX: 0, transformOrigin: 'center center', });

		onSectionEnterLeaveAnimation({ isEnter: isProjectsEnter, isLeave: isProjectsLeave, onEnter: startHelixAnimation, onLeave: leaveHelixAnimation, initialSection: SECTION_INDEX.PROJECTS, });

		watch(activeProjectIndex, (newIndex) => {
			
			if (newIndex !== null) {
				if (activeStateTimeline) activeStateTimeline.kill();
				activeStateTimeline = gsap.timeline();

				activeStateTimeline.call(() => {
					leaveHelixAnimation();
				}, [], 0);

				activeStateTimeline.to({}, {}, `+=${DELAY_AFTER_LEAVE}`);

				activeStateTimeline.call(() => {
					gsap.set('.helix-container', { right: '-10%' });
				}, [], '+=0');

				activeStateTimeline.to({}, {}, `+=${DELAY_BEFORE_ENTER}`);

				activeStateTimeline.call(() => {
					if (helixIntro) {
						helixIntro.reversed(false).seek(0).timeScale(ENTER_TIMESCALE).play();
					}
				}, [], '+=0');
			} else {
				if (activeStateTimeline) activeStateTimeline.kill();
				activeStateTimeline = gsap.timeline();

				activeStateTimeline.call(() => {
					leaveHelixAnimation();
				}, [], 0);

				activeStateTimeline.to({}, {}, `+=${DELAY_AFTER_LEAVE}`);

				activeStateTimeline.call(() => {
					gsap.set('.helix-container', { right: '0%' });
				}, [], '+=0');

				activeStateTimeline.to({}, {}, `+=${DELAY_BEFORE_ENTER}`);

				activeStateTimeline.call(() => {
					if (helixIntro) {
						helixIntro.reversed(false).seek(0).timeScale(ENTER_TIMESCALE).play();
					}
				}, [], '+=0');
			}
		});
	});

	onBeforeUnmount(() => {
		if (helixIntro) {
			helixIntro.kill();
			helixIntro = null;
		}
		if (activeStateTimeline) {
			activeStateTimeline.kill();
			activeStateTimeline = null;
		}
	});
</script>

<style lang="scss" scoped>
@use "@styleVariables" as *;

@mixin helix-delays($count, $step) {
	@for $i from 1 through $count {
		.strang:nth-child(#{$i}) {
			animation-delay: -$step * $i;
		}
	}
}

@include helix-delays(17, 0.35s);

@keyframes rotate {
	from {
		transform: rotateY(0deg) ;
	}
	to {
		transform: rotateY(360deg) ;
	}
}

.helix-container {
	right: 0;
	align-items: center;
	width: 100%;
	height: 100%;
	opacity: .6;
	perspective: 1000px;
	overflow: hidden;
	z-index: -1;
}

.helix {
	position: absolute;
	transform-style: preserve-3d;
	scale: 2.5;
	right: 30.4%;
}

.strang {
	position: absolute;
	width: 5rem;
	margin: 6px 0;
	animation: rotate 10s linear infinite;
}

.strang-body {
	position: relative;
	width: 5rem;
	height: 1px;
	border-radius: 10px;
	background-color: white;
}

.strang-body::before {
	margin: 0;
	padding: 0;
	border: none;
	content: "";
	position: absolute;
	top: -5px;
	left: -14px;
	width: 10px;
	height: 10px;
	background-color: $red;
	border-radius: 50%;
	z-index: -1;
	@include boxShadow(0 0 15px $red, true);
}

.strang-body::after {
	margin: 0;
	padding: 0;
	border: none;
	content: "";
	position: absolute;
	top: -5px;
	right: -14px;
	width: 10px;
	height: 10px;
	background-color: $red;
	border-radius: 50%;
	z-index: -1;
	@include boxShadow(0 0 15px $red, true);
}
</style>
