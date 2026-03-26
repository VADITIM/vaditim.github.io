<template>
	<div class="project-list" :class="{ active: activeProjectIndex !== null }">
		<div class="list-container">
			<div v-for="item in visibleProjects" 
				   :key="item.virtualIndex" 
				   class="project-list-item"
				   :class="[`position-${item.position}`, { active: activeProjectIndex !== null }]"
				   :style="getItemStyle(item.position)"
				   @click="selectProject(item.position)">
				{{ item.project.name }}
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed, ref, watch } from 'vue';
	import { activeProjectIndex, currentProjectIndex, projects } from '@modules/Projects Section/projects'

	const totalProjects = projects.length;
	const itemSpacingRem = 3.8;
	const modulo = (value: number, length: number) => ((value % length) + length) % length;

	const virtualCurrentIndex = ref(currentProjectIndex.value);

	const getNearestVirtualIndex = (targetIndex: number) => {
		const base = virtualCurrentIndex.value;
		const normalized = modulo(targetIndex, totalProjects);
		const targetBand = Math.round((base - normalized) / totalProjects);

		const candidates = [
			normalized + (targetBand - 1) * totalProjects,
			normalized + targetBand * totalProjects,
			normalized + (targetBand + 1) * totalProjects,
		];

		return candidates.reduce((closest, candidate) =>
			Math.abs(candidate - base) < Math.abs(closest - base) ? candidate : closest
		);
	};

	watch(currentProjectIndex, (newIndex) => {
		virtualCurrentIndex.value = getNearestVirtualIndex(newIndex);
	});

	const visibleProjects = computed(() => {
		const current = virtualCurrentIndex.value;
		const positions = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
		
		return positions.map(offset => {
			const virtualIndex = current + offset;
			const index = modulo(virtualIndex, totalProjects);
			
			return {
				index,
				virtualIndex,
				project: projects[index],
				position: offset
			};
		});
	});

	const selectProject = (offset: number) => {
		if (offset === 0) return;
		virtualCurrentIndex.value += offset;
		currentProjectIndex.value = modulo(virtualCurrentIndex.value, totalProjects);
	}

	const getItemStyle = (position: number) => {
		return {
			top: `calc(50% + ${position * itemSpacingRem}rem)`,
		};
	}
</script>

<style scoped lang="scss">
@use "@styleVariables" as *;

.project-list {
	@extend .disable-selection;
	@include absoluteCenter(31%, 150%);
	display: flex;
	flex-direction: column;
	width: 15rem;
	height: 20rem;
	transform: translateX(0);
	font-family: Wosker;
	perspective: 1000px;
	opacity: 1;
	z-index: 1;
	filter: drop-shadow(0px 0px 30px black);

	transition:
		left 0.5s ease .4s,
		top 0s ease .3s,
		transform 0.3s ease;

	&.active {
		left: 130% !important;
		top: -2% !important;
		transform: translateX(-126vw);
	}
}

.list-container {
	position: relative;
	width: 100%;
	height: 100%;
	padding: 1rem 0;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	justify-content: center;
}

.project-list-item {
	@include rotate(0, -40, 0);
	@include outline(black);
	display: flex;
	justify-content: right;
	align-items: center;
	position: absolute;
	top: 50%;
	right: 0%;
	width: 100%;
	text-wrap: nowrap;
	height: 2rem;
	box-sizing: border-box;
	padding-top: 0;
	padding-bottom: 0;
	line-height: 1rem;
	margin: .8rem .7rem;
	font-size: 1.5rem;
	color: white;
	cursor: pointer;
	opacity: 0.4;

	transition:
		font-size 0.4s ease,
		opacity 0.4s ease,
		margin 0.4s ease,
		padding 0.4s ease,
		color 0.4s ease,
		right 0.2s ease,
		top 0.3s ease;
		
	&:hover {
		opacity: 1;
	}

	&.active {
		justify-content: left;
	}

	&.position-0 {
		color: $red;
		right: 10%;
		font-size: 3.5rem;
		opacity: 1;
	}

	&.position--1,
	&.position-1 {
		font-size: 1.85rem;
		opacity: 0.8;
		right: 5%;
	}

	&.position--1 {
		padding-bottom: 1.2rem;
	}

	&.position-1 {
		padding-top: 1.2rem;
	}

	&.position--2,
	&.position-2 {
		font-size: 1.5rem;
		opacity: 0.5;
	}

	&.position--2 {
		padding-top: 0.7rem;
	}

	&.position-2 {
		padding-bottom: 0.7rem;
	}

	&.position--3,
	&.position-3 {
		font-size: 1.5rem;
		opacity: 0;
		pointer-events: none;
	}

	&.position--4,
	&.position-4 {
		font-size: 1.5rem;
		opacity: 0;
		pointer-events: none;
	}
}
</style>