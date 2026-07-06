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
import { showProjectHelix, hideProjectHelix } from '@modules/miscProjectHelixCanvas'

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

const COVER_SLICE_TARGETS = [
  '.perks-back',
  '.perks-front',
  '.logs-back',
  '.logs-front',
  '.projects-back',
  '.projects-front',
  '.extra-tr',
  '.extra-bl',
  '.sandbox-tl',
  '.sandbox-tr',
  '.sandbox-bl',
  '.sandbox-br',
  '.classified-tl',
  '.classified-br',
]

function DragTransition(buildTimeline: (timeline: gsap.core.Timeline) => void) {
  const els = gsap.utils.toArray(COVER_SLICE_TARGETS)
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
  gsap.killTweensOf(['.perks-back', '.perks-front'])
  DragTransition((tl) => {
    tl.to('.perks-back', { left: '-10%', top: '-5%', ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY)
    tl.to('.perks-front', { left: '-10%', top: '-5%', ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY + FRONT_LAYER_OFFSET)
  })
}

function playPerksLeaveDesktop() {
  gsap.killTweensOf(['.perks-back', '.perks-front'])
  DragTransition((tl) => {
    tl.to('.perks-back', { left: '-30%', top: '0%', ease: 'back.in', duration: DURATION, overwrite: 'auto', onComplete: vibrateOnComplete }, 0)
    tl.to('.perks-front', { left: '-30%', top: '0%', ease: 'back.in', duration: DURATION, overwrite: 'auto' }, FRONT_LAYER_OFFSET)
  })
}

function playLogsEnterDesktop() {
  gsap.killTweensOf(['.logs-back', '.logs-front'])
  DragTransition((tl) => {
    tl.to('.logs-back', { left: '-10%', top: '-5%', ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY)
    tl.to('.logs-front', { left: '-10%', top: '-5%', ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY + FRONT_LAYER_OFFSET)
  })
}

function playLogsLeaveDesktop() {
  gsap.killTweensOf(['.logs-back', '.logs-front'])
  DragTransition((tl) => {
    tl.to('.logs-back', { left: '-30%', ease: 'back.in', duration: DURATION, overwrite: 'auto' }, 0)
    tl.to('.logs-front', { left: '-30%', ease: 'back.in', duration: DURATION, overwrite: 'auto' }, FRONT_LAYER_OFFSET)
  })
}

function playProjectsEnterDesktop() {
  gsap.killTweensOf(['.projects-back', '.projects-front'])
  DragTransition((tl) => {
    tl.to('.projects-back', { right: '-10%', ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY)
    tl.to('.projects-front', { right: '-10%', ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY + FRONT_LAYER_OFFSET)
  })
  showProjectHelix(SECTION_ENTER_DELAY)
}

function playProjectsLeaveDesktop() {
  gsap.killTweensOf(['.projects-back', '.projects-front'])
  DragTransition((tl) => {
    tl.to('.projects-back', { right: '-40%', ease: 'back.in', duration: DURATION, overwrite: 'auto' }, 0)
    tl.to('.projects-front', { right: '-40%', ease: 'back.in', duration: DURATION, overwrite: 'auto' }, FRONT_LAYER_OFFSET)
  })
  hideProjectHelix()
}

function playExtraEnterDesktop() {
  gsap.killTweensOf(['.extra-tr', '.extra-bl'])
  DragTransition((tl) => {
    tl.to('.extra-tr', { top: CORNER_REVEAL, ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY)
    tl.to('.extra-bl', { bottom: CORNER_REVEAL, ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY)
  })
}

function playExtraLeaveDesktop() {
  gsap.killTweensOf(['.extra-tr', '.extra-bl'])
  DragTransition((tl) => {
    tl.to('.extra-tr', { top: CORNER_HIDDEN, ease: 'back.in', duration: DURATION, overwrite: 'auto' }, 0)
    tl.to('.extra-bl', { bottom: CORNER_HIDDEN, ease: 'back.in', duration: DURATION, overwrite: 'auto' }, 0)
  })
}

function playSandboxEnterDesktop() {
  gsap.killTweensOf(['.sandbox-tl', '.sandbox-tr', '.sandbox-bl', '.sandbox-br'])
  DragTransition((tl) => {
    tl.to('.sandbox-tl', { top: CORNER_REVEAL, ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY)
    tl.to('.sandbox-tr', { top: CORNER_REVEAL, ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY)
    tl.to('.sandbox-bl', { bottom: CORNER_REVEAL, ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY)
    tl.to('.sandbox-br', { bottom: CORNER_REVEAL, ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY)
  })
}

function playSandboxLeaveDesktop() {
  gsap.killTweensOf(['.sandbox-tl', '.sandbox-tr', '.sandbox-bl', '.sandbox-br'])
  DragTransition((tl) => {
    tl.to('.sandbox-tl', { top: CORNER_HIDDEN, ease: 'back.in', duration: DURATION, overwrite: 'auto' }, 0)
    tl.to('.sandbox-tr', { top: CORNER_HIDDEN, ease: 'back.in', duration: DURATION, overwrite: 'auto' }, 0)
    tl.to('.sandbox-bl', { bottom: CORNER_HIDDEN, ease: 'back.in', duration: DURATION, overwrite: 'auto' }, 0)
    tl.to('.sandbox-br', { bottom: CORNER_HIDDEN, ease: 'back.in', duration: DURATION, overwrite: 'auto' }, 0)
  })
}

function playClassifiedEnterDesktop() {
  gsap.killTweensOf(['.classified-tl', '.classified-br'])
  DragTransition((tl) => {
    tl.to('.classified-tl', { top: CORNER_REVEAL, ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY)
    tl.to('.classified-br', { bottom: CORNER_REVEAL, ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY)
  })
}

function playClassifiedLeaveDesktop() {
  gsap.killTweensOf(['.classified-tl', '.classified-br'])
  DragTransition((tl) => {
    tl.to('.classified-tl', { top: CORNER_HIDDEN, ease: 'back.in', duration: DURATION, overwrite: 'auto' }, 0)
    tl.to('.classified-br', { bottom: CORNER_HIDDEN, ease: 'back.in', duration: DURATION, overwrite: 'auto' }, 0)
  })
}

// -------------------- Mobile animations (<= smallDesktop) --------------------

const MOBILE_DURATION = 0.95
const MOBILE_ENTER_TOP = '-90%'
const MOBILE_LEAVE_TOP = '-150%'
const MOBILE_BOTTOM_HIDDEN = '100%'

function initMobileBackgroundState() {
  COVER_SLICE_TARGETS.forEach((selector) => {
    gsap.set(selector, { clearProps: 'transition,transform' })
  })

  gsap.set('.perks-back', { top: MOBILE_BOTTOM_HIDDEN })
  gsap.set('.perks-front', { top: MOBILE_BOTTOM_HIDDEN })
  gsap.set('.logs-back', { top: MOBILE_BOTTOM_HIDDEN })
  gsap.set('.logs-front', { top: MOBILE_BOTTOM_HIDDEN })
  gsap.set('.projects-back', { top: MOBILE_BOTTOM_HIDDEN })
  gsap.set('.projects-front', { top: MOBILE_BOTTOM_HIDDEN })
  gsap.set('.extra-tr', { top: MOBILE_BOTTOM_HIDDEN })
  gsap.set('.extra-bl', { top: MOBILE_BOTTOM_HIDDEN })
  gsap.set(['.sandbox-tl', '.sandbox-tr'], { top: CORNER_HIDDEN })
  gsap.set(['.sandbox-bl', '.sandbox-br'], { bottom: CORNER_HIDDEN })
}

function playPerksEnterMobile() {
  DragTransition((tl) => {
    tl.set('.perks-back', { top: MOBILE_BOTTOM_HIDDEN }, 0)
    tl.set('.perks-front', { top: MOBILE_BOTTOM_HIDDEN }, 0)
    tl.to('.perks-back', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, SECTION_ENTER_DELAY)
    tl.to('.perks-front', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, SECTION_ENTER_DELAY)
  })
}

function playLogsEnterMobile() {
  DragTransition((tl) => {
    tl.set('.logs-back', { top: MOBILE_BOTTOM_HIDDEN }, 0)
    tl.set('.logs-front', { top: MOBILE_BOTTOM_HIDDEN }, 0)
    tl.to('.logs-back', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, SECTION_ENTER_DELAY)
    tl.to('.logs-front', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, SECTION_ENTER_DELAY)
  })
}

function playProjectsEnterMobile() {
  DragTransition((tl) => {
    tl.set('.projects-back', { top: MOBILE_BOTTOM_HIDDEN }, 0)
    tl.set('.projects-front', { top: MOBILE_BOTTOM_HIDDEN }, 0)
    tl.to('.projects-back', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, SECTION_ENTER_DELAY)
    tl.to('.projects-front', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, SECTION_ENTER_DELAY)
  })
}

function playExtraEnterMobile() {
  DragTransition((tl) => {
    tl.set('.extra-tr', { top: MOBILE_BOTTOM_HIDDEN }, 0)
    tl.set('.extra-bl', { top: MOBILE_BOTTOM_HIDDEN }, 0)
    tl.to('.extra-tr', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, SECTION_ENTER_DELAY)
    tl.to('.extra-bl', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, SECTION_ENTER_DELAY)
  })
}

function playSandboxEnterMobile() {
  DragTransition((tl) => {
    tl.set(['.sandbox-tl', '.sandbox-tr'], { top: CORNER_HIDDEN }, 0)
    tl.set(['.sandbox-bl', '.sandbox-br'], { bottom: CORNER_HIDDEN }, 0)
    tl.to('.sandbox-tl', { top: CORNER_REVEAL, duration: MOBILE_DURATION, ease: 'back.out' }, SECTION_ENTER_DELAY)
    tl.to('.sandbox-tr', { top: CORNER_REVEAL, duration: MOBILE_DURATION, ease: 'back.out' }, SECTION_ENTER_DELAY)
    tl.to('.sandbox-bl', { bottom: CORNER_REVEAL, duration: MOBILE_DURATION, ease: 'back.out' }, SECTION_ENTER_DELAY)
    tl.to('.sandbox-br', { bottom: CORNER_REVEAL, duration: MOBILE_DURATION, ease: 'back.out' }, SECTION_ENTER_DELAY)
  })
}

function playMobileBackgroundTransition(
  meta: SectionTransitionMeta,
  perksIdx: number,
  logsIdx: number,
  projectsIdx: number,
  extraIdx: number,
  sandboxIdx: number
) {
  const enterAt = SECTION_ENTER_DELAY

  DragTransition((tl) => {
    // PERKS
    if (meta.isEnteringSection(perksIdx) && meta.isFromSection(-1)) {
      tl.set('.perks-back', { top: MOBILE_BOTTOM_HIDDEN }, 0)
      tl.set('.perks-front', { top: MOBILE_BOTTOM_HIDDEN }, 0)
      tl.to('.perks-back', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
      tl.to('.perks-front', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
    } else if (meta.isEnteringSection(perksIdx)) {
      tl.set('.perks-back', { top: MOBILE_LEAVE_TOP }, 0)
      tl.set('.perks-front', { top: MOBILE_LEAVE_TOP }, 0)
      tl.to('.perks-back', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
      tl.to('.perks-front', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
    }

    if (meta.isLeavingSection(perksIdx)) {
      tl.to('.perks-back', { top: MOBILE_LEAVE_TOP, duration: MOBILE_DURATION, ease: 'back.inOut', onComplete: vibrateOnComplete }, 0)
      tl.to('.perks-front', { top: MOBILE_LEAVE_TOP, duration: MOBILE_DURATION, ease: 'back.inOut' }, 0)
    }

    // LOGS; entering from below (perks) vs. entering from above (projects)
    if (meta.isEnteringSection(logsIdx) && !meta.isFromSection(projectsIdx)) {
      tl.set('.logs-back', { top: MOBILE_BOTTOM_HIDDEN }, 0)
      tl.set('.logs-front', { top: MOBILE_BOTTOM_HIDDEN }, 0)
      tl.to('.logs-back', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
      tl.to('.logs-front', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
    } else if (meta.isEnteringSection(logsIdx) && meta.isFromSection(projectsIdx)) {
      tl.set('.logs-back', { top: MOBILE_LEAVE_TOP }, 0)
      tl.set('.logs-front', { top: MOBILE_LEAVE_TOP }, 0)
      tl.to('.logs-back', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
      tl.to('.logs-front', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
    }

    if (meta.isLeavingSection(logsIdx) && meta.isToSection(perksIdx)) {
      tl.to('.logs-back', { top: MOBILE_BOTTOM_HIDDEN, duration: MOBILE_DURATION, ease: 'back.inOut', onComplete: vibrateOnComplete }, 0)
      tl.to('.logs-front', { top: MOBILE_BOTTOM_HIDDEN, duration: MOBILE_DURATION, ease: 'back.inOut' }, 0)
    }

    if (meta.isLeavingSection(logsIdx) && meta.isToSection(projectsIdx)) {
      tl.to('.logs-back', { top: MOBILE_LEAVE_TOP, duration: MOBILE_DURATION, ease: 'back.inOut', onComplete: vibrateOnComplete }, 0)
      tl.to('.logs-front', { top: MOBILE_LEAVE_TOP, duration: MOBILE_DURATION, ease: 'back.inOut' }, 0)
    }

    // PROJECTS
    if (meta.isEnteringSection(projectsIdx)) {
      tl.set('.projects-back', { top: MOBILE_BOTTOM_HIDDEN }, 0)
      tl.set('.projects-front', { top: MOBILE_BOTTOM_HIDDEN }, 0)
      tl.to('.projects-back', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
      tl.to('.projects-front', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
    }

    if (meta.isLeavingSection(projectsIdx)) {
      tl.to('.projects-back', { top: MOBILE_BOTTOM_HIDDEN, duration: MOBILE_DURATION, ease: 'back.inOut', onComplete: vibrateOnComplete }, 0)
      tl.to('.projects-front', { top: MOBILE_BOTTOM_HIDDEN, duration: MOBILE_DURATION, ease: 'back.inOut' }, 0)
    }

    // EXTRA
    if (meta.isEnteringSection(extraIdx)) {
      tl.set('.extra-tr', { top: MOBILE_BOTTOM_HIDDEN }, 0)
      tl.set('.extra-bl', { top: MOBILE_BOTTOM_HIDDEN }, 0)
      tl.to('.extra-tr', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
      tl.to('.extra-bl', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
    }

    if (meta.isLeavingSection(extraIdx)) {
      tl.to('.extra-tr', { top: MOBILE_BOTTOM_HIDDEN, duration: MOBILE_DURATION, ease: 'back.inOut', onComplete: vibrateOnComplete }, 0)
      tl.to('.extra-bl', { top: MOBILE_BOTTOM_HIDDEN, duration: MOBILE_DURATION, ease: 'back.inOut' }, 0)
    }

    // SANDBOX
    if (meta.isEnteringSection(sandboxIdx)) {
      tl.set(['.sandbox-tl', '.sandbox-tr'], { top: CORNER_HIDDEN }, 0)
      tl.set(['.sandbox-bl', '.sandbox-br'], { bottom: CORNER_HIDDEN }, 0)
      tl.to('.sandbox-tl', { top: CORNER_REVEAL, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
      tl.to('.sandbox-tr', { top: CORNER_REVEAL, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
      tl.to('.sandbox-bl', { bottom: CORNER_REVEAL, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
      tl.to('.sandbox-br', { bottom: CORNER_REVEAL, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
    }

    if (meta.isLeavingSection(sandboxIdx)) {
      tl.to('.sandbox-tl', { top: CORNER_HIDDEN, duration: MOBILE_DURATION, ease: 'back.inOut', onComplete: vibrateOnComplete }, 0)
      tl.to('.sandbox-tr', { top: CORNER_HIDDEN, duration: MOBILE_DURATION, ease: 'back.inOut' }, 0)
      tl.to('.sandbox-bl', { bottom: CORNER_HIDDEN, duration: MOBILE_DURATION, ease: 'back.inOut' }, 0)
      tl.to('.sandbox-br', { bottom: CORNER_HIDDEN, duration: MOBILE_DURATION, ease: 'back.inOut' }, 0)
    }
  })
}

export function ScrollBackgroundSections() {
  const perksIdx     = getSectionIndexById('perks')
  const logsIdx   = getSectionIndexById('logs')
  const projectsIdx  = getSectionIndexById('projects')
  const extraIdx     = getSectionIndexById('extra')
  const sandboxIdx = getSectionIndexById('sandbox')
  const classifiedIdx = getSectionIndexById('classified')

  const isPerksEnter    = (meta: SectionTransitionMeta) => meta.isEnteringSection(perksIdx)
  const isPerksLeave    = (meta: SectionTransitionMeta) => meta.isLeavingSection(perksIdx)
  const isLogsEnter  = (meta: SectionTransitionMeta) => meta.isEnteringSection(logsIdx)
  const isLogsLeave  = (meta: SectionTransitionMeta) => meta.isLeavingSection(logsIdx)
  const isProjectsEnter = (meta: SectionTransitionMeta) => meta.isEnteringSection(projectsIdx)
  const isProjectsLeave = (meta: SectionTransitionMeta) => meta.isLeavingSection(projectsIdx)
  const isExtraEnter    = (meta: SectionTransitionMeta) => meta.isEnteringSection(extraIdx)
  const isExtraLeave    = (meta: SectionTransitionMeta) => meta.isLeavingSection(extraIdx)
  const isSandboxEnter  = (meta: SectionTransitionMeta) => meta.isEnteringSection(sandboxIdx)
  const isSandboxLeave  = (meta: SectionTransitionMeta) => meta.isLeavingSection(sandboxIdx)
  const isClassifiedEnter  = (meta: SectionTransitionMeta) => meta.isEnteringSection(classifiedIdx)
  const isClassifiedLeave  = (meta: SectionTransitionMeta) => meta.isLeavingSection(classifiedIdx)

  const MatchMedia = gsap.matchMedia()

  MatchMedia.add(`(min-width: ${breakpoints.smallDesktop}px)`, () => {
    if (!document.querySelector('.section-background-layer')) return

    gsap.set('.perks-back', { left: '-30%', top: '0%' })
    gsap.set('.perks-front', { left: '-30%', top: '0%' })
    gsap.set('.logs-back', { left: '-30%', top: '0%' })
    gsap.set('.logs-front', { left: '-30%', top: '0%' })
    gsap.set('.projects-back', { right: '-40%', top: '0%' })
    gsap.set('.projects-front', { right: '-40%', top: '0%' })
    gsap.set('.extra-tr', { top: CORNER_HIDDEN })
    gsap.set('.extra-bl', { bottom: CORNER_HIDDEN })
    gsap.set(['.sandbox-tl', '.sandbox-tr'], { top: CORNER_HIDDEN })
    gsap.set(['.sandbox-bl', '.sandbox-br'], { bottom: CORNER_HIDDEN })
    gsap.set('.classified-tl', { top: CORNER_HIDDEN })
    gsap.set('.classified-br', { bottom: CORNER_HIDDEN })

    const cleanupPerks = onSectionEnterLeaveAnimation({
      isEnter: isPerksEnter,
      isLeave: isPerksLeave,
      onEnter: playPerksEnterDesktop,
      onLeave: playPerksLeaveDesktop,
      initialSection: perksIdx,
    })

    const cleanupLogs = onSectionEnterLeaveAnimation({
      isEnter: isLogsEnter,
      isLeave: isLogsLeave,
      onEnter: playLogsEnterDesktop,
      onLeave: playLogsLeaveDesktop,
      initialSection: logsIdx,
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
      initialSection: sandboxIdx,
    })

    const cleanupClassified = onSectionEnterLeaveAnimation({
      isEnter: isClassifiedEnter,
      isLeave: isClassifiedLeave,
      onEnter: playClassifiedEnterDesktop,
      onLeave: playClassifiedLeaveDesktop,
      initialSection: classifiedIdx,
    })

    return () => {
      cleanupPerks()
      cleanupLogs()
      cleanupProjects()
      cleanupExtra()
      cleanupSandbox()
      cleanupClassified()
    }
  })

  MatchMedia.add(`(max-width: ${breakpoints.smallDesktop - 1}px)`, () => {
    if (!document.querySelector('.section-background-layer')) return

    COVER_SLICE_TARGETS.forEach((selector) => {
      gsap.set(selector, { clearProps: 'left,right,top,bottom' })
    })

    initMobileBackgroundState()

    if (currentSection.value === perksIdx) playPerksEnterMobile()
    else if (currentSection.value === logsIdx) playLogsEnterMobile()
    else if (currentSection.value === projectsIdx) playProjectsEnterMobile()
    else if (currentSection.value === extraIdx) playExtraEnterMobile()
    else if (currentSection.value === sandboxIdx) playSandboxEnterMobile()

    const cleanupMobile = onSectionStatesChange((meta) => {
      playMobileBackgroundTransition(meta, perksIdx, logsIdx, projectsIdx, extraIdx, sandboxIdx)
    })

    return () => {
      cleanupMobile()

      COVER_SLICE_TARGETS.forEach((selector) => {
        gsap.set(selector, { clearProps: 'left,right,top,bottom,opacity,transform' })
      })
    }
  })

  return () => {
    MatchMedia.revert()
  }
}
