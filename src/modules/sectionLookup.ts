/**
 * Lightweight id→index lookup with no Vue component imports.
 * Import from here (not sectionsRegistry) inside Vue components
 * to avoid the circular dependency: registry→component→registry.
 *
 * Must stay in sync with the SECTIONS array order in sectionsRegistry.ts.
 */
const SECTION_IDS = ['perks', 'logs', 'projects', 'sandbox', 'extra'] as const;

export type SectionId = typeof SECTION_IDS[number];

export function getSectionIndexById(id: string): number {
	return SECTION_IDS.indexOf(id as SectionId);
}
