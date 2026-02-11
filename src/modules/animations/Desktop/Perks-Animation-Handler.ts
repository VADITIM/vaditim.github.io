import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { breakpoints } from "../animation-handler";

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ immediateRender: false });

export function PerksAnimationDesktop() {
	Skills();
	Name();
}

function Skills() 
{
  gsap.matchMedia().add(`(min-width: ${breakpoints.desktop}px)`, () => {
	if (document.querySelector(".skill")) {
		const skillsTimeline = gsap.timeline({
			scrollTrigger: {
				trigger: ".perks-section-trigger",
				toggleActions: "play none none reverse",
				start: "top 40%",
				end: "bottom 0%",
				// markers: true,
			},
		});

		skillsTimeline.fromTo(".skill", { },
			{
				x: "-210%",
				duration: 0.21,
				stagger: 0.12,
			}
		);

		if (document.querySelector(".skills-line-container")) {
			skillsTimeline.fromTo(
				".skills-line-container",
				{ y: 0 },
				{
					y: -1000,
					duration: 0.2,
				},
				0
);}}})};


function Name() {
  gsap.matchMedia().add(`(min-width: ${breakpoints.desktop}px)`, () => {

	if (document.querySelector(".name-container")) {
		gsap.fromTo(".name-container", { },
		{
			x: "150%",
			duration: 0.5,
			scrollTrigger: { trigger: ".perks-section-trigger", scrub: false, toggleActions: "play none none reverse",
				start: "top 40%", 
				end: "bottom 0%",
				// markers: true,
},})}})};
