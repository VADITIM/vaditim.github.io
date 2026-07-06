// Perks skills-board data; the quick-glance skill display on the Perks
// section's left side (see CLAUDE.md "Perks Section overhaul"). Each entry
// becomes its own Module-Display; `color` accents that module and its skill
// cards so categories read at a glance without needing icons.
export interface PerkGraphNode {
	id: string
	label: string
	color: string
	children: string[]
}

export const perkGraph: PerkGraphNode[] = [
	{ id: 'csharp', label: 'C#',    color: '#ffdd1b', children: ['Unity & Godot', '.NET', 'Apps & Games'] },
	{ id: 'web',    label: 'Web',   color: '#5bc4fd', children: ['Vue', 'Angular', 'Typescript', 'mySQL'] },
	{ id: 'uiux',   label: 'UI/UX', color: '#ff6bd6', children: ['Vivid Motions', 'Seemless Navigation'] },
]

// Detail copy shown in the side module when a child node is clicked.
export const perkInfo: Record<string, string> = {
	'Unity & Godot':        'Game development across both engines; gameplay systems, tooling, and shipped desktop / mobile builds in C#.',
	'.NET':                 'Application development on the .NET stack; from console tooling to structured, testable service code.',
	'Apps & Games':         'End-to-end delivery: prototyping, iterating, and releasing playable apps and games as finished products.',
	'Vue':                  'Component-driven SPAs with Vue 3, composition API, and animation-heavy interfaces like this portfolio.',
	'Angular':              'Structured enterprise front-ends with Angular; typed services, RxJS data flow, and component architecture.',
	'Typescript':           'Strictly-typed application code across every web project; interfaces, generics, and safe refactoring.',
	'mySQL':                'Relational data modelling and querying; schemas, joins, and integrating persistent storage into apps.',
	'Vivid Motions':        'GSAP-driven motion design: choreographed enter/leave transitions, timelines, and game-menu feel.',
	'Seemless Navigation':  'Navigation that never breaks flow; virtual scroll, section state machines, and interruption-safe animation.',
}
