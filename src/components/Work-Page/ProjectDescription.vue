<template>
  <div class="description-container" :class="{ active: activeProjectIndex !== null, clicked: clicked}" @click="toggleClick">
    <div class="container" >
      <div class="info">Info</div>
      <div class="description"> {{ projects[currentProjectIndex || 0].description }}</div>
      <div class="more-content" :class="{clicked: clicked}"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { clicked, toggleClick } from '../../modules/techContainer';
import { currentProjectIndex, projects, activeProjectIndex } from '../../modules/projects';

</script>

<style lang="scss" scoped>
@use "../../style/Work-Page/descriptioncontainer.scss" as *;
</style>
