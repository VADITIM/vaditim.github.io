<template>
  <main class="app-container" ref="container">

    <template v-if="!isMobile" >
      <HardwareAccelerationNotice />
      <StartSection v-if="showLoadingPage && !hardwareNoticeActive" />
      <template v-if="!hardwareNoticeActive">
        <MagneticDots :isDisabled="activeProjectIndex !== null" />
        <SectionCoverSlice />
        <div
          v-for="(section, i) in SECTIONS"
          :key="section.id"
          :style="GetSection(i)"
        >
          <component :is="section.component" />
        </div>
        <SectionTransition />
        <Navigator />
        <ClassifiedUnlockPopup />
      </template>
    </template>

    <template v-else>
      <StartSection v-if="showLoadingPage" />
      <Navigator />
      <SectionCoverSlice />
    </template>

    <StartTransition :show-loading-page="showLoadingPage" :container-element="container" :is-mobile="isMobile" />

  </main>
</template>

<script setup lang="ts">

  import { nextTick, onBeforeUnmount, ref, watch } from 'vue';

  import { SECTIONS, LOADING_COLOR } from '@modules/sectionsRegistry';
  import { onSectionChange } from '@modules/sectionsCore';
  import { PageAnimations } from '@modules/animationHandler';
  import { InitializeVirtualScroll, unlockScroll } from '@modules/miscVirtualScroll';
  import { finished, CreateSectionLayerStyleController } from '@modules/sectionsStateMachine';
  import { setSectionCount } from '@modules/sectionsCore';

  import StartSection from '@components/Main/Landing Section/Start-Section.vue';
  import SectionCoverSlice from '@components/Misc/Section-Cover-Slice.vue';
  import Navigator from '@components/Misc/Navigator.vue';
  import StartTransition from '@components/Misc/Start-Transition.vue';
  import HardwareAccelerationNotice from '@components/Misc/Hardware-Acceleration-Notice.vue';
  import MagneticDots from '@components/Misc/Magnetic-Dots.vue';
  import SectionTransition from '@components/Misc/Section-Transition.vue';
  import ClassifiedUnlockPopup from '@components/Misc/Classified-Unlock-Popup.vue';

  import { hardwareNoticeActive } from '@modules/miscHardwareNotice';
  import { isMobile } from '@modules/miscIsMobile';
  import { activeProjectIndex } from '@modules/sectionsProjects';
  import { registerDebugCacheClear } from '@modules/miscDebugCacheClear';

  setSectionCount(SECTIONS.length);

  document.documentElement.style.setProperty('--section-color', LOADING_COLOR);
  onSectionChange((current) => {
    document.documentElement.style.setProperty('--section-color', SECTIONS[current]?.color ?? LOADING_COLOR);
  });

  const container = ref<HTMLElement | null>(null);
  const showLoadingPage = ref(true);
  const hasInitialized = ref(false);
  const sectionHeightVh = 100;


  const { GetSectionLayerStyle: GetSection, cleanup: cleanupSectionLayerStyle } = CreateSectionLayerStyleController({
    lingerMs: 1500,
  });

  const cleanupDebugCacheClear = registerDebugCacheClear();

  onBeforeUnmount(() => {
    cleanupSectionLayerStyle();
    cleanupDebugCacheClear();
  });

  const tryInitializeApp = () => {
    if (hasInitialized.value || (!isMobile.value && hardwareNoticeActive.value) || !finished.value) return;
    PageAnimations(SECTIONS);
    hasInitialized.value = true;
    showLoadingPage.value = false;

    if (!isMobile.value) {
      InitializeVirtualScroll(SECTIONS.length, sectionHeightVh);
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
    background-color: #181818;
    user-select: none
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
