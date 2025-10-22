<template>
  <div class="info-page-container">
    <Cards />
    <!-- <InfoHeader /> -->
    <Contact />
    <div class="info-scroller-top"></div>
    <div class="info-scroller-bottom"></div>
  </div>
</template>

<script setup lang="ts">
import Cards from './Cards.vue';
import InfoHeader from './InfoHeader.vue';

import { onMounted } from 'vue';
import { InfoPageAnimations } from '../../modules/animations/info-page-animations';
import { InfoPageAnimationsOut } from '../../modules/animations/info-page-animations-out';
import Contact from './Contact.vue';

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
  // width: 100%;
  // height: 1%;
  // background-color: red;
}

.info-scroller-bottom {
  position: absolute;
  top: 100vh;
  // width: 100%;
  // height: 1%;
  // background-color: red;
}
</style>
