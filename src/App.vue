<template>
  <main class="app-container" ref="container">

    <template v-if="!isMobile" >
      <HardwareAccelerationNotice />
      <LandingSection v-if="showLoadingPage && !hardwareNoticeActive" />
      <template v-if="!hardwareNoticeActive">
        <MagneticDots :isDisabled="activeProjectIndex !== null" />
        <SectionBackgrounds />
        <div
          v-for="(section, i) in SECTIONS"
          :key="section.id"
          :style="GetSection(i)"
        >
          <component :is="section.component" />
        </div>
        <SectionTransition />
        <SectionsDisplay />
      </template>
    </template>

    <template v-else>
      <LandingSection v-if="showLoadingPage" />
      <SectionsDisplay />
      <SectionBackgrounds />
    </template>

    <ExploreFullscreenToggle :show-loading-page="showLoadingPage" :container-element="container" :is-mobile="isMobile" />

  </main>
</template>

<script setup lang="ts">

  import { nextTick, onBeforeUnmount, ref, watch } from 'vue';

  import { SECTIONS, LOADING_COLOR } from '@modules/Sections/section-registry';
  import { onSectionChange } from '@modules/Sections/sections';
  import { PageAnimations } from '@modules/animations/animation-handler';
  import { InitializeVirtualScroll, unlockScroll } from '@modules/Misc/virtual-scroll';
  import { finished, CreateSectionLayerStyleController } from '@modules/Sections/section-state-machine';
  import { setSectionCount } from '@modules/Sections/sections';

  import LandingSection from '@components/Sections/Main/Landing Section/LandingSection.vue';
  import SectionBackgrounds from '@components/Misc/Section-Background-Display.vue';
  import SectionsDisplay from '@components/Misc/Sections-State-Display.vue';
  import ExploreFullscreenToggle from '@components/Misc/Explore-Fullscreen-Toggle.vue';
  import HardwareAccelerationNotice from '@components/Misc/Hardware-Acceleration-Notice.vue';
  import MagneticDots from '@components/Misc/Magnetic-Dots.vue';
  import SectionTransition from '@components/Misc/Section-Transition.vue';

  import { hardwareNoticeActive } from '@modules/Misc/hardware-notice';
  import { isMobile } from '@modules/Misc/is-mobile';
  import { activeProjectIndex } from '@modules/Sections/Projects Section/projects';

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

  onBeforeUnmount(() => {
    cleanupSectionLayerStyle();
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
