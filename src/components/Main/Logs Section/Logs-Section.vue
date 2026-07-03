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
