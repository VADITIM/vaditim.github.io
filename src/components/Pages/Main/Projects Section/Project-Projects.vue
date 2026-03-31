<template>
  <ProjectsTech />
  <ProjectsHelix/>
    <div class="projects-container">
      <GooeyFilter />
      <div ref="bubbleContainerRef" class="bubble-container">
        <template v-if="renderBubbles">
          <div
            v-for="bubble in visibleBubbles"
            :key="bubble.projectIndex"
            class="bubble"
            :class="{ 
              current: bubble.positionIndex === 2,
              active: activeProjectIndex !== null,
              'no-opacity-transition':
                skipOpacityTransition && bubble.positionIndex === 2
            }"
            :style="{ 
              top: allPositions[bubble.positionIndex].top, 
              left: allPositions[bubble.positionIndex].left,
              backgroundImage: `url(${bubble.project.img})`
            }"
            @click="handleBubbleClick(bubble.positionIndex)"
          ></div>
        </template>
      </div>
      <ProjectProjectDisplay />
      <ProjectPaginationDots />
    </div>
</template>

<script setup lang="ts">
  
  import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
  import gsap from 'gsap';

  import ProjectProjectDisplay from '@projects/Project-Display.vue';
  
  import { activeProjectIndex, ActiveProject, currentProjectIndex, projects } from '@modules/Sections/Projects Section/projects';
  import ProjectPaginationDots from '@projects/Project-Pagination-Dots.vue';
  import GooeyFilter from '@components/Misc/Gooey-Filter.vue';
  import ProjectsHelix from './Projects-Helix.vue';
  import ProjectsTech from '@projects/Project-Technology-Detail.vue';

  import { currentSection } from '@modules/Sections/sections';


  const allPositions = [
    { top: '50%', left: '180%' },    
    { top: '-30%', left: '140%' },   
    { top: '50%', left: '85%' },     
    { top: '130%', left: '140%' },   
  ];
  const visibleProjectIndices = ref([projects.length - 1, 0, 1]);
  const skipOpacityTransition = ref(false);

  const bubbleContainerRef = ref<HTMLElement | null>(null);
  const renderBubbles = ref(false);
  let hideBubblesTimer: number | null = null;

  type VisibleBubble = {
    projectIndex: number;
    positionIndex: 1 | 2 | 3;
    project: (typeof projects)[number];
  };

  const visibleBubbles = computed<VisibleBubble[]>(() => {
    return visibleProjectIndices.value
      .map((projectIndex, idx) => {
        const project = projects[projectIndex];
        if (!project) return null;
        return {
          projectIndex,
          positionIndex: (idx + 1) as 1 | 2 | 3,
          project,
        };
      })
      .filter((b): b is VisibleBubble => b !== null);
  });

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

  let bubbleGsapContext: gsap.Context | null = null;
  const initializeBubbles = async () => {
    if (!renderBubbles.value) {
      bubbleGsapContext?.revert();
      bubbleGsapContext = null;
      return;
    }

    await nextTick();

    const container = bubbleContainerRef.value;
    if (!container) return;

    // Only animate currently rendered (visible) bubbles.
    const bubbles = Array.from(container.querySelectorAll<HTMLElement>('.bubble'));
    if (bubbles.length === 0) return;

    // Clean up previous animations to prevent accumulation/crashes on iOS/Samsung browsers.
    bubbleGsapContext?.revert();
    bubbleGsapContext = gsap.context(() => {
      bubbles.forEach((bubble) => {
        gsap.killTweensOf(bubble);
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
          delay: 1.0 + Math.random() * 4.0,
        });
      });
    }, container);
  };

  onMounted(() => {
    renderBubbles.value = currentSection.value === 2;
    if (renderBubbles.value) initializeBubbles();
  });

  watch(visibleProjectIndices, async () => {
    if (!renderBubbles.value) return;
    await initializeBubbles();
  }, { deep: true, flush: 'post' });

  watch(currentSection, (newSection, oldSection) => {
    if (newSection === 2) {
      if (hideBubblesTimer !== null) window.clearTimeout(hideBubblesTimer);
      hideBubblesTimer = null;
      renderBubbles.value = true;
      initializeBubbles();
      return;
    }

    if (oldSection === 2 && newSection !== 2) {
      if (hideBubblesTimer !== null) window.clearTimeout(hideBubblesTimer);
      hideBubblesTimer = window.setTimeout(() => {
        renderBubbles.value = false;
        bubbleGsapContext?.revert();
        bubbleGsapContext = null;
        hideBubblesTimer = null;
      }, 1500);
    }
  }, { flush: 'post' });

  onBeforeUnmount(() => {
    if (hideBubblesTimer !== null) {
      window.clearTimeout(hideBubblesTimer);
      hideBubblesTimer = null;
    }
    bubbleGsapContext?.revert();
    bubbleGsapContext = null;
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
		display: flex;
		right: -50%;
		align-items: center;
    width: 100%;
    height: 100%;
    perspective: 1000px;;  
  }

  .bubble-container {
    width: 100%;
    height: 100%;
    perspective: 1000px;
    pointer-events: none;
    filter: url(#gooey-filter);
    z-index: 3;
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
    pointer-events: auto;
    
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
      @include boxShadow(0 0 20px rgba(185, 26, 26, 0.5));
      
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