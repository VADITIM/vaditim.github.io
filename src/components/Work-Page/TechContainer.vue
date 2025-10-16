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

  <div class="description-container" :class="{ active: activeProjectIndex !== null, clicked: clicked }" @click="toggleClick">
    <div class="container" :class="{ clicked: clicked }">
      <div class="see-more" :class="{clicked: clicked}">Info</div>
      <div class="description" :class="{clicked: clicked}"> {{ projects[currentProjectIndex || 0].description }}</div>
      <div class="content" >
        Watch More
      </div>      
    </div>

    <div class="description-grid" :class="{clicked: clicked}">
      <div class="div1"></div>
      <div class="div2"></div>
      <div class="div3"></div>
      <div class="div4"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { currentProjectIndex, projects, activeProjectIndex } from '../../modules/projects';
import { InitializeTilt } from '../../modules/vanillaTilt';

const platformRef = ref<HTMLElement | null>(null);
const engineRef = ref<HTMLElement | null>(null);
const languageRef = ref<HTMLElement | null>(null);
const downloadRef = ref<HTMLElement | null>(null);

const tilts = [platformRef, engineRef, languageRef, downloadRef];

const devItems = computed(() => [
  { 
    class: 'platform', 
    ref: platformRef, 
    image: projects[currentProjectIndex.value || 0].platform 
  },
  { 
    class: 'engine', 
    ref: engineRef, 
    image: projects[currentProjectIndex.value || 0].engine 
  },
  { 
    class: 'language', 
    ref: languageRef, 
    image: projects[currentProjectIndex.value || 0].language 
  }
]);

const clicked = ref(false);

const toggleClick = () => {
  clicked.value = !clicked.value;
};

InitializeTilt(tilts);
</script>

<style lang="scss" scoped>
@use "../../style/variables.scss" as *;
@use "../../style/Work-Page/teckcontainer.scss" as *;

.tech-container {
  @extend .center;
  position: absolute;
  bottom: 0;
  right: -50%;
  width: 25%;
  height: 40%;
  z-index: 5;

  transition:
    all .3s ease-in-out;

  &.active {
    right: 0%;

    transition:
      all 1s ease-in-out;
  }
}

.dev-container {
  position: absolute;
  right: 0;
  margin: 2rem;
  filter: drop-shadow(0px 0px 30px black);
  perspective: 1000px;
}

.engine,
.platform,
.language {
  @include rotate(-10, -20, 0);
  position: relative;
  top: 0;
  left: 0;
  width: 6rem;
  height: 6rem;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  margin: 1rem;
}

.download {
  position: absolute;
  top: 70%;
  left: 15%;
  width: 6.5rem;
  height: 6.5rem;
  background-image: url("../../assets/images/download.png");
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  filter: drop-shadow(0px 0px 30px rgb(121, 121, 121));
}





</style>
