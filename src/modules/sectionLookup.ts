import { isClassifiedUnlocked } from './sectionsClassifiedUnlock';

/**
 * Lightweight id→index lookup with no Vue component imports.
 * Import from here (not sectionsRegistry) inside Vue components
 * to avoid the circular dependency: registry→component→registry.
 *
 * Must stay in sync with the SECTIONS array order in sectionsRegistry.ts.
 */
const SECTION_IDS = ['perks', 'logs', 'projects', 'sandbox', 'extra', 'classified'] as const;

export type SectionId = typeof SECTION_IDS[number];

export function getSectionIndexById(id: string): number {
	return SECTION_IDS.indexOf(id as SectionId);
}

/** True only for the Classified section while it hasn't been unlocked via QR scan. */
export function isSectionLocked(index: number): boolean {
	return index === getSectionIndexById('classified') && !isClassifiedUnlocked.value;
}
