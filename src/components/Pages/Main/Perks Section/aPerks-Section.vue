<template>
  <Name />
  <Roles />
  <div class="perks-section-trigger"></div>
  <div class="wip">WIP</div>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue';
  import Roles from '@perks/Perks-Perks-Display.vue'
  import Name from '@perks/Perks-Name.vue'
  import { PerksAnimationDesktop } from '@modules/animations/Desktop/Perks-Animation-Handler';

  onMounted(() => {
    PerksAnimationDesktop();
  })
</script>

<style lang="scss" scoped>
  @use "@styleVariables" as *;

  .perks-section-trigger {
    position: absolute;
    bottom: 0;
  }

  .wip {
    position: fixed;
    bottom: 1%;
    right: 1%;
    width: 100px;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 2rem;
    font-family: "Cutive";
    z-index: 1000;
  }
</style>
