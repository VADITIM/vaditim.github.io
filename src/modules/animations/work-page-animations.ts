import { gsap } from "gsap/gsap-core";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { activeProjectIndex, currentProjectIndex, projectsContainer, } from "../3 Work Page/work-projects";
import { ref, watch } from "vue";

let _scrollRafId: number | null = null;
let _snapTimeoutId: number | null = null;
let _startTimeoutId: number | null = null;
const scrolled = ref<boolean>(false);
let con: HTMLElement | null = null;
let spa: HTMLElement | null = null;
gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ immediateRender: false });


export function WorkPageAnimations() {
	if (document.querySelector(".projects-container")) {
		gsap.set(".carousel-item .p-name", { opacity: 0 });
		gsap.fromTo(".projects-container",
		{ y: 1000 },
		{
			y: 0,
			duration: .6,
			stagger: 0.1,
			scrollTrigger: { trigger: ".work-scroller", scrub: false, toggleActions: "play none none reverse",
				start: "top 30%",
				end: "bottom 30%",
				markers: true,
				onEnter: () => {
					const items = document.querySelectorAll(".carousel-item");
					const current = items[currentProjectIndex.value];
					if (current) {
						const pName = current.querySelector(".p-name");
						if (pName) gsap.to(pName, { opacity: 1, duration: 0.5, delay: 0.3 });
					}
				},
				onLeaveBack: () => {
					gsap.set(".carousel-item .p-name", { opacity: 0 });
				},
			},
		})

		// When the current project changes, fade out old p-name and fade in new one
		watch(currentProjectIndex, (newIndex, oldIndex) => {
			const items = document.querySelectorAll(".carousel-item");
			if (items[oldIndex]) {
				const oldPName = items[oldIndex].querySelector(".p-name");
				if (oldPName) gsap.to(oldPName, { opacity: 0, duration: 0.2 });
			}
			if (items[newIndex]) {
				const newPName = items[newIndex].querySelector(".p-name");
				if (newPName) gsap.to(newPName, { opacity: 1, duration: 0.5, delay: 0.2 });
			}
		})
	}
}
  

