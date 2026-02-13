<template>
    <div class="projects-container">
      <GooeyFilter />
      <div class="bubble-container">
        <div 
          v-for="(project, index) in projects" 
          :key="index"
          :ref="el => { if (el) bubbleRefs[index] = el as HTMLElement; }"
          class="bubble"
          :class="{ 
            helper: getPositionForProject(index) === 0,
            current: getPositionForProject(index) === 2,
            active: activeProjectIndex !== null,
            'no-opacity-transition':
              skipOpacityTransition && getPositionForProject(index) === 2
          }"
          :style="{ 
            top: allPositions[getPositionForProject(index)].top, 
            left: allPositions[getPositionForProject(index)].left,
            backgroundImage: `url(${project.img})`
          }"
          @click="handleBubbleClick(getPositionForProject(index))",
        ></div>
      </div>

      <ProjectProjectDisplay />
      <ProjectPaginationDots />
    </div>
</template>

<script setup lang="ts">
  
  import { ref, computed, onMounted, watch } from 'vue';
  import gsap from 'gsap';

  import ProjectProjectDisplay from '@projects/Project-Display.vue';
  
  import { activeProjectIndex, ActiveProject, closeActiveProject, currentProjectIndex, projects } from '@modules/Projects Section/projects';
  import ProjectPaginationDots from '@projects/Project-Pagination-Dots.vue';
  import GooeyFilter from '@components/Gooey-Filter.vue';


  const allPositions = [
    { top: '50%', left: '150%' },    
    { top: '-30%', left: '110%' },   
    { top: '50%', left: '85%' },     
    { top: '130%', left: '110%' },   
  ];
  const visibleProjectIndices = ref([0, 1, 2]);
  const bubbleRefs = ref<HTMLElement[]>([]);
  const skipOpacityTransition = ref(false);

  onMounted(() => {
    bubbleRefs.value.forEach((bubble) => {
      if (bubble) {
        const randomRadius = () => {
          const r1 = 40 + Math.random() * 20; 
          const r2 = 40 + Math.random() * 20;
          const r3 = 40 + Math.random() * 20;
          const r4 = 40 + Math.random() * 20;
          const r5 = 40 + Math.random() * 20;
          const r6 = 40 + Math.random() * 20;
          const r7 = 40 + Math.random() * 20;
          const r8 = 40 + Math.random() * 20;
          return `${r1.toFixed(0)}% ${r2.toFixed(0)}% ${r3.toFixed(0)}% ${r4.toFixed(0)}% / ${r5.toFixed(0)}% ${r6.toFixed(0)}% ${r7.toFixed(0)}% ${r8.toFixed(0)}%`;
        };

        gsap.to(bubble, {
          keyframes: [
            { borderRadius: randomRadius(), duration: 2 },
            { borderRadius: randomRadius(), duration: 2 },
            { borderRadius: randomRadius(), duration: 2 },
            { borderRadius: randomRadius(), duration: 2 },
            { borderRadius: '50% 50% 50% 50% / 50% 50% 50% 50%', duration: 1.0 },
          ],
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay:  1.0 + Math.random() * 4.0,
        });
      }
    });
  });

  watch(activeProjectIndex, (newValue, oldValue) => {
    if (oldValue !== null && newValue === null) {
      skipOpacityTransition.value = true;
      requestAnimationFrame(() => {
        skipOpacityTransition.value = false;
      });
    }
  });

  watch(currentProjectIndex, (newIndex) => {
    const prevIndex = newIndex - 1 < 0 ? projects.length - 1 : newIndex - 1;
    const nextIndex = newIndex + 1 >= projects.length ? 0 : newIndex + 1;
    visibleProjectIndices.value = [prevIndex, newIndex, nextIndex];
  });

  const getPositionForProject = (projectIndex: number): number => {
    const visibleIndex = visibleProjectIndices.value.indexOf(projectIndex);
    if (visibleIndex === -1) return 0; 
    return visibleIndex + 1; 
  };

  const handleBubbleClick = (positionIndex: number) => {
    if (positionIndex === 0) return; 
    
    if (positionIndex === 1) { moveLeft(); return; }
    else if (positionIndex === 3) { moveRight(); return; }
    
    if (positionIndex === 2) {
      const centerIndex = visibleProjectIndices.value[1];
      ActiveProject(centerIndex);
    }
  };

  const moveRight = () => {
    visibleProjectIndices.value = visibleProjectIndices.value.map(index => {
      const nextIndex = index + 1;
      return nextIndex >= projects.length ? 0 : nextIndex;
    });
    
    currentProjectIndex.value = visibleProjectIndices.value[1];
  };

  const moveLeft = () => {
    visibleProjectIndices.value = visibleProjectIndices.value.map(index => {
      const prevIndex = index - 1;
      return prevIndex < 0 ? projects.length - 1 : prevIndex;
    });
    
    currentProjectIndex.value = visibleProjectIndices.value[1];
  };

</script>

<style lang="scss" scoped>
  @use "@styleVariables" as *;

  .projects-container {
    position: absolute;
    top: 0;
    right: -50%;
    width: 100vw;
    height: 100vh;
    perspective: 1000px;
  }

  .bubble-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    filter: url(#gooey-filter);
    z-index: 3;
    perspective: 1000px;
  }

  .bubble {
    --opacity-duration: 0.6s;
    position: absolute;
    width: 15rem;
    height: 15rem;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    z-index: 21;
    cursor: pointer;
    opacity: 1;
    
    transition: 
      top 0.6s cubic-bezier(0.4, 0, 0.2, 1),
      left 0.6s cubic-bezier(0.4, 0, 0.2, 1),
      width 0.6s cubic-bezier(0.4, 0, 0.2, 1),
      height 0.6s cubic-bezier(0.4, 0, 0.2, 1),
      opacity var(--opacity-duration) cubic-bezier(0.4, 0, 0.2, 1) .6s,
      transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      box-shadow 0.6s cubic-bezier(0.4, 0, 0.2, 1),
      z-index 0.6s cubic-bezier(0.4, 0, 0.2, 1);

    &:not(.helper):hover {
      filter: brightness(1.1);
      transform: translate(-50%, -50%) scale(1.05);
    }

    &.current {
      width: 18rem;
      opacity: 1;
      height: 18rem;
      z-index: 22;
      box-shadow: 0 0 20px rgba(185, 26, 26, 0.5);
      
      &.active {
        opacity: 0;

        transition:
          opacity 0s 0s;
      }
    }

    &.helper {
      pointer-events: none;
      opacity: 1;
      z-index: 0;
    }

    &.no-opacity-transition {
      --opacity-duration: 0s;
    }
  }
</style>