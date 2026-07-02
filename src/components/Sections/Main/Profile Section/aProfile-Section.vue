<template>
  <div class="profile-section-container">
      <!-- Desktop (>= smallDesktop): wireframe cubes + corner labels -->
      <Cubes />
      <LabelSet class="profile-labels-desktop-only" :labels="profileLabels" section-id="profile" accent="#3664fc" />
      <!-- Mobile (< smallDesktop): the original rotated card stack -->
      <Cards class="cards-mobile-only" />
    </div>
</template>

<script setup lang="ts">
  import Cubes from '@profile/Profile-Cubes.vue';
  import Cards from '@profile/Profile-Cards.vue';
  import LabelSet from '@components/Misc/Label-Set.vue';
  import type { CSSProperties } from 'vue';

  const profileLabels: { text: string; pos: CSSProperties; wrap?: boolean }[] = [
    { text: 'CRAFTED\nWITH INTENT', pos: { top: '8%', left: '20%' } },
    { text: 'BUILT TO\nCAPTIVATE',       pos: { top: '8%', right: '10%', textAlign: 'right' } },
    { text: 'EXPERIENCE DESIGN', pos: { bottom: '2%', left: '15%' }, wrap: true },
  ];
</script>

<style lang="scss" scoped>
  @use "@styleVariables" as *;

  .profile-labels-desktop-only {
    @include allMobile {
      display: none;
    }
  }

  .profile-section-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    transform: translateY(-100vh);
    overflow: hidden;
  }
</style>
