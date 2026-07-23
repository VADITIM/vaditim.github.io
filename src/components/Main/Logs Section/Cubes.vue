<template>
  <!-- Desktop-only wireframe cubes. Hidden below smallDesktop (see <style>). -->
  <div ref="root" class="logs-cubes">
    <!-- Cubes, centered -->
    <div class="pc-stage">
      <div class="pc-row">
        <Module v-for="(cube, ci) in cubes" :key="'cube-' + ci" class="pc-cell" :accent="cube.color">
          <template #label>{{ String(ci + 1).padStart(2, '0') }} · {{ cube.name }}</template>
          <div class="pc-body">
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
        </Module>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, onBeforeUnmount, ref } from 'vue';
  import { gsap } from 'gsap';
  import { onSectionStatesChange, type SectionTransitionMeta } from '@modules/sectionsStateMachine';
  import { getSectionIndexById } from '@modules/sectionLookup';
  import { currentSection } from '@modules/sectionsCore';
  import { SECTION_ENTER_DELAY } from '@modules/sectionsTransition';
  import { hideLabels, playLabelReveals, playLabelLeave } from '@modules/miscLabelReveal';
  import Module from '@components/Misc/Module.vue';
  import { prefersReducedMotion } from '@modules/miscReducedMotion';
  import { isLiteMode } from '@modules/miscAnimationMode';
  import { playLiteEnter, playLiteLeave } from '@modules/animationLiteFallback';

  gsap.defaults({ immediateRender: false });

  const FACE_HALF = 105;  // half the 300px cube edge (see .pc-scene); how far each face is pushed out

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

  const cubes: CubeDef[] = cubeData.map(cube => ({
    name: cube.name,
    color: cube.color,
    bg: cube.bg,
    faces: faceDefs.map((face, index) => ({ tf: face.tf, token: cube.tokens[index] || '' })),
  }));

  function faceStyle(cube: CubeDef, tf: string) {
    return {
      border: `2px solid ${cube.color}`,
      transform: tf,
      boxShadow: `inset 0 0 30px ${cube.bg}, 0 0 12px ${cube.bg}`,
    };
  }

  // ---- Interactive state (idle spin + drag) --------------------------------

  const root = ref<HTMLElement | null>(null);
  const BUILD_STAGGER = 0.22;  // gap between successive cubes starting to build
  const FACE_STAGGER = 0.06;   // gap between faces of the same cube

  // ── Quaternion helpers ──
  // World-space (extrinsic) rotations: pre-multiply so each drag increment
  // rotates around the screen axes, not the cube's local axes. This means
  // "drag right always spins right" regardless of current orientation.
  interface Q { w: number; x: number; y: number; z: number }
  const qMul = (left: Q, right: Q): Q => ({
    w: left.w*right.w - left.x*right.x - left.y*right.y - left.z*right.z,
    x: left.w*right.x + left.x*right.w + left.y*right.z - left.z*right.y,
    y: left.w*right.y - left.x*right.z + left.y*right.w + left.z*right.x,
    z: left.w*right.z + left.x*right.y - left.y*right.x + left.z*right.w,
  });
  const qNorm = (quaternion: Q): Q => {
    const length = Math.sqrt(quaternion.w**2 + quaternion.x**2 + quaternion.y**2 + quaternion.z**2) || 1;
    return { w: quaternion.w/length, x: quaternion.x/length, y: quaternion.y/length, z: quaternion.z/length };
  };
  const qFromAxis = (axisX: number, axisY: number, axisZ: number, degrees: number): Q => {
    const halfAngle = degrees * Math.PI / 360;
    const sine = Math.sin(halfAngle);
    return { w: Math.cos(halfAngle), x: axisX*sine, y: axisY*sine, z: axisZ*sine };
  };
  // Column-major matrix3d for CSS; perspective on .pc-scene still applies.
  const qToCSS = ({ w, x, y, z }: Q) =>
    `matrix3d(${1-2*(y*y+z*z)},${2*(x*y+z*w)},${2*(x*z-y*w)},0,` +
    `${2*(x*y-z*w)},${1-2*(x*x+z*z)},${2*(y*z+x*w)},0,` +
    `${2*(x*z+y*w)},${2*(y*z-x*w)},${1-2*(x*x+y*y)},0,0,0,0,1)`;
  // Initial orientation: CSS rotateX(-20deg) rotateY(-28deg)
  // = extrinsic qY(-28) * qX(-20) (right-to-left world order).
  const Q0 = () => qNorm(qMul(qFromAxis(0,1,0,-28), qFromAxis(1,0,0,-20)));

  interface CubeState {
    element: HTMLElement;
    q: Q;
    vX: number; vY: number;       // angular velocity (deg/frame) around world X / Y
    idleVX: number; idleVY: number;
    dragging: boolean;
    building: boolean;
  }

  let cubeEls: HTMLElement[] = [];
  let shadowEls: HTMLElement[] = [];
  let nameEls: HTMLElement[] = [];
  let states: CubeState[] = [];
  let animationFrame = 0;
  let cleanupStates: (() => void) | null = null;
  const detachers: Array<() => void> = [];

  const logsIndex = getSectionIndexById('logs');

  function setup() {
    if (!root.value) return;
    cubeEls = [...root.value.querySelectorAll<HTMLElement>('.pc-cube')];
    shadowEls = [...root.value.querySelectorAll<HTMLElement>('.pc-shadow')];
    nameEls = [...root.value.querySelectorAll<HTMLElement>('.pc-name')];

    // Reduced motion parks the idle spin at zero rather than stopping the loop:
    // dragging a cube still works, it just comes to rest instead of drifting on.
    states = cubeEls.map(element => {
      const idleVX = prefersReducedMotion.value ? 0 : gsap.utils.random([-1, 1]) * gsap.utils.random(0.02, 0.07);
      const idleVY = prefersReducedMotion.value ? 0 : gsap.utils.random([-1, 1]) * gsap.utils.random(0.08, 0.2);
      return { element, q: Q0(), vX: idleVX, vY: idleVY, idleVX, idleVY, dragging: false, building: false };
    });

    cubeEls.forEach((cube, i) => attachDrag(cube.closest('.pc-scene') as HTMLElement, states[i]));

    hideAll();
    startIdleBob();

    const tick = () => { spinStep(); animationFrame = requestAnimationFrame(tick); };
    animationFrame = requestAnimationFrame(tick);

    cleanupStates = onSectionStatesChange((meta: SectionTransitionMeta) => {
      if (meta.isEnteringSection(logsIndex)) playAll();
      else if (meta.isLeavingSection(logsIndex)) playLeave();
    });

    // Cold-mount case: if Logs is already the active section, build immediately.
    if (currentSection.value === logsIndex) playAll();
  }

  function spinStep() {
    for (const cube of states) {
      if (!cube.dragging && !cube.building) {
        cube.q = qNorm(qMul(qFromAxis(0,1,0, cube.vY), qMul(qFromAxis(1,0,0, cube.vX), cube.q)));
        cube.vX += (cube.idleVX - cube.vX) * 0.02;
        cube.vY += (cube.idleVY - cube.vY) * 0.02;
      }
      cube.element.style.transform = qToCSS(cube.q);
    }
  }

  function attachDrag(scene: HTMLElement, cube: CubeState) {
    let lastX = 0, lastY = 0;
    const move = (event: PointerEvent) => {
      const dx = event.clientX - lastX, dy = event.clientY - lastY;
      lastX = event.clientX; lastY = event.clientY;
      cube.q = qNorm(qMul(qFromAxis(0,1,0, dx * 0.5), qMul(qFromAxis(1,0,0, -dy * 0.5), cube.q)));
      cube.vX = -dy * 0.5; cube.vY = dx * 0.5;
    };
    const up = () => {
      cube.dragging = false; scene.style.cursor = 'grab';
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    const down = (event: PointerEvent) => {
      cube.dragging = true; scene.style.cursor = 'grabbing';
      lastX = event.clientX; lastY = event.clientY;
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      event.preventDefault();
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

  // Initial hidden state; faces invisible, shadows collapsed, names clipped.
  function hideAll() {
    cubeEls.forEach(cube => gsap.set(cube.querySelectorAll('.pc-face-anim'), { opacity: 0 }));
    gsap.set(shadowEls, { opacity: 0, scaleX: 0.5 });
    hideLabels(nameEls);
  }

  // Gentle perpetual float; each scene bobs on its own rhythm so the row never
  // reads as mechanically synced. Runs for the component's whole life.
  function startIdleBob() {
    if (!root.value) return;
    // An endless bob is ambience; at the reduced-motion time scale it would judder.
    if (prefersReducedMotion.value || isLiteMode.value) return;
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

  const BOX_REVEAL_DURATION = 0.6;
  const BOX_REVEAL_STAGGER = 0.08;

  // Boxes reveal first (same choreography as the Sandbox module windows), then
  // the cubes build on top of them once they've landed.
  function playAll() {
    const boxes = root.value ? Array.from(root.value.querySelectorAll<HTMLElement>('.module')) : [];
    gsap.killTweensOf(boxes);

    // Lite: the boxes still arrive, but the cubes are simply there rather than
    // raining in face by face — that build is dozens of 3D layers in flight.
    if (isLiteMode.value) {
      playLiteEnter(boxes);
      cubeEls.forEach((cube) => gsap.set(cube.querySelectorAll('.pc-face-anim'), { opacity: 1, x: 0, y: 0, rotationZ: 0 }));
      gsap.set(shadowEls, { opacity: 0.85, scaleX: 1 });
      playLabelReveals(nameEls, SECTION_ENTER_DELAY);
      return;
    }

    gsap.fromTo(boxes,
      { opacity: 0, y: 36, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: BOX_REVEAL_DURATION, stagger: BOX_REVEAL_STAGGER, ease: 'back.out(1.6)', delay: SECTION_ENTER_DELAY });

    const boxesDone = SECTION_ENTER_DELAY + BOX_REVEAL_DURATION + Math.max(0, boxes.length - 1) * BOX_REVEAL_STAGGER;
    const done = buildAll(boxesDone);
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
    const state = states.find(c => c.element === cube);
    if (state) {
      state.building = true;
      const rxDeg = gsap.utils.random(-40, 20);
      const ryDeg = gsap.utils.random(-360, 360);
      state.q = qNorm(qMul(qFromAxis(0,1,0, ryDeg), qFromAxis(1,0,0, rxDeg)));
      state.idleVX = prefersReducedMotion.value ? 0 : gsap.utils.random([-1, 1]) * gsap.utils.random(0.02, 0.08);
      state.idleVY = prefersReducedMotion.value ? 0 : gsap.utils.random([-1, 1]) * gsap.utils.random(0.07, 0.22);
      state.vX = state.idleVX; state.vY = state.idleVY;
    }
    gsap.killTweensOf(faces);
    const rect = cube.getBoundingClientRect();
    const fromTop = -(rect.top + rect.height + 80);
    const order = gsap.utils.shuffle([...faces].map((_, index) => index));
    let last = 0;
    order.forEach((faceIndex, step) => {
      const face = faces[faceIndex];
      const start = step * FACE_STAGGER + gsap.utils.random(0, FACE_STAGGER * 0.9);
      const duration = gsap.utils.random(0.26, 0.42);
      last = Math.max(last, delay + start + duration);
      gsap.set(face, { opacity: 0, y: fromTop, x: gsap.utils.random(-40, 40), rotationZ: gsap.utils.random(-18, 18) });
      const timeline = gsap.timeline({ delay: delay + start });
      timeline.to(face, { opacity: 1, duration: 0.1, ease: 'none' }, 0)
        .to(face, { y: 0, x: 0, rotationZ: 0, duration: duration, ease: 'power4.out' }, 0);
    });
    // Shadow blooms while the faces rain down, then pulses once the last face
    // lands; sells the impact of the completed cube.
    const shadow = shadowEls[cubeEls.indexOf(cube)];
    if (shadow) {
      gsap.killTweensOf(shadow);
      gsap.set(shadow, { opacity: 0, scaleX: 0.5 });
      const shadowTimeline = gsap.timeline({ delay });
      shadowTimeline.to(shadow, { opacity: 0.85, scaleX: 1, duration: last - delay, ease: 'power2.out' }, 0)
         .to(shadow, { scaleX: 1.25, opacity: 1, duration: 0.09, ease: 'power2.out' }, last - delay)
         .to(shadow, { scaleX: 1, opacity: 0.85, duration: 0.4, ease: 'power2.out' }, last - delay + 0.09);
    }
    gsap.delayedCall(last + 0.05, () => { if (state) state.building = false; });
    return last;
  }

  // Leave fires immediately (no delay); mirrors the Sandbox module windows:
  // the whole box slides down off screen and fades, carrying the cube with it.
  // No separate per-face fly-out on leave (that's an enter-only flourish now).
  function playLeave() {
    const boxes = root.value ? Array.from(root.value.querySelectorAll<HTMLElement>('.module')) : [];
    gsap.killTweensOf(boxes);
    if (isLiteMode.value) playLiteLeave(boxes);
    else gsap.to(boxes, { y: '60vh', opacity: 0, duration: 0.22, stagger: 0.035, ease: 'power3.in', overwrite: 'auto' });

    gsap.killTweensOf(shadowEls);
    gsap.to(shadowEls, { opacity: 0, scaleX: 0.5, duration: 0.22, ease: 'power2.in', overwrite: 'auto' });
    playLabelLeave(nameEls);

    cubeEls.forEach(cube => gsap.killTweensOf(cube.querySelectorAll('.pc-face-anim')));
    states.forEach(state => { state.building = false; });
  }

  onMounted(setup);

  onBeforeUnmount(() => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    if (cleanupStates) cleanupStates();
    detachers.forEach(fn => fn());
  });
</script>

<style lang="scss" scoped>
  @use "@styleVariables" as *;

  .logs-cubes {
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
    gap: clamp(24px, 3vw, 60px);
    flex-wrap: wrap;
  }

  // Overrides the base .module: a fixed 1:1 square (border-box, so padding
  // can't skew the ratio), enlarged to properly contain the bigger cube. The
  // module label keeps its own predetermined top-left position regardless.
  .pc-cell {
    width: 430px;
    height: 430px;
    box-sizing: border-box;
    pointer-events: auto;
  }

  // Centers the cube content within the box.
  .pc-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    min-height: 0;
  }

  .pc-scene {
    width: 210px;
    height: 210px;
    perspective: 1100px;
    cursor: grab;
    pointer-events: auto;
  }

  // Elliptical glow floor under each cube; colour injected inline per cube.
  // .pc-shadow {
  //   width: 320px;
  //   height: 32px;
  //   margin-top: 8px;
  //   border-radius: 50%;
  //   opacity: 0;
  //   filter: brightness(1);
  //   pointer-events: none;
  // }

  .pc-name {
    position: relative;
    pointer-events: none;
      bottom: -15%;

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
    // Faint blueprint grid + edge vignette on top of the translucent fill -
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
