// Perks skills-board data; the quick-glance skill display on the Perks
// section's left side (see CLAUDE.md "Perks Section overhaul"). Each entry
// becomes its own Module; `color` accents that module and its skill
// cards so categories read at a glance without needing icons.
import { ref } from 'vue'

export interface PerkGraphNode {
	id: string
	label: string
	color: string
	// Short self-descriptor that replaces the name's default title while this
	// category is selected (see Name.vue). Edit these freely.
	tagline: string
	children: string[]
}

export const perkGraph: PerkGraphNode[] = [
	{ id: 'net',      label: '.NET',     color: '#ffdd1b', tagline: 'Game & App Developer', children: ['Unity', 'Tools', 'Godot', '.NET', 'Apps', 'EFCore', 'Games'] },
	{ id: 'frontend', label: 'Frontend', color: '#5bc4fd', tagline: 'Frontend Developer',   children: ['Vue', 'Angular', 'Typescript', 'mySQL'] },
	{ id: 'uiux',   label: 'UI/UX', color: '#ff6bd6', tagline: 'Interface Designer',   children: ['Vivid Motions', 'Seemless Navigation'] },
]

// The currently selected perk category (null = none). Shared source of truth so
// the slice band atop the name and the name's tagline both react to the same
// selection, while the crystal (Perks-Skills) can close its skill detail on it.
export const selectedPerkId = ref<string | null>(null)

// Detail copy shown in the side module when a child node is clicked.
export const perkInfo: Record<string, string> = {
	'Godot':        'Game development across both engines; gameplay systems, tooling, and shipped desktop / mobile builds in C#.',
	'Unity':        'Game development across both engines; gameplay systems, tooling, and shipped desktop / mobile builds in C#.',
	'.NET':                 'Application development on the .NET stack; from console tooling to structured, testable service code.',
	'Apps':         'End-to-end delivery: prototyping, iterating, and releasing playable apps and games as finished products.',
	'Games':         'End-to-end delivery: prototyping, iterating, and releasing playable apps and games as finished products.',
	'EFCore':         'End-to-end delivery: prototyping, iterating, and releasing playable apps and games as finished products.',
	'Tools':         'End-to-end delivery: prototyping, iterating, and releasing playable apps and games as finished products.',

	'Vue':                  'Component-driven SPAs with Vue 3, composition API, and animation-heavy interfaces like this portfolio.',
	'Angular':              'Structured enterprise front-ends with Angular; typed services, RxJS data flow, and component architecture.',
	'Typescript':           'Strictly-typed application code across every web project; interfaces, generics, and safe refactoring.',
	'mySQL':                'Relational data modelling and querying; schemas, joins, and integrating persistent storage into apps.',
	'GSAP':                'Relational data modelling and querying; schemas, joins, and integrating persistent storage into apps.',

	'Vivid Motions':        'GSAP-driven motion design: choreographed enter/leave transitions, timelines, and game-menu feel.',
	'Seemless Navigation':  'Navigation that never breaks flow; virtual scroll, section state machines, and interruption-safe animation.',
	'Clear Standards':  'Navigation that never breaks flow; virtual scroll, section state machines, and interruption-safe animation.',
}
