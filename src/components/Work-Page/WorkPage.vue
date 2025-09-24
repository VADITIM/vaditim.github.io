<template>
  <WorkBackground />
  <Projects />

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
</style>
