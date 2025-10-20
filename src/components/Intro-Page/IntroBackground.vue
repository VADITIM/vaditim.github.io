<template>
  <div class="intro-page-container">
    <div class="intro-info-background-back"></div>
    <div class="intro-info-background-front"></div>
    <div class="intro-intro-background"></div>
  </div>
</template>

<script setup lang="ts">
</script>

<style lang="scss" scoped>
@use "../../style/Intro-Page/introbackground.scss" as *;


.info-page-container {
  overflow: visible;
}

.info-scroller-bottom {
  position: absolute;
  top: 0vh;
}
</style>