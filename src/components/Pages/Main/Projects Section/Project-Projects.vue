<template>
    <div class="projects-container">


      <svg style="position: absolute; width: 0; height: 0;">
        <defs>
          <filter id="gooey-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 0 18 -7
            " result="gooey" />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>



      <div class="bubble-container">
        <div 
          v-for="(project, index) in projects" 
          :key="index"
          :ref="el => { if (el) bubbleRefs[index] = el as HTMLElement; }"
          class="bubble"
          :class="{ 
            helper: getPositionForProject(index) === 0,
            current: getPositionForProject(index) === 2,
            active: activeProjectIndex !== null
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
  
  import { ref, computed, onMounted } from 'vue';
  import gsap from 'gsap';

  import ProjectProjectDisplay from '@projects/Project-Display.vue';
  
  import { activeProjectIndex, ActiveProject, closeActiveProject, currentProjectIndex, projects } from '@modules/Projects Section/projects';
  import { clicked } from '@modules/Projects Section/projects-technology';
  import ProjectPaginationDots from '@projects/Project-Pagination-Dots.vue';

  const currentProject = computed(() => projects[currentProjectIndex.value]);

  const allPositions = [
    { top: '130%', left: '-30%' },    // Position 0: helper (off-screen)
    { top: '25%', left: '10%' },      // Position 1: First visible
    { top: '50%', left: '20%' },      // Position 2: Middle visible
    { top: '75%', left: '10%' },      // Position 3: Last visible
  ];
  const visibleProjectIndices = ref([0, 1, 2]);
  const bubbleRefs = ref<HTMLElement[]>([]);

  onMounted(() => {
    bubbleRefs.value.forEach((bubble, index) => {
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
    top: 100%;
    left: 0;
    width: 100vw;
    height: 100vh;
  }

  .bubble-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    filter: url(#gooey-filter);
  }

  .bubble {
    position: absolute;
    width: 12rem;
    height: 12rem;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
    cursor: pointer;
    opacity: 1;
    
    transition: top 0.6s cubic-bezier(0.4, 0, 0.2, 1),
                left 0.6s cubic-bezier(0.4, 0, 0.2, 1),
                width 0.6s cubic-bezier(0.4, 0, 0.2, 1),
                height 0.6s cubic-bezier(0.4, 0, 0.2, 1),
                opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1),
                transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                box-shadow 0.6s cubic-bezier(0.4, 0, 0.2, 1),
                z-index 0.6s cubic-bezier(0.4, 0, 0.2, 1);

    &:not(.helper):hover {
      filter: brightness(1.1);
      transform: translate(-50%, -50%) scale(1.05);
    }

    &.current {
      width: 16rem;
      height: 16rem;
      z-index: 2;
      box-shadow: 0 0 20px rgba(185, 26, 26, 0.5);
      
      &.active {
        opacity: 0;

        transition:
          opacity 0s 0s;
      }
    }

    &.helper {
      pointer-events: none;
      opacity: 0;
      z-index: 0;
    }
  }


</style>