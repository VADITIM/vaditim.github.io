<template>
  <div class="work-work-background-front" :class="{active: activeProjectIndex !== null}"></div>
  <div class="work-work-background-back" :class="{active: activeProjectIndex !== null}"></div>

  <div class="work-info-background-back"></div>
  <div class="work-info-background-front"></div>
</template>

<script setup lang="ts">
import { activeProjectIndex } from '../../modules/projects';

</script>

<style lang="scss" scoped>
@use "../../style/Work-Page/workbackground.scss" as *;
</style>