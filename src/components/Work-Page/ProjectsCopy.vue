<template>
    <div class="copy-container" :class="{ active: activeProjectIndex !== null }">
        <div class="project-copy" :class="{ active: activeProjectIndex !== null }" @click="closeActiveProject">
        <div class="more-info-container">
            <div class="more-info" :class="{ active: activeProjectIndex !== null }">Show More</div>
        </div>
        <h3 :class="{ active: activeProjectIndex !== null }" v-html="projects[currentProjectIndex]?.name"></h3>
        <span :class="{ active: activeProjectIndex !== null }" v-if="!projects[currentProjectIndex]?.wip">Year <br> {{
            projects[currentProjectIndex]?.year }}</span>
        <span :class="{ active: activeProjectIndex !== null }" v-if="projects[currentProjectIndex]?.wip">
            <span>WORK IN PROGRESS <br> </span>
            <span>Estimated {{ projects[currentProjectIndex]?.estimated }}</span>
        </span>
        <Transition name="notice-fade">
            <p v-if="projects[currentProjectIndex]?.ai && activeProjectIndex !== null" class="notice active">This image
            was created with the help of AI, using visual assets from the original game for reference.</p>
        </Transition>
        <div class="project-image" :style="{ backgroundImage: `url(${projects[currentProjectIndex]?.img})` }"
            :class="{ current: currentProjectIndex === currentProjectIndex, transitioning: transitioning }"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
  projects,
  currentProjectIndex,
  activeProjectIndex,
  closeActiveProject,
  transitioning,
} from '../../modules/projects';

</script>


<style lang="scss" scoped>
@use "@/style/Work-Page/projects.scss" as *;

.copy-container {
  overflow: visible;

  &.active {
    z-index: 10;
  }
}

.project-copy {
  transform: translate(0%, 0%);
  top: .03%;
  left: 0;
  cursor: pointer;
  
  transition: 
    width 0.75s, 
    height 0.75s, 
    top .4s, 
    left .35s, 
    transform .3s .05s, 
    border-radius 1s, 
    z-index .5s, 
    scale .2s;

    &>h3, &>span {
      position: absolute;
      transform: translateY(-0%);

      transition: 
        .4s ease opacity;

        &.active {
          opacity: 0;
        }
    }

    
  &>h3 {
    top: 10%;
    margin: 0.5rem 0;
    color: white;
    font-size: 2.5rem;
    font-family: Exo;
    opacity: 1;
    z-index: 1;
    filter: drop-shadow(0px 0px 30px black);
  }
  
  &>span {
    position: absolute;
    bottom: 5%;
    line-height: 1.2;
    color: white;
    font-size: 3.5rem;
    font-family: Exo;
    opacity: 1;
    z-index: 1;
    filter: drop-shadow(0px 0px 30px black);

    &>span:nth-child(2) {
      line-height: .8;
      color: white;
      font-size: 1.3rem;
      font-family: Mono;
    }
  }

  &.active {
    width: 80%;
    top: -25%;
    height: 110%;
    transform: translate(0%, 20%);

    transition: 
      width 0.75s, 
      height 0.75s, 
      top .5s .1s, 
      left .35s, 
      transform .4s, 
      border-radius 1s, 
      z-index .5s, 
      scale .2s;
  }
}

.notice {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 1;
  margin: 1rem;
  border-radius: 20px;
  backdrop-filter: blur(3px);
  filter: drop-shadow(0px 0px 30px black);
  font-family: Mono;
  opacity: 1;

  transition: 
    all 1s ease;
}


.notice-fade-enter-active,
.notice-fade-leave-active {
  transition: all 1s ease;
}

.notice-fade-enter-from,
.notice-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
  transition: all 0s ease;
}

.notice-fade-enter-to,
.notice-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
  transition: all 1s ease 1s;
}

</style>
