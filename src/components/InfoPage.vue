<template>
  <AboutMe />
  <div class="scroller"></div>
</template>

<script setup lang="ts">
  import AboutMe from './AboutMe.vue';

  import { onMounted } from 'vue';
  import { ScrollInfoPage } from '../modules/info-page-scroller';

  onMounted(() => {
    ScrollInfoPage()
  })
</script>

<style lang="scss" scoped>
  @use "../style/aboutme.scss" as *;
  
  .scroller {
    position: absolute;
    top: 0;
  }
</style>
