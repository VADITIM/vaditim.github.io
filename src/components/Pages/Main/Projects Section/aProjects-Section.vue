<template>
  <div class="projects-section-container">
    <ProjectProjects />
    <ProjectsTechnologyContainer />
    <InfoBackground :isDisabled="activeProjectIndex !== null" />
  </div>
  <div class="project-section-trigger"></div>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue';

  import ProjectProjects from '@projects/Project-Projects.vue';
  import ProjectsTechnologyContainer from '@projects/Project-Technology-Container.vue';
  import InfoBackground from '@components/Magnetic-Dots.vue';
  import { activeProjectIndex } from '@modules/Projects Section/projects';

  import { ProjectAnimationDesktop } from '@modules/animations/Desktop/Projects-Animation-Handler';

  onMounted(() => {
    ProjectAnimationDesktop();
  })
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
