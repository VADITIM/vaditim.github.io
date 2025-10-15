<template>
  <div class="container">
    <div class="pagination-dots">
      <div 
        v-for="(project, index) in projects" 
        :key="index"
        class="dot"
        :class="{ active: index === currentProjectIndex }"
        @click="scrollToProject(index)"
      ></div>
    </div>


    <div ref="projectsContainer" class="projects-container" :class="{active: activeProjectIndex !== null}" @scroll="updateCurrentProject" @mousedown="startDrag" @mousemove="drag" @mouseup="endDrag" @mouseleave="endDrag">
      <div class="spacer"></div>
      <div v-for="(project, index) in projects" :key="index" class="project" :class="{active: activeProjectIndex === index}">
        <div class="more-info-container">
          <div class="more-info" @click="ActiveProject(index)" :class="{ active: activeProjectIndex === index }">Show More</div>
        </div>
        <h3>{{ project.name }}</h3>
        <span v-if="!project.wip">Year <br></br> {{ project.year }}</span>
        <span v-if="project.wip">
          <span>WORK IN PROGRESS <br></br> </span>
          <span>Estimated {{ project.estimated }}</span>
        </span>
        <div class="project-image" :style="{ backgroundImage: `url(${project.img})` }" :class="{current: currentProjectIndex === index, transitioning: transitioning}"></div>
      </div>
      <div class="spacer2">More To Come</div>
    </div>

    <div class="next" @click="nextProject" :class="{active: activeProjectIndex !== null, clicked: nextClicked}"></div>
    <div class="previous" @click="previousProject" :class="{active: activeProjectIndex !== null, clicked: previousClicked}"></div>
    <div v-if="!last" class="full-next" @click="nextProject" :class="{active: activeProjectIndex !== null, clicked: nextClicked}"></div>
    <div v-if="!first" class="full-previous" @click="previousProject" :class="{active: activeProjectIndex !== null, clicked: previousClicked}"></div>

        
    <div class="copy-container" :class="{ active: activeProjectIndex !== null }">
      <div class="project-copy" :class="{ active: activeProjectIndex !== null }" @click="closeActiveProject">
        <p>{{ projects[currentProjectIndex]?.name }}</p>
        <p>{{ projects[currentProjectIndex]?.description }}</p>
        <span>{{ projects[currentProjectIndex]?.year }}</span>
        <p class="notice" v-if="projects[currentProjectIndex]?.ai && activeProjectIndex !== null">This image was created with the help of AI, using visual assets from the original game for reference.</p>
        <div class="project-image" :style="{ backgroundImage: `url(${projects[currentProjectIndex]?.img})` }" :class="{current: currentProjectIndex === currentProjectIndex, transitioning: transitioning}"></div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { 
  projects,
  currentProjectIndex,
  activeProjectIndex,
  ActiveProject,
  scrollToProject,
  closeActiveProject,
  updateCurrentProject,
  startDrag,
  drag,
  endDrag,
  projectsContainer,
  transitioning,
  nextProject,
  previousProject,
  nextClicked,
  previousClicked,
} 
from '../../modules/projects';

const first = computed(() => currentProjectIndex.value === 0);
const last = computed(() => currentProjectIndex.value === projects.length - 1);


</script>

<style lang="scss" scoped>
@use "@/style/Work-Page/projects.scss" as *;
</style>
