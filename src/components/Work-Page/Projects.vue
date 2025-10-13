<template>
  <div class="container">
    <div class="pagination-dots">
      <div 
        v-for="(project, index) in projects" 
        :key="index"
        class="dot"
        :class="{ active: index === currentProjectIndex }"
        @click="scrollToProject(index)"
      ></div>
    </div>
    
    <div class="copy-container" :class="{ active: activeProjectIndex !== null }">
      <div class="current-project-copy" :class="{ active: activeProjectIndex !== null }" @click="closeActiveProject">
        <p>{{ projects[currentProjectIndex]?.name }}</p>
        <h3>{{ projects[currentProjectIndex]?.name }}</h3>
        <p>{{ projects[currentProjectIndex]?.description }}</p>
        <span>{{ projects[currentProjectIndex]?.year }}</span>
        <div class="project-image" :style="{ backgroundImage: `url(${projects[currentProjectIndex]?.img})` }"></div>

      </div>
    </div>

    <div ref="projectsContainer" class="projects-container" @scroll="updateCurrentProject" @mousedown="startDrag" @mousemove="drag" @mouseup="endDrag" @mouseleave="endDrag">

      <div class="spacer"></div>
      
      <div v-for="(project, index) in projects" :key="index" class="project" >

        <div class="more-info-container">
          <div class="more-info" @click="ActiveProject(index)" :class="{ active: activeProjectIndex === index }">Show More</div>
        </div>

        <h3>{{ project.name }}</h3>
        <p>{{ project.description }}</p>
        <span>{{ project.year }}</span>
        <div class="project-image" :style="{ backgroundImage: `url(${project.img})` }"></div>
      </div>
      
      <div class="spacer2"> More To Come</div>
      
    </div>
    <div class="platform" :style="{ backgroundImage: `url(${projects[activeProjectIndex || 0].platform})` }"></div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activeProjectIndex = ref<number | null>(null)

const projectsContainer = ref<HTMLElement>()
const currentProjectIndex = ref(0)
const isDragging = ref(false)
const startX = ref(0)
const scrollLeft = ref(0)



const projects = [
  {
    name: "Wrath of the Fallen Queen",
    description: "Description",
    year: 1,
    img: "src/assets/images/wrathofthefallenqueen.png",
    Engine: "src/assets/images/javascript.png",
    Language: "src/assets/images/javascript.png",
    platform: "src/assets/images/webapp.png",
  },
  {
    name: "Haunted",
    description: "Description",
    year: 2,
    img: "src/assets/images/haunted.png",
    Engine: "src/assets/images/unity.png",
    Language: "C#",
    platform: "src/assets/images/windows.png"
  },
  {
    name: "Boundless Board",
    description: "Description",
    year: 3,
    img: "path/to/image4.jpg",
    Engine: "src/assets/images/unity.png",
    Language: "C#",
    platform: "src/assets/images/windows.png"
  },
  {
    name: "//NETRUNNERS",
    description: "Description",
    year: 4,
    img: "path/to/image4.jpg",
    Engine: "src/assets/images/unity.png",
    Language: "C#",
    platform: "src/assets/images/windows.png"
  },
  {
    name: "Veil of Remorse",
    description: "Description",
    year: 4,
    img: "path/to/image4.jpg",
    Engine: "src/assets/images/unity.png",
    Language: "C#",
    platform: "src/assets/images/windows.png"
  },
    {
    name: "Simulation City - Reborn: Green Horizons",
    description: "Description",
    year: 4,
    img: "path/to/image4.jpg",
    Engine: "src/assets/images/unity.png",
    Language: "C#",
    platform: "src/assets/images/windows.png"
  },
    {
    name: "Velvet Deck",
    description: "Description",
    year: 4,
    img: "src/assets/images/wrathofthefallenqueen.png",
    Engine: "src/assets/images/godot.png",
    Language: "C#",
    platform: "src/assets/images/android.png"
  },
    {
    name: "Anomaly",
    description: "Description",
    year: 4,
    img: "src/assets/images/anomaly.JPG",
    Engine: "src/assets/images/godot.png",
    Language: "C#",
    platform: "src/assets/images/windows.png"
  },
]

function ActiveProject(index: number) {
  activeProjectIndex.value = index
  console.log(`Active project: ${projects[index].name}`)
}

function closeActiveProject() {
  activeProjectIndex.value = null
}

function startDrag(event: MouseEvent) {
  if (!projectsContainer.value) return
  
  isDragging.value = true
  startX.value = event.pageX - projectsContainer.value.offsetLeft
  scrollLeft.value = projectsContainer.value.scrollLeft
  
  projectsContainer.value.style.cursor = 'grabbing'
}

function drag(event: MouseEvent) {
  if (!isDragging.value || !projectsContainer.value) return
  
  event.preventDefault()
  const x = event.pageX - projectsContainer.value.offsetLeft
  const walk = (x - startX.value) * 3 
  projectsContainer.value.scrollLeft = scrollLeft.value - walk
}

function endDrag() {
  isDragging.value = false
  if (projectsContainer.value) {
    projectsContainer.value.style.cursor = 'grab'
  }
}






function updateCurrentProject() {
  if (!projectsContainer.value) return
  
  const scrollLeft = projectsContainer.value.scrollLeft
  
  const projectSpacing = 60 * 16
  const currentIndex = Math.floor((scrollLeft + projectSpacing / 2) / projectSpacing)
  
  currentProjectIndex.value = Math.max(0, Math.min(currentIndex, projects.length - 1))
  console.log('Current project index:', currentProjectIndex.value, 'ScrollLeft:', scrollLeft, 'ProjectSpacing:', projectSpacing)
}

function scrollToProject(index: number) {
  if (!projectsContainer.value) return
  
  const projectSpacing = 60 * 16
  projectsContainer.value.scrollLeft = index * projectSpacing
}

</script>

<style lang="scss" scoped>
@use "@/style/Work-Page/projects.scss" as *;
</style>
