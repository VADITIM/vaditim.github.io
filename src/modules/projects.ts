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
  type?: string
  image1?: string
  image2?: string
  image3?: string
  image4?: string
  mobileImage?: boolean
  ai?: boolean
  wip?: boolean
  estimated?: number | string
}

export const activeProjectIndex = ref<number | null>(null)
export const currentProjectIndex = ref(0)
export const projectsContainer = ref<HTMLElement>()
export const isDragging = ref(false)
export const startX = ref(0)
export const startY = ref(0)
export const clickStartX = ref(0)
export const clickStartY = ref(0)
export const scrollLeft = ref(0)
export const transitioning = ref(false)

// 3D Carousel rotation state
export const carouselRotation = ref(0)
export const anglePerItem = () => 360 / projects.length

export const projects: Project[] = [
  {
    name: "Wrath of the Fallen Queen",
    description: "Description",
    year: 2024,
    img: new URL("../assets/images/projects/wrathofthefallenqueen/wrathofthefallenqueen.png", import.meta.url).href,
    engine: new URL("../assets/images/icons/webengine.png", import.meta.url).href,
    language: new URL("../assets/images/icons/javascript.png", import.meta.url).href,
    platform: new URL("../assets/images/icons/webapp.png", import.meta.url).href,
    link: "https://github.com/VADITIM/Wrath-Of-The-Fallen-Queen",
    type: "info",
    image1: new URL("../assets/images/projects/wrathofthefallenqueen/1.png", import.meta.url).href,
    image2: new URL("../assets/images/projects/wrathofthefallenqueen/2.png", import.meta.url).href,
    image3: new URL("../assets/images/projects/wrathofthefallenqueen/3.png", import.meta.url).href,
    image4: new URL("../assets/images/projects/wrathofthefallenqueen/4.png", import.meta.url).href,
    ai: true,
  },

  {
    name: "Haunted",
    description: "Description",
    year: 2024,
    img: new URL("../assets/images/projects/haunted.png", import.meta.url).href,
    engine: new URL("../assets/images/icons/unity.png", import.meta.url).href,
    language: new URL("../assets/images/icons/csharp.png", import.meta.url).href,
    platform: new URL("../assets/images/icons/windows.png", import.meta.url).href,
    link: "https://github.com/VADITIM/Haunted/releases",
    type: "download",
    image1: new URL("../assets/images/projects/haunted.png", import.meta.url).href,
    image2: new URL("../assets/images/projects/haunted.png", import.meta.url).href,
    image3: new URL("../assets/images/projects/haunted.png", import.meta.url).href,
    image4: new URL("../assets/images/projects/haunted.png", import.meta.url).href,
    ai: true,
  },

	// {
  //   name: "Velvet Deck Web",
  //   description: "Description",
  //   year: 2024,
  //   img: "src/assets/images/projects/velvetdeck.png",
  //   engine: "src/assets/images/icons/webengine.png",
  //   language: "src/assets/images/icons/javascript.png",
  //   platform: "src/assets/images/icons/webapp.png",
  //   link: "https://github.com/VADITIM/Card-Game",
  //   type: "play",
  //   image1: "src/assets/images/projects/velvetdeck.png",
  //   image2: "src/assets/images/projects/velvetdeck.png",
  //   image3: "src/assets/images/projects/velvetdeck.png",
  //   image4: "src/assets/images/projects/velvetdeck.png",
  //   ai: true,
  // },

  {
    name: "Boundless Board",
    description: "Description",
    year: 2025,
    img: new URL("../assets/images/projects/boundlessboard.png", import.meta.url).href,
    engine: new URL("../assets/images/icons/unity.png", import.meta.url).href,
    language: new URL("../assets/images/icons/csharp.png", import.meta.url).href,
    platform: new URL("../assets/images/icons/windows.png", import.meta.url).href,
    link: "https://github.com/VADITIM/Boundless-Board/releases",
    type: "download",
    image1: new URL("../assets/images/projects/boundlessboard.png", import.meta.url).href,
    image2: new URL("../assets/images/projects/boundlessboard.png", import.meta.url).href,
    image3: new URL("../assets/images/projects/boundlessboard.png", import.meta.url).href,
    image4: new URL("../assets/images/projects/boundlessboard.png", import.meta.url).href,
    ai: true,
  },

  {
    name: "//NETRUNNERS",
    description: "Description",
    year: 2025,
    img: new URL("../assets/images/projects/netrunners.png", import.meta.url).href,
    engine: new URL("../assets/images/icons/unity.png", import.meta.url).href,
    language: new URL("../assets/images/icons/csharp.png", import.meta.url).href,
    platform: new URL("../assets/images/icons/windows.png", import.meta.url).href,
    link: "https://github.com/VADITIM/NETRUNNERS/releases",
    type: "download",
    image1: new URL("../assets/images/projects/netrunners.png", import.meta.url).href,
    image2: new URL("../assets/images/projects/netrunners.png", import.meta.url).href,
    image3: new URL("../assets/images/projects/netrunners.png", import.meta.url).href,
    image4: new URL("../assets/images/projects/netrunners.png", import.meta.url).href,
    ai: true,
  },

  // {
  //   name: "Veil of Remorse",
  //   description: "Description",
  //   year: 2025,
  //   img: "src/assets/images/projects/netrunners.png",
  //   engine: "src/assets/images/icons/unity.png",
  //   language: "src/assets/images/icons/csharp.png",
  //   platform: "src/assets/images/icons/windows.png",
  //   link: "https://github.com/VADITIM/Veil-of-Remorse",
    // type: true,
  //   image1: "src/assets/images/projects/netrunners.png",
  //   image2: "src/assets/images/projects/netrunners.png",
  //   image3: "src/assets/images/projects/netrunners.png",
  //   image4: "src/assets/images/projects/netrunners.png",
  //   ai: true,
  // },

	{
    name: "Simulation City Reborn",
    description: "Description",
    year: 2025,
  img: new URL("../assets/images/projects/simulationcity.jpg", import.meta.url).href,
  engine: new URL("../assets/images/icons/unity.png", import.meta.url).href,
  language: new URL("../assets/images/icons/csharp.png", import.meta.url).href,
  platform: new URL("../assets/images/icons/windows.png", import.meta.url).href,
    link: "https://github.com/Nobody-989/SimulationCity",
    type: "info",
  image1: new URL("../assets/images/projects/simulationcity.jpg", import.meta.url).href,
  image2: new URL("../assets/images/projects/simulationcity.jpg", import.meta.url).href,
  image3: new URL("../assets/images/projects/simulationcity.jpg", import.meta.url).href,
  image4: new URL("../assets/images/projects/simulationcity.jpg", import.meta.url).href,
  },

	{
		name: "Velvet Deck",
		description: "Description",
		year: 2025,
    img: new URL("../assets/images/projects/velvetdeck/velvetdeck.png", import.meta.url).href,
    engine: new URL("../assets/images/icons/godot.png", import.meta.url).href,
    language: new URL("../assets/images/icons/csharp.png", import.meta.url).href,
    platform: new URL("../assets/images/icons/android.png", import.meta.url).href,
		link: "https://github.com/VADITIM/Velvet-Deck",
    type: "download",
    image1: new URL("../assets/images/projects/velvetdeck/velvetdeck1.jpg", import.meta.url).href,
    image2: new URL("../assets/images/projects/velvetdeck/velvetdeck2.jpg", import.meta.url).href,
    image3: new URL("../assets/images/projects/velvetdeck/velvetdeck3.jpg", import.meta.url).href,
    image4: new URL("../assets/images/projects/velvetdeck/velvetdeck4.jpg", import.meta.url).href,
    mobileImage: true,
    ai: true,
	},
  
	// {
	// 	name: "'Godot 3D'",
	// 	description: "Description",
	// 	year: 2025,
	// 	img: "src/assets/images/projects/velvetdeck.png", 
	// 	engine: "src/assets/images/icons/godot.png",
	// 	language: "src/assets/images/icons/csharp.png",
	// 	platform: "src/assets/images/icons/windows.png",
	// 	link: "https://github.com/VADITIM/Velvet-Deck",
  // type: true,
  //   image1: "src/assets/images/projects/velvetdeck.png",
  //   image2: "src/assets/images/projects/velvetdeck.png",
  //   image3: "src/assets/images/projects/velvetdeck.png",
  //   image4: "src/assets/images/projects/velvetdeck.png",
  //   wip: true,
  //   estimated: 2027,
	// },

	{
    name: "Anomaly",
    description: "Description",
    year: "Planned 2030",
    img: new URL("../assets/images/projects/anomaly.JPG", import.meta.url).href,
    engine: new URL("../assets/images/icons/godot.png", import.meta.url).href,
    language: new URL("../assets/images/icons/csharp.png", import.meta.url).href,
    platform: new URL("../assets/images/icons/windows.png", import.meta.url).href,
    link: "https://github.com/VADITIM/Anomaly",
    type: "info",
    image1: new URL("../assets/images/projects/anomaly.JPG", import.meta.url).href,
    image2: new URL("../assets/images/projects/anomaly.JPG", import.meta.url).href,
    image3: new URL("../assets/images/projects/anomaly.JPG", import.meta.url).href,
    image4: new URL("../assets/images/projects/anomaly.JPG", import.meta.url).href,
    wip: true,
    estimated: 2035,
  },
]



export function ActiveProject(index: number, event?: MouseEvent) {
  if (event && (Math.abs(event.pageX - clickStartX.value) > 50 || Math.abs(event.pageY - clickStartY.value) > 50)) return;

  activeProjectIndex.value = index; 
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
  startY.value = event.pageY
  clickStartX.value = event.pageX
  clickStartY.value = event.pageY
  scrollLeft.value = projectsContainer.value.scrollLeft
  
  projectsContainer.value.style.cursor = 'grabbing'
}

export function drag(event: MouseEvent) {
  if (!isDragging.value || !projectsContainer.value) return
  
  event.preventDefault()
  const x = event.pageX - projectsContainer.value.offsetLeft
  const walk = (x - startX.value) * 3 
  projectsContainer.value.scrollLeft = scrollLeft.value - walk
  
  const distanceX = Math.abs(event.pageX - clickStartX.value)
  const distanceY = Math.abs(event.pageY - clickStartY.value)
  
  const projects = document.querySelectorAll('.project')
  projects.forEach((proj) => {
    if (distanceX > 5 || distanceY > 5) {
      (proj as HTMLElement).style.cursor = 'grabbing'
    }
  })
}

export function endDrag() {
  isDragging.value = false
  
  if (projectsContainer.value) {
    projectsContainer.value.style.cursor = 'grab'
  }
  
  const projects = document.querySelectorAll('.project')
  projects.forEach((proj) => {
    (proj as HTMLElement).style.cursor = 'pointer'
  })
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
	navigateToCarouselProject(currentProjectIndex.value)
}

export function previousProject() {
	if (currentProjectIndex.value <= 0) return

  previousClicked.value = true
  setTimeout(() => {
    previousClicked.value = false
  }, 500)

	currentProjectIndex.value--
	navigateToCarouselProject(currentProjectIndex.value)
}

// Navigate carousel to specific project index (takes shortest rotation path)
export function navigateToCarouselProject(index: number) {
  const targetRotation = -index * anglePerItem()
  const currentRotation = carouselRotation.value
  
  // Normalize both rotations to 0-360 range for comparison
  const normalizedCurrent = ((currentRotation % 360) + 360) % 360
  const normalizedTarget = ((targetRotation % 360) + 360) % 360
  
  // Calculate the difference
  let diff = normalizedTarget - normalizedCurrent
  
  // Choose the shortest path (if diff > 180, go the other way)
  if (diff > 180) {
    diff -= 360
  } else if (diff < -180) {
    diff += 360
  }
  
  // Apply the shortest rotation from current position
  carouselRotation.value = currentRotation + diff
  currentProjectIndex.value = index
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
  navigateToCarouselProject(index)
}