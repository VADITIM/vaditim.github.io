<template>
  <main class="app-container" ref="container">
    
    <template v-if="!isMobile" >
      <HardwareAccelerationNotice />
      <LoadingPage v-if="showLoadingPage && !hardwareNoticeActive" />
      <template v-if="!hardwareNoticeActive">
        <SectionBackgrounds />
        <div :style="GetSection(0)"><PerksPage /></div>
        <div :style="GetSection(2)"><ProjectsPage /></div>
        <div :style="GetSection(1)"><ProfilePage /></div>
        <SectionsDisplay />
      </template>
    </template>
    
    <template v-else>
      <LoadingPage v-if="showLoadingPage" />
      <SectionsDisplay />
      <SectionBackgrounds />
      <!-- <div :style="GetSection(0)"><PerksPage /></div> -->
      <!-- <div :style="GetSection(1)"><ProfilePage /></div> -->
      <!-- <div :style="GetSection(2)"><ProjectsPage /></div> -->
    </template>

  </main>
</template>

<script setup lang="ts">

  import { nextTick, onBeforeUnmount, ref, watch } from 'vue';

  import { PageAnimations } from '@modules/animations/animation-handler';
  import { InitializeVirtualScroll, unlockScroll } from '@modules/Misc/virtual-scroll';
  import { finished, CreateSectionLayerStyleController } from '@modules/Sections/section-state-machine';

  import LoadingPage from '@components/Pages/Main/Loading Section/LoadingPage.vue';
  import PerksPage from '@perks/aPerks-Section.vue';
  import ProfilePage from '@profile/aProfile-Section.vue';
  import ProjectsPage from '@projects/aProjects-Section.vue';

  import SectionBackgrounds from '@sections/Section-Background-Display.vue';
  import SectionsDisplay from '@sections/Sections-State-Display.vue';


  import HardwareAccelerationNotice from '@components/Misc/Hardware-Acceleration-Notice.vue';
  import { hardwareNoticeActive } from '@modules/Misc/hardware-notice';
  import { isMobile } from '@modules/Misc/is-mobile';

  const showLoadingPage = ref(true);
  const hasInitialized = ref(false);
  const sectionHeightVh = 100;


  const { GetSectionLayerStyle: GetSection, cleanup: cleanupSectionLayerStyle } = CreateSectionLayerStyleController({
    lingerMs: 1500,
  });

  onBeforeUnmount(() => {
    cleanupSectionLayerStyle();
  });

  const tryInitializeApp = () => {
    if (hasInitialized.value || (!isMobile.value && hardwareNoticeActive.value) || !finished.value) return;
    PageAnimations();
    hasInitialized.value = true;
    showLoadingPage.value = false;
    
    if (!isMobile.value) {
      InitializeVirtualScroll(3, sectionHeightVh);
    }
  };

  watch(
    hardwareNoticeActive,
    async (isActive) => {
      if (isActive || hasInitialized.value) return;
      await nextTick();
      tryInitializeApp();
    },
    { immediate: true, flush: 'post' }
  );

  watch(
    finished,
    (isFinished) => {
      if (!isFinished) return;
      tryInitializeApp();
      unlockScroll();
    }
  );
</script>

<style scoped lang="scss">
  @use "@styleVariables" as *;

  .app-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    overscroll-behavior: none;
  }

  .app-container>* {
    @extend .center;

    @include mobile {
      overflow-x: clip;
      overflow-y: visible;
      overscroll-behavior: none;
    }

    @include desktop {
      overflow-x: visible;
      overflow-y: visible;
    }
  }
</style>