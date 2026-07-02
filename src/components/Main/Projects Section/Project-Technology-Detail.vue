<template>
  <div class="tech-container" :class="{ active: activeProjectIndex !== null }">
    <div class="dev-container" 
        :class="{ active: activeProjectIndex !== null }"
    >
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
  import { downloadRef, tilts, devItems} from '@modules/sectionsProjectsTechnology';
  import { activeProjectIndex, currentProjectIndex, projects } from '@modules/sectionsProjects';
  import { InitializeTilt } from '@modules/miscVanillaTilt';
  import { watch, ref } from 'vue';
  import { gsap } from 'gsap';

  let animationTimeline: gsap.core.Timeline | null = null;

  const playLeaveAnimation = () => {
    if (animationTimeline) animationTimeline.kill();
    animationTimeline = gsap.timeline();

    animationTimeline.to(
      '.engine, .platform, .language',
      { 
        top: "100vh", 
        duration: 0.4, 
        ease: 'back.inOut',
        stagger: { each: 0.05, from: 'end' }
      },
      0
    );
  };

  const playEnterAnimation = () => {
    if (animationTimeline) animationTimeline.kill();
    animationTimeline = gsap.timeline();

    animationTimeline.to(
      '.engine, .platform, .language',
      { 
        top: 0, 
        duration: 1, 
        ease: 'back.out',
        stagger: { each: 0.1, from: 'start' }
      },
      0
    );
  };

  watch(activeProjectIndex, (newIndex) => {
    const devContainer = document.querySelector('.dev-container');
    if (!devContainer) return;

    const isActive = devContainer.classList.contains('active');

    if (isActive) {
      playLeaveAnimation();
    } else {
      playEnterAnimation();
    }
  });

  InitializeTilt(tilts);
</script>

<style lang="scss" scoped>
  @use "@styleVariables" as *;

  .tech-container {
    @extend .center;
    position: absolute;
    top: 0%;
    width: 100%;
    height: 100%;
    z-index: -1;
    user-select: none;
    pointer-events: none;

    transition: 
      z-index 0s 1s;

    &.active {
      z-index: 5;

      transition:
        z-index 0s 0s;
    }
  }

  .dev-container {
    position: absolute;
    top: 25%;
    right: -3%;
    filter: drop-shadow(0px 0px 30px black);
    perspective: 1000px;

    &.active {
    }
  }

  .engine,
  .platform,
  .language {
    @include rotate(-210, -20, 30);
    position: relative;
    top: 100vh;
    right: 170%;
    width: 8rem;
    height: 8rem;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    margin: 1rem;
  }

  a {
    position: absolute;
    top: 70%;
    left: 15%;
    width: 6.5rem;
    height: 6.5rem;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    filter: drop-shadow(0px 0px 30px rgb(121, 121, 121));

    &.download {
      background-image: url("../../../assets/images/icons/download.png");
    }

    &.info {
      background-image: url("../../../assets/images/icons/info.png");
    }

    &.play {
      background-image: url("../../../assets/images/icons/play.png");
    }
  }
</style>
