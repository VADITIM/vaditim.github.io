<template>
  <div class="logs-section-container">
      <!-- Desktop (>= smallDesktop): wireframe cubes + corner labels -->
      <Cubes />
      <LabelSet class="logs-labels-desktop-only" :labels="logsLabels" section-id="logs" accent="#3664fc" />
      <!-- Mobile (< smallDesktop): the original rotated card stack -->
      <Cards class="cards-mobile-only" />
    </div>
</template>

<script setup lang="ts">
  import Cubes from '@components/Main/Logs Section/Cubes.vue';
  import Cards from '@components/Main/Logs Section/Cards.vue';
  import LabelSet from '@components/Misc/Label-Set.vue';
  import type { CSSProperties } from 'vue';

  const logsLabels: { text: string; pos: CSSProperties; wrap?: boolean }[] = [
    { text: 'CRAFTED WITH INTENT', pos: { top: '8%', left: '20%' }, wrap: true },
    { text: 'BUILT TO CAPTIVATE',       pos: { top: '8%', right: '10%', textAlign: 'right' }, wrap: true },
    { text: 'EXPERIENCE DESIGN', pos: { bottom: '8%', left: '15%' }, wrap: true },
  ];
</script>

<style lang="scss" scoped>
  @use "@styleVariables" as *;

  .logs-labels-desktop-only {
    // Hidden only on the frozen small-landscape phone path; shown on desktop and
    // on the vertical (portrait) layout. `vertical` is declared after `allMobile`
    // in variables.scss, so on a portrait phone (which matches both) it wins.
    @include allMobile {
      display: none;
    }
    @include vertical {
      display: block;
    }

    // Vertical overlay placement: one label up top, the other two flanking the
    // bottom corners, over the cube stack. inset (!important) overrides the
    // desktop inline `pos`; values are viewport-proportional.
    @include vertical {
      :deep(.pc-label) {
        &:nth-child(1) { inset: 4vh auto auto 6vw !important; text-align: left; }
        &:nth-child(2) { inset: auto 6vw 9vh auto !important; text-align: right; }
        &:nth-child(3) { inset: auto auto 9vh 6vw !important; text-align: left; }
      }
    }
  }

  // Mobile now uses the wireframe cubes (stacked vertically), so the old rotated
  // card stack is retired on phones too.
  .cards-mobile-only {
    @include allMobile {
      display: none;
    }
  }

  .logs-section-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    transform: translateY(-100vh);
    overflow: hidden;
  }
</style>
