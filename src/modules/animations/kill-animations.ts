import { gsap } from 'gsap';

const SECTION_ANIMATION_TARGETS = [
  '.perks-section-background',
  '.profile-section-background-back',
  '.profile-section-background-front',
  '.projects-section-background-back',
  '.projects-section-background-front',

  '.perks-section-container',
  '.profile-section-container',
  '.projects-section-container',

  '.projects-container',
  '.project-list',
  '.pagination-dots',
  '.magnetic-dots-container',
  '.helix-container',
  '.helix',

  '.name-container',
  '.skills-line-container',
  '.skill',
];

export function KillAllSectionAnimations() {
  if (typeof document === 'undefined') return;

  gsap.killTweensOf(SECTION_ANIMATION_TARGETS);

  document
    .querySelectorAll('.gsap--no-transition')
    .forEach((el) => el.classList.remove('gsap--no-transition'));
}
