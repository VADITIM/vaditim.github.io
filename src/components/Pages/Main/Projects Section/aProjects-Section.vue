<template>
  <div class="projects-section-container">
    <ProjectList />
    <Projects />
    <ProjectsTechnologyContainer />
    <MagneticDots :isDisabled="activeProjectIndex !== null" />
  </div>
  <div class="project-section-trigger"></div>
</template>

<script setup lang="ts">
  import Projects from '@projects/Project-Projects.vue';
  import ProjectsTechnologyContainer from '@projects/Project-Technology-Container.vue';
  import MagneticDots from '@components/Magnetic-Dots.vue';
  import ProjectList from '@components/Project-List.vue';
  import { activeProjectIndex } from '@modules/Projects Section/projects';
</script>

<style lang="scss" scoped>
  @use "@styleVariables" as *;

  .project-section-trigger {
    position: absolute;
    top: 200vh;
    // width: 100%;
    // height: 1%;
    // background-color: red;
  }

  .projects-section-container {
    position: absolute;
    top: 200vh;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

</style>
