import { gsap } from 'gsap'
import { breakpoints } from '@modules/animations/animation-handler'
import {
  onSectionEnterLeaveAnimation,
  onSectionStatesChange,
  SECTION_INDEX,
  type SectionTransitionStates,
} from '@modules/Sections/section-state-machine'
import { currentSection } from '@modules/Sections/sections'
import { dragOffset, dragDirection, consumeLastDragOffsetY as ConsumeLastDragOffsetY, wasTransitionDragged as WasTransitionDragged } from '@modules/Misc/mobile-drag-navigation'

gsap.defaults({ immediateRender: false })

const ENTER_DELAY = 0.5
const FRONT_LAYER_OFFSET = 0.1
const DURATION = 0.45

const vibrateOnComplete = () => {
  if (typeof navigator === 'undefined') return
  if (!('vibrate' in navigator)) return
  navigator.vibrate(10)
}

const BACKGROUND_TARGETS = [
  '.perks-section-background',
  '.profile-section-background-back',
  '.profile-section-background-front',
  '.projects-section-background-back',
  '.projects-section-background-front',
]

const isPerksEnter = (states: SectionTransitionStates) => states.enterPerksFromProfile || states.enterPerksFromProjects || states.enterPerksFromNone
const isPerksLeave = (states: SectionTransitionStates) => states.leavePerksToProfile || states.leavePerksToProjects
const isProfileEnter = (states: SectionTransitionStates) => states.enterProfileFromPerks || states.enterProfileFromProjects || states.enterProfileFromNone
const isProfileLeave = (states: SectionTransitionStates) => states.leaveProfileToPerks || states.leaveProfileToProjects
const isProjectsEnter = (states: SectionTransitionStates) => states.enterProjectsFromProfile || states.enterProjectsFromPerks || states.enterProjectsFromNone
const isProjectsLeave = (states: SectionTransitionStates) =>  states.leaveProjectsToProfile || states.leaveProjectsToPerks

function DragTransition(buildTimeline: (timeline: gsap.core.Timeline) => void) {
  const els = gsap.utils.toArray(BACKGROUND_TARGETS)
  els.forEach((el: any) => el.classList && el.classList.add('gsap--no-transition'))

  const tl = gsap.timeline({
    onComplete: () => {
      els.forEach((el: any) => el.classList && el.classList.remove('gsap--no-transition'))
      vibrateOnComplete()
    },
    onInterrupt: () => els.forEach((el: any) => el.classList && el.classList.remove('gsap--no-transition')),
  })

  buildTimeline(tl)
}

function playPerksEnterDesktop() {
    DragTransition((tl) => {
      tl.to('.perks-section-background',{ left: '-10%', top: '-5%', ease: 'back.out', duration: DURATION },ENTER_DELAY)
    })
}

function playPerksLeaveDesktop() {
  DragTransition((tl) => {
    tl.to('.perks-section-background', { left: '-30%', top: '0%', ease: 'back.in', duration: DURATION, onComplete: vibrateOnComplete }, 0)
  })
}

function playProfileEnterDesktop() {
  DragTransition((tl) => {
    tl.to('.profile-section-background-back', { left: '-10%', top: '-5%', ease: 'back.out', duration: DURATION }, ENTER_DELAY)
    tl.to('.profile-section-background-front', { left: '-10%', top: '-5%', ease: 'back.out', duration: DURATION }, ENTER_DELAY + FRONT_LAYER_OFFSET)
  })
}

function playProfileLeaveDesktop() {
  DragTransition((tl) => {
    tl.to('.profile-section-background-back', { left: '-30%', ease: 'back.in', duration: DURATION }, 0)
    tl.to('.profile-section-background-front', { left: '-30%', ease: 'back.in', duration: DURATION }, FRONT_LAYER_OFFSET)
  })
}

function playProjectsEnterDesktop() {
  DragTransition((tl) => {
    tl.to('.projects-section-background-back', { right: '-10%', ease: 'back.out', duration: DURATION }, ENTER_DELAY)
    tl.to('.projects-section-background-front', { right: '-10%', ease: 'back.out', duration: DURATION }, ENTER_DELAY + FRONT_LAYER_OFFSET)
  })
}

function playProjectsLeaveDesktop() {
  DragTransition((tl) => {
    tl.to('.projects-section-background-back', { right: '-40%', ease: 'back.in', duration: DURATION }, 0)
    tl.to('.projects-section-background-front', { right: '-40%', ease: 'back.in', duration: DURATION }, FRONT_LAYER_OFFSET)
  })
}

// -------------------- Mobile animations (<= smallDesktop) --------------------

const MOBILE_DURATION = 0.95
const MOBILE_ENTER_TOP = '-90%'
const MOBILE_LEAVE_TOP = '-150%'
const MOBILE_BOTTOM_HIDDEN = '100%'

function initMobileBackgroundState() {
  BACKGROUND_TARGETS.forEach((selector) => {
    gsap.set(selector, { clearProps: 'transition,transform' })
  })

  // New mobile foundation: all backgrounds start outside the bottom.
  gsap.set('.perks-section-background', { top: MOBILE_BOTTOM_HIDDEN })
  gsap.set('.profile-section-background-back', { top: MOBILE_BOTTOM_HIDDEN })
  gsap.set('.profile-section-background-front', { top: MOBILE_BOTTOM_HIDDEN })
  gsap.set('.projects-section-background-back', { top: MOBILE_BOTTOM_HIDDEN })
  gsap.set('.projects-section-background-front', { top: MOBILE_BOTTOM_HIDDEN })
}

function playPerksEnterMobile() {
  DragTransition((tl) => {
    tl.set('.perks-section-background', { top: MOBILE_BOTTOM_HIDDEN }, 0)
    tl.to('.perks-section-background', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, ENTER_DELAY)
  })
}

function playProfileEnterMobile() {
  DragTransition((tl) => {
    tl.set('.profile-section-background-back', { top: MOBILE_BOTTOM_HIDDEN }, 0)
    tl.set('.profile-section-background-front', { top: MOBILE_BOTTOM_HIDDEN }, 0)
    tl.to('.profile-section-background-back', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, ENTER_DELAY)
    tl.to('.profile-section-background-front', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, ENTER_DELAY)
  })
}

function playProjectsEnterMobile() {
  DragTransition((tl) => {
    tl.set('.projects-section-background-back', { top: MOBILE_BOTTOM_HIDDEN }, 0)
    tl.set('.projects-section-background-front', { top: MOBILE_BOTTOM_HIDDEN }, 0)
    tl.to('.projects-section-background-back', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, ENTER_DELAY)
    tl.to('.projects-section-background-front', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, ENTER_DELAY)
  })
}

function playMobileBackgroundTransition(states: SectionTransitionStates) {
  const shouldAnimate =
    states.enterPerksFromNone || states.enterPerksFromProfile || states.enterPerksFromProjects ||
    states.leavePerksToProfile || states.leavePerksToProjects ||
    states.enterProfileFromPerks || states.enterProfileFromProjects || states.enterProfileFromNone ||
    states.leaveProfileToPerks || states.leaveProfileToProjects ||
    states.enterProjectsFromProfile || states.enterProjectsFromPerks || states.enterProjectsFromNone ||
    states.leaveProjectsToProfile || states.leaveProjectsToPerks

  if (!shouldAnimate) return

  const hasLeave =
    states.leavePerksToProfile || states.leavePerksToProjects ||
    states.leaveProfileToPerks || states.leaveProfileToProjects ||
    states.leaveProjectsToProfile || states.leaveProjectsToPerks

  const enterAt = ENTER_DELAY

  DragTransition((tl) => {
    // PERKS
    if (states.enterPerksFromNone) {
      tl.set('.perks-section-background', { top: MOBILE_BOTTOM_HIDDEN }, 0)
      tl.to('.perks-section-background', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
    } else if (states.enterPerksFromProfile || states.enterPerksFromProjects) {
      tl.set('.perks-section-background', { top: MOBILE_LEAVE_TOP }, 0)
      tl.to('.perks-section-background', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
    }

    if (states.leavePerksToProfile || states.leavePerksToProjects) {
      tl.to('.perks-section-background', { top: MOBILE_LEAVE_TOP, duration: MOBILE_DURATION, ease: 'back.inOut', onComplete: vibrateOnComplete }, 0)
    }

    // PROFILE
    if (states.enterProfileFromNone || states.enterProfileFromPerks) {
      tl.set('.profile-section-background-back', { top: MOBILE_BOTTOM_HIDDEN }, 0)
      tl.set('.profile-section-background-front', { top: MOBILE_BOTTOM_HIDDEN }, 0)
      tl.to('.profile-section-background-back', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
      tl.to('.profile-section-background-front', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
    } else if (states.enterProfileFromProjects) {
      // Coming from Projects: Profile drop in from above.
      tl.set('.profile-section-background-back', { top: MOBILE_LEAVE_TOP }, 0)
      tl.set('.profile-section-background-front', { top: MOBILE_LEAVE_TOP }, 0)
      tl.to('.profile-section-background-back', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
      tl.to('.profile-section-background-front', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
    }

    // Leaving PROFILE to PERKS: go back down.
    if (states.leaveProfileToPerks) {
      tl.to('.profile-section-background-back', { top: MOBILE_BOTTOM_HIDDEN, duration: MOBILE_DURATION, ease: 'back.inOut', onComplete: vibrateOnComplete }, 0)
      tl.to('.profile-section-background-front', { top: MOBILE_BOTTOM_HIDDEN, duration: MOBILE_DURATION, ease: 'back.inOut' }, 0)
    }

    // Leaving PROFILE to PROJECTS: move up 
    if (states.leaveProfileToProjects) {
      tl.to('.profile-section-background-back', { top: MOBILE_LEAVE_TOP, duration: MOBILE_DURATION, ease: 'back.inOut', onComplete: vibrateOnComplete }, 0)
      tl.to('.profile-section-background-front', { top: MOBILE_LEAVE_TOP, duration: MOBILE_DURATION, ease: 'back.inOut' }, 0)
    }

    // PROJECTS
    if (states.enterProjectsFromNone || states.enterProjectsFromProfile || states.enterProjectsFromPerks) {
      tl.set('.projects-section-background-back', { top: MOBILE_BOTTOM_HIDDEN }, 0)
      tl.set('.projects-section-background-front', { top: MOBILE_BOTTOM_HIDDEN }, 0)
      tl.to('.projects-section-background-back', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
      tl.to('.projects-section-background-front', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
    }

    if (states.leaveProjectsToProfile || states.leaveProjectsToPerks) {
      tl.to('.projects-section-background-back', { top: MOBILE_BOTTOM_HIDDEN, duration: MOBILE_DURATION, ease: 'back.inOut', onComplete: vibrateOnComplete }, 0)
      tl.to('.projects-section-background-front', { top: MOBILE_BOTTOM_HIDDEN, duration: MOBILE_DURATION, ease: 'back.inOut' }, 0)
    }
  })
}

export function ScrollBackgroundSections() {
  const MatchMedia = gsap.matchMedia()

  MatchMedia.add(`(min-width: ${breakpoints.smallDesktop}px)`, () => {
    if (!document.querySelector('.section-background-layer')) return

    gsap.set('.perks-section-background', { left: '-30%', top: '0%' })
    gsap.set('.profile-section-background-back', { left: '-30%', top: '0%' })
    gsap.set('.profile-section-background-front', { left: '-30%', top: '0%' })
    gsap.set('.projects-section-background-back', { right: '-40%', top: '0%' })
    gsap.set('.projects-section-background-front', { right: '-40%', top: '0%' })

    const cleanupPerks = onSectionEnterLeaveAnimation({
      isEnter: isPerksEnter,
      isLeave: isPerksLeave,
      onEnter: playPerksEnterDesktop,
      onLeave: playPerksLeaveDesktop,
      initialSection: SECTION_INDEX.PERKS,
    })

    const cleanupProfile = onSectionEnterLeaveAnimation({
      isEnter: isProfileEnter,
      isLeave: isProfileLeave,
      onEnter: playProfileEnterDesktop,
      onLeave: playProfileLeaveDesktop,
      initialSection: SECTION_INDEX.PROFILE,
    })

    const cleanupProjects = onSectionEnterLeaveAnimation({
      isEnter: isProjectsEnter,
      isLeave: isProjectsLeave,
      onEnter: playProjectsEnterDesktop,
      onLeave: playProjectsLeaveDesktop,
      initialSection: SECTION_INDEX.PROJECTS,
    })

    return () => {
      cleanupPerks()
      cleanupProfile()
      cleanupProjects()
    }
  })

  MatchMedia.add(`(max-width: ${breakpoints.smallDesktop - 1}px)`, () => {
    if (!document.querySelector('.section-background-layer')) return

    BACKGROUND_TARGETS.forEach((selector) => {
      gsap.set(selector, { clearProps: 'left,right,top' })
    })

    initMobileBackgroundState()

    if (currentSection.value === SECTION_INDEX.PERKS) playPerksEnterMobile()
    else if (currentSection.value === SECTION_INDEX.PROFILE) playProfileEnterMobile()
    else if (currentSection.value === SECTION_INDEX.PROJECTS) playProjectsEnterMobile()

    const cleanupMobile = onSectionStatesChange((states) => {
      playMobileBackgroundTransition(states)
    })

    return () => {
      cleanupMobile()

      BACKGROUND_TARGETS.forEach((selector) => {
        gsap.set(selector, { clearProps: 'left,right,top,opacity,transform' })
      })
    }
  })

  return () => {
    MatchMedia.revert()
  }
}