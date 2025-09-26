<template>
  <IntroBackground />
  <Name />
  <Roles />
  <div class="scroller"></div>
</template>

<script setup lang="ts">
  import Roles from './Roles.vue'
  import Name from './Name.vue'

  import { onMounted } from 'vue';
  import { ScrollIntroPage } from '../../modules/intro-page-background-scroller';
  import { IntroPageAnimations } from '../../modules/animations/intro-page-animations';
  import IntroBackground from './IntroBackground.vue';

  onMounted(() => {
    IntroPageAnimations();
    ScrollIntroPage();
  })
</script>

<style lang="scss" scoped>
</style>
