<template>
  <div class="work-work-background-front" :class="{active: activeProjectIndex !== null}"></div>
  <div class="work-work-background-back" :class="{active: activeProjectIndex !== null}"></div>

  <div class="work-info-background-back"></div>
  <div class="work-info-background-front"></div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { ScrollWorkPage } from '../../modules/animations/background/work-page-background-scroller';
import { activeProjectIndex } from '../../modules/projects';

onMounted(()=> {
  ScrollWorkPage();
})

</script>

<style lang="scss" scoped>
@use "../../style/Work-Page/workbackground.scss" as *;
</style>