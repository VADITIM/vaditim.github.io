<template>
  <main class="app-container" ref="container">
    <IntroPage />
    <InfoPage />
    <WorkPage />
  </main>
</template>

<script setup lang="ts">
import IntroPage from './components/IntroPage.vue'
import InfoPage from './components/InfoPage.vue'
import WorkPage from './components/WorkPage.vue'

import { container, InitializeScrollSnap } from './modules/scroll-snapping'

InitializeScrollSnap();
</script>

<style scoped lang="scss">
@use "../src/style/variables.scss" as *;

.app-container>* {
  @extend .center;
}
</style>