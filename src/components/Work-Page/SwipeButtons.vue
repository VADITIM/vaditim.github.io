<template>
    <div v-if="!last" class="full-next" @click="nextProject"
      :class="{ active: activeProjectIndex !== null, clicked: nextClicked }"></div>
    <div v-if="!first" class="full-previous" @click="previousProject"
      :class="{ active: activeProjectIndex !== null, clicked: previousClicked }"></div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { nextProject, previousProject, projects, currentProjectIndex, activeProjectIndex, nextClicked, previousClicked } from '../../modules/projects';
const first = computed(() => currentProjectIndex.value === 0);
const last = computed(() => currentProjectIndex.value === projects.length - 1);

</script>

<style lang="scss">
@use "@/style/Work-Page/projects.scss" as *;
@use "../../style/variables.scss" as *;

.full-next,
.full-previous {
  width: $projectWidht;
  height: 80%;
  cursor: pointer;
  z-index: 10;

  &.active {
    z-index: 0;
  }
}

.full-next {
  @include absoluteCenter(50%, 82%);
}

.full-previous {
  @include absoluteCenter(50%, 8%);
}

</style>