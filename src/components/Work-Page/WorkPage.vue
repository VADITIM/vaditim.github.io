<template>
  <div class="work-page-container">
    <Projects />
    <WorkBackground />
  </div>
  <div class="scrollerW"></div>
</template>

<script setup lang="ts">
import Projects from './Projects.vue';
import WorkBackground from './WorkBackground.vue';
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
