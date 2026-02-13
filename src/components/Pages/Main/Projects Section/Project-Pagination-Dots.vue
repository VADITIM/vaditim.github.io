<template>
  <div class="pagination-dots" :class="{ 'project-open': activeProjectIndex !== null }">
    <div v-for="(_project, index) in projects" :key="index" class="dot"
      :class="{ active: index === currentProjectIndex, 'project-open': activeProjectIndex !== null }"></div>
  </div>
</template>

<script setup lang="ts">
  import { projects, currentProjectIndex, activeProjectIndex } from '@modules/Projects Section/projects';
</script>

<style lang="scss" scoped>
  @use "@styleVariables" as *;
  .pagination-dots {
    @include absoluteCenter(50%, 98.5%);
    width: 2rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-top: 1rem;
    padding-bottom: 1rem;
    border-radius: 10rem;
    gap: 1rem;
    z-index: 100;
    filter: drop-shadow(0px 0px 15px white);

    transition: 
      all 0.3s ease-in-out;

    &.project-open {
      left: 5%;
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
      
    &.project-open {
      left: 5%;
    }

    &:hover {
      background-color: rgba(214, 22, 22, 0.8);
      transform: scale(1.2);
    }

    &.active {
      background-color: rgb(255, 0, 0);
      background-color: rgb(255, 255, 255);
      transform: scale(1.3);
      box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
    }
  }
</style>