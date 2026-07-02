import { gsap } from 'gsap'
import { breakpoints } from '@modules/animationHandler'
import {
  onSectionEnterLeaveAnimation,
  onSectionStatesChange,
  type SectionTransitionMeta,
} from '@modules/sectionsStateMachine'
import { currentSection } from '@modules/sectionsCore'
import { getSectionIndexById } from '@modules/sectionsRegistry'
import { SECTION_ENTER_DELAY } from '@modules/sectionsTransition'
import { dragOffset, dragDirection, consumeLastDragOffsetY as ConsumeLastDragOffsetY, wasTransitionDragged as WasTransitionDragged } from '@modules/miscMobileDragNavigation'

gsap.defaults({ immediateRender: false })

const FRONT_LAYER_OFFSET = 0.1
const DURATION = 0.45

// Corner slices (extra, sandbox) reveal/hide along top or bottom instead of
// left/right, but follow the exact same "mostly hidden -> partially revealed"
// convention as the left/right slices below (e.g. perks' left: -30% -> -10%).
const CORNER_HIDDEN = '-40%'
const CORNER_REVEAL = '-10%'

const vibrateOnComplete = () => {
  if (typeof navigator === 'undefined') return
  if (!('vibrate' in navigator)) return
  navigator.vibrate(10)
}

const BACKGROUND_TARGETS = [
  '.perks-section-background-back',
  '.perks-section-background-front',
  '.profile-section-background-back',
  '.profile-section-background-front',
  '.projects-section-background-back',
  '.projects-section-background-front',
  '.extra-section-background-topright',
  '.extra-section-background-bottomleft',
  '.sandbox-corner-tl',
  '.sandbox-corner-tr',
  '.sandbox-corner-bl',
  '.sandbox-corner-br',
]

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
  gsap.killTweensOf(['.perks-section-background-back', '.perks-section-background-front'])
  DragTransition((tl) => {
    tl.to('.perks-section-background-back', { left: '-10%', top: '-5%', ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY)
    tl.to('.perks-section-background-front', { left: '-10%', top: '-5%', ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY + FRONT_LAYER_OFFSET)
  })
}

function playPerksLeaveDesktop() {
  gsap.killTweensOf(['.perks-section-background-back', '.perks-section-background-front'])
  DragTransition((tl) => {
    tl.to('.perks-section-background-back', { left: '-30%', top: '0%', ease: 'back.in', duration: DURATION, overwrite: 'auto', onComplete: vibrateOnComplete }, 0)
    tl.to('.perks-section-background-front', { left: '-30%', top: '0%', ease: 'back.in', duration: DURATION, overwrite: 'auto' }, FRONT_LAYER_OFFSET)
  })
}

function playProfileEnterDesktop() {
  gsap.killTweensOf(['.profile-section-background-back', '.profile-section-background-front'])
  DragTransition((tl) => {
    tl.to('.profile-section-background-back', { left: '-10%', top: '-5%', ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY)
    tl.to('.profile-section-background-front', { left: '-10%', top: '-5%', ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY + FRONT_LAYER_OFFSET)
  })
}

function playProfileLeaveDesktop() {
  gsap.killTweensOf(['.profile-section-background-back', '.profile-section-background-front'])
  DragTransition((tl) => {
    tl.to('.profile-section-background-back', { left: '-30%', ease: 'back.in', duration: DURATION, overwrite: 'auto' }, 0)
    tl.to('.profile-section-background-front', { left: '-30%', ease: 'back.in', duration: DURATION, overwrite: 'auto' }, FRONT_LAYER_OFFSET)
  })
}

function playProjectsEnterDesktop() {
  gsap.killTweensOf(['.projects-section-background-back', '.projects-section-background-front'])
  DragTransition((tl) => {
    tl.to('.projects-section-background-back', { right: '-10%', ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY)
    tl.to('.projects-section-background-front', { right: '-10%', ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY + FRONT_LAYER_OFFSET)
  })
}

function playProjectsLeaveDesktop() {
  gsap.killTweensOf(['.projects-section-background-back', '.projects-section-background-front'])
  DragTransition((tl) => {
    tl.to('.projects-section-background-back', { right: '-40%', ease: 'back.in', duration: DURATION, overwrite: 'auto' }, 0)
    tl.to('.projects-section-background-front', { right: '-40%', ease: 'back.in', duration: DURATION, overwrite: 'auto' }, FRONT_LAYER_OFFSET)
  })
}

function playExtraEnterDesktop() {
  gsap.killTweensOf(['.extra-section-background-topright', '.extra-section-background-bottomleft'])
  DragTransition((tl) => {
    tl.to('.extra-section-background-topright', { top: CORNER_REVEAL, ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY)
    tl.to('.extra-section-background-bottomleft', { bottom: CORNER_REVEAL, ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY)
  })
}

function playExtraLeaveDesktop() {
  gsap.killTweensOf(['.extra-section-background-topright', '.extra-section-background-bottomleft'])
  DragTransition((tl) => {
    tl.to('.extra-section-background-topright', { top: CORNER_HIDDEN, ease: 'back.in', duration: DURATION, overwrite: 'auto' }, 0)
    tl.to('.extra-section-background-bottomleft', { bottom: CORNER_HIDDEN, ease: 'back.in', duration: DURATION, overwrite: 'auto' }, 0)
  })
}

function playSandboxEnterDesktop() {
  gsap.killTweensOf(['.sandbox-corner-tl', '.sandbox-corner-tr', '.sandbox-corner-bl', '.sandbox-corner-br'])
  DragTransition((tl) => {
    tl.to('.sandbox-corner-tl', { top: CORNER_REVEAL, ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY)
    tl.to('.sandbox-corner-tr', { top: CORNER_REVEAL, ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY)
    tl.to('.sandbox-corner-bl', { bottom: CORNER_REVEAL, ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY)
    tl.to('.sandbox-corner-br', { bottom: CORNER_REVEAL, ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY)
  })
}

function playSandboxLeaveDesktop() {
  gsap.killTweensOf(['.sandbox-corner-tl', '.sandbox-corner-tr', '.sandbox-corner-bl', '.sandbox-corner-br'])
  DragTransition((tl) => {
    tl.to('.sandbox-corner-tl', { top: CORNER_HIDDEN, ease: 'back.in', duration: DURATION, overwrite: 'auto' }, 0)
    tl.to('.sandbox-corner-tr', { top: CORNER_HIDDEN, ease: 'back.in', duration: DURATION, overwrite: 'auto' }, 0)
    tl.to('.sandbox-corner-bl', { bottom: CORNER_HIDDEN, ease: 'back.in', duration: DURATION, overwrite: 'auto' }, 0)
    tl.to('.sandbox-corner-br', { bottom: CORNER_HIDDEN, ease: 'back.in', duration: DURATION, overwrite: 'auto' }, 0)
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

  gsap.set('.perks-section-background-back', { top: MOBILE_BOTTOM_HIDDEN })
  gsap.set('.perks-section-background-front', { top: MOBILE_BOTTOM_HIDDEN })
  gsap.set('.profile-section-background-back', { top: MOBILE_BOTTOM_HIDDEN })
  gsap.set('.profile-section-background-front', { top: MOBILE_BOTTOM_HIDDEN })
  gsap.set('.projects-section-background-back', { top: MOBILE_BOTTOM_HIDDEN })
  gsap.set('.projects-section-background-front', { top: MOBILE_BOTTOM_HIDDEN })
  gsap.set('.extra-section-background-topright', { top: MOBILE_BOTTOM_HIDDEN })
  gsap.set('.extra-section-background-bottomleft', { top: MOBILE_BOTTOM_HIDDEN })
  gsap.set(['.sandbox-corner-tl', '.sandbox-corner-tr'], { top: CORNER_HIDDEN })
  gsap.set(['.sandbox-corner-bl', '.sandbox-corner-br'], { bottom: CORNER_HIDDEN })
}

function playPerksEnterMobile() {
  DragTransition((tl) => {
    tl.set('.perks-section-background-back', { top: MOBILE_BOTTOM_HIDDEN }, 0)
    tl.set('.perks-section-background-front', { top: MOBILE_BOTTOM_HIDDEN }, 0)
    tl.to('.perks-section-background-back', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, SECTION_ENTER_DELAY)
    tl.to('.perks-section-background-front', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, SECTION_ENTER_DELAY)
  })
}

function playProfileEnterMobile() {
  DragTransition((tl) => {
    tl.set('.profile-section-background-back', { top: MOBILE_BOTTOM_HIDDEN }, 0)
    tl.set('.profile-section-background-front', { top: MOBILE_BOTTOM_HIDDEN }, 0)
    tl.to('.profile-section-background-back', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, SECTION_ENTER_DELAY)
    tl.to('.profile-section-background-front', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, SECTION_ENTER_DELAY)
  })
}

function playProjectsEnterMobile() {
  DragTransition((tl) => {
    tl.set('.projects-section-background-back', { top: MOBILE_BOTTOM_HIDDEN }, 0)
    tl.set('.projects-section-background-front', { top: MOBILE_BOTTOM_HIDDEN }, 0)
    tl.to('.projects-section-background-back', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, SECTION_ENTER_DELAY)
    tl.to('.projects-section-background-front', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, SECTION_ENTER_DELAY)
  })
}

function playExtraEnterMobile() {
  DragTransition((tl) => {
    tl.set('.extra-section-background-topright', { top: MOBILE_BOTTOM_HIDDEN }, 0)
    tl.set('.extra-section-background-bottomleft', { top: MOBILE_BOTTOM_HIDDEN }, 0)
    tl.to('.extra-section-background-topright', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, SECTION_ENTER_DELAY)
    tl.to('.extra-section-background-bottomleft', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, SECTION_ENTER_DELAY)
  })
}

function playSandboxEnterMobile() {
  DragTransition((tl) => {
    tl.set(['.sandbox-corner-tl', '.sandbox-corner-tr'], { top: CORNER_HIDDEN }, 0)
    tl.set(['.sandbox-corner-bl', '.sandbox-corner-br'], { bottom: CORNER_HIDDEN }, 0)
    tl.to('.sandbox-corner-tl', { top: CORNER_REVEAL, duration: MOBILE_DURATION, ease: 'back.out' }, SECTION_ENTER_DELAY)
    tl.to('.sandbox-corner-tr', { top: CORNER_REVEAL, duration: MOBILE_DURATION, ease: 'back.out' }, SECTION_ENTER_DELAY)
    tl.to('.sandbox-corner-bl', { bottom: CORNER_REVEAL, duration: MOBILE_DURATION, ease: 'back.out' }, SECTION_ENTER_DELAY)
    tl.to('.sandbox-corner-br', { bottom: CORNER_REVEAL, duration: MOBILE_DURATION, ease: 'back.out' }, SECTION_ENTER_DELAY)
  })
}

function playMobileBackgroundTransition(
  meta: SectionTransitionMeta,
  perksIdx: number,
  profileIdx: number,
  projectsIdx: number,
  extraIdx: number,
  playgroundIdx: number
) {
  const enterAt = SECTION_ENTER_DELAY

  DragTransition((tl) => {
    // PERKS
    if (meta.isEnteringSection(perksIdx) && meta.isFromSection(-1)) {
      tl.set('.perks-section-background-back', { top: MOBILE_BOTTOM_HIDDEN }, 0)
      tl.set('.perks-section-background-front', { top: MOBILE_BOTTOM_HIDDEN }, 0)
      tl.to('.perks-section-background-back', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
      tl.to('.perks-section-background-front', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
    } else if (meta.isEnteringSection(perksIdx)) {
      tl.set('.perks-section-background-back', { top: MOBILE_LEAVE_TOP }, 0)
      tl.set('.perks-section-background-front', { top: MOBILE_LEAVE_TOP }, 0)
      tl.to('.perks-section-background-back', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
      tl.to('.perks-section-background-front', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
    }

    if (meta.isLeavingSection(perksIdx)) {
      tl.to('.perks-section-background-back', { top: MOBILE_LEAVE_TOP, duration: MOBILE_DURATION, ease: 'back.inOut', onComplete: vibrateOnComplete }, 0)
      tl.to('.perks-section-background-front', { top: MOBILE_LEAVE_TOP, duration: MOBILE_DURATION, ease: 'back.inOut' }, 0)
    }

    // PROFILE — entering from below (perks) vs. entering from above (projects)
    if (meta.isEnteringSection(profileIdx) && !meta.isFromSection(projectsIdx)) {
      tl.set('.profile-section-background-back', { top: MOBILE_BOTTOM_HIDDEN }, 0)
      tl.set('.profile-section-background-front', { top: MOBILE_BOTTOM_HIDDEN }, 0)
      tl.to('.profile-section-background-back', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
      tl.to('.profile-section-background-front', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
    } else if (meta.isEnteringSection(profileIdx) && meta.isFromSection(projectsIdx)) {
      tl.set('.profile-section-background-back', { top: MOBILE_LEAVE_TOP }, 0)
      tl.set('.profile-section-background-front', { top: MOBILE_LEAVE_TOP }, 0)
      tl.to('.profile-section-background-back', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
      tl.to('.profile-section-background-front', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
    }

    if (meta.isLeavingSection(profileIdx) && meta.isToSection(perksIdx)) {
      tl.to('.profile-section-background-back', { top: MOBILE_BOTTOM_HIDDEN, duration: MOBILE_DURATION, ease: 'back.inOut', onComplete: vibrateOnComplete }, 0)
      tl.to('.profile-section-background-front', { top: MOBILE_BOTTOM_HIDDEN, duration: MOBILE_DURATION, ease: 'back.inOut' }, 0)
    }

    if (meta.isLeavingSection(profileIdx) && meta.isToSection(projectsIdx)) {
      tl.to('.profile-section-background-back', { top: MOBILE_LEAVE_TOP, duration: MOBILE_DURATION, ease: 'back.inOut', onComplete: vibrateOnComplete }, 0)
      tl.to('.profile-section-background-front', { top: MOBILE_LEAVE_TOP, duration: MOBILE_DURATION, ease: 'back.inOut' }, 0)
    }

    // PROJECTS
    if (meta.isEnteringSection(projectsIdx)) {
      tl.set('.projects-section-background-back', { top: MOBILE_BOTTOM_HIDDEN }, 0)
      tl.set('.projects-section-background-front', { top: MOBILE_BOTTOM_HIDDEN }, 0)
      tl.to('.projects-section-background-back', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
      tl.to('.projects-section-background-front', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
    }

    if (meta.isLeavingSection(projectsIdx)) {
      tl.to('.projects-section-background-back', { top: MOBILE_BOTTOM_HIDDEN, duration: MOBILE_DURATION, ease: 'back.inOut', onComplete: vibrateOnComplete }, 0)
      tl.to('.projects-section-background-front', { top: MOBILE_BOTTOM_HIDDEN, duration: MOBILE_DURATION, ease: 'back.inOut' }, 0)
    }

    // EXTRA
    if (meta.isEnteringSection(extraIdx)) {
      tl.set('.extra-section-background-topright', { top: MOBILE_BOTTOM_HIDDEN }, 0)
      tl.set('.extra-section-background-bottomleft', { top: MOBILE_BOTTOM_HIDDEN }, 0)
      tl.to('.extra-section-background-topright', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
      tl.to('.extra-section-background-bottomleft', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
    }

    if (meta.isLeavingSection(extraIdx)) {
      tl.to('.extra-section-background-topright', { top: MOBILE_BOTTOM_HIDDEN, duration: MOBILE_DURATION, ease: 'back.inOut', onComplete: vibrateOnComplete }, 0)
      tl.to('.extra-section-background-bottomleft', { top: MOBILE_BOTTOM_HIDDEN, duration: MOBILE_DURATION, ease: 'back.inOut' }, 0)
    }

    // SANDBOX
    if (meta.isEnteringSection(playgroundIdx)) {
      tl.set(['.sandbox-corner-tl', '.sandbox-corner-tr'], { top: CORNER_HIDDEN }, 0)
      tl.set(['.sandbox-corner-bl', '.sandbox-corner-br'], { bottom: CORNER_HIDDEN }, 0)
      tl.to('.sandbox-corner-tl', { top: CORNER_REVEAL, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
      tl.to('.sandbox-corner-tr', { top: CORNER_REVEAL, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
      tl.to('.sandbox-corner-bl', { bottom: CORNER_REVEAL, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
      tl.to('.sandbox-corner-br', { bottom: CORNER_REVEAL, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
    }

    if (meta.isLeavingSection(playgroundIdx)) {
      tl.to('.sandbox-corner-tl', { top: CORNER_HIDDEN, duration: MOBILE_DURATION, ease: 'back.inOut', onComplete: vibrateOnComplete }, 0)
      tl.to('.sandbox-corner-tr', { top: CORNER_HIDDEN, duration: MOBILE_DURATION, ease: 'back.inOut' }, 0)
      tl.to('.sandbox-corner-bl', { bottom: CORNER_HIDDEN, duration: MOBILE_DURATION, ease: 'back.inOut' }, 0)
      tl.to('.sandbox-corner-br', { bottom: CORNER_HIDDEN, duration: MOBILE_DURATION, ease: 'back.inOut' }, 0)
    }
  })
}

export function ScrollBackgroundSections() {
  const perksIdx     = getSectionIndexById('perks')
  const profileIdx   = getSectionIndexById('profile')
  const projectsIdx  = getSectionIndexById('projects')
  const extraIdx     = getSectionIndexById('extra')
  const playgroundIdx = getSectionIndexById('playground')

  const isPerksEnter    = (meta: SectionTransitionMeta) => meta.isEnteringSection(perksIdx)
  const isPerksLeave    = (meta: SectionTransitionMeta) => meta.isLeavingSection(perksIdx)
  const isProfileEnter  = (meta: SectionTransitionMeta) => meta.isEnteringSection(profileIdx)
  const isProfileLeave  = (meta: SectionTransitionMeta) => meta.isLeavingSection(profileIdx)
  const isProjectsEnter = (meta: SectionTransitionMeta) => meta.isEnteringSection(projectsIdx)
  const isProjectsLeave = (meta: SectionTransitionMeta) => meta.isLeavingSection(projectsIdx)
  const isExtraEnter    = (meta: SectionTransitionMeta) => meta.isEnteringSection(extraIdx)
  const isExtraLeave    = (meta: SectionTransitionMeta) => meta.isLeavingSection(extraIdx)
  const isSandboxEnter  = (meta: SectionTransitionMeta) => meta.isEnteringSection(playgroundIdx)
  const isSandboxLeave  = (meta: SectionTransitionMeta) => meta.isLeavingSection(playgroundIdx)

  const MatchMedia = gsap.matchMedia()

  MatchMedia.add(`(min-width: ${breakpoints.smallDesktop}px)`, () => {
    if (!document.querySelector('.section-background-layer')) return

    gsap.set('.perks-section-background-back', { left: '-30%', top: '0%' })
    gsap.set('.perks-section-background-front', { left: '-30%', top: '0%' })
    gsap.set('.profile-section-background-back', { left: '-30%', top: '0%' })
    gsap.set('.profile-section-background-front', { left: '-30%', top: '0%' })
    gsap.set('.projects-section-background-back', { right: '-40%', top: '0%' })
    gsap.set('.projects-section-background-front', { right: '-40%', top: '0%' })
    gsap.set('.extra-section-background-topright', { top: CORNER_HIDDEN })
    gsap.set('.extra-section-background-bottomleft', { bottom: CORNER_HIDDEN })
    gsap.set(['.sandbox-corner-tl', '.sandbox-corner-tr'], { top: CORNER_HIDDEN })
    gsap.set(['.sandbox-corner-bl', '.sandbox-corner-br'], { bottom: CORNER_HIDDEN })

    const cleanupPerks = onSectionEnterLeaveAnimation({
      isEnter: isPerksEnter,
      isLeave: isPerksLeave,
      onEnter: playPerksEnterDesktop,
      onLeave: playPerksLeaveDesktop,
      initialSection: perksIdx,
    })

    const cleanupProfile = onSectionEnterLeaveAnimation({
      isEnter: isProfileEnter,
      isLeave: isProfileLeave,
      onEnter: playProfileEnterDesktop,
      onLeave: playProfileLeaveDesktop,
      initialSection: profileIdx,
    })

    const cleanupProjects = onSectionEnterLeaveAnimation({
      isEnter: isProjectsEnter,
      isLeave: isProjectsLeave,
      onEnter: playProjectsEnterDesktop,
      onLeave: playProjectsLeaveDesktop,
      initialSection: projectsIdx,
    })

    const cleanupExtra = onSectionEnterLeaveAnimation({
      isEnter: isExtraEnter,
      isLeave: isExtraLeave,
      onEnter: playExtraEnterDesktop,
      onLeave: playExtraLeaveDesktop,
      initialSection: extraIdx,
    })

    const cleanupSandbox = onSectionEnterLeaveAnimation({
      isEnter: isSandboxEnter,
      isLeave: isSandboxLeave,
      onEnter: playSandboxEnterDesktop,
      onLeave: playSandboxLeaveDesktop,
      initialSection: playgroundIdx,
    })

    return () => {
      cleanupPerks()
      cleanupProfile()
      cleanupProjects()
      cleanupExtra()
      cleanupSandbox()
    }
  })

  MatchMedia.add(`(max-width: ${breakpoints.smallDesktop - 1}px)`, () => {
    if (!document.querySelector('.section-background-layer')) return

    BACKGROUND_TARGETS.forEach((selector) => {
      gsap.set(selector, { clearProps: 'left,right,top,bottom' })
    })

    initMobileBackgroundState()

    if (currentSection.value === perksIdx) playPerksEnterMobile()
    else if (currentSection.value === profileIdx) playProfileEnterMobile()
    else if (currentSection.value === projectsIdx) playProjectsEnterMobile()
    else if (currentSection.value === extraIdx) playExtraEnterMobile()
    else if (currentSection.value === playgroundIdx) playSandboxEnterMobile()

    const cleanupMobile = onSectionStatesChange((meta) => {
      playMobileBackgroundTransition(meta, perksIdx, profileIdx, projectsIdx, extraIdx, playgroundIdx)
    })

    return () => {
      cleanupMobile()

      BACKGROUND_TARGETS.forEach((selector) => {
        gsap.set(selector, { clearProps: 'left,right,top,bottom,opacity,transform' })
      })
    }
  })

  return () => {
    MatchMedia.revert()
  }
}
