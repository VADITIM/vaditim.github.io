<template>
  <Name />
  <Roles />
  <div class="intro-scroller"></div>
</template>

<script setup lang="ts">
  import Roles from './Roles.vue'
  import Name from './Name.vue'

  import { onMounted } from 'vue';
  import { IntroPageAnimations } from '../../modules/animations/intro-page-animations';

  onMounted(() => {
    IntroPageAnimations();
  })
</script>

<style lang="scss" scoped>
.intro-scroller {
  position: absolute;
  bottom: 0;
  // width: 100%;
  // height: 1%;
  // background: red;
}
</style>
