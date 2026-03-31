<template>
	  <div class="content-list-container" :class="[{ active: activeProjectIndex !== null }, isMobile ? 'is-mobile' : 'is-desktop', { 'dragging': isDragging && isMobile }]" :style="dragStyle">
			<div class="line"></div>
			<div v-if="isMobile" class="rect-container">
				<div class="rect" :class="[{ active: currentSection === 0 }, { 'locked': navigationLockRef && currentSection !== 0 }]" @click="onEntryClick(0)"></div>
				<div class="rect" :class="[{ active: currentSection === 1 }, { 'locked': navigationLockRef && currentSection !== 1 }]" @click="onEntryClick(1)"></div>
				<div class="rect" :class="[{ active: currentSection === 2 }, { 'locked': navigationLockRef && currentSection !== 2 }]" @click="onEntryClick(2)"></div>
			</div>
	    <div class="perks-header-list" :class="[{ active: currentSection === 0 }, { 'locked': navigationLockRef && currentSection !== 0 }]" @click="onEntryClick(0)">PERK</div>
	    <div class="profile-header-list" :class="[{ active: currentSection === 1 }, { 'locked': navigationLockRef && currentSection !== 1 }]" @click="onEntryClick(1)">PROFILE</div>
	    <div class="projects-header-list" :class="[{ active: currentSection === 2 }, { 'locked': navigationLockRef && currentSection !== 2 }]" @click="onEntryClick(2)">PROJECT</div>
	  </div>

</template>

<script setup lang="ts">
	import { onMounted, onUnmounted, ref, computed, watch } from 'vue'
	import { currentSection, InitializeSectionTracking, cleanupSectionTracking, ChangeToSectionID } from '@modules/Sections/sections'
	import { activeProjectIndex } from '@modules/Sections/Projects Section/projects'
	import { isMobile } from '@modules/Misc/is-mobile'
	import { navigationLockRef } from '@modules/Misc/navigation-lock'
	import { InitializeMobileDragNavigation, CleanupMobileDragNavigation, dragOffset, isDragging, dragDirection, dragOffsetX, thresholdReached } from '@modules/Misc/mobile-drag-navigation'

	const thresholdAnimating = ref(false)

	watch(thresholdReached, () => {
		thresholdAnimating.value = true
		setTimeout(() => {
			thresholdAnimating.value = false
		}, 180)
	})

	const dragStyle = computed(() => {
		if (!isDragging.value || !isMobile.value) return {}
		
		const scale = Math.min(1 + dragOffset.value / 200, 1.1)
		const translateY = dragDirection.value === 'up' ? dragOffset.value * 0.3 : -dragOffset.value * 0.3
		const translateX = dragOffsetX.value * 0.2
		
		const popScale = thresholdReached.value ? 1.08 : 1
		const popTranslateY = thresholdReached.value ? -15 : 0
		const useTransition = thresholdReached.value || thresholdAnimating.value
		
		return {
			transform: `translateX(calc(-50% + ${translateX}px)) scale(${scale * popScale}) translateY(${translateY + popTranslateY}px)`,
			opacity: 0.8 + dragOffset.value / 500,
			transition: useTransition ? '0.15s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none'
		}
	})

	const vibrateClick = () => {
		if (navigationLockRef.value) return;
		if (typeof navigator === 'undefined') return;
		if (!('vibrate' in navigator)) return;
		navigator.vibrate(10);
	};

	const onEntryClick = (sectionIndex: number) => {
		vibrateClick();
		ChangeToSectionID(sectionIndex);
	};

	onMounted(() => {
		InitializeSectionTracking()
		if (isMobile.value) {
			InitializeMobileDragNavigation()
		}
	})

	onUnmounted(() => {
		cleanupSectionTracking()
		if (isMobile.value) {
			CleanupMobileDragNavigation()
		}
	})
</script>

<style scoped lang="scss">
	@use "@styleVariables" as *;

	.rect-container {
		position: absolute;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		justify-items: center;
		align-items: center;
		top: -3.2rem;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	.rect {
		display: flex;
		flex-direction: row;
		border: 4px solid white;
		border-radius: 10px;
		width: 3rem;
		height: 3rem;
		pointer-events: auto;
		width: 2rem;
		height: 2rem;
		scale: 0.8;

		transition:
			.2s all .1s;

		&.active {
			border-color: $red;
			transform: translateY(-30%)
			scale(1.1)
			rotate(135deg);
		}

		&.locked {
			transform: translateY(10px) scale(.95);
			border: 4px solid rgb(179, 179, 179);
		}
	}

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

		&.dragging {
			transition: none;
		}
	}

	.content-list-container.is-mobile {
		flex-direction: row;
		justify-content: space-between;
		left: 50%;
		bottom: 1.5%;
		width: min(92vw, 23rem);
		transform: translateX(-50%);
		perspective: none;

		@include mobile {
			width: min(94vw, 13rem);
		}
	}

	.perks-header-list,
	.profile-header-list,
	.projects-header-list {
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

		&.locked {
			color: rgb(179, 179, 179);
			scale: .8;
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

		@include allMobile {
			visibility: hidden;
		}	

	}


	.content-list-container.is-mobile .perks-header-list,
	.content-list-container.is-mobile .profile-header-list,
	.content-list-container.is-mobile .projects-header-list {


		@include mobile {
			@include rotate(0, 0, 0);
			flex: 1;
			width: auto;
			justify-content: center;
			text-align: center;
			margin: 0;
			padding: 0.4rem 0.25rem;
			line-height: 1.1rem;
			transform: translateY(0);
			font-size: .8rem;
			padding: 0.35rem 0rem;

			&.active {
				font-size: 1.1rem;
				padding: 0.35rem 0rem;
			}
		}
	}

	.content-list-container.is-mobile .perks-header-list.active,
	.content-list-container.is-mobile .profile-header-list.active,
	.content-list-container.is-mobile .projects-header-list.active {
		transform: translateY(-0.6rem);
	}
</style>