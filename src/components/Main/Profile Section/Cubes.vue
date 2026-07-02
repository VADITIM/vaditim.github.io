<template>
  <!-- Desktop-only wireframe cubes. Hidden below smallDesktop (see <style>). -->
  <div ref="root" class="profile-cubes">
    <!-- Cubes, centered -->
    <div class="pc-stage">
      <div class="pc-row">
        <div v-for="(cube, ci) in cubes" :key="'cube-' + ci" class="pc-cell">
          <div class="pc-scene">
            <div class="pc-cube" :data-cube="ci">
              <div v-for="(face, fi) in cube.faces" :key="'face-' + fi" class="pc-face-anim">
                <div class="pc-face" :style="faceStyle(cube, face.tf)">
                  <span :style="{ color: cube.color, textShadow: `0 0 12px ${cube.bg}` }">{{ face.token }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="pc-shadow" :style="{ background: `radial-gradient(ellipse at center, ${cube.bg} 0%, transparent 70%)` }"></div>
          <div class="pc-name pc-label">
            <div class="pc-label-inner">
              <div class="pc-label-text" :style="{ color: cube.color, textShadow: `0 0 14px ${cube.bg}` }">{{ cube.name }}</div>
              <div class="pc-label-bar" :style="{ background: cube.color, boxShadow: `0 0 22px ${cube.color}` }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, onBeforeUnmount, ref } from 'vue';
  import { gsap } from 'gsap';
  import { onSectionStatesChange, type SectionTransitionMeta } from '@modules/sectionsStateMachine';
  import { getSectionIndexById } from '@modules/sectionsRegistry';
  import { currentSection } from '@modules/sectionsCore';
  import { SECTION_ENTER_DELAY } from '@modules/sectionsTransition';
  import { hideLabels, playLabelReveals, playLabelLeave } from '@modules/miscLabelReveal';

  gsap.defaults({ immediateRender: false });

  const FACE_HALF = 110;  // half the 220px cube edge (see .pc-scene) — how far each face is pushed out

  interface FaceDef { tf: string; token: string }
  interface CubeDef { name: string; color: string; bg: string; faces: FaceDef[] }

  const faceDefs = [
    { key: 'bottom', tf: `rotateX(-90deg) translateZ(${FACE_HALF}px)` },
    { key: 'back',   tf: `rotateY(180deg) translateZ(${FACE_HALF}px)` },
    { key: 'left',   tf: `rotateY(-90deg) translateZ(${FACE_HALF}px)` },
    { key: 'right',  tf: `rotateY(90deg) translateZ(${FACE_HALF}px)` },
    { key: 'front',  tf: `rotateY(0deg) translateZ(${FACE_HALF}px)` },
    { key: 'top',    tf: `rotateX(90deg) translateZ(${FACE_HALF}px)` },
  ];

  const cubeData = [
    { name: 'TECHNICAL',    color: '#3664fc', bg: 'rgba(54,100,252,0.18)', tokens: ['GIT', 'C#', '.NET', 'VUE', 'TS', 'SCSS'] },
    { name: 'PROFESSIONAL', color: '#0bc993', bg: 'rgba(11,201,147,0.18)', tokens: ['DELIVER', 'SHIP', 'LEAD', 'MENTOR', 'OWN', 'SCOPE'] },
    { name: 'MINDSET',      color: '#9532e6', bg: 'rgba(149,50,230,0.20)', tokens: ['FOCUS', 'CURIOUS', 'DRIVEN', 'GRIT', 'OPEN', 'CALM'] },
  ];

  const cubes: CubeDef[] = cubeData.map(c => ({
    name: c.name,
    color: c.color,
    bg: c.bg,
    faces: faceDefs.map((d, i) => ({ tf: d.tf, token: c.tokens[i] || '' })),
  }));

  function faceStyle(c: CubeDef, tf: string) {
    return {
      border: `2px solid ${c.color}`,
      transform: tf,
      boxShadow: `inset 0 0 30px ${c.bg}, 0 0 12px ${c.bg}`,
    };
  }

  // ---- Interactive state (idle spin + drag) --------------------------------

  const root = ref<HTMLElement | null>(null);
  const BUILD_STAGGER = 0.22;  // gap between successive cubes starting to build
  const FACE_STAGGER = 0.06;   // gap between faces of the same cube

  interface CubeState {
    el: HTMLElement;
    rx: number; ry: number;
    vx: number; vy: number;
    idleVx: number; idleVy: number;
    dragging: boolean;
    building: boolean;
  }

  let cubeEls: HTMLElement[] = [];
  let shadowEls: HTMLElement[] = [];
  let nameEls: HTMLElement[] = [];
  let states: CubeState[] = [];
  let raf = 0;
  let cleanupStates: (() => void) | null = null;
  const detachers: Array<() => void> = [];

  const profileIdx = getSectionIndexById('profile');

  function setup() {
    if (!root.value) return;
    cubeEls = [...root.value.querySelectorAll<HTMLElement>('.pc-cube')];
    shadowEls = [...root.value.querySelectorAll<HTMLElement>('.pc-shadow')];
    nameEls = [...root.value.querySelectorAll<HTMLElement>('.pc-name')];

    states = cubeEls.map(el => {
      const idleVx = gsap.utils.random([-1, 1]) * gsap.utils.random(0.02, 0.07);
      const idleVy = gsap.utils.random([-1, 1]) * gsap.utils.random(0.08, 0.2);
      return { el, rx: -20, ry: -28, vx: idleVx, vy: idleVy, idleVx, idleVy, dragging: false, building: false };
    });

    cubeEls.forEach((cube, i) => attachDrag(cube.closest('.pc-scene') as HTMLElement, states[i]));

    hideAll();
    startIdleBob();

    const tick = () => { spinStep(); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);

    cleanupStates = onSectionStatesChange((meta: SectionTransitionMeta) => {
      if (meta.isEnteringSection(profileIdx)) playAll();
      else if (meta.isLeavingSection(profileIdx)) playLeave();
    });

    // Cold-mount case: if Profile is already the active section, build immediately.
    if (currentSection.value === profileIdx) playAll();
  }

  function spinStep() {
    for (const c of states) {
      if (c.building) { c.el.style.transform = `rotateX(${c.rx}deg) rotateY(${c.ry}deg)`; continue; }
      if (!c.dragging) {
        c.rx += c.vx; c.ry += c.vy;
        c.vx += (c.idleVx - c.vx) * 0.02;
        c.vy += (c.idleVy - c.vy) * 0.02;
      }
      c.el.style.transform = `rotateX(${c.rx}deg) rotateY(${c.ry}deg)`;
    }
  }

  function attachDrag(scene: HTMLElement, cube: CubeState) {
    let lastX = 0, lastY = 0;
    const move = (e: PointerEvent) => {
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      cube.ry += dx * 0.5; cube.rx += -dy * 0.5;
      cube.vx = -dy * 0.5; cube.vy = dx * 0.5;
    };
    const up = () => {
      cube.dragging = false; scene.style.cursor = 'grab';
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    const down = (e: PointerEvent) => {
      cube.dragging = true; scene.style.cursor = 'grabbing';
      lastX = e.clientX; lastY = e.clientY;
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      e.preventDefault();
    };
    const shadow = scene.parentElement?.querySelector('.pc-shadow') ?? null;
    const enter = () => {
      gsap.to(scene, { scale: 1.1, duration: 0.35, ease: 'power2.out' });
      if (shadow) gsap.to(shadow, { scaleX: 1.18, filter: 'brightness(1.5)', duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
    };
    const leave = () => {
      gsap.to(scene, { scale: 1, duration: 0.4, ease: 'power2.out' });
      if (shadow) gsap.to(shadow, { scaleX: 1, filter: 'brightness(1)', duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
    };

    scene.addEventListener('pointerdown', down);
    scene.addEventListener('mouseenter', enter);
    scene.addEventListener('mouseleave', leave);

    detachers.push(() => {
      scene.removeEventListener('pointerdown', down);
      scene.removeEventListener('mouseenter', enter);
      scene.removeEventListener('mouseleave', leave);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    });
  }

  // Initial hidden state — faces invisible, shadows collapsed, names clipped.
  function hideAll() {
    cubeEls.forEach(cube => gsap.set(cube.querySelectorAll('.pc-face-anim'), { opacity: 0 }));
    gsap.set(shadowEls, { opacity: 0, scaleX: 0.5 });
    hideLabels(nameEls);
  }

  // Gentle perpetual float — each scene bobs on its own rhythm so the row never
  // reads as mechanically synced. Runs for the component's whole life.
  function startIdleBob() {
    if (!root.value) return;
    root.value.querySelectorAll<HTMLElement>('.pc-scene').forEach(scene => {
      gsap.to(scene, {
        y: gsap.utils.random(6, 11),
        duration: gsap.utils.random(1.8, 2.8),
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: gsap.utils.random(0, 1.5),
      });
    });
  }

  // Build the cubes. Enter waits for the section-cut curtain to clear (SECTION_ENTER_DELAY).
  function playAll() {
    const done = buildAll(SECTION_ENTER_DELAY);
    // Names sweep in once the builds are mostly settled; positional stagger in
    // playLabelReveals handles the left-to-right cascade across the row.
    playLabelReveals(nameEls, done - 0.35);
  }

  // Returns the time (s) at which the last face of the last cube has landed.
  function buildAll(base: number) {
    const order = gsap.utils.shuffle(cubeEls.map((_, i) => i));
    let done = 0;
    order.forEach((cubeIndex, slot) => {
      done = Math.max(done, buildCube(cubeEls[cubeIndex], base + slot * BUILD_STAGGER));
    });
    return done;
  }

  function buildCube(cube: HTMLElement, delay: number) {
    const faces = cube.querySelectorAll<HTMLElement>('.pc-face-anim');
    const state = states.find(c => c.el === cube);
    if (state) {
      state.building = true;
      state.rx = gsap.utils.random(-40, 20);
      state.ry = gsap.utils.random(-360, 360);
      state.idleVx = gsap.utils.random([-1, 1]) * gsap.utils.random(0.02, 0.08);
      state.idleVy = gsap.utils.random([-1, 1]) * gsap.utils.random(0.07, 0.22);
      state.vx = state.idleVx; state.vy = state.idleVy;
    }
    gsap.killTweensOf(faces);
    const rect = cube.getBoundingClientRect();
    const fromTop = -(rect.top + rect.height + 80);
    const order = gsap.utils.shuffle([...faces].map((_, i) => i));
    let last = 0;
    order.forEach((fi, step) => {
      const f = faces[fi];
      const start = step * FACE_STAGGER + gsap.utils.random(0, FACE_STAGGER * 0.9);
      const dur = gsap.utils.random(0.26, 0.42);
      last = Math.max(last, delay + start + dur);
      gsap.set(f, { opacity: 0, y: fromTop, x: gsap.utils.random(-40, 40), rotationZ: gsap.utils.random(-18, 18) });
      const tl = gsap.timeline({ delay: delay + start });
      tl.to(f, { opacity: 1, duration: 0.1, ease: 'none' }, 0)
        .to(f, { y: 0, x: 0, rotationZ: 0, duration: dur, ease: 'power4.out' }, 0);
    });
    // Shadow blooms while the faces rain down, then pulses once the last face
    // lands — sells the impact of the completed cube.
    const shadow = shadowEls[cubeEls.indexOf(cube)];
    if (shadow) {
      gsap.killTweensOf(shadow);
      gsap.set(shadow, { opacity: 0, scaleX: 0.5 });
      const stl = gsap.timeline({ delay });
      stl.to(shadow, { opacity: 0.85, scaleX: 1, duration: last - delay, ease: 'power2.out' }, 0)
         .to(shadow, { scaleX: 1.25, opacity: 1, duration: 0.09, ease: 'power2.out' }, last - delay)
         .to(shadow, { scaleX: 1, opacity: 0.85, duration: 0.4, ease: 'power2.out' }, last - delay + 0.09);
    }
    gsap.delayedCall(last + 0.05, () => { if (state) state.building = false; });
    return last;
  }

  const BASE_RX = -20, BASE_RY = -28;
  const ROTATE_RESET_DURATION = 0.22;

  // Returns an angle equivalent to `current` (mod 360) that lies within 180deg
  // of `target`, so tweening to `target` takes the short way round instead of
  // unwinding whatever multiple of 360 the idle spin/drag accumulated.
  function shortestAngle(current: number, target: number) {
    let diff = (current - target) % 360;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return target + diff;
  }

  // Leave fires immediately (no delay) and mirrors the build in reverse: the
  // rotation settles to its resting orientation *while* the faces peel off in
  // shuffled order and fly back up where they rained down from, with the same
  // random x-drift and rotationZ scatter as the enter. Every element revealed
  // on enter is animated out.
  function playLeave() {
    // Shadows and names exit immediately alongside the cubes.
    gsap.killTweensOf(shadowEls);
    gsap.to(shadowEls, { opacity: 0, scaleX: 0.5, duration: 0.3, ease: 'power2.in', overwrite: 'auto' });
    playLabelLeave(nameEls);

    const cubeOrder = gsap.utils.shuffle(cubeEls.map((_, i) => i));
    cubeOrder.forEach((cubeIndex, slot) => {
      const cube = cubeEls[cubeIndex];
      const state = states.find(c => c.el === cube);
      const faces = cube.querySelectorAll<HTMLElement>('.pc-face-anim');
      gsap.killTweensOf(faces);

      // Quick concurrent settle so "up" reads as screen-up while faces travel —
      // no waiting: faces start leaving while the rotation is still fixing.
      if (state) {
        gsap.killTweensOf(state);
        state.building = true;
        state.rx = shortestAngle(state.rx, BASE_RX);
        state.ry = shortestAngle(state.ry, BASE_RY);
        gsap.to(state, {
          rx: BASE_RX,
          ry: BASE_RY,
          duration: ROTATE_RESET_DURATION,
          ease: 'power2.inOut',
          overwrite: 'auto',
        });
      }

      const rect = cube.getBoundingClientRect();
      const toTop = -(rect.top + rect.height + 80);
      const cubeDelay = slot * 0.04;
      const order = gsap.utils.shuffle([...faces].map((_, i) => i));
      let last = 0;
      order.forEach((fi, step) => {
        const f = faces[fi];
        const start = cubeDelay + step * (FACE_STAGGER * 0.5) + gsap.utils.random(0, FACE_STAGGER * 0.4);
        const dur = gsap.utils.random(0.24, 0.34);
        last = Math.max(last, start + dur);
        const tl = gsap.timeline({ delay: start });
        tl.to(f, {
            y: toTop,
            x: gsap.utils.random(-40, 40),
            rotationZ: gsap.utils.random(-14, 14),
            duration: dur,
            ease: 'power3.in',
            overwrite: 'auto',
          }, 0)
          // Fade only in the last stretch of travel so the face visibly flies
          // away rather than vanishing in place.
          .to(f, { opacity: 0, duration: 0.12, ease: 'none' }, dur - 0.12);
      });

      if (state) {
        gsap.delayedCall(last + 0.05, () => {
          state.building = false;
          state.vx = state.idleVx;
          state.vy = state.idleVy;
        });
      }
    });
  }

  onMounted(setup);

  onBeforeUnmount(() => {
    if (raf) cancelAnimationFrame(raf);
    if (cleanupStates) cleanupStates();
    detachers.forEach(fn => fn());
  });
</script>

<style lang="scss" scoped>
  @use "@styleVariables" as *;

  .profile-cubes {
    position: absolute;
    inset: 0;
    color: #fff;
    font-family: Mono, monospace;
    overflow: hidden;
    pointer-events: none;

    // Desktop-exclusive: the card stack takes over below smallDesktop.
    @include allMobile {
      display: none;
    }
  }

  .pc-stage {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pc-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(48px, 6vw, 110px);
    flex-wrap: nowrap;
  }

  .pc-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 34px;
  }

  .pc-scene {
    width: 220px;
    height: 220px;
    perspective: 1100px;
    cursor: grab;
    pointer-events: auto;
  }

  // Elliptical glow floor under each cube — colour injected inline per cube.
  .pc-shadow {
    width: 240px;
    height: 34px;
    margin-top: 18px;
    border-radius: 50%;
    opacity: 0;
    filter: brightness(1);
    pointer-events: none;
  }

  .pc-name {
    position: relative;
    pointer-events: none;

    .pc-label-inner {
      position: relative;
      display: inline-block;
      overflow: hidden;
    }

    .pc-label-text {
      font-size: 17px;
      font-weight: 700;
      letter-spacing: 4px;
      line-height: 1.05;
      white-space: pre;
      clip-path: inset(0 100% 0 0);
    }

    .pc-label-bar {
      position: absolute;
      top: -6%;
      bottom: -6%;
      left: 0;
      width: 100%;
      transform-origin: left center;
      transform: scaleX(0);
    }
  }

  .pc-cube {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transform: rotateX(-20deg) rotateY(-28deg);
  }

  .pc-face-anim {
    position: absolute;
    inset: 0;
    transform-style: preserve-3d;
    opacity: 0;
  }

  .pc-face {
    // Bled 1px past the cube's logical edge on every side (translateZ is still
    // pegged to the true half-size in the script) so adjoining faces overlap by
    // a hairline instead of leaving a seam gap at the shared corner/edge.
    position: absolute;
    inset: -1px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    // Faint blueprint grid + edge vignette on top of the translucent fill —
    // keeps the wireframe/HUD look without adding any DOM.
    background:
      radial-gradient(ellipse at center, transparent 55%, rgba(0, 0, 0, 0.45) 100%),
      linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px) 0 0 / 27.5px 27.5px,
      linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px) 0 0 / 27.5px 27.5px,
      rgba(0, 0, 0, 0.3);

    span {
      font-weight: 700;
      font-size: 20px;
      letter-spacing: 1px;
    }
  }
</style>
