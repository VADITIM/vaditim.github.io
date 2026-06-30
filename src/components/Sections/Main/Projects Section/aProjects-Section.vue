<template>
  <div class="projects-section-container">
    <ProjectList />
    <Projects />
  </div>
</template>

<script setup lang="ts">
  import ProjectList from '@projects/Project-List.vue';
  import Projects from '@projects/Project-Projects.vue';
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
