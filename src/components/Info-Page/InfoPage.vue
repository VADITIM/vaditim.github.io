<template>
  <InfoBackground />
  <Cards />
  <NameHeadline />
  <div class="scroller"></div>
  <div class="info-scroller-bottom"></div>
</template>

<script setup lang="ts">
import Cards from './Cards.vue';

import { onMounted } from 'vue';
import { InfoPageAnimations, CardsAnimations } from '../../modules/info-page-animations';
import { ScrollInfoPage } from '../../modules/info-page-background-scroller';
import InfoBackground from './InfoBackground.vue';
import NameHeadline from './NameHeadline.vue';

onMounted(() => {
  ScrollInfoPage();
  InfoPageAnimations();
  CardsAnimations();
})
</script>

<style lang="scss" scoped>
.scroller {
  position: absolute;
  top: 0;
}

.info-scroller-bottom {
  position: absolute;
  top: 200vh;
}
</style>
