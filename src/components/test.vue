<template>
  <div class="content-list-container">
		<div class="line"></div>
    <p class="intro-header-list" :class="{active: currentSection === 0}" @click="scrollToSection(0)">ROLES</p>
    <p class="info-header-list" :class="{active: currentSection === 1}" @click="scrollToSection(1)">ABOUT ME</p>
    <p class="work-header-list" :class="{active: currentSection === 2}" @click="scrollToSection(2)">PROJECTS</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { currentSection, initSectionTracking, cleanupSectionTracking, scrollToSection } from '../modules/test'

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
  display: flex;
  position: fixed;
	flex-direction: column;
  bottom: 3%;
  left: 1%;
  width: 20%;
  font-family: Wosker;
  perspective: 1000px;
  z-index: 20;
	// background-color: green;
}

.intro-header-list,
.info-header-list,
.work-header-list {
  @include rotate(0, 40, 0);
	@include outline(black);
  position: relative;
	display: flex;
	width: 100%;
	align-self: start;
	line-height: 1rem;
	margin: .8rem 0rem;
	font-size: 2rem;
  cursor: pointer;
  transition: 
    .3s all;

	&.active {
		font-size: 5rem;
		color: $red;
		line-height: 1.2rem;
		margin: 3rem 0rem;
	}
}

.line {
	position: absolute;
	width: .4rem;
	height: 100%;
	background-color: $black;
	margin-bottom: 1rem;
	left: 0;
	top: -5%;
}
</style>