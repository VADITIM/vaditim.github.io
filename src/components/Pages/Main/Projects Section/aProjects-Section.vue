<template>
  <div class="projects-section-container">
    <ProjectList />
    <MagneticDots :isDisabled="activeProjectIndex !== null" />
    <Projects />
  </div>
</template>

<script setup lang="ts">
  import ProjectList from '@projects/Project-List.vue';
  import MagneticDots from '../../../Misc/Magnetic-Dots.vue';
  import Projects from '@projects/Project-Projects.vue';
  import { activeProjectIndex } from '@modules/Projects Section/projects';
</script>

<style lang="scss" scoped>
  @use "@styleVariables" as *;

  .projects-section-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    transform: translateY(-100vh);
    overflow: hidden;
  }

</style>
