<template>
  <div class="projects-container">
    <PaginationDots />
    <div class="project-name-container" :class="{ active: activeProjectIndex !== null }" @click="closeActiveProject">
      <div class="project-name" v-html="projects[currentProjectIndex]?.name"></div>
    </div>
    <div class="carousel-container">
      <div ref="carouselRef" class="carousel" :class="{ active: activeProjectIndex !== null }" :style="carouselStyle">
        <div v-for="(project, index) in projects" :key="index" class="carousel-item" :style="getItemStyle(index)"
          @click="handleProjectClick(index)"
          :class="{ active: activeProjectIndex === index, current: currentProjectIndex === index }">
          <span v-html="project.name" class="p-name"></span>
          <span v-if="!project.wip" class="year" :class="{ active: activeProjectIndex !== null }">{{ project.year
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
    <ProjectsCopy />
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
  } from '../../../../modules/3 Work Page/work-projects';

  import PaginationDots from './Work-Pagination-Dots.vue';
  import ProjectsCopy from './Work-Projects-Copy.vue';

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
    const container = document.querySelector('.carousel-container');
    if (container) {
      container.addEventListener('mousedown', handleMouseDown as any);
    }
  });

  onUnmounted(() => {
    const container = document.querySelector('.carousel-container');
    if (container) {
      container.removeEventListener('mousedown', handleMouseDown as any);
    }
    window.removeEventListener('mousemove', handleMouseMove as any);
    window.removeEventListener('mouseup', handleMouseUp as any);
  });
</script>

<style lang="scss" scoped>
  @use "../../../../style/3-Work-Page/projects.scss" as *;
</style>
