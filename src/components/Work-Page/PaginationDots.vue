<template>
    <div class="pagination-dots">
      <div v-for="(project, index) in projects" :key="index" class="dot"
        :class="{ active: index === currentProjectIndex }" @click="scrollToProject(index)"></div>
    </div>
</template>

<script setup lang="ts">
import { projects, currentProjectIndex, scrollToProject } from '../../modules/projects';
</script>

<style lang="scss" scoped> 
@use "../../style/variables.scss" as *;

.pagination-dots {
  @include absoluteCenter(95%, 45.5%);
  display: flex;
  gap: 1rem;
  z-index: 100;
}

.dot {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(214, 22, 22, 0.8);
    transform: scale(1.2);
  }
    
  &.active {
    background-color: rgb(255, 0, 0);
    transform: scale(1.3);
    box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
  }
}


</style>