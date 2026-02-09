import { gsap } from "gsap/gsap-core";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { currentProjectIndex, } from "../3 Work Page/work-projects";
import { watch } from "vue";

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
				// markers: true,
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
  

