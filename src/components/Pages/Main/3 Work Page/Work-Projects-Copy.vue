<template>
  <div class="projects-display-container" :class="{ active: activeProjectIndex !== null }">
    <div class="container">
      <div class="container2" :style="carouselStyle">
        <div v-for="(project, index) in projects" :key="index" class="carousel-project-copy" :style="getItemStyle(index)"
          :class="{ active: activeProjectIndex === index, current: currentProjectIndex === index }">
          <span v-html="project.name" class="project-name"></span>
          <span v-if="!project.wip" class="project-year" :class="{ active: activeProjectIndex !== null }">{{ project.year }}</span>
          <span v-if="project.wip" class="wip">
            <span>WORK IN PROGRESS <br></br> </span>
            <span class="estimated" :class="{ active: activeProjectIndex !== null }">Estimated {{ project.estimated }}</span>
          </span>
          <div class="project-image" :style="{ backgroundImage: `url(${project.img})` }"
            :class="{ active: activeProjectIndex === index, current: currentProjectIndex === index }"></div>
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
  </div>
</template>

<script setup lang="ts">
  import { projects, currentProjectIndex, activeProjectIndex, closeActiveProject, carouselRotation, anglePerItem } from '../../../../modules/3 Work Page/work-projects';
  import { clicked } from '../../../../modules/3 Work Page/work-tech-container';
  import { computed } from 'vue';

  const currentProject = computed(() => projects[currentProjectIndex.value]);

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
</script>


<style lang="scss" scoped>
  @use "../../../../style/3-Work-Page/projectscopy.scss";
</style>
