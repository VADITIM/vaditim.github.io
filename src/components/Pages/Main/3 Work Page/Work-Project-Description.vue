<template>
  <div class="description-container" :class="{ active: activeProjectIndex !== null, clicked: clicked }"
    @click="toggleClick">
    <div class="container">
      <div class="info">Info</div>
      <div class="description"> {{ projects[currentProjectIndex || 0].description }}</div>
      <div class="wrapper" :class="{ clicked: clicked }">
          <div class="bg" :class="{ clicked: clicked }"></div>
        <div class="more-content" :class="{ clicked: clicked }">
          <div class="text" :class="{ clicked: clicked }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { clicked, toggleClick } from '../../../../modules/3 Work Page/work-tech-container';
  import { currentProjectIndex, projects, activeProjectIndex } from '../../../../modules/3 Work Page/work-projects';
</script>

<style lang="scss" scoped>
  @use "../../../../style/3-Work-Page/descriptioncontainer.scss" as *;
</style>
