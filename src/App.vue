<!-- 
1280 x 720
tabletland 1180 x 820
tablet 820 x 1180

-->

<template>
  <main class="app-container" ref="container">
    <IntroPage />
    <InfoPage />
    <WorkPage />
  </main>
</template>

<script setup lang="ts">
import IntroPage from './components/Intro-Page/IntroPage.vue'
import InfoPage from './components/Info-Page/InfoPage.vue'
import WorkPage from './components/Work-Page/WorkPage.vue'

// import { container, InitializeScrollSnap } from './modules/scroll-snapping'

// InitializeScrollSnap();
</script>

<style scoped lang="scss">
@use "./style/variables.scss" as *;

.app-container>* {
  @extend .center;

  @include mobile {
    overflow-x: hidden;
    overflow-y: visible;
  }

  @include allTablets {
    overflow-x: hidden;
    overflow-y: visible; 
  }
}
</style>