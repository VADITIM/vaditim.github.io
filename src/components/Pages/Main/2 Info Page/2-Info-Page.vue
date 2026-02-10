<template>
  <div class="info-page-container">
    <div class="info-page-content">
      <Cards />
      <Contact />
      <!-- <InfoBackground /> -->
    </div>
    <div class="info-scroller-top"></div>
    <div class="info-scroller-bottom"></div>
  </div>
</template>

<script setup lang="ts">
  import Cards from './Info-Cards.vue';

  import { onMounted } from 'vue';
  import { InfoPageAnimations } from '../../../../modules/animations/2 Info Page/info-page-animations';
  import { InfoPageAnimationsOut } from '../../../../modules/animations/2 Info Page/info-page-animations-out';
  import Contact from './Info-Contact.vue';
  import InfoBackground from './Info-Background.vue';
  import { BackCardsAnimations, CardsAnimations } from '../../../../modules/animations/2 Info Page/card-animations';
  import { CardAnimationsOut } from '../../../../modules/animations/2 Info Page/card-animations-out';

  

  onMounted(() => {
    InfoPageAnimations();
    InfoPageAnimationsOut();
    CardsAnimations();
    CardAnimationsOut();
    BackCardsAnimations();
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

  .info-page-content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform: translateY(-100vh);
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
