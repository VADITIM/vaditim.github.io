<template>
  <div class="work-page-container">
    <Projects />
    <WorkBackground />
    <TechContainer />
  </div>
  <div class="scrollerW"></div>
</template>

<script setup lang="ts">
import Projects from './Projects.vue';
import TechContainer from './TechContainer.vue';
import WorkBackground from './WorkBackground.vue';
import { WorkPageAnimations } from '../../modules/animations/work-page-animations';
import { onMounted } from 'vue';

onMounted(() => {
  WorkPageAnimations();
})
</script>

<style lang="scss" scoped>
.scrollerW {
  position: absolute;
  top: 200vh;
}

.work-page-container {
  position: absolute;
  top: 200vh;
  left: 0;
  width: 100vw;
  height: 100vh;
}

</style>
