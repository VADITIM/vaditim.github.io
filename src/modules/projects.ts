import { ref } from 'vue'

export const activeProjectIndex = ref<number | null>(null)
export const currentProjectIndex = ref(0)
export const projectsContainer = ref<HTMLElement>()
export const isDragging = ref(false)
export const startX = ref(0)
export const scrollLeft = ref(0)
export const transitioning = ref(false)


export const projects = [
  {
    name: "Wrath of the Fallen Queen",
    description: "Description",
    year: 1,
    img: "src/assets/images/wrathofthefallenqueen1.png",
    engine: "src/assets/images/webengine.png",
    language: "src/assets/images/javascript.png",
    platform: "src/assets/images/webapp.png",
    link: "https://github.com/VADITIM/Wrath-Of-The-Fallen-Queen",
    ai: true,
  },
  {
    name: "Haunted",
    description: "Description",
    year: 2,
    img: "src/assets/images/haunted.png",
    engine: "src/assets/images/unity.png",
    language: "src/assets/images/csharp.png",
    platform: "src/assets/images/windows.png",
    link: "https://github.com/VADITIM/Haunted",
    ai: true,
  },
	{
    name: "Velvet Deck Web",
    description: "Description",
    year: 2,
    img: "src/assets/images/velvetdeckweb.png",
    engine: "src/assets/images/webengine.png",
    language: "src/assets/images/javascript.png",
    platform: "src/assets/images/webapp.png",
    link: "https://github.com/VADITIM/Card-Game",
    ai: true,
  },
  {
    name: "Boundless Board",
    description: "Description",
    year: 3,
    img: "src/assets/images/boundlessboard.png",
    engine: "src/assets/images/unity.png",
    language: "src/assets/images/csharp.png",
    platform: "src/assets/images/windows.png",
    link: "https://github.com/VADITIM/Boundless-Board",
    ai: true,
  },
  {
    name: "//NETRUNNERS",
    description: "Description",
    year: 4,
    img: "src/assets/images/netrunners.png",
    engine: "src/assets/images/unity.png",
    language: "src/assets/images/csharp.png",
    platform: "src/assets/images/windows.png",
    link: "https://github.com/VADITIM/NETRUNNERS",
    ai: true,
  },
  {
    name: "Veil of Remorse",
    description: "Description",
    year: 4,
    img: "path/to/image4.jpg",
    engine: "src/assets/images/unity.png",
    language: "src/assets/images/csharp.png",
    platform: "src/assets/images/windows.png",
    link: "https://github.com/VADITIM/Veil-of-Remorse",
    ai: true,
  },
	{
    name: "Simulation City - Reborn: Green Horizons",
    description: "Description",
    year: 4,
    img: "src/assets/images/simulationcity.jpg",
    engine: "src/assets/images/unity.png",
    language: "src/assets/images/csharp.png",
    platform: "src/assets/images/windows.png",
    link: "https://github.com/Nobody-989/SimulationCity",
    ai: false,
  },
	{
		name: "Velvet Deck",
		description: "Description",
		year: 4,
		img: "src/assets/images/velvetdeck.jpg",
		engine: "src/assets/images/godot.png",
		language: "src/assets/images/csharp.png",
		platform: "src/assets/images/android.png",
		link: "https://github.com/VADITIM/Velvet-Deck",
    ai: true,
	},
	{
		name: "Portfolio",
		description: "Description",
		year: 4,
		img: "src/assets/images/portfolio.png",
		engine: "src/assets/images/webengine.png",
		language: "src/assets/images/typescript.png",
		platform: "src/assets/images/webapp.png",
		link: "https://github.com/VADITIM/Velvet-Deck",
    ai: true,
	},
	{
    name: "Anomaly",
    description: "Description",
    year: 4,
    img: "src/assets/images/anomaly.JPG",
    engine: "src/assets/images/godot.png",
    language: "src/assets/images/csharp.png",
    platform: "src/assets/images/windows.png",
    link: "https://github.com/VADITIM/Anomaly",
    ai: true,
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

export const nextClicked = ref(false);
export const previousClicked = ref(false);

export function nextProject() {
	if (currentProjectIndex.value >= projects.length - 1) return
	
  nextClicked.value = true
  setTimeout(() => {
    nextClicked.value = false
  }, 500)

	currentProjectIndex.value++
	scrollToProject(currentProjectIndex.value)
}

export function previousProject() {
	if (currentProjectIndex.value <= 0) return

  previousClicked.value = true
  setTimeout(() => {
    previousClicked.value = false
  }, 500)

	currentProjectIndex.value--
	scrollToProject(currentProjectIndex.value)
}



export function updateCurrentProject() {
  if (!projectsContainer.value) return

  transitioning.value = true
  setTimeout(() => {
    transitioning.value = false
  }, 300)

  const scrollLeft = projectsContainer.value.scrollLeft
  
  const projectWidth = projectsContainer.value.clientWidth * 0.22
  const gap = projectsContainer.value.clientWidth * .15 
  const projectSpacing = projectWidth + gap
  
  const currentIndex = Math.floor((scrollLeft + projectSpacing / 2) / projectSpacing)
  
  currentProjectIndex.value = Math.max(0, Math.min(currentIndex, projects.length - 1))
}

export function scrollToProject(index: number) {
  if (!projectsContainer.value) return
  
  const projectWidth = projectsContainer.value.clientWidth * 0.22
  const gap = projectsContainer.value.clientWidth * .15 
  const projectSpacing = projectWidth + gap
  
  projectsContainer.value.scrollLeft = index * projectSpacing
}
