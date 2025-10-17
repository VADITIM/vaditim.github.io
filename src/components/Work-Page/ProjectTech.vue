<template>
  <div class="tech-container" :class="{ active: activeProjectIndex !== null }">
    <div class="dev-container">
      <div 
        v-for="item in devItems" 
        :key="item.class"
        :class="[item.class, { active: activeProjectIndex !== null }]"
        :ref="item.ref"
        :style="{ backgroundImage: `url(${item.image})` }"
      ></div>
    </div>
    <div class="download" ref="downloadRef"></div>
  </div>
</template>

<script setup lang="ts">
import { downloadRef, tilts, devItems} from '../../modules/techContainer';
import { activeProjectIndex } from '../../modules/projects';
import { InitializeTilt } from '../../modules/vanillaTilt';

InitializeTilt(tilts);
</script>

<style lang="scss" scoped>
@use "../../style/Work-Page/techcontainer.scss" as *;
</style>
