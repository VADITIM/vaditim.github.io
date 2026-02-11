<!-- 
1280 x 720
tabletland 1180 x 820
tablet 820 x 1180 -->

<template>
  <main class="app-container" ref="container">
    <!-- <LoadingPage v-if="showLoadingPage" /> -->
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
import { PageAnimations } from './modules/animations/animation-handler';

import { onBeforeUnmount, onMounted, ref } from 'vue';
import { destroyVirtualScroll, initVirtualScroll } from './modules/virtual-scroll';

const showLoadingPage = ref(true);

onMounted(() => {
  initVirtualScroll(3);
  PageAnimations();
});

onBeforeUnmount(() => {
  destroyVirtualScroll();
});

onMounted(() => {
  setTimeout(() => {
    showLoadingPage.value = false;
  }, 3000);
});

</script>

<style scoped lang="scss">
@use "./style/variables.scss" as *;

.app-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

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

  @include allDesktops {
    overflow-x: visible;
    overflow-y: visible;
  }
}
</style>