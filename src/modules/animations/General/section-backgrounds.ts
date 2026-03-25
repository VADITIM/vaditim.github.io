import { gsap } from 'gsap'
import {
  onSectionEnterLeaveAnimation,
  SECTION_INDEX,
  type SectionTransitionStates,
} from '../section-state-machine'

gsap.defaults({ immediateRender: false })

const ENTER_DELAY = 0.5
const FRONT_LAYER_OFFSET = 0.1
const DURATION = 0.45

const BACKGROUND_TARGETS = [
  '.perks-section-background',
  '.profile-section-background-back',
  '.profile-section-background-front',
  '.projects-section-background-back',
  '.projects-section-background-front',
]

const isPerksEnter = (states: SectionTransitionStates) =>
 states.enterPerksFromProfile || states.enterPerksFromProjects || states.enterPerksFromNone

const isPerksLeave = (states: SectionTransitionStates) =>
  states.leavePerksToProfile || states.leavePerksToProjects

const isProfileEnter = (states: SectionTransitionStates) =>
  states.enterProfileFromPerks || states.enterProfileFromProjects || states.enterProfileFromNone

const isProfileLeave = (states: SectionTransitionStates) =>
  states.leaveProfileToPerks || states.leaveProfileToProjects

const isProjectsEnter = (states: SectionTransitionStates) =>
  states.enterProjectsFromProfile || states.enterProjectsFromNone

const isProjectsLeave = (states: SectionTransitionStates) =>
  states.leaveProjectsToProfile

function runBackgroundTransition(buildTimeline: (timeline: gsap.core.Timeline) => void) {
  const els = gsap.utils.toArray(BACKGROUND_TARGETS)
  els.forEach((el: any) => el.classList && el.classList.add('gsap--no-transition'))

  const tl = gsap.timeline({
    onComplete: () => els.forEach((el: any) => el.classList && el.classList.remove('gsap--no-transition')),
    onInterrupt: () => els.forEach((el: any) => el.classList && el.classList.remove('gsap--no-transition')),
  })

  buildTimeline(tl)
}

function playPerksEnter() {
    runBackgroundTransition((tl) => {
      tl.to('.perks-section-background',{ left: '-10%', ease: 'back.out', duration: DURATION },ENTER_DELAY)
    })
}

function playPerksLeave() {
  runBackgroundTransition((tl) => {
    tl.to('.perks-section-background', { left: '-30%', ease: 'back.in', duration: DURATION }, 0)
  })
}

function playProfileEnter() {
  runBackgroundTransition((tl) => {
    tl.to('.profile-section-background-back', { left: '-10%', ease: 'back.out', duration: DURATION }, ENTER_DELAY)
    tl.to('.profile-section-background-front', { left: '-10%', ease: 'back.out', duration: DURATION }, ENTER_DELAY + FRONT_LAYER_OFFSET)
  })
}

function playProfileLeave() {
  runBackgroundTransition((tl) => {
    tl.to('.profile-section-background-back', { left: '-30%', ease: 'back.in', duration: DURATION }, 0)
    tl.to('.profile-section-background-front', { left: '-30%', ease: 'back.in', duration: DURATION }, FRONT_LAYER_OFFSET)
  })
}

function playProjectsEnter() {
  runBackgroundTransition((tl) => {
    tl.to('.projects-section-background-back', { right: '-10%', ease: 'back.out', duration: DURATION }, ENTER_DELAY)
    tl.to('.projects-section-background-front', { right: '-10%', ease: 'back.out', duration: DURATION }, ENTER_DELAY + FRONT_LAYER_OFFSET)
  })
}

function playProjectsLeave() {
  runBackgroundTransition((tl) => {
    tl.to('.projects-section-background-back', { right: '-40%', ease: 'back.in', duration: DURATION }, 0)
    tl.to('.projects-section-background-front', { right: '-40%', ease: 'back.in', duration: DURATION }, FRONT_LAYER_OFFSET)
  })
}

export function ScrollBackgroundSections() {
  // Initialize all backgrounds to leave positions for NONE state
  gsap.set('.perks-section-background', { left: '-30%' })
  gsap.set('.profile-section-background-back', { left: '-30%' })
  gsap.set('.profile-section-background-front', { left: '-30%' })
  gsap.set('.projects-section-background-back', { right: '-40%' })
  gsap.set('.projects-section-background-front', { right: '-40%' })

  const cleanupPerks = onSectionEnterLeaveAnimation({
    isEnter: isPerksEnter,
    isLeave: isPerksLeave,
    onEnter: playPerksEnter,
    onLeave: playPerksLeave,
    initialSection: SECTION_INDEX.PERKS,
  })

  const cleanupProfile = onSectionEnterLeaveAnimation({
    isEnter: isProfileEnter,
    isLeave: isProfileLeave,
    onEnter: playProfileEnter,
    onLeave: playProfileLeave,
    initialSection: SECTION_INDEX.PROFILE,
  })

  const cleanupProjects = onSectionEnterLeaveAnimation({
    isEnter: isProjectsEnter,
    isLeave: isProjectsLeave,
    onEnter: playProjectsEnter,
    onLeave: playProjectsLeave,
    initialSection: SECTION_INDEX.PROJECTS,
  })

  return () => {
    cleanupPerks()
    cleanupProfile()
    cleanupProjects()
  }
}