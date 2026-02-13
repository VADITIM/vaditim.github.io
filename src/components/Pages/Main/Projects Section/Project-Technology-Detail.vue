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
    
  <a 
    :class="{
      download: projects[currentProjectIndex].type === 'download', 
      info: projects[currentProjectIndex].type === 'info', 
      play: projects[currentProjectIndex].type === 'play'
    }" 
    ref="downloadRef" 
    :href="projects[currentProjectIndex].link"
    target="_blank"
    rel="noopener noreferrer"
  ></a>
  </div>
</template>

<script setup lang="ts">
  import { downloadRef, tilts, devItems} from '@modules/Projects Section/projects-technology';
  import { activeProjectIndex, currentProjectIndex, projects } from '@modules/Projects Section/projects';
  import { InitializeTilt } from '@modules/vanilla-tilt';

  InitializeTilt(tilts);
</script>

<style lang="scss" scoped>
  @use "@styleVariables" as *;
  @use "@projectsStyle/techcontainer.scss" as *;
</style>
