<template>
  <div class="work-page-container">
    <div class="work-page-content">
      <Projects />
      <TechContainer />
    </div>
    <div class="work-scroller"></div>
  </div>
</template>

<script setup lang="ts">
  import Projects from './Work-Projects.vue';
  import TechContainer from './Work-Project-Info-Container.vue';

  import { onMounted } from 'vue';
  import { WorkPageAnimations } from '../../../../modules/outdated/work-page-animations'; 
  import { ProjectAnimationDesktop } from '../../../../modules/animations/Desktop/Projects-Animation-Handler';

  onMounted(() => {
    // WorkPageAnimations();
    // ProjectAnimationDesktop();
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

  .work-page-content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform: translateY(-200vh);
  }
</style>
