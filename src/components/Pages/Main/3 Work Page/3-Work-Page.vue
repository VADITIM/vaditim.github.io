<template>
  <div class="work-page-container">
    <Projects />
    <TechContainer />
    <div class="work-scroller"></div>
  </div>
</template>

<script setup lang="ts">
  import Projects from './Work-Projects.vue';
  import TechContainer from './Work-Project-Info-Container.vue';
  import { WorkPageAnimations } from '../../../../modules/animations/work-page-animations';
  import { onMounted } from 'vue';

  onMounted(() => {
    WorkPageAnimations();
  })
</script>

<style lang="scss" scoped>
  @use "../../../../style/variables.scss" as *;

  .work-scroller {
    position: absolute;
    top: 0;
    // width: 100%;
    // height: 1%;
    // background-color: red;
  }

  .work-page-container {
    position: absolute;
    top: 200vh;
    left: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }
</style>
