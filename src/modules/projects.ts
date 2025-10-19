import { ref } from 'vue'


interface Project {
  name: string
  description: string
  year: number | string
  img: string
  engine: string
  language: string
  platform: string
  link: string
  image1?: string
  image2?: string
  image3?: string
  image4?: string
  ai?: boolean
  wip?: boolean
  estimated?: number | string
}

export const activeProjectIndex = ref<number | null>(null)
export const currentProjectIndex = ref(0)
export const projectsContainer = ref<HTMLElement>()
export const isDragging = ref(false)
export const startX = ref(0)
export const scrollLeft = ref(0)
export const transitioning = ref(false)

export const projects: Project[] = [
  {
    name: "Wrath of the Fallen Queen",
    description: "Description",
    year: 2024,
    img: "src/assets/images/projects/wrathofthefallenqueen/wrathofthefallenqueen.png",
    engine: "src/assets/images/icons/webengine.png",
    language: "src/assets/images/icons/javascript.png",
    platform: "src/assets/images/icons/webapp.png",
    link: "https://github.com/VADITIM/Wrath-Of-The-Fallen-Queen",
    image1: "src/assets/images/projects/wrathofthefallenqueen/1.png",
    image2: "src/assets/images/projects/wrathofthefallenqueen/2.png",
    image3: "src/assets/images/projects/wrathofthefallenqueen/3.png",
    image4: "src/assets/images/projects/wrathofthefallenqueen/4.png",
    ai: true,
  },
  {
    name: "Haunted",
    description: "Description",
    year: 2024,
    img: "src/assets/images/projects/haunted.png",
    engine: "src/assets/images/icons/unity.png",
    language: "src/assets/images/icons/csharp.png",
    platform: "src/assets/images/icons/windows.png",
    link: "https://github.com/VADITIM/Haunted",
    image1: "src/assets/images/projects/haunted.png",
    image2: "src/assets/images/projects/haunted.png",
    image3: "src/assets/images/projects/haunted.png",
    image4: "src/assets/images/projects/haunted.png",
    ai: true,
  },
	{
    name: "Velvet Deck Web",
    description: "Description",
    year: 2024,
    img: "src/assets/images/projects/velvetdeck.png", // Fixed path
    engine: "src/assets/images/icons/webengine.png",
    language: "src/assets/images/icons/javascript.png",
    platform: "src/assets/images/icons/webapp.png",
    link: "https://github.com/VADITIM/Card-Game",
    image1: "src/assets/images/projects/velvetdeck.png",
    image2: "src/assets/images/projects/velvetdeck.png",
    image3: "src/assets/images/projects/velvetdeck.png",
    image4: "src/assets/images/projects/velvetdeck.png",
    ai: true,
  },
  {
    name: "Boundless Board",
    description: "Description",
    year: 2025,
    img: "src/assets/images/projects/boundlessboard.png",
    engine: "src/assets/images/icons/unity.png",
    language: "src/assets/images/icons/csharp.png",
    platform: "src/assets/images/icons/windows.png",
    link: "https://github.com/VADITIM/Boundless-Board",
    image1: "src/assets/images/projects/boundlessboard.png",
    image2: "src/assets/images/projects/boundlessboard.png",
    image3: "src/assets/images/projects/boundlessboard.png",
    image4: "src/assets/images/projects/boundlessboard.png",
    ai: true,
  },
  {
    name: "//NETRUNNERS",
    description: "Description",
    year: 2025,
    img: "src/assets/images/projects/netrunners.png",
    engine: "src/assets/images/icons/unity.png",
    language: "src/assets/images/icons/csharp.png",
    platform: "src/assets/images/icons/windows.png",
    link: "https://github.com/VADITIM/NETRUNNERS",
    image1: "src/assets/images/projects/netrunners.png",
    image2: "src/assets/images/projects/netrunners.png",
    image3: "src/assets/images/projects/netrunners.png",
    image4: "src/assets/images/projects/netrunners.png",
    ai: true,
  },
  {
    name: "Veil of Remorse",
    description: "Description",
    year: 2025,
    img: "src/assets/images/projects/netrunners.png", // Using existing image as placeholder
    engine: "src/assets/images/icons/unity.png",
    language: "src/assets/images/icons/csharp.png",
    platform: "src/assets/images/icons/windows.png",
    link: "https://github.com/VADITIM/Veil-of-Remorse",
    image1: "src/assets/images/projects/netrunners.png",
    image2: "src/assets/images/projects/netrunners.png",
    image3: "src/assets/images/projects/netrunners.png",
    image4: "src/assets/images/projects/netrunners.png",
    ai: true,
  },
	{
    name: "Simulation City Reborn<br>Green Horizons",
    description: "Description",
    year: 2025,
    img: "src/assets/images/projects/simulationcity.jpg",
    engine: "src/assets/images/icons/unity.png",
    language: "src/assets/images/icons/csharp.png",
    platform: "src/assets/images/icons/windows.png",
    link: "https://github.com/Nobody-989/SimulationCity",
    image1: "src/assets/images/projects/simulationcity.jpg",
    image2: "src/assets/images/projects/simulationcity.jpg",
    image3: "src/assets/images/projects/simulationcity.jpg",
    image4: "src/assets/images/projects/simulationcity.jpg",
  },
	{
		name: "Velvet Deck",
		description: "Description",
		year: 2025,
		img: "src/assets/images/projects/velvetdeck.png",
		engine: "src/assets/images/icons/godot.png",
		language: "src/assets/images/icons/csharp.png",
		platform: "src/assets/images/icons/android.png",
		link: "https://github.com/VADITIM/Velvet-Deck",
    image1: "src/assets/images/projects/velvetdeck.png",
    image2: "src/assets/images/projects/velvetdeck.png",
    image3: "src/assets/images/projects/velvetdeck.png",
    image4: "src/assets/images/projects/velvetdeck.png",
    ai: true,
	},
	{
		name: "'Godot 3D'",
		description: "Description",
		year: 2025,
		img: "src/assets/images/projects/velvetdeck.png", // Using existing image as placeholder
		engine: "src/assets/images/icons/godot.png",
		language: "src/assets/images/icons/csharp.png",
		platform: "src/assets/images/icons/windows.png",
		link: "https://github.com/VADITIM/Velvet-Deck",
    image1: "src/assets/images/projects/velvetdeck.png",
    image2: "src/assets/images/projects/velvetdeck.png",
    image3: "src/assets/images/projects/velvetdeck.png",
    image4: "src/assets/images/projects/velvetdeck.png",
    wip: true,
    estimated: 2027,
	},
	{
    name: "Anomaly",
    description: "Description",
    year: "Planned 2030",
    img: "src/assets/images/projects/anomaly.JPG",
    engine: "src/assets/images/icons/godot.png",
    language: "src/assets/images/icons/csharp.png",
    platform: "src/assets/images/icons/windows.png",
    link: "https://github.com/VADITIM/Anomaly",
    image1: "src/assets/images/projects/anomaly.JPG",
    image2: "src/assets/images/projects/anomaly.JPG",
    image3: "src/assets/images/projects/anomaly.JPG",
    image4: "src/assets/images/projects/anomaly.JPG",
    wip: true,
    estimated: 2035,
  },
]

export function ActiveProject(index: number) {
  activeProjectIndex.value = index
  console.log(`Active project: ${projects[index].name}`)
}

export function closeActiveProject(event?: MouseEvent) {
  if (event) {
    const target = event.target as HTMLElement;
    if (target.closest('.description-grid') || target.closest('.more-content')) {
      return; 
    }
  }
  activeProjectIndex.value = null;
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
