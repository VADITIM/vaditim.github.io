<template>
  <div class="container">

    <PaginationDots />

    <div class="project-name-container" :class="{ active: activeProjectIndex !== null }" @click="closeActiveProject">
      <div class="project-name" v-html="projects[currentProjectIndex]?.name"></div>
    </div>

    <div class="carousel-container">
      <div ref="carouselRef" class="carousel" :class="{ active: activeProjectIndex !== null }" :style="carouselStyle">
        <div v-for="(project, index) in projects" :key="index" class="carousel-item" :style="getItemStyle(index)"
          @click="handleProjectClick(index, $event)"
          :class="{ active: activeProjectIndex === index, current: currentProjectIndex === index }">
          <span v-html="project.name" class="p-name"></span>
          <span v-if="!project.wip" class="year" :class="{ active: activeProjectIndex !== null }">{{ project.year
            }}</span>
          <span v-if="project.wip" class="wip">
            <span>WORK IN PROGRESS <br></br> </span>
            <span class="estimated" :class="{ active: activeProjectIndex !== null }">Estimated {{ project.estimated
              }}</span>
          </span>
          <div class="project-image" :style="{ backgroundImage: `url(${project.img})` }"></div>
        </div>
      </div>
    </div>

    <ProjectsCopy />
    <SwipeButtons />
  </div>
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
}
  from '../../modules/projects';
import PaginationDots from './PaginationDots.vue';
import ProjectsCopy from './ProjectsCopy.vue';
import SwipeButtons from './SwipeButtons.vue';

const carouselRef = ref<HTMLElement>();
const isDragging = ref(false);
const startX = ref(0);
const startRotation = ref(0);

// Carousel rotation style
const carouselStyle = computed(() => ({
  transform: `rotateY(${carouselRotation.value}deg)`
}));

// Calculate individual item position in 3D space
function getItemStyle(index: number) {
  const angle = index * anglePerItem();
  const radius = 450; // Distance from center

  return {
    transform: `rotateY(${angle}deg) translateZ(${radius}px)`
  };
}

// Handle project click
function handleProjectClick(index: number, event: MouseEvent) {
  // Only activate if not dragging
  if (Math.abs(event.clientX - startX.value) > 10) return;

  // Rotate to bring clicked item to front
  navigateToCarouselProject(index);
  ActiveProject(index, event);
}

// Mouse drag handling
function handleMouseDown(event: MouseEvent) {
  isDragging.value = true;
  startX.value = event.clientX;
  startRotation.value = carouselRotation.value;
}

function handleMouseMove(event: MouseEvent) {
  if (!isDragging.value) return;
  const deltaX = event.clientX - startX.value;
  carouselRotation.value = startRotation.value + deltaX * 0.3;
}

function handleMouseUp() {
  if (!isDragging.value) return;
  isDragging.value = false;
  // Snap to nearest project
  const angle = anglePerItem();
  const nearestIndex = Math.round(-carouselRotation.value / angle) % projects.length;
  const normalizedIndex = nearestIndex < 0 ? projects.length + nearestIndex : nearestIndex;
  navigateToCarouselProject(normalizedIndex);
}

// Mouse wheel handling
function handleWheel(event: WheelEvent) {
  event.preventDefault();
  carouselRotation.value -= event.deltaY * 0.1;
  // Update current index
  const angle = anglePerItem();
  const nearestIndex = Math.round(-carouselRotation.value / angle) % projects.length;
  const normalizedIndex = nearestIndex < 0 ? projects.length + nearestIndex : nearestIndex;
  currentProjectIndex.value = normalizedIndex;
}

onMounted(() => {
  const container = document.querySelector('.carousel-container');
  if (container) {
    container.addEventListener('mousedown', handleMouseDown as any);
    container.addEventListener('mousemove', handleMouseMove as any);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mouseleave', handleMouseUp);
    container.addEventListener('wheel', handleWheel as any, { passive: false });
  }
});

onUnmounted(() => {
  const container = document.querySelector('.carousel-container');
  if (container) {
    container.removeEventListener('mousedown', handleMouseDown as any);
    container.removeEventListener('mousemove', handleMouseMove as any);
    container.removeEventListener('mouseup', handleMouseUp);
    container.removeEventListener('mouseleave', handleMouseUp);
    container.removeEventListener('wheel', handleWheel as any);
  }
});

</script>

<style lang="scss" scoped>
@use "../../style/Work-Page/projects.scss" as *;
</style>
