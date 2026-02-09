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
import IntroPage from './components/Pages/Main/1 Intro Page/1-Intro-Page.vue';
import InfoPage from './components/Pages/Main/2 Info Page/2-Info-Page.vue';
import WorkPage from './components/Pages/Main/3 Work Page/3-Work-Page.vue';
import SectionBackgrounds from './components/Sections/Section-Color-Backgrounds.vue';
import Sections from './components/Sections/Sections-Display.vue';
import LoadingPage from './components/Pages/Main/LoadingPage.vue';

import { ref } from 'vue';

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