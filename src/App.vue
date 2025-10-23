<!-- 
1280 x 720
tabletland 1180 x 820
tablet 820 x 1180 -->

<template>
  <main class="app-container" ref="container">
    <LoadingPage v-if="showLoadingPage" />
    <SectionBackgrounds />
    <IntroPage />
    <InfoPage />
    <WorkPage />
    <Sections />
  </main>
</template>

<script setup lang="ts">
import IntroPage from './components/Intro-Page/IntroPage.vue'
import InfoPage from './components/Info-Page/InfoPage.vue'
import WorkPage from './components/Work-Page/WorkPage.vue'
import SectionBackgrounds from './components/SectionBackgrounds.vue';
import Sections from './components/Sections.vue';
import LoadingPage from './components/LoadingPage.vue';

import { ref, onMounted } from 'vue';

const showLoadingPage = ref(true);

// onMounted(() => {
//   setTimeout(() => {
//     showLoadingPage.value = false;
//   }, 3000);
// });

// import { container, InitializeScrollSnap } from './modules/scroll-snapping'

// InitializeScrollSnap();
</script>

<style scoped lang="scss">
@use "./style/variables.scss" as *;

.app-container>* {
  @extend .center;

  @include mobile {
    overflow-x: clip;
    overflow-y: visible;
  }

  @include allTablets {
    overflow-x: clip;
    overflow-y: visible;
  }
}
</style>