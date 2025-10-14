<template>
  <div class="backgroundWorkBottom" :class="{active: activeProjectIndex !== null}"></div>
  <div class="backgroundWorkTop" :class="{active: activeProjectIndex !== null}"></div>

  <div class="info-background-bottom"></div>
  <div class="info-background-top"></div>
</template>

<script setup lang="ts">
import { activeProjectIndex } from '../../modules/projects';
</script>

<style lang="scss" scoped>
@use "../../style/Work-Page/workbackground.scss" as *;
</style>