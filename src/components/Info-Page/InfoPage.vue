<template>
  <div class="info-page-container">
    <InfoBackground />
    <Quotes />
    <Cards />
    <NameHeadline />
    <Contact />
    <div class="scroller"></div>
    <div class="info-scroller-bottom"></div>
  </div>
</template>

<script setup lang="ts">
import Cards from './Cards.vue';
import InfoBackground from './InfoBackground.vue';
import NameHeadline from './NameHeadline.vue';
import Quotes from './Quotes.vue';

import { onMounted } from 'vue';
import { InfoPageAnimations } from '../../modules/animations/info-page-animations';
import { ScrollInfoPage } from '../../modules/info-page-background-scroller';
import Contact from './Contact.vue';

onMounted(() => {
  ScrollInfoPage();
  InfoPageAnimations();
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

.scroller {
  position: absolute;
  top: 0;
}

.info-scroller-bottom {
  position: absolute;
  top: 100vh;
}
</style>
