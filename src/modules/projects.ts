import { ref } from 'vue'

export const activeProjectIndex = ref<number | null>(null)
export const currentProjectIndex = ref(0)
export const projectsContainer = ref<HTMLElement>()
export const isDragging = ref(false)
export const startX = ref(0)
export const scrollLeft = ref(0)


export const projects = [
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
    img: "src/assets/images/boundlessboard.png",
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

export function ActiveProject(index: number) {
  activeProjectIndex.value = index
  console.log(`Active project: ${projects[index].name}`)
}

export function closeActiveProject() {
  activeProjectIndex.value = null
}

export function startDrag(event: MouseEvent) {
  if (!projectsContainer.value) return
  
  isDragging.value = true
  startX.value = event.pageX - projectsContainer.value.offsetLeft
  scrollLeft.value = projectsContainer.value.scrollLeft
  
  projectsContainer.value.style.cursor = 'grabbing'
}

export function drag(event: MouseEvent) {
  if (!isDragging.value || !projectsContainer.value) return
  
  event.preventDefault()
  const x = event.pageX - projectsContainer.value.offsetLeft
  const walk = (x - startX.value) * 3 
  projectsContainer.value.scrollLeft = scrollLeft.value - walk
}

export function endDrag() {
  isDragging.value = false
  if (projectsContainer.value) {
    projectsContainer.value.style.cursor = 'grab'
  }
}






export function updateCurrentProject() {
  if (!projectsContainer.value) return
  
  const scrollLeft = projectsContainer.value.scrollLeft
  
  const projectSpacing = 60 * 16
  const currentIndex = Math.floor((scrollLeft + projectSpacing / 2) / projectSpacing)
  
  currentProjectIndex.value = Math.max(0, Math.min(currentIndex, projects.length - 1))
  console.log('Current project index:', currentProjectIndex.value, 'ScrollLeft:', scrollLeft, 'ProjectSpacing:', projectSpacing)
}

export function scrollToProject(index: number) {
  if (!projectsContainer.value) return
  
  const projectSpacing = 60 * 16
  projectsContainer.value.scrollLeft = index * projectSpacing
}
