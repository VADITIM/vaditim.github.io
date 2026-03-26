<template>
  <main class="app-container" ref="container">
    <MobileNotice />
    <HardwareAccelerationNotice />
    <LoadingPage v-if="showLoadingPage && !hardwareNoticeActive" />
    <template v-if="!hardwareNoticeActive">
      <SectionBackgrounds />
      <div :style="{ zIndex: currentSection === 0 ? 1 : 0, position: 'relative', pointerEvents: currentSection === 0 ? 'auto' : 'none' }"><PerksPage /></div>
      <div :style="{ zIndex: currentSection === 2 ? 1 : 0, position: 'relative', pointerEvents: currentSection === 2 ? 'auto' : 'none' }"><ProjectsPage /></div>
      <div :style="{ zIndex: currentSection === 1 ? 1 : 0, position: 'relative', pointerEvents: currentSection === 1 ? 'auto' : 'none' }"><ProfilePage /></div>
      <SectionsDisplay />
    </template>
  </main>
</template>

<script setup lang="ts">

  import { nextTick, ref, watch } from 'vue';

  import { currentSection } from '@modules/sections';
  import { PageAnimations } from '@modules/animations/animation-handler';
  import { InitializeVirtualScroll, unlockScroll } from '@modules/virtual-scroll';
  import { finished } from '@modules/animations/section-state-machine';

  import LoadingPage from '@components/Pages/Main/LoadingPage.vue';
  import PerksPage from '@perks/aPerks-Section.vue';
  import ProfilePage from '@profile/aProfile-Section.vue';
  import ProjectsPage from '@projects/aProjects-Section.vue';

  import SectionBackgrounds from '@sections/Section-Background-Display.vue';
  import SectionsDisplay from '@sections/Sections-State-Display.vue';


  import HardwareAccelerationNotice from '@components/Misc/Hardware-Acceleration-Notice.vue';
  import { hardwareNoticeActive } from '@modules/hardware-notice';
  import MobileNotice from '@components/Misc/Mobile-Notice.vue';

  const showLoadingPage = ref(true);
  const hasInitialized = ref(false);
  const sectionHeightVh = 100;

  const tryInitializeApp = () => {
    if (hasInitialized.value || hardwareNoticeActive.value || !finished.value) return;


    InitializeVirtualScroll(3, sectionHeightVh);
    PageAnimations();
    hasInitialized.value = true;

    showLoadingPage.value = false;
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
  }

  .app-container>* {
    @extend .center;

    @include mobile {
      overflow-x: clip;
      overflow-y: visible;
    }

    @include desktop {
      overflow-x: visible;
      overflow-y: visible;
    }
  }
</style>