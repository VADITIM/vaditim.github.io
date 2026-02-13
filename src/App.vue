<template>
  <main class="app-container" ref="container">
    <MobileNotice />
    <HardwareAccelerationNotice />
    <LoadingPage v-if="showLoadingPage && !hardwareNoticeActive" />
    <template v-if="!hardwareNoticeActive">
      <SectionBackgrounds />
      <PerksPage :style="{ zIndex: currentSection === 0 ? 1 : 0, position: 'relative', pointerEvents: currentSection === 0 ? 'auto' : 'none' }" />
      <ProjectsPage :style="{ zIndex: currentSection === 2 ? 1 : 0, position: 'relative', pointerEvents: currentSection === 2 ? 'auto' : 'none' }" />
      <ProfilePage :style="{ zIndex: currentSection === 1 ? 1 : 0, position: 'relative', pointerEvents: currentSection === 1 ? 'auto' : 'none' }" />
      <SectionsDisplay />
    </template>
  </main>
</template>

<script setup lang="ts">

  import { nextTick, ref, watch } from 'vue';

  import { currentSection } from '@modules/sections';
  import { PageAnimations } from '@modules/animations/animation-handler';
  import { InitializeVirtualScroll } from '@modules/virtual-scroll';

  import PerksPage from '@perks/aPerks-Section.vue';
  import ProfilePage from '@profile/aProfile-Section.vue';
  import ProjectsPage from '@projects/aProjects-Section.vue';

  import SectionBackgrounds from '@sections/Section-Background-Display.vue';
  import SectionsDisplay from '@sections/Sections-State-Display.vue';

  import LoadingPage from '@components/Pages/Main/LoadingPage.vue';

  import HardwareAccelerationNotice from '@components/Hardware-Acceleration-Notice.vue';
  import { hardwareNoticeActive } from '@modules/hardware-notice';
  import MobileNotice from '@components/Mobile-Notice.vue';

  const showLoadingPage = ref(true);
  const hasInitialized = ref(false);

  const initializeApp = () => {
    if (hasInitialized.value) return;

    InitializeVirtualScroll(3);
    PageAnimations();
    hasInitialized.value = true;

    setTimeout(() => {
      showLoadingPage.value = false;
    }, 3000);
  };

  watch(
    hardwareNoticeActive,
    async (isActive) => {
      if (isActive || hasInitialized.value) return;
      await nextTick();
      initializeApp();
    },
    { immediate: true, flush: 'post' }
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