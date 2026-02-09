<template>
  <Name />
  <Roles />
  <div class="intro-scroller"></div>
  <div class="wip">WIP</div>
</template>

<script setup lang="ts">
  import Roles from './Intro-Perks.vue'
  import Name from './Intro-Name.vue'

  import { onMounted } from 'vue';
  import { IntroPageAnimations } from '../../../../modules/animations/intro-page-animations';

  onMounted(() => {
    IntroPageAnimations();
  })
</script>

<style lang="scss" scoped>
  @use "../../../../style/variables.scss" as *;

  .intro-scroller {
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
