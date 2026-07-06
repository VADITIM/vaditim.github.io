<template>
    <div class="section-background-layer">
      <div class="perks-back" :style="GetBackgroundStyle('perks-back')"></div>
      <div class="perks-front" :style="GetBackgroundStyle('perks-front')"></div>
      <div class="logs-back" :style="GetBackgroundStyle('logs-back')"></div>
      <div class="logs-front" :style="GetBackgroundStyle('logs-front')"></div>
      <div class="projects-back" :class="{active: activeProjectIndex !== null, 'no-transition': isProjectsTransitioning}" :style="GetBackgroundStyle('projects-back')"></div>
      <!-- Sits between the two slices in DOM order (all three share z-index 4)
           so it renders in front of the back slice but behind the front one. -->
      <canvas ref="projHelixRef" class="proj-helix"></canvas>
      <div class="projects-front" :class="{active: activeProjectIndex !== null, 'no-transition': isProjectsTransitioning}" :style="GetBackgroundStyle('projects-front')"></div>
      <div class="extra-tr"></div>
      <div class="extra-bl"></div>
      <div class="sandbox-tl"></div>
      <div class="sandbox-tr"></div>
      <div class="sandbox-bl"></div>
      <div class="sandbox-br"></div>
      <div class="classified-tl"></div>
      <div class="classified-br"></div>
    </div>
</template>

<script setup lang="ts" >
  import { onBeforeUnmount, onMounted, watch, ref, computed } from 'vue';
  import { ScrollBackgroundSections } from '@modules/sectionCoverSlices';
  import { activeProjectIndex } from '@modules/sectionsProjects';
  import { finished } from '@modules/sectionsStateMachine';
  import { dragOffset, dragDirection, isDragging, thresholdReached, consumeLastDragOffsetY } from '@modules/miscMobileDragNavigation';
  import { isMobile } from '@modules/miscIsMobile';
  import { currentSection, previousSection, isTransitioning } from '@modules/sectionsCore';
  import { initializeProjectHelixCanvas } from '@modules/miscProjectHelixCanvas';

  const projHelixRef = ref<HTMLCanvasElement | null>(null);

  // Horizontal DNA-strand backdrop for Projects, sandwiched between the
  // back/front slices above; purely decorative (see CLAUDE.md "Section
  // Backgrounds"). Rendered on its own canvas (see miscProjectHelixCanvas)
  // instead of per-strand DOM nodes, which were too heavy to composite.
  let cleanupHelixCanvas: (() => void) | null = null;

  onMounted(() => {
    if (projHelixRef.value) cleanupHelixCanvas = initializeProjectHelixCanvas(projHelixRef.value);
  });

  let CleanupBackgroundAnimations: (() => void) | null = null;
  const isReturning = ref(false);
  const returnTransform = ref('');

  const isProjectsTransitioning = computed(() => {
    return isTransitioning.value && (currentSection.value === 2 || previousSection.value === 2);
  });

  const GetBackgroundStyle = (type: string) => {
    const activeSectionIndex = isTransitioning.value ? previousSection.value : currentSection.value;
    
    const isInteractiveSection =
      ((type === 'perks-back' || type === 'perks-front') && activeSectionIndex === 0) ||
      ((type === 'logs-back' || type === 'logs-front') && activeSectionIndex === 1) ||
      ((type === 'projects-back' || type === 'projects-front') && activeSectionIndex === 2)

    if (!isInteractiveSection) return {}

    if (isReturning.value) {
      return {
        transform: returnTransform.value,
        transition: 'transform 0.3s ease-out'
      }
    }

    if (isMobile.value && dragDirection.value) {
      const offsetAmount = dragDirection.value === 'down' ? dragOffset.value * -0.5 : dragOffset.value * 0.5
      const scaleAmount = thresholdReached.value ? 1.05 : 1
      const popYTransform = thresholdReached.value ? -10 : 0

      return {
        transform: `translateY(${offsetAmount + popYTransform}px) scale(${scaleAmount})`,
        transition: thresholdReached.value ? '0.15s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none'
      }
    }

    return {}
  }

  watch(isDragging, (newVal) => {
    if (!newVal) {
      isReturning.value = true
      
      const lastOffset = consumeLastDragOffsetY()
      const popscale = thresholdReached.value ? 1.05 : 1
      returnTransform.value = lastOffset ? `translateY(${lastOffset}px) scale(${popscale})` : `translateY(0) scale(${popscale})`

      requestAnimationFrame(() => {
        returnTransform.value = 'translateY(0) scale(1)'
      })

      setTimeout(() => {
        isReturning.value = false
        returnTransform.value = ''
      }, 300)
    }
  })

  watch(finished, (isFinished) => {
    if (isFinished && !CleanupBackgroundAnimations) {
      CleanupBackgroundAnimations = ScrollBackgroundSections();
    }
  });

  onBeforeUnmount(() => {
    if (CleanupBackgroundAnimations) {
      CleanupBackgroundAnimations();
      CleanupBackgroundAnimations = null;
    }
    cleanupHelixCanvas?.();
    cleanupHelixCanvas = null;
  });
</script>

<style lang="scss">
  @use "@styleVariables" as *;

  .section-background-layer {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  .perks-front {
    position: absolute;
    top: 0;
    left: -30%;
    width: 30%;
    height: 110vh;
    background: linear-gradient(180deg,rgba(255, 221, 27, 1) 0%, rgba(102, 89, 22, 1) 100%);
    clip-path: polygon(0 0, 100% 0, 10% 100%, 0% 100%);
    z-index: 2;

    @include allMobile {
      left: 0;
      top: 100%;
      width: 100vw;
      height: 150dvh;
      background: linear-gradient(360deg,rgba(255, 221, 27, 1) 0%, rgba(102, 89, 22, 1) 100%);
      clip-path: polygon(0 0, 100% 0, 100% 80%, 0 68%);
      border-radius: 30px 30px 0 0;
    }
  }

  .perks-back {
    position: absolute;
    top: 0;
    left: -30%;
    width: 30%;
    height: 110vh;
    background: linear-gradient(180deg, rgba(153, 132, 16, 1) 15%, rgba(255, 221, 27, 1) 85%);
    clip-path: polygon(0 0, 19% 0, 83% 100%, 0 100%);
    z-index: 1;

    @include allMobile {
      left: 0;
      top: 100%;
      width: 100vw;
      height: 150dvh;
      background: linear-gradient(360deg, rgba(153, 132, 16, 1) 15%, rgba(255, 221, 27, 1) 85%);
      clip-path: polygon(0 0, 100% 0, 100% 54%, 0 80%);
      border-radius: 30px 30px 0 0;
    }
  }

  .logs-front {
    position: absolute;
    left: -30%;
    width: 30%;
    height: 110vh;
    background: linear-gradient(180deg,rgba(17, 56, 89, 1) 15%, rgba(0, 64, 255, 1) 85%);
    clip-path: polygon(0 0, 100% 0, 10% 100%, 0% 100%);
    z-index: 2;

    @include tablet {
      width: 20%;
    }

    @include allMobile {
      left: 0;
      top: 100%;
      width: 100vw;
      height: 150dvh;
      background: linear-gradient(180deg,rgba(17, 56, 89, 1) 15%, rgba(0, 64, 255, 1) 85%);
      clip-path: polygon(0 0, 100% 0, 100% 62%, 0 80%);
      border-radius: 30px 30px 0 0;
    }
  }

  .logs-back {
    position: absolute;
    left: -30%;
    width: 30%;
    height: 110vh;
    background-color: rgb(24, 24, 177);
    background: linear-gradient(180deg,#001eff 15%, rgba(17, 56, 89, 1) 85%);
    clip-path: polygon(0 0, 19% 0, 83% 100%, 0 100%);
    z-index: 2;

    @include tablet {
      width: 30%;
    }

    @include allMobile {
      left: 0;
      top: 100%;
      width: 100vw;
      height: 150dvh;
      background: linear-gradient(180deg,rgb(13, 40, 62) 15%, rgba(0, 64, 255, 1) 85%);
      clip-path: polygon(0 0, 100% 0, 100% 80%, 0 54%);
      border-radius: 30px 30px 0 0;
    }
  }

  .projects-back {
    position: absolute;
    right: -40%;
    width: 25%;
    height: 100vh;
    background-color: rgb(134, 12, 12);
    background: linear-gradient(180deg,rgba(51, 8, 8, 1) 21%, rgba(102, 14, 14, 1) 80%, rgba(134, 12, 12, 1) 100%);
    clip-path: polygon(100% 0, 100% 0, 100% 100%, 0 100%);
    z-index: 4;

    transition: 
      $backgroundTransitionTime all ease-out;
    
    &.active {
      width: 40%;

      transition: 
        .4s all;
    }

    &.no-transition {
      transition: none !important;
    }

    @include allMobile {
      left: 0;
      top: 100%;
      width: 100vw;
      height: 150dvh;
      background: linear-gradient(180deg,rgb(93, 26, 40) 15%, rgba(163, 9, 38, 1) 85%);
      border-radius: 30px 30px 0 0;
      clip-path: polygon(0 0, 100% 0, 100% 33%, 0 80%);

    }
  }

  .projects-front {
    position: absolute;
    right: -40%;
    width: 25%;
    height: 100vh;
    background-color: $red;
    background: linear-gradient(180deg,rgba(105, 17, 34, 1) 21%, rgba(153, 9, 38, 1) 55%, rgba(220, 20, 60, 1) 100%);
    clip-path: polygon(0 0, 100% 0, 100% 100%, 81% 100%);
    z-index: 4;

    transition: 
      $backgroundTransitionTime all ease-out;
    
    &.active {
      width: 35%;
      
      transition: 
        .5s all .2s;
    }

    &.no-transition {
      transition: none !important;
    }

    @include allMobile {
      left: 0;
      top: 100%;
      width: 100vw;
      height: 150dvh;
      background: linear-gradient(180deg,rgba(105, 17, 34, 1) 15%, rgba(163, 9, 38, 1) 85%);
      border-radius: 30px 30px 0 0;
      clip-path: polygon(0 0, 100% 0, 100% 80%, 0 60%);

    }
  }

  // ── horizontal DNA-strand backdrop (Projects) ──
  // Centred on the viewport and overspilling both edges so the rotating
  // strands never show a hard clip at the section's sides. A canvas; the
  // strand geometry, opacity fades, and dot glow are all drawn by
  // miscProjectHelixCanvas; only placement lives here. Tall enough for the
  // dots' widest perspective swing (~±200px around the strand centre).
  .proj-helix {
    position: absolute;
    top: 30%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 130vw;
    height: 440px;
    z-index: 4;
    pointer-events: none;
  }

  // Corner slices; top-right drops in from the top, bottom-left rises from
  // the bottom (see CLAUDE.md Current Task 6).
  .extra-tr {
    position: absolute;
    top: -40%;
    right: 0;
    width: 15vw;
    height: 36vh;
    background: linear-gradient(160deg, rgba(240, 155, 58, 1) 0%, rgba(74, 43, 8, 1) 100%);
    clip-path: polygon(0 0, 100% 0, 100% 100%);
    z-index: 4;
    will-change: top;

    @include allMobile {
      left: 0;
      right: auto;
      top: 100%;
      width: 100vw;
      height: 150dvh;
      background: linear-gradient(180deg, rgb(92, 55, 12) 15%, rgba(178, 104, 24, 1) 85%);
      border-radius: 30px 30px 0 0;
      clip-path: polygon(0 0, 100% 0, 100% 33%, 0 80%);
    }
  }

  .extra-bl {
    position: absolute;
    bottom: -40%;
    left: 0;
    width: 15vw;
    height: 30vh;
    background: linear-gradient(-20deg, rgba(240, 155, 58, 1) 0%, rgba(74, 43, 8, 1) 100%);
    clip-path: polygon(0 0, 0 100%, 100% 100%);
    z-index: 4;
    will-change: bottom;

    @include allMobile {
      left: 0;
      top: 100%;
      bottom: auto;
      width: 100vw;
      height: 150dvh;
      background: linear-gradient(180deg, rgba(120, 70, 16, 1) 15%, rgba(240, 155, 58, 1) 85%);
      border-radius: 30px 30px 0 0;
      clip-path: polygon(0 0, 100% 0, 100% 80%, 0 60%);
    }
  }

  // Sandbox corner accents; top corners drop from the top, bottom corners
  // rise from the bottom, same rule as the extra slices above.
  .sandbox-tl {
    position: absolute;
    top: -40%;
    left: 0;
    width: 10vw;
    height: 32vh;
    background: linear-gradient(200deg, rgba(91, 253, 91, 1) 0%, rgba(30, 90, 30, 1) 100%);
    clip-path: polygon(0 0, 100% 0, 0 100%);
    z-index: 4;
    will-change: top;

    @include allMobile {
      width: 16vw;
      height: 18vh;
    }
  }

  .sandbox-tr {
    position: absolute;
    top: -40%;
    right: 0;
    width: 15vw;
    height: 36vh;
    background: linear-gradient(200deg, rgba(91, 253, 91, 1) 0%, rgba(30, 90, 30, 1) 100%);
    clip-path: polygon(0 0, 100% 0, 100% 100%);
    z-index: 4;
    will-change: top;

    @include allMobile {
      width: 22vw;
      height: 20vh;
    }
  }

  .sandbox-bl {
    position: absolute;
    bottom: -40%;
    left: 0;
    width: 15vw;
    height: 30vh;
    background: linear-gradient(-20deg, rgba(91, 253, 91, 1) 0%, rgba(30, 90, 30, 1) 100%);
    clip-path: polygon(0 0, 0 100%, 100% 100%);
    z-index: 4;
    will-change: bottom;

    @include allMobile {
      width: 22vw;
      height: 17vh;
    }
  }

  .sandbox-br {
    position: absolute;
    bottom: -40%;
    right: 0;
    width: 11vw;
    height: 20vh;
    background: linear-gradient(20deg, rgba(91, 253, 91, 1) 0%, rgba(30, 90, 30, 1) 100%);
    clip-path: polygon(100% 0, 100% 100%, 0 100%);
    z-index: 4;
    will-change: bottom;

    @include allMobile {
      width: 16vw;
      height: 12vh;
    }
  }

  // Classified section corner accents; desktop only for now (mobile paths are
  // frozen; see CLAUDE.md). Hidden by default via top/bottom offset so they
  // stay off-screen even before JS runs.
  .classified-tl {
    position: absolute;
    top: -40%;
    left: 0;
    width: 12vw;
    height: 34vh;
    background: linear-gradient(200deg, rgba(138, 43, 226, 1) 0%, rgba(45, 12, 74, 1) 100%);
    clip-path: polygon(0 0, 100% 0, 0 100%);
    z-index: 4;
    will-change: top;
  }

  .classified-br {
    position: absolute;
    bottom: -40%;
    right: 0;
    width: 12vw;
    height: 34vh;
    background: linear-gradient(20deg, rgba(138, 43, 226, 1) 0%, rgba(45, 12, 74, 1) 100%);
    clip-path: polygon(100% 0, 100% 100%, 0 100%);
    z-index: 4;
    will-change: bottom;
  }
</style>