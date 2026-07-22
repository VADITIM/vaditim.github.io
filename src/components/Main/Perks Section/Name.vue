<template>
  <!-- Replaces Name-Display (see CLAUDE.md "Perks Section overhaul"):
       VADITIM is the main name, "vadim niedental" sits underneath as a small
       suffix/notice. Both type in via the standalone Typewriter API with the
       section's main colour. The labels live on genuinely separate 3D planes
       (preserve-3d + per-plane translateZ + pointer tilt) instead of the old
       stacked-copies/border fake. -->
  <div ref="rootRef" class="name-root">
    <div ref="stageRef" class="name-stage">
      <div ref="mainPlaneRef" class="name-plane name-plane-main">
        <Typewriter
          ref="mainTw"
          text="VADITIM"
          color="#7e55dd"
          caretColor="#FFDD1B"
          class="name-main"
          :options="{ speed: 0.09, caretBlink: 0.45 }"
        />
      </div>
      <div ref="subPlaneRef" class="name-plane name-plane-sub">
        <Typewriter
          ref="subTw"
          text="vadim niedental"
          color="#FFDD1B"
          class="name-sub"
          :options="{ speed: 0.045, caretBlink: 0.45, holdCaret: false }"
        />
      </div>
      <div ref="titlePlaneRef" class="name-plane name-plane-title">
        <Typewriter
          ref="titleTw"
          text="Creative Developer - Designer"
          color="#FFDD1B"
          class="name-title"
          :options="{ speed: 0.045, caretBlink: 0.45, holdCaret: false }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, onBeforeUnmount, ref } from 'vue'
  import { gsap } from 'gsap'
  import Typewriter from '@components/Misc/Typewriter.vue'
  import { onSectionStatesChange } from '@modules/sectionsStateMachine'
  import { getSectionIndexById } from '@modules/sectionLookup'
  import { currentSection } from '@modules/sectionsCore'
  import { finished } from '@modules/sectionsStateMachine'
  import { SECTION_ENTER_DELAY } from '@modules/sectionsTransition'
  import { keepFullMotion } from '@modules/miscReducedMotion'

  gsap.defaults({ immediateRender: false })

  const rootRef = ref<HTMLElement | null>(null)
  const stageRef = ref<HTMLElement | null>(null)
  const mainPlaneRef = ref<HTMLElement | null>(null)
  const subPlaneRef = ref<HTMLElement | null>(null)
  const titlePlaneRef = ref<HTMLElement | null>(null)
  const mainTw = ref<InstanceType<typeof Typewriter> | null>(null)
  const subTw = ref<InstanceType<typeof Typewriter> | null>(null)
  const titleTw = ref<InstanceType<typeof Typewriter> | null>(null)

  const perksIndex = getSectionIndexById('perks')
  let cleanupStates: (() => void) | null = null
  let typeCall: gsap.core.Tween | null = null

  // ── pointer tilt; the whole stage sits in real 3D space and leans toward
  // the cursor; the two planes' differing translateZ makes them shift against
  // each other (true parallax depth, not layered copies).
  function onPointerMove(e: MouseEvent) {
    if (!stageRef.value) return
    const px = e.clientX / window.innerWidth - 0.5
    const py = e.clientY / window.innerHeight - 0.5
    gsap.to(stageRef.value, {
      rotationY: -14 + px * -10,
      rotationX: -6 + py * 10,
      transformOrigin: 'left center',
      duration: 0.6,
      ease: 'power3.out',
      overwrite: 'auto',
    })
  }

  function playEnter() {
    if (!mainPlaneRef.value) return
    gsap.killTweensOf(mainPlaneRef.value)
    gsap.killTweensOf([subPlaneRef.value, titlePlaneRef.value])
    typeCall?.kill()

    mainTw.value?.reset()
    subTw.value?.reset()
    titleTw.value?.reset()

    // VADITIM's plane slides in from the right (the name's side of the
    // screen); the "vadim niedental" suffix stays put and only ever animates
    // via its own typewriter reveal, never a container move.
    // The Perks info module is carved out of reduced motion (see TASKS.md), so its
    // planes and the typewriters underneath keep real-time playback.
    keepFullMotion(gsap.fromTo(mainPlaneRef.value,
      { x: '40%', opacity: 0 },
      { x: '0%', opacity: 1, duration: 0.5, delay: SECTION_ENTER_DELAY, ease: 'back.out(1.2)', overwrite: 'auto' }
    ))
    keepFullMotion(gsap.to([subPlaneRef.value, titlePlaneRef.value], { opacity: 1, duration: 0.35, delay: SECTION_ENTER_DELAY, ease: 'power2.out', overwrite: 'auto' }))
    // …then the typewriters run: VADITIM first, the suffix follows.
    typeCall = gsap.delayedCall(SECTION_ENTER_DELAY + 0.35, async () => {
      await mainTw.value?.type()
      await subTw.value?.type()
      await titleTw.value?.type()
    })
  }

  function playLeave() {
    if (!mainPlaneRef.value) return
    typeCall?.kill()
    typeCall = null
    // Typed lines clear (fast backspace); but the backspace on longer lines
    // (e.g. the title) can outlast the leave duration, so the caret/text
    // would otherwise linger visibly into the next section. Fade the sub and
    // title planes out immediately alongside VADITIM's exit rather than
    // waiting on the backspace to finish.
    mainTw.value?.clear()
    subTw.value?.clear()
    titleTw.value?.clear()
    gsap.to(mainPlaneRef.value, { x: '40%', opacity: 0, duration: 0.3, ease: 'power2.in', overwrite: 'auto' })
    gsap.to([subPlaneRef.value, titlePlaneRef.value], { opacity: 0, duration: 0.25, ease: 'power2.in', overwrite: 'auto' })
  }

  onMounted(() => {
    if (mainPlaneRef.value) gsap.set(mainPlaneRef.value, { x: '40%', opacity: 0 })
    if (subPlaneRef.value) gsap.set(subPlaneRef.value, { opacity: 0 })
    if (titlePlaneRef.value) gsap.set(titlePlaneRef.value, { opacity: 0 })

    window.addEventListener('mousemove', onPointerMove)

    cleanupStates = onSectionStatesChange((meta) => {
      if (meta.isEnteringSection(perksIndex)) playEnter()
      else if (meta.isLeavingSection(perksIndex)) playLeave()
    })

    // Only auto-play here for a genuine remount after the loading intro has
    // already finished (e.g. dev HMR); at cold boot currentSection is
    // already perksIndex (its default) well before ChangeSection ever fires,
    // so without the finished.value gate this would play the enter animation
    // under the loading curtain instead of waiting for the real transition.
    if (currentSection.value === perksIndex && finished.value) playEnter()
  })

  onBeforeUnmount(() => {
    window.removeEventListener('mousemove', onPointerMove)
    cleanupStates?.()
    cleanupStates = null
    typeCall?.kill()
    typeCall = null
  })
</script>

<style scoped lang="scss">
  @use "@styleVariables" as *;

  // Plain flex child now — Perks-Section.vue owns the full-viewport frame and
  // the flexbox that positions this against Perks-Skills' column, so no
  // absolute positioning or right-edge offset is needed here.
  .name-root {
    @extend .disable-selection;
    flex: 0 0 auto;
    perspective: 1100px;
    pointer-events: none;
    will-change: transform, opacity;
  }

  .name-stage {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    transform-style: preserve-3d;
    transform-origin: left center;
    transform: rotateY(-14deg) rotateX(-6deg);
  }

  // Two real 3D planes; the main name floats nearest the viewer, the suffix
  // sits deeper, so the pointer tilt reads as genuine depth.
  .name-plane {
    transform-style: preserve-3d;
  }

  .name-plane-main {
    transform: translateZ(60px);
  }

  .name-plane-sub {
    transform: translateZ(10px);
    margin-top: 0.4rem;
  }

  .name-plane-title {
    transform: translateZ(10px);
    margin-top: 0.3rem;
  }

  .name-main {
    font-family: Wosker;
    font-size: clamp(6rem, 12vw, 13rem);
    line-height: 1;
    filter: drop-shadow(0.6rem 0.9rem 0.9rem rgba(0, 0, 0, 0.55));
  }

  .name-sub {
    font-family: 'Mono';
    font-size: clamp(0.9rem, 1.2vw, 1.4rem);
    letter-spacing: 5px;
    opacity: 0.75;
  }

  .name-title {
    font-family: 'Mono';
    font-size: clamp(0.9rem, 1.2vw, 1.4rem);
    letter-spacing: 5px;
    opacity: 0.75;
  }
</style>
