<template>
  <InfoBackground />
  <AboutMe />
  <div class="scroller"></div>
  <div class="info-scroller-bottom"></div>
</template>

<script setup lang="ts">
import AboutMe from './AboutMe.vue';

import { onMounted } from 'vue';
import { ScrollInfoPage } from '../../modules/info-page-scroller';
import InfoBackground from './InfoBackground.vue';

onMounted(() => {
  ScrollInfoPage()
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
