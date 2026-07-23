<template>
  <main class="app-container" ref="container">

    <template v-if="!isVertical" >
      <HardwareAccelerationNotice />
      <StartSection v-if="showLoadingPage && !hardwareNoticeActive" />
      <template v-if="!hardwareNoticeActive">
        <MagneticDots v-if="!isLiteMode" :isDisabled="activeProjectIndex !== null" />
        <SectionCoverSlice />
        <div
          v-for="(section, i) in SECTIONS"
          :key="section.id"
          :style="GetSection(i)"
        >
          <component :is="section.component" />
        </div>
        <!-- The shutter/label overlay is skipped wholesale in lite mode; the slice
             backgrounds still carry the transition. -->
        <SectionTransition v-if="!isLiteMode" />
        <Navigator />
        <SettingsPanel :revealed="!showLoadingPage" />
        <ClassifiedUnlockPopup />
      </template>
    </template>

    <template v-else>
      <StartSection v-if="showLoadingPage" />
      <div
        v-for="(section, i) in SECTIONS"
        :key="section.id"
        :style="GetSection(i)"
      >
        <component :is="section.component" />
      </div>
      <Navigator />
      <SettingsPanel :revealed="!showLoadingPage" />
      <ClassifiedUnlockPopup />
    </template>

    <StartTransition :show-loading-page="showLoadingPage" :container-element="container" :is-vertical="isVertical" />
    <UnlockScanSplash />

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
  import SettingsPanel from '@components/Misc/Settings-Panel.vue';
  import UnlockScanSplash from '@components/Misc/Unlock-Scan-Splash.vue';

  import { hardwareNoticeActive } from '@modules/miscHardwareNotice';
  import { isVertical } from '@modules/miscIsVertical';
  import { activeProjectIndex } from '@modules/sectionsProjects';
  import { registerDebugCacheClear } from '@modules/miscDebugCacheClear';
  import { startUnlockSession, stopUnlockSession } from '@modules/classifiedUnlockSession';
  import { recordHeatmapVisit } from '@modules/miscHeatmap';
  import { initializeReducedMotion } from '@modules/miscReducedMotion';
  import { applyLiteModeClass, isLiteMode } from '@modules/miscAnimationMode';

  setSectionCount(SECTIONS.length);
  applyLiteModeClass();

  document.documentElement.style.setProperty('--section-color', LOADING_COLOR);
  onSectionChange((current) => {
    document.documentElement.style.setProperty('--section-color', SECTIONS[current]?.color ?? LOADING_COLOR);
  });

  // Debug: skip the loading intro so vertical-layout iteration doesn't replay it
  // every reload. DEV-only; production always shows the intro. Flip to false to
  // see the intro while developing.
  const SKIP_LOADING_PAGE = import.meta.env.DEV;
  if (SKIP_LOADING_PAGE) finished.value = true;

  const container = ref<HTMLElement | null>(null);
  const showLoadingPage = ref(!SKIP_LOADING_PAGE);
  const hasInitialized = ref(false);
  const sectionHeightVh = 100;


  const { GetSectionLayerStyle: GetSection, cleanup: cleanupSectionLayerStyle } = CreateSectionLayerStyleController({
    lingerMs: 1500,
  });

  const cleanupDebugCacheClear = registerDebugCacheClear();
  const cleanupReducedMotion = initializeReducedMotion();

  // The phone that scans the QR loads this same page; it must not open a session of its own.
  if (!isVertical.value && !new URLSearchParams(window.location.search).has('unlock')) {
    void startUnlockSession();
  }

  void recordHeatmapVisit();

  onBeforeUnmount(() => {
    cleanupSectionLayerStyle();
    cleanupDebugCacheClear();
    cleanupReducedMotion();
    stopUnlockSession();
  });

  const tryInitializeApp = () => {
    if (hasInitialized.value || (!isVertical.value && hardwareNoticeActive.value) || !finished.value) return;
    PageAnimations(SECTIONS);
    hasInitialized.value = true;
    showLoadingPage.value = false;

    if (!isVertical.value) {
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
