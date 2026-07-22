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
  const elements = gsap.utils.toArray(COVER_SLICE_TARGETS)
  elements.forEach((element: any) => element.classList && element.classList.add('gsap--no-transition'))

  const timeline = gsap.timeline({
    onComplete: () => {
      elements.forEach((element: any) => element.classList && element.classList.remove('gsap--no-transition'))
      vibrateOnComplete()
    },
    onInterrupt: () => elements.forEach((element: any) => element.classList && element.classList.remove('gsap--no-transition')),
  })

  buildTimeline(timeline)
}

function playPerksEnterDesktop() {
  gsap.killTweensOf(['.perks-back', '.perks-front'])
  DragTransition((timeline) => {
    timeline.to('.perks-back', { left: '-10%', top: '-5%', ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY)
    timeline.to('.perks-front', { left: '-10%', top: '-5%', ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY + FRONT_LAYER_OFFSET)
  })
}

function playPerksLeaveDesktop() {
  gsap.killTweensOf(['.perks-back', '.perks-front'])
  DragTransition((timeline) => {
    timeline.to('.perks-back', { left: '-30%', top: '0%', ease: 'back.in', duration: DURATION, overwrite: 'auto', onComplete: vibrateOnComplete }, 0)
    timeline.to('.perks-front', { left: '-30%', top: '0%', ease: 'back.in', duration: DURATION, overwrite: 'auto' }, FRONT_LAYER_OFFSET)
  })
}

function playLogsEnterDesktop() {
  gsap.killTweensOf(['.logs-back', '.logs-front'])
  DragTransition((timeline) => {
    timeline.to('.logs-back', { left: '-10%', top: '-5%', ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY)
    timeline.to('.logs-front', { left: '-10%', top: '-5%', ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY + FRONT_LAYER_OFFSET)
  })
}

function playLogsLeaveDesktop() {
  gsap.killTweensOf(['.logs-back', '.logs-front'])
  DragTransition((timeline) => {
    timeline.to('.logs-back', { left: '-30%', ease: 'back.in', duration: DURATION, overwrite: 'auto' }, 0)
    timeline.to('.logs-front', { left: '-30%', ease: 'back.in', duration: DURATION, overwrite: 'auto' }, FRONT_LAYER_OFFSET)
  })
}

function playProjectsEnterDesktop() {
  gsap.killTweensOf(['.projects-back', '.projects-front'])
  DragTransition((timeline) => {
    timeline.to('.projects-back', { right: '-10%', ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY)
    timeline.to('.projects-front', { right: '-10%', ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY + FRONT_LAYER_OFFSET)
  })
  showProjectHelix(SECTION_ENTER_DELAY)
}

function playProjectsLeaveDesktop() {
  gsap.killTweensOf(['.projects-back', '.projects-front'])
  DragTransition((timeline) => {
    timeline.to('.projects-back', { right: '-40%', ease: 'back.in', duration: DURATION, overwrite: 'auto' }, 0)
    timeline.to('.projects-front', { right: '-40%', ease: 'back.in', duration: DURATION, overwrite: 'auto' }, FRONT_LAYER_OFFSET)
  })
  hideProjectHelix()
}

function playExtraEnterDesktop() {
  gsap.killTweensOf(['.extra-tr', '.extra-bl'])
  DragTransition((timeline) => {
    timeline.to('.extra-tr', { top: CORNER_REVEAL, ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY)
    timeline.to('.extra-bl', { bottom: CORNER_REVEAL, ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY)
  })
}

function playExtraLeaveDesktop() {
  gsap.killTweensOf(['.extra-tr', '.extra-bl'])
  DragTransition((timeline) => {
    timeline.to('.extra-tr', { top: CORNER_HIDDEN, ease: 'back.in', duration: DURATION, overwrite: 'auto' }, 0)
    timeline.to('.extra-bl', { bottom: CORNER_HIDDEN, ease: 'back.in', duration: DURATION, overwrite: 'auto' }, 0)
  })
}

function playSandboxEnterDesktop() {
  gsap.killTweensOf(['.sandbox-tl', '.sandbox-tr', '.sandbox-bl', '.sandbox-br'])
  DragTransition((timeline) => {
    timeline.to('.sandbox-tl', { top: CORNER_REVEAL, ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY)
    timeline.to('.sandbox-tr', { top: CORNER_REVEAL, ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY)
    timeline.to('.sandbox-bl', { bottom: CORNER_REVEAL, ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY)
    timeline.to('.sandbox-br', { bottom: CORNER_REVEAL, ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY)
  })
}

function playSandboxLeaveDesktop() {
  gsap.killTweensOf(['.sandbox-tl', '.sandbox-tr', '.sandbox-bl', '.sandbox-br'])
  DragTransition((timeline) => {
    timeline.to('.sandbox-tl', { top: CORNER_HIDDEN, ease: 'back.in', duration: DURATION, overwrite: 'auto' }, 0)
    timeline.to('.sandbox-tr', { top: CORNER_HIDDEN, ease: 'back.in', duration: DURATION, overwrite: 'auto' }, 0)
    timeline.to('.sandbox-bl', { bottom: CORNER_HIDDEN, ease: 'back.in', duration: DURATION, overwrite: 'auto' }, 0)
    timeline.to('.sandbox-br', { bottom: CORNER_HIDDEN, ease: 'back.in', duration: DURATION, overwrite: 'auto' }, 0)
  })
}

function playClassifiedEnterDesktop() {
  gsap.killTweensOf(['.classified-tl', '.classified-br'])
  DragTransition((timeline) => {
    timeline.to('.classified-tl', { top: CORNER_REVEAL, ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY)
    timeline.to('.classified-br', { bottom: CORNER_REVEAL, ease: 'back.out', duration: DURATION, overwrite: 'auto' }, SECTION_ENTER_DELAY)
  })
}

function playClassifiedLeaveDesktop() {
  gsap.killTweensOf(['.classified-tl', '.classified-br'])
  DragTransition((timeline) => {
    timeline.to('.classified-tl', { top: CORNER_HIDDEN, ease: 'back.in', duration: DURATION, overwrite: 'auto' }, 0)
    timeline.to('.classified-br', { bottom: CORNER_HIDDEN, ease: 'back.in', duration: DURATION, overwrite: 'auto' }, 0)
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
  DragTransition((timeline) => {
    timeline.set('.perks-back', { top: MOBILE_BOTTOM_HIDDEN }, 0)
    timeline.set('.perks-front', { top: MOBILE_BOTTOM_HIDDEN }, 0)
    timeline.to('.perks-back', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, SECTION_ENTER_DELAY)
    timeline.to('.perks-front', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, SECTION_ENTER_DELAY)
  })
}

function playLogsEnterMobile() {
  DragTransition((timeline) => {
    timeline.set('.logs-back', { top: MOBILE_BOTTOM_HIDDEN }, 0)
    timeline.set('.logs-front', { top: MOBILE_BOTTOM_HIDDEN }, 0)
    timeline.to('.logs-back', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, SECTION_ENTER_DELAY)
    timeline.to('.logs-front', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, SECTION_ENTER_DELAY)
  })
}

function playProjectsEnterMobile() {
  DragTransition((timeline) => {
    timeline.set('.projects-back', { top: MOBILE_BOTTOM_HIDDEN }, 0)
    timeline.set('.projects-front', { top: MOBILE_BOTTOM_HIDDEN }, 0)
    timeline.to('.projects-back', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, SECTION_ENTER_DELAY)
    timeline.to('.projects-front', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, SECTION_ENTER_DELAY)
  })
}

function playExtraEnterMobile() {
  DragTransition((timeline) => {
    timeline.set('.extra-tr', { top: MOBILE_BOTTOM_HIDDEN }, 0)
    timeline.set('.extra-bl', { top: MOBILE_BOTTOM_HIDDEN }, 0)
    timeline.to('.extra-tr', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, SECTION_ENTER_DELAY)
    timeline.to('.extra-bl', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, SECTION_ENTER_DELAY)
  })
}

function playSandboxEnterMobile() {
  DragTransition((timeline) => {
    timeline.set(['.sandbox-tl', '.sandbox-tr'], { top: CORNER_HIDDEN }, 0)
    timeline.set(['.sandbox-bl', '.sandbox-br'], { bottom: CORNER_HIDDEN }, 0)
    timeline.to('.sandbox-tl', { top: CORNER_REVEAL, duration: MOBILE_DURATION, ease: 'back.out' }, SECTION_ENTER_DELAY)
    timeline.to('.sandbox-tr', { top: CORNER_REVEAL, duration: MOBILE_DURATION, ease: 'back.out' }, SECTION_ENTER_DELAY)
    timeline.to('.sandbox-bl', { bottom: CORNER_REVEAL, duration: MOBILE_DURATION, ease: 'back.out' }, SECTION_ENTER_DELAY)
    timeline.to('.sandbox-br', { bottom: CORNER_REVEAL, duration: MOBILE_DURATION, ease: 'back.out' }, SECTION_ENTER_DELAY)
  })
}

function playMobileBackgroundTransition(
  meta: SectionTransitionMeta,
  perksIndex: number,
  logsIndex: number,
  projectsIndex: number,
  extraIndex: number,
  sandboxIndex: number
) {
  const enterAt = SECTION_ENTER_DELAY

  DragTransition((timeline) => {
    // PERKS
    if (meta.isEnteringSection(perksIndex) && meta.isFromSection(-1)) {
      timeline.set('.perks-back', { top: MOBILE_BOTTOM_HIDDEN }, 0)
      timeline.set('.perks-front', { top: MOBILE_BOTTOM_HIDDEN }, 0)
      timeline.to('.perks-back', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
      timeline.to('.perks-front', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
    } else if (meta.isEnteringSection(perksIndex)) {
      timeline.set('.perks-back', { top: MOBILE_LEAVE_TOP }, 0)
      timeline.set('.perks-front', { top: MOBILE_LEAVE_TOP }, 0)
      timeline.to('.perks-back', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
      timeline.to('.perks-front', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
    }

    if (meta.isLeavingSection(perksIndex)) {
      timeline.to('.perks-back', { top: MOBILE_LEAVE_TOP, duration: MOBILE_DURATION, ease: 'back.inOut', onComplete: vibrateOnComplete }, 0)
      timeline.to('.perks-front', { top: MOBILE_LEAVE_TOP, duration: MOBILE_DURATION, ease: 'back.inOut' }, 0)
    }

    // LOGS; entering from below (perks) vs. entering from above (projects)
    if (meta.isEnteringSection(logsIndex) && !meta.isFromSection(projectsIndex)) {
      timeline.set('.logs-back', { top: MOBILE_BOTTOM_HIDDEN }, 0)
      timeline.set('.logs-front', { top: MOBILE_BOTTOM_HIDDEN }, 0)
      timeline.to('.logs-back', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
      timeline.to('.logs-front', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
    } else if (meta.isEnteringSection(logsIndex) && meta.isFromSection(projectsIndex)) {
      timeline.set('.logs-back', { top: MOBILE_LEAVE_TOP }, 0)
      timeline.set('.logs-front', { top: MOBILE_LEAVE_TOP }, 0)
      timeline.to('.logs-back', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
      timeline.to('.logs-front', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
    }

    if (meta.isLeavingSection(logsIndex) && meta.isToSection(perksIndex)) {
      timeline.to('.logs-back', { top: MOBILE_BOTTOM_HIDDEN, duration: MOBILE_DURATION, ease: 'back.inOut', onComplete: vibrateOnComplete }, 0)
      timeline.to('.logs-front', { top: MOBILE_BOTTOM_HIDDEN, duration: MOBILE_DURATION, ease: 'back.inOut' }, 0)
    }

    if (meta.isLeavingSection(logsIndex) && meta.isToSection(projectsIndex)) {
      timeline.to('.logs-back', { top: MOBILE_LEAVE_TOP, duration: MOBILE_DURATION, ease: 'back.inOut', onComplete: vibrateOnComplete }, 0)
      timeline.to('.logs-front', { top: MOBILE_LEAVE_TOP, duration: MOBILE_DURATION, ease: 'back.inOut' }, 0)
    }

    // PROJECTS
    if (meta.isEnteringSection(projectsIndex)) {
      timeline.set('.projects-back', { top: MOBILE_BOTTOM_HIDDEN }, 0)
      timeline.set('.projects-front', { top: MOBILE_BOTTOM_HIDDEN }, 0)
      timeline.to('.projects-back', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
      timeline.to('.projects-front', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
    }

    if (meta.isLeavingSection(projectsIndex)) {
      timeline.to('.projects-back', { top: MOBILE_BOTTOM_HIDDEN, duration: MOBILE_DURATION, ease: 'back.inOut', onComplete: vibrateOnComplete }, 0)
      timeline.to('.projects-front', { top: MOBILE_BOTTOM_HIDDEN, duration: MOBILE_DURATION, ease: 'back.inOut' }, 0)
    }

    // EXTRA
    if (meta.isEnteringSection(extraIndex)) {
      timeline.set('.extra-tr', { top: MOBILE_BOTTOM_HIDDEN }, 0)
      timeline.set('.extra-bl', { top: MOBILE_BOTTOM_HIDDEN }, 0)
      timeline.to('.extra-tr', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
      timeline.to('.extra-bl', { top: MOBILE_ENTER_TOP, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
    }

    if (meta.isLeavingSection(extraIndex)) {
      timeline.to('.extra-tr', { top: MOBILE_BOTTOM_HIDDEN, duration: MOBILE_DURATION, ease: 'back.inOut', onComplete: vibrateOnComplete }, 0)
      timeline.to('.extra-bl', { top: MOBILE_BOTTOM_HIDDEN, duration: MOBILE_DURATION, ease: 'back.inOut' }, 0)
    }

    // SANDBOX
    if (meta.isEnteringSection(sandboxIndex)) {
      timeline.set(['.sandbox-tl', '.sandbox-tr'], { top: CORNER_HIDDEN }, 0)
      timeline.set(['.sandbox-bl', '.sandbox-br'], { bottom: CORNER_HIDDEN }, 0)
      timeline.to('.sandbox-tl', { top: CORNER_REVEAL, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
      timeline.to('.sandbox-tr', { top: CORNER_REVEAL, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
      timeline.to('.sandbox-bl', { bottom: CORNER_REVEAL, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
      timeline.to('.sandbox-br', { bottom: CORNER_REVEAL, duration: MOBILE_DURATION, ease: 'back.out' }, enterAt)
    }

    if (meta.isLeavingSection(sandboxIndex)) {
      timeline.to('.sandbox-tl', { top: CORNER_HIDDEN, duration: MOBILE_DURATION, ease: 'back.inOut', onComplete: vibrateOnComplete }, 0)
      timeline.to('.sandbox-tr', { top: CORNER_HIDDEN, duration: MOBILE_DURATION, ease: 'back.inOut' }, 0)
      timeline.to('.sandbox-bl', { bottom: CORNER_HIDDEN, duration: MOBILE_DURATION, ease: 'back.inOut' }, 0)
      timeline.to('.sandbox-br', { bottom: CORNER_HIDDEN, duration: MOBILE_DURATION, ease: 'back.inOut' }, 0)
    }
  })
}

export function ScrollBackgroundSections() {
  const perksIndex     = getSectionIndexById('perks')
  const logsIndex   = getSectionIndexById('logs')
  const projectsIndex  = getSectionIndexById('projects')
  const extraIndex     = getSectionIndexById('extra')
  const sandboxIndex = getSectionIndexById('sandbox')
  const classifiedIndex = getSectionIndexById('classified')

  const isPerksEnter    = (meta: SectionTransitionMeta) => meta.isEnteringSection(perksIndex)
  const isPerksLeave    = (meta: SectionTransitionMeta) => meta.isLeavingSection(perksIndex)
  const isLogsEnter  = (meta: SectionTransitionMeta) => meta.isEnteringSection(logsIndex)
  const isLogsLeave  = (meta: SectionTransitionMeta) => meta.isLeavingSection(logsIndex)
  const isProjectsEnter = (meta: SectionTransitionMeta) => meta.isEnteringSection(projectsIndex)
  const isProjectsLeave = (meta: SectionTransitionMeta) => meta.isLeavingSection(projectsIndex)
  const isExtraEnter    = (meta: SectionTransitionMeta) => meta.isEnteringSection(extraIndex)
  const isExtraLeave    = (meta: SectionTransitionMeta) => meta.isLeavingSection(extraIndex)
  const isSandboxEnter  = (meta: SectionTransitionMeta) => meta.isEnteringSection(sandboxIndex)
  const isSandboxLeave  = (meta: SectionTransitionMeta) => meta.isLeavingSection(sandboxIndex)
  const isClassifiedEnter  = (meta: SectionTransitionMeta) => meta.isEnteringSection(classifiedIndex)
  const isClassifiedLeave  = (meta: SectionTransitionMeta) => meta.isLeavingSection(classifiedIndex)

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
      initialSection: perksIndex,
    })

    const cleanupLogs = onSectionEnterLeaveAnimation({
      isEnter: isLogsEnter,
      isLeave: isLogsLeave,
      onEnter: playLogsEnterDesktop,
      onLeave: playLogsLeaveDesktop,
      initialSection: logsIndex,
    })

    const cleanupProjects = onSectionEnterLeaveAnimation({
      isEnter: isProjectsEnter,
      isLeave: isProjectsLeave,
      onEnter: playProjectsEnterDesktop,
      onLeave: playProjectsLeaveDesktop,
      initialSection: projectsIndex,
    })

    const cleanupExtra = onSectionEnterLeaveAnimation({
      isEnter: isExtraEnter,
      isLeave: isExtraLeave,
      onEnter: playExtraEnterDesktop,
      onLeave: playExtraLeaveDesktop,
      initialSection: extraIndex,
    })

    const cleanupSandbox = onSectionEnterLeaveAnimation({
      isEnter: isSandboxEnter,
      isLeave: isSandboxLeave,
      onEnter: playSandboxEnterDesktop,
      onLeave: playSandboxLeaveDesktop,
      initialSection: sandboxIndex,
    })

    const cleanupClassified = onSectionEnterLeaveAnimation({
      isEnter: isClassifiedEnter,
      isLeave: isClassifiedLeave,
      onEnter: playClassifiedEnterDesktop,
      onLeave: playClassifiedLeaveDesktop,
      initialSection: classifiedIndex,
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

    if (currentSection.value === perksIndex) playPerksEnterMobile()
    else if (currentSection.value === logsIndex) playLogsEnterMobile()
    else if (currentSection.value === projectsIndex) playProjectsEnterMobile()
    else if (currentSection.value === extraIndex) playExtraEnterMobile()
    else if (currentSection.value === sandboxIndex) playSandboxEnterMobile()

    const cleanupMobile = onSectionStatesChange((meta) => {
      playMobileBackgroundTransition(meta, perksIndex, logsIndex, projectsIndex, extraIndex, sandboxIndex)
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
