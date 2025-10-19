import { ref, computed } from 'vue';
import { currentProjectIndex, projects } from '../modules/projects';

export const platformRef = ref<HTMLElement | null>(null);
export const engineRef = ref<HTMLElement | null>(null);
export const languageRef = ref<HTMLElement | null>(null);
export const downloadRef = ref<HTMLElement | null>(null);

export const tilts = [platformRef, engineRef, languageRef, downloadRef];

export const devItems = computed(() => [
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

export const clicked = ref(false);
export const isAnimating = ref(false);

export const toggleClick = () => {
  if (isAnimating.value) return;
  
  isAnimating.value = true;
  clicked.value = !clicked.value;
  
  if (!clicked.value) {
    setTimeout(() => {
      isAnimating.value = false;
    }, 1250); 
  } else {
      setTimeout(() => {
      isAnimating.value = false;
    }, 2000); 
  }
};