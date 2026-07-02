<template>
  <div class="pagination-dots" :class="{ 'active': activeProjectIndex !== null }">
    <div v-for="(_project, index) in projects" :key="index" class="dot"
      :class="{ active: index === currentProjectIndex }"
      @click="selectProject(index)"
    ></div>
  </div>
</template>

<script setup lang="ts">
  import { projects, currentProjectIndex, activeProjectIndex } from '@modules/sectionsProjects';

  const selectProject = (index: number) => {
    currentProjectIndex.value = index;
  };
</script>

<style lang="scss" scoped>
  @use "@styleVariables" as *;
  .pagination-dots {
    @include absoluteCenter(50%, 98.5%);
    width: 2rem;
    display: flex;
    flex-direction: column;
    justify-content: center;

    transform: translate(-50%, -50%);
    align-items: center;
    padding-top: 1rem;
    padding-bottom: 1rem;
    border-radius: 10rem;
    gap: 1rem;
    z-index: 100;
    filter: drop-shadow(0px 0px 15px white);
    pointer-events: all;
    isolation: isolate;


	transition:
		left 0.5s ease .9s,
		top 0s ease .3s,
		transform 0.3s ease;

    &.active {
      left: 111% !important;
      top: 17%;
      transform: translate(-100vw, -50%);
    }
  }

  .dot {
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.5);
    cursor: pointer;

    transition:
      all 0.3s ease;
      
    &:hover {
      background-color: rgba(214, 22, 22, 0.8);
      transform: scale(1.2);
    }

    &.active {
      background-color: rgb(255, 0, 0);
      transform: scale(1.3);
      @include boxShadow(0 0 10px rgba(255, 0, 0, 0.5));
    }
  }
</style>