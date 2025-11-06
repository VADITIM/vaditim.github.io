<template>
  <div class="container">

    <PaginationDots />

    <div class="project-name-container" :class="{ active: activeProjectIndex !== null }" @click="closeActiveProject">
      <div class="project-name" v-html="projects[currentProjectIndex]?.name"></div>
    </div>

    <div ref="projectsContainer" class="projects-container" :class="{ active: activeProjectIndex !== null }"
      @scroll="updateCurrentProject" @mousedown="startDrag" @mousemove="drag" @mouseup="endDrag" @mouseleave="endDrag">
      <div class="spacer"></div>
      <div v-for="(project, index) in projects" :key="index" class="project" @click="ActiveProject(index, $event)"
        :class="{ active: activeProjectIndex === index, cursor: clicked }">
        <span v-html="project.name" class="p-name"></span>
        <span v-if="!project.wip" class="year" :class="{ active: activeProjectIndex !== null }">{{ project.year }}</span>
        <span v-if="project.wip" class="wip">
          <span>WORK IN PROGRESS <br></br> </span>
          <span class="estimated" :class="{ active: activeProjectIndex !== null }">Estimated {{ project.estimated }}</span>
        </span>
        <div class="project-image" :style="{ backgroundImage: `url(${project.img})` }"
          :class="{ current: currentProjectIndex === index, transitioning: transitioning }"></div>
      </div>
      <div class="spacer2 transparent">More To Come</div>
    </div>

    <ProjectsCopy />
    <SwipeButtons />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import {
  projects,
  currentProjectIndex,
  activeProjectIndex,
  ActiveProject,
  updateCurrentProject,
  startDrag,
  drag,
  endDrag,
  projectsContainer,
  transitioning,
  closeActiveProject,
}
  from '../../modules/projects';
import PaginationDots from './PaginationDots.vue';
import ProjectsCopy from './ProjectsCopy.vue';
import SwipeButtons from './SwipeButtons.vue';
import { clicked } from '../../modules/techContainer';

onMounted(() => {
if (projectsContainer.value) {
  projectsContainer.value.scrollTo({
    left: projectsContainer.value.scrollWidth,
    behavior: "instant"
  });
}
})

</script>

<style lang="scss" scoped>
@use "../../style/Work-Page/projects.scss" as *;
</style>
