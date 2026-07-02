import type { Component } from 'vue';
import PerksPage from '@components/Main/Perks Section/Perks-Section.vue';
import ProfilePage from '@components/Main/Profile Section/Logs-Section.vue';
import ProjectsPage from '@components/Main/Projects Section/Projects-Section.vue';
import PlaygroundPage from '@components/Main/Playground Section/Playground-Section.vue';
import ExtraPage from '@components/Main/Extra Section/Extra-Section.vue';
import { registerPerksAnimations } from './sectionsPerksAnimationHandler';
import { registerProfileAnimations } from './sectionsProfileAnimationHandler';
import { registerProjectsAnimations } from './sectionsProjectsAnimationHandler';
import { registerPlaygroundAnimations } from './sectionsPlaygroundAnimationHandler';
import { registerExtraAnimations } from './sectionsExtraAnimationHandler';

export const LOADING_COLOR = '#5bfd5b';

export interface SectionDefinition {
	/** Stable string key — used as :key in v-for and for id-based animation registration. */
	id: string;
	/** Display label shown in the nav menu. */
	label: string;
	/** Main accent color for this section — drives dot color and any section-aware UI. */
	color: string;
	/** Vue component. Must never be unmounted — GSAP targets must persist in the DOM. */
	component: Component;
	/** Called once by PageAnimations() after all sections are mounted. */
	registerAnimations: () => void;
}

/**
 * The ordered list of all sections. The array index is the section's numeric index.
 * To add a section: create the component + animation handler, then append here — nothing else needs changing.
 */
export const SECTIONS: SectionDefinition[] = [
	{ id: 'perks',    label: 'PERKS',    color: '#FFDD1B', component: PerksPage,    registerAnimations: registerPerksAnimations    },
	{ id: 'profile',  label: 'PROFILE',  color: '#0040ff', component: ProfilePage,  registerAnimations: registerProfileAnimations  },
	{ id: 'projects', label: 'PROJECTS', color: '#DC143C', component: ProjectsPage, registerAnimations: registerProjectsAnimations },
	{ id: 'playground', label: 'SANDBOX', color: '#5bfd5b', component: PlaygroundPage, registerAnimations: registerPlaygroundAnimations },
	{ id: 'extra',      label: 'EXTRA',   color: '#f09b3a', component: ExtraPage,      registerAnimations: registerExtraAnimations      },
];

export function getSectionIndexById(id: string): number {
	return SECTIONS.findIndex(s => s.id === id);
}
