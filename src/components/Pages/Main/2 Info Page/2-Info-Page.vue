<template>
  <div class="info-page-container">
    <Cards />
    <Contact />
    <div class="info-scroller-top"></div>
    <div class="info-scroller-bottom"></div>
  </div>
</template>

<script setup lang="ts">
  import Cards from './Info-Cards.vue';

  import { onMounted } from 'vue';
  import { InfoPageAnimations } from '../../../../modules/animations/info-page-animations';
  import { InfoPageAnimationsOut } from '../../../../modules/animations/info-page-animations-out';
  import Contact from './Info-Contact.vue';

  onMounted(() => {
    InfoPageAnimations();
    InfoPageAnimationsOut();
  })
</script>

<style lang="scss" scoped>
  .info-page-container {
    position: absolute;
    top: 100vh;
    left: 0;
    width: 100vw;
    height: 100vh;
  }

  .info-scroller-top {
    position: absolute;
    top: 0;
  }

  .info-scroller-bottom {
    position: absolute;
    top: 100vh;
  }
</style>
