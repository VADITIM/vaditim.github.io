<template>
  <div class="container">

    <PaginationDots />

    <div class="project-name-container" :class="{ active: activeProjectIndex !== null }" @click="closeActiveProject">
      <div class="project-name" v-html="projects[currentProjectIndex]?.name"></div>
    </div>

    <div ref="projectsContainer" class="projects-container" :class="{ active: activeProjectIndex !== null }"
      @scroll="updateCurrentProject" @mousedown="startDrag" @mousemove="drag" @mouseup="endDrag" @mouseleave="endDrag">
      <div class="spacer"></div>
      <div v-for="(project, index) in projects" :key="index" class="project"
        :class="{ active: activeProjectIndex === index }">
        <div class="more-info-container">
          <div class="more-info" @click="ActiveProject(index)" :class="{ active: activeProjectIndex === index }">Show
            More</div>
        </div>
        <h3 v-html="project.name"></h3>
        <span v-if="!project.wip">Year <br></br> {{ project.year }}</span>
        <span v-if="project.wip">
          <span>WORK IN PROGRESS <br></br> </span>
          <span>Estimated {{ project.estimated }}</span>
        </span>
        <div class="project-image" :style="{ backgroundImage: `url(${project.img})` }"
          :class="{ current: currentProjectIndex === index, transitioning: transitioning }"></div>
      </div>
      <div class="spacer2">More To Come</div>
    </div>

    <ProjectsCopy />
    <SwipeButtons />
  </div>
</template>

<script setup lang="ts">
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

</script>

<style lang="scss" scoped>
@use "@/style/Work-Page/projects.scss" as *;
</style>
