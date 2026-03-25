<template>
<div class="container">
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
	import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';

	const strangRefs = ref<HTMLElement[]>([]);
	let helixIntro: gsap.core.Timeline | null = null;

	onMounted(async () => {
		await nextTick();
		await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

		const strands = strangRefs.value.filter(Boolean);
		if (!strands.length) return;

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

		gsap.set(strands, {
			left: '50%',
			top: '50%',
			transformOrigin: 'center center',
		});

		gsap.set(strandBodies, {
			scaleX: 0,
			transformOrigin: 'center center',
		});

		const timeline = gsap.timeline();
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
	});

	onBeforeUnmount(() => {
		if (helixIntro) {
			helixIntro.kill();
			helixIntro = null;
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

  .container {
		position: absolute;
		top: 0;
		left: 0;
    display: flex;
    perspective: 1000px;
    width: 100%;
    height: 100%;
    opacity: .6;
    z-index: -1;
		overflow: hidden;
  }

@keyframes rotate {
	from {
		transform: rotateY(0deg);
	}
	to {
		transform: rotateY(360deg);
	}
}

.helix {
	position: relative;
	transform-style: preserve-3d;
	top: 0%;
  right: -79.75%;
	display: flex;
	justify-content: center;
	align-items: center;
  scale: 2.5;
}

.strang {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
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
