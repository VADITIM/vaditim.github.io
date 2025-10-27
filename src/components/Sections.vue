<template>
  <div class="content-list-container" :class="{active: activeProjectIndex !== null}">
		<div class="line"></div>
    <p class="intro-header-list" :class="{active: currentSection === 0}" @click="scrollToSection(0)">ROLES</p>
    <p class="info-header-list" :class="{active: currentSection === 1}" @click="scrollToSection(1)">ABOUT ME</p>
    <p class="work-header-list" :class="{active: currentSection === 2}" @click="scrollToSection(2)">PROJECTS</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { currentSection, initSectionTracking, cleanupSectionTracking, scrollToSection } from '../modules/sections'
import { activeProjectIndex } from '../modules/projects'

onMounted(() => {
  initSectionTracking()
})

onUnmounted(() => {
  cleanupSectionTracking()
})
</script>

<style scoped lang="scss">
@use "../style/variables.scss" as *;

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

	transition: .5s ease all;

	&.active {
		left: -20%
	}

	@include largeDesktop {
		bottom: 3%;
	}
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