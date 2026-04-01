<template>
    <div class="section-background-layer">
      <div class="perks-section-background" :style="GetBackgroundStyle('perks')"></div>
      <div class="profile-section-background-back" :style="GetBackgroundStyle('profile-back')"></div>
      <div class="profile-section-background-front" :style="GetBackgroundStyle('profile-front')"></div>
      <div class="projects-section-background-back" :class="{active: activeProjectIndex !== null}" :style="GetBackgroundStyle('projects-back')"></div>
      <div class="projects-section-background-front" :class="{active: activeProjectIndex !== null}" :style="GetBackgroundStyle('projects-front')"></div>
    </div>
</template>

<script setup lang="ts" >
  import { onBeforeUnmount, watch, ref } from 'vue';
  import { ScrollBackgroundSections } from '@modules/Sections/section-backgrounds';
  import { activeProjectIndex } from '@modules/Sections/Projects Section/projects';
  import { finished } from '@modules/Sections/section-state-machine';
  import { dragOffset, dragDirection, isDragging, thresholdReached, consumeLastDragOffsetY } from '@modules/Misc/mobile-drag-navigation';
  import { isMobile } from '@modules/Misc/is-mobile';
  import { currentSection, previousSection, isTransitioning } from '@modules/Sections/sections';

  let CleanupBackgroundAnimations: (() => void) | null = null;
  const isReturning = ref(false);
  const returnTransform = ref('');

  const GetBackgroundStyle = (type: string) => {
    const activeSectionIndex = isTransitioning.value ? previousSection.value : currentSection.value;
    
    const isInteractiveSection = 
      (type === 'perks' && activeSectionIndex === 0) ||
      ((type === 'profile-back' || type === 'profile-front') && activeSectionIndex === 1) ||
      ((type === 'projects-back' || type === 'projects-front') && activeSectionIndex === 2)

    if (!isInteractiveSection) return {}

    if (isReturning.value) {
      return {
        transform: returnTransform.value,
        transition: 'transform 0.3s ease-out'
      }
    }

    if (isMobile.value && dragDirection.value) {
      const offsetAmount = dragDirection.value === 'down' ? dragOffset.value * -0.5 : dragOffset.value * 0.5
      const scaleAmount = thresholdReached.value ? 1.05 : 1
      const popYTransform = thresholdReached.value ? -10 : 0

      return {
        transform: `translateY(${offsetAmount + popYTransform}px) scale(${scaleAmount})`,
        transition: thresholdReached.value ? '0.15s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none'
      }
    }

    return {}
  }

  watch(isDragging, (newVal) => {
    if (!newVal) {
      isReturning.value = true
      
      const lastOffset = consumeLastDragOffsetY()
      const popscale = thresholdReached.value ? 1.05 : 1
      returnTransform.value = lastOffset ? `translateY(${lastOffset}px) scale(${popscale})` : `translateY(0) scale(${popscale})`

      requestAnimationFrame(() => {
        returnTransform.value = 'translateY(0) scale(1)'
      })

      setTimeout(() => {
        isReturning.value = false
        returnTransform.value = ''
      }, 300)
    }
  })

  watch(finished, (isFinished) => {
    if (isFinished && !CleanupBackgroundAnimations) {
      CleanupBackgroundAnimations = ScrollBackgroundSections();
    }
  });

  onBeforeUnmount(() => {
    if (CleanupBackgroundAnimations) {
      CleanupBackgroundAnimations();
      CleanupBackgroundAnimations = null;
    }
  });
</script>

<style lang="scss">
  @use "@styleVariables" as *;

  .section-background-layer {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  .perks-section-background {
    position: absolute;
    top: 0;
    left: -30%;
    width: 30%;
    height: 100vh;
    background-color: rgb(255, 221, 28);
    background: #FFDD1B;
    background: linear-gradient(180deg,rgba(255, 221, 27, 1) 0%, rgba(102, 89, 22, 1) 100%);
    clip-path: polygon(0 0, 100% 0, 10% 100%, 0% 100%);
    z-index: 1;

    @include allMobile {
      left: 0;
      top: 100%;
      width: 100vw;
      height: 150dvh;
      background: linear-gradient(360deg,rgba(255, 221, 27, 1) 0%, rgba(102, 89, 22, 1) 100%);
      clip-path: polygon(0 0, 100% 0, 100% 80%, 0 68%);
      border-radius: 30px 30px 0 0;
    }
  }

  .profile-section-background-front {
    position: absolute;
    left: -30%;
    width: 30%;
    height: 110vh;
    background: linear-gradient(180deg,rgba(17, 56, 89, 1) 15%, rgba(0, 64, 255, 1) 85%);
    clip-path: polygon(0 0, 100% 0, 10% 100%, 0% 100%);
    z-index: 2;

    @include tablet {
      width: 20%;
    }

    @include allMobile {
      left: 0;
      top: 100%;
      width: 100vw;
      height: 150dvh;
      background: linear-gradient(180deg,rgba(17, 56, 89, 1) 15%, rgba(0, 64, 255, 1) 85%);
      clip-path: polygon(0 0, 100% 0, 100% 62%, 0 80%);
      border-radius: 30px 30px 0 0;
    }
  }

  .profile-section-background-back {
    position: absolute;
    left: -30%;
    width: 30%;
    height: 110vh;
    background-color: rgb(24, 24, 177);
    background: linear-gradient(180deg,#001eff 15%, rgba(17, 56, 89, 1) 85%);
    clip-path: polygon(0 0, 19% 0, 83% 100%, 0 100%);
    z-index: 2;

    @include tablet {
      width: 30%;
    }

    @include allMobile {
      left: 0;
      top: 100%;
      width: 100vw;
      height: 150dvh;
      background: linear-gradient(180deg,rgb(13, 40, 62) 15%, rgba(0, 64, 255, 1) 85%);
      clip-path: polygon(0 0, 100% 0, 100% 80%, 0 54%);
      border-radius: 30px 30px 0 0;
    }
  }

  .projects-section-background-back {
    position: absolute;
    right: -40%;
    width: 25%;
    height: 100vh;
    background-color: rgb(134, 12, 12);
    background: linear-gradient(180deg,rgba(51, 8, 8, 1) 21%, rgba(102, 14, 14, 1) 80%, rgba(134, 12, 12, 1) 100%);
    clip-path: polygon(100% 0, 100% 0, 100% 100%, 0 100%);
    z-index: 4;
    
    &.active {
      width: 40%;

      transition: 
        .4s all;
    }

    @include allMobile {
      left: 0;
      top: 100%;
      width: 100vw;
      height: 150dvh;
      background: linear-gradient(180deg,rgb(93, 26, 40) 15%, rgba(163, 9, 38, 1) 85%);
      border-radius: 30px 30px 0 0;
      clip-path: polygon(0 0, 100% 0, 100% 33%, 0 80%);

    }
  }

  .projects-section-background-front {
    position: absolute;
    right: -40%;
    width: 25%;
    height: 100vh;
    background-color: $red;
    background: linear-gradient(180deg,rgba(105, 17, 34, 1) 21%, rgba(153, 9, 38, 1) 55%, rgba(220, 20, 60, 1) 100%);
    clip-path: polygon(0 0, 100% 0, 100% 100%, 81% 100%);
    z-index: 4;
    
    &.active {
      width: 35%;
      
      transition: 
        .5s all .2s;
    }

    @include allMobile {
      left: 0;
      top: 100%;
      width: 100vw;
      height: 150dvh;
      background: linear-gradient(180deg,rgba(105, 17, 34, 1) 15%, rgba(163, 9, 38, 1) 85%);
      border-radius: 30px 30px 0 0;
      clip-path: polygon(0 0, 100% 0, 100% 80%, 0 60%);

    }
  }
</style>