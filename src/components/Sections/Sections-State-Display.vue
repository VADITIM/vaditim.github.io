<template>
  <div class="content-list-container" :class="{active: activeProjectIndex !== null}">
		<div class="line">
			<!-- <div class="dot" :style="dotStyle"></div> -->
		</div>
    <p class="intro-header-list" :class="{active: currentSection === 0}" @click="scrollToSection(0)">PERKS</p>
    <p class="info-header-list" :class="{active: currentSection === 1}" @click="scrollToSection(1)">DEV PROFILE</p>
    <p class="work-header-list" :class="{active: currentSection === 2}" @click="scrollToSection(2)">PROJECTS</p>
  </div>
</template>

<script setup lang="ts">
	import { computed, onMounted, onUnmounted, ref } from 'vue'
	import { currentSection, initSectionTracking, cleanupSectionTracking, scrollToSection } from '@modules/sections'
	import { activeProjectIndex } from '@modules/Projects Section/projects'

	const dotProgress = ref(0)

	const updateDotProgress = () => {
		const maxScroll = Math.max(
			0,
			document.documentElement.scrollHeight - window.innerHeight
		)

		if (maxScroll === 0) {
			dotProgress.value = 0
			return
		}

		dotProgress.value = Math.min(1, Math.max(0, window.scrollY / maxScroll))
	}

	const dotStyle = computed(() => ({
		top: `${dotProgress.value * 100}%`
	}))

	onMounted(() => {
		initSectionTracking()
		updateDotProgress()
		window.addEventListener('scroll', updateDotProgress)
		window.addEventListener('resize', updateDotProgress)
	})

	onUnmounted(() => {
		cleanupSectionTracking()
		window.removeEventListener('scroll', updateDotProgress)
		window.removeEventListener('resize', updateDotProgress)
	})
</script>

<style scoped lang="scss">
	@use "@styleVariables" as *;

	.content-list-container {
		@extend .disable-selection;
		display: flex;
		position: fixed;
		flex-direction: column;
		bottom: 1%;
		left: 1%;
		width: 15rem;
		font-family: Wosker;
		perspective: 1000px;
		z-index: 20;
		filter: drop-shadow(0px 0px 30px black);

		transition: 
			.5s ease all;

		&.active {
			left: -20%
		}

		@include largeDesktop {
			bottom: 3%;
		}
	}

	.dot {
		position: absolute;
		top: 0;
		left: 50%;
		transform: translate(-50%, -50%);
		width: .8rem;
		height: .8rem;
		background-color: $red;
		border-radius: 50%;
		border: solid 3px $red;
		transition: top .15s linear;
	}

	.intro-header-list,
	.info-header-list,
	.work-header-list {
		@include rotate(0, 40, 0);
		@include outline(black);
		position: relative;
		display: flex;
		width: 10%;
		align-self: start;
		line-height: 1rem;
		margin: .8rem .7rem;
		font-size: 1.7rem;
		cursor: pointer;
		text-wrap: nowrap;

		transition: 
			.3s all;

		&:hover {
			font-size: 2.1rem;
		}

		&.active {
			font-size: 4rem;
			color: $red;
			line-height: 1rem;
			margin: 2rem 1rem;
		}

		@include largeDesktop {
			font-size: 2rem;

			&:hover {
				font-size: 2.1rem;
			}

			&.active {
				font-size: 5rem;
				color: $red;
				line-height: 1.2rem;
				margin: 3rem 1rem;
			}
		}
	}

	.line {
		display: flex;
		position: absolute;
		width: .4rem;
		height: 100%;
		background-color: $black;
		background-color: rgb(224, 224, 224);
		border: solid 1px black;
		border-radius: 5px;
		top: -2%;
		left: 0;
	}
</style>