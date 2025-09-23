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
  import { ScrollIntroPage } from '../../modules/intro-page-scroller';
import IntroBackground from './IntroBackground.vue';

  onMounted(() => {
    ScrollIntroPage();
  })
</script>

<style lang="scss" scoped>
</style>
