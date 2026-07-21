<template>
  <!-- Both halves of the section share one flexbox so their sizes are
       resolved against each other (not two independently-guessed absolute
       percentages) — the only way to guarantee no overlap at every width. -->
  <div class="perks-frame">
    <div class="perks-layout">
      <PerksSkills />
      <Name />
    </div>
  </div>
</template>

<script setup lang="ts">
  import Name from '@components/Main/Perks Section/Name.vue'
  import PerksSkills from '@components/Main/Perks Section/Perks-Skills.vue'
</script>

<style scoped lang="scss">
  // Section layer wrappers collapse to 0 height; this re-establishes the
  // full-viewport coordinate space and is what gives the Perks section its
  // 100vh height — every later section compensates its own position with
  // translateY(-100vh) assuming this wrapper is full-height, so it must stay
  // position: relative, not absolute.
  .perks-frame {
    position: relative;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
  }

  .perks-layout {
    position: absolute;
    inset: 0;
    z-index: 4;
    display: flex;
    align-items: center;
    justify-content: space-between;
    // Mirrors the Nav's reserved right-most 23rem + 2.2rem (see
    // Navigator.vue) so the name never runs under it, trimmed down from the
    // wider clearance the old absolute layout needed — space-between here
    // already keeps the name off the crystal, so it can sit closer to the nav.
    padding: 0 calc(11% + 6vw) 0 3vw;
    pointer-events: none;
  }
</style>
