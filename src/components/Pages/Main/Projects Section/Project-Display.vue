<template>
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
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { activeProjectIndex, closeActiveProject, currentProjectIndex, projects } from '@modules/Projects Section/projects';
  import { clicked } from '@modules/Projects Section/projects-technology';
  const currentProject = computed(() => projects[currentProjectIndex.value]);
</script>

<style lang="scss" scoped>
@use "@styleVariables" as *;

.project-display {
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  top: 50%;
  left: 20%;
  width: 16rem;
  height: 16rem;
  transform: translate(-50%, -50%);
  border-radius: 15px;
  border-radius: 50%;
  opacity: 1;
  z-index: -1;
  cursor: pointer;

  transition: 
    top .4s, 
    left .35s, 
    width 0.75s, 
    height 0.75s, 
    border-radius 1s, 
    transform .5s ,
    scale .2s,
    opacity 0s .75s, 
    z-index .9s .1s !important;

  &.active {
    top: 10%;
    left: 15%;
    width: 70%;
    height: 85%;
    transform: translate(-10%, 0%);
    border-radius: 30px;
    opacity: 1;
    scale: 1;
    z-index: 1;
    pointer-events: pointer;

    transition: 
      width 0.75s, 
      height 0.75s, 
      top .5s .1s, 
      left .35s, 
      border-radius 1s, 
      z-index 0s, 
      transform .5s,
      scale .2s !important;
  }

  .project-image {
    position: absolute;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: inherit;
    z-index: -1;

    transition:
      border-radius 1s 0s;
  }
}
</style>