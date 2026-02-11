<template>
  <div class="projects-container">
    <div class="project-name-container" :class="{ active: activeProjectIndex !== null }" @click="closeActiveProject">
      <div class="project-name" v-html="projects[currentProjectIndex]?.name"></div>
    </div>
    <div class="projects-carousel-container">
      <div ref="carouselRef" class="carousel" :class="{ active: activeProjectIndex !== null }" :style="carouselStyle">
        <div v-for="(project, index) in projects" :key="index" class="carousel-project" :style="getItemStyle(index)"
          @click="handleProjectClick(index)"
          :class="{ active: activeProjectIndex === index, current: currentProjectIndex === index }">
          <span v-html="project.name" class="project-name"></span>
          <span v-if="!project.wip" class="project-year" :class="{ active: activeProjectIndex !== null }">{{ project.year
            }}</span>
          <span v-if="project.wip" class="wip">
            <span>WORK IN PROGRESS <br></br> </span>
            <span class="estimated" :class="{ active: activeProjectIndex !== null }">Estimated {{ project.estimated
              }}</span>
          </span>
          <div class="project-image" :style="{ backgroundImage: `url(${project.img})` }"
          :class="{ active: activeProjectIndex === index, current: currentProjectIndex === index }"></div>
        </div>
      </div>
    </div>
    <div class="project-display"
  :class="{ active: activeProjectIndex !== null }"
  @click="closeActiveProject($event)">

  <span :class="{ active: activeProjectIndex !== null }" v-html="currentProject.name" class="p-name"></span>
  <span :class="{ active: activeProjectIndex !== null }" v-if="!currentProject.wip" class="year">{{ currentProject.year }}</span>
  <span :class="{ active: activeProjectIndex !== null }" v-if="currentProject.wip" class="wip">
    <span>WORK IN PROGRESS <br> </span>
    <span class="estimated" :class="{ active: activeProjectIndex !== null }">Estimated {{ currentProject.estimated }}</span>
  </span>

  <Transition name="notice-fade">
    <p :class="{clicked: clicked}"
      v-if="currentProject.ai && activeProjectIndex !== null"
      class="notice active">Visual concept generated with AI tools and refined using assets from the original game.</p>
  </Transition>
  <div class="project-image" :style="{ backgroundImage: `url(${currentProject.img})` }"></div>
    </div>
  </div>

    <PaginationDots />

  <!-- <ProjectsCopy /> -->
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import {
    projects,
    currentProjectIndex,
    activeProjectIndex,
    ActiveProject,
    closeActiveProject,
    carouselRotation,
    anglePerItem,
    navigateToCarouselProject,
  } from '../../../../modules/3 Work Page/work-projects';

  import PaginationDots from './Work-Pagination-Dots.vue';
  import ProjectsCopy from './Work-Projects-Copy.vue';
  import { clicked } from '../../../../modules/3 Work Page/work-tech-container';
  const currentProject = computed(() => projects[currentProjectIndex.value]);

  const isPointerDown = ref(false);
  const isDragging = ref(false);
  const wasDragged = ref(false);
  const startX = ref(0);
  const startRotation = ref(0);
  const dragThreshold = 6;

  const carouselStyle = computed(() => ({
    transform: `rotateY(${carouselRotation.value}deg)`
  }));

  function getItemStyle(index: number) {
    const angle = index * anglePerItem();
    const radius = 450;

    return {
      transform: `rotateY(${angle}deg) translateZ(${radius}px)`
    };
  }

  function handleProjectClick(index: number) {
    if (wasDragged.value) {
      wasDragged.value = false;
      return;
    }

    const angle = anglePerItem();
    const nearestIndex = Math.round(-carouselRotation.value / angle) % projects.length;
    const frontIndex = nearestIndex < 0 ? projects.length + nearestIndex : nearestIndex;

    if (index !== frontIndex) {
      navigateToCarouselProject(index);
      return;
    }

    ActiveProject(index);
  }

  function handleMouseDown(event: MouseEvent) {
    isPointerDown.value = true;
    isDragging.value = false;
    startX.value = event.clientX;
    startRotation.value = carouselRotation.value;
    window.addEventListener('mousemove', handleMouseMove as any);
    window.addEventListener('mouseup', handleMouseUp as any);
  }

  function handleMouseMove(event: MouseEvent) {
    if (!isPointerDown.value) return;
    const deltaX = event.clientX - startX.value;
    if (!isDragging.value && Math.abs(deltaX) > dragThreshold) {
      isDragging.value = true;
    }
    if (isDragging.value) {
      carouselRotation.value = startRotation.value + deltaX * 0.3;
    }
  }

  function handleMouseUp() {
    if (!isPointerDown.value) return;
    if (isDragging.value) {
      const angle = anglePerItem();
      const nearestIndex = Math.round(-carouselRotation.value / angle) % projects.length;
      const normalizedIndex = nearestIndex < 0 ? projects.length + nearestIndex : nearestIndex;
      navigateToCarouselProject(normalizedIndex);
      wasDragged.value = true;
    }
    isPointerDown.value = false;
    isDragging.value = false;
    window.removeEventListener('mousemove', handleMouseMove as any);
    window.removeEventListener('mouseup', handleMouseUp as any);
  }

  onMounted(() => {
    const container = document.querySelector('.projects-carousel-container');
    if (container) {
      container.addEventListener('mousedown', handleMouseDown as any);
    }
  });

  onUnmounted(() => {
    const container = document.querySelector('.projects-carousel-container');
    if (container) {
      container.removeEventListener('mousedown', handleMouseDown as any);
    }
    window.removeEventListener('mousemove', handleMouseMove as any);
    window.removeEventListener('mouseup', handleMouseUp as any);
  });
</script>

<style lang="scss" scoped>
  @use "../../../../style/3-Work-Page/projects.scss" as *;
  @use "@/style/variables.scss" as *;




.project-display {
  @include absoluteCenter(100%, 50%);
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: $projectWidth;
  height: $projectHeight;
  margin-left: calc($projectWidth / -2);
  border-radius: 15px;
  backface-visibility: visible;
  transform-style: preserve-3d;
  cursor: default;
  opacity: 1;
  z-index: -1;
  scale: 1.3;

  transition: 
    top .4s, 
    left .35s, 
    width 0.75s, 
    height 0.75s, 
    border-radius 1s, 
    z-index .9s .1s, 
    transform .5s ,
    opacity 0s .75s,
    scale .2s;

  &.active {
    top: 10%;
    transform: translate(-10%, 0%);
    left: 20%;
    pointer-events: pointer;
    width: 80%;
    height: 85%;
    opacity: 1;
    z-index: 1;
    scale: 1;

    transition: 
      width 0.75s, 
      height 0.75s, 
      top .5s .1s, 
      left .35s, 
      border-radius 1s, 
      z-index 0s, 
      transform .5s,
      scale .2s;
  }

  &.project-image {
    position: absolute;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 10px;

    transition:
      border-radius 3.8s 0s linear;
  }

  &.active .project-image {
  }
}

</style>
