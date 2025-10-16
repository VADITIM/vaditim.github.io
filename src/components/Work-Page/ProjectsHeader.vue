<template>
    <div class="projects-header-container"> 
      <p class="projects-header" :class="{active: activeProjectIndex !== null}"></p>
    </div>
</template>

<script setup lang="ts">
import { activeProjectIndex } from '../../modules/projects';
</script>

<style lang="scss" scoped>
@use "../../style/variables.scss" as *;

.projects-header-container {
  display: flex;
  position: fixed;
  top: 1%;
  left: -20%;
  width: 10%;
  font-size: 5rem;
  font-family: Wosker;
  perspective: 1000px;
  z-index: 20;
  gap: 0;

  transition: .3s all
}

.projects-header {
  @include rotate(0, 40, 0);
	@include outline(black);
	color: $red;
  position: relative;
  min-width: 100%;

  &::before {
    content: 'PROJECT';
  }
  
  &::after {
    position: relative;
    top: 0;
    content: 'S';
    transition: all 0.3s;
  }
  
  &.active::after {
    opacity: 0;
    top: -50%;
  }
}
</style>
