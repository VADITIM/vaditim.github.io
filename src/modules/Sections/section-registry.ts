import type { Component } from 'vue';
import PerksPage from '@perks/aPerks-Section.vue';
import ProfilePage from '@profile/aProfile-Section.vue';
import ProjectsPage from '@projects/aProjects-Section.vue';
import PlaygroundPage from '@sections/Playground Section/aPlayground-Section.vue';
import ExtraPage from '@sections/Extra Section/aExtra-Section.vue';
import { registerPerksAnimations } from './Perks Section/Perks-Animation-Handler';
import { registerProfileAnimations } from './Profile Section/Profile-Animation-Handler';
import { registerProjectsAnimations } from './Projects Section/Projects-Animation-Handler';
import { registerPlaygroundAnimations } from './Playground Section/Playground-Animation-Handler';
import { registerExtraAnimations } from './Extra Section/Extra-Animation-Handler';

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
