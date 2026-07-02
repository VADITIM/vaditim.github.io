<template>
  <!-- Desktop-only wireframe cubes. Hidden below smallDesktop (see <style>). -->
  <div ref="root" class="logs-cubes">
    <!-- Cubes, centered -->
    <div class="pc-stage">
      <div class="pc-row">
        <ModuleDisplay v-for="(cube, ci) in cubes" :key="'cube-' + ci" class="pc-cell" :accent="cube.color">
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
        </ModuleDisplay>
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
  import ModuleDisplay from '@components/Misc/Module-Display.vue';

  gsap.defaults({ immediateRender: false });

  const FACE_HALF = 105;  // half the 300px cube edge (see .pc-scene) — how far each face is pushed out

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

  // ── Quaternion helpers ──
  // World-space (extrinsic) rotations: pre-multiply so each drag increment
  // rotates around the screen axes, not the cube's local axes. This means
  // "drag right always spins right" regardless of current orientation.
  interface Q { w: number; x: number; y: number; z: number }
  const qMul = (a: Q, b: Q): Q => ({
    w: a.w*b.w - a.x*b.x - a.y*b.y - a.z*b.z,
    x: a.w*b.x + a.x*b.w + a.y*b.z - a.z*b.y,
    y: a.w*b.y - a.x*b.z + a.y*b.w + a.z*b.x,
    z: a.w*b.z + a.x*b.y - a.y*b.x + a.z*b.w,
  });
  const qNorm = (q: Q): Q => {
    const l = Math.sqrt(q.w**2 + q.x**2 + q.y**2 + q.z**2) || 1;
    return { w: q.w/l, x: q.x/l, y: q.y/l, z: q.z/l };
  };
  const qFromAxis = (ax: number, ay: number, az: number, deg: number): Q => {
    const h = deg * Math.PI / 360;
    const s = Math.sin(h);
    return { w: Math.cos(h), x: ax*s, y: ay*s, z: az*s };
  };
  // Column-major matrix3d for CSS — perspective on .pc-scene still applies.
  const qToCSS = ({ w, x, y, z }: Q) =>
    `matrix3d(${1-2*(y*y+z*z)},${2*(x*y+z*w)},${2*(x*z-y*w)},0,` +
    `${2*(x*y-z*w)},${1-2*(x*x+z*z)},${2*(y*z+x*w)},0,` +
    `${2*(x*z+y*w)},${2*(y*z-x*w)},${1-2*(x*x+y*y)},0,0,0,0,1)`;
  // Initial orientation: CSS rotateX(-20deg) rotateY(-28deg)
  // = extrinsic qY(-28) * qX(-20) (right-to-left world order).
  const Q0 = () => qNorm(qMul(qFromAxis(0,1,0,-28), qFromAxis(1,0,0,-20)));

  interface CubeState {
    el: HTMLElement;
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
  let raf = 0;
  let cleanupStates: (() => void) | null = null;
  const detachers: Array<() => void> = [];

  const logsIdx = getSectionIndexById('logs');

  function setup() {
    if (!root.value) return;
    cubeEls = [...root.value.querySelectorAll<HTMLElement>('.pc-cube')];
    shadowEls = [...root.value.querySelectorAll<HTMLElement>('.pc-shadow')];
    nameEls = [...root.value.querySelectorAll<HTMLElement>('.pc-name')];

    states = cubeEls.map(el => {
      const idleVX = gsap.utils.random([-1, 1]) * gsap.utils.random(0.02, 0.07);
      const idleVY = gsap.utils.random([-1, 1]) * gsap.utils.random(0.08, 0.2);
      return { el, q: Q0(), vX: idleVX, vY: idleVY, idleVX, idleVY, dragging: false, building: false };
    });

    cubeEls.forEach((cube, i) => attachDrag(cube.closest('.pc-scene') as HTMLElement, states[i]));

    hideAll();
    startIdleBob();

    const tick = () => { spinStep(); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);

    cleanupStates = onSectionStatesChange((meta: SectionTransitionMeta) => {
      if (meta.isEnteringSection(logsIdx)) playAll();
      else if (meta.isLeavingSection(logsIdx)) playLeave();
    });

    // Cold-mount case: if Logs is already the active section, build immediately.
    if (currentSection.value === logsIdx) playAll();
  }

  function spinStep() {
    for (const c of states) {
      if (!c.dragging && !c.building) {
        c.q = qNorm(qMul(qFromAxis(0,1,0, c.vY), qMul(qFromAxis(1,0,0, c.vX), c.q)));
        c.vX += (c.idleVX - c.vX) * 0.02;
        c.vY += (c.idleVY - c.vY) * 0.02;
      }
      c.el.style.transform = qToCSS(c.q);
    }
  }

  function attachDrag(scene: HTMLElement, cube: CubeState) {
    let lastX = 0, lastY = 0;
    const move = (e: PointerEvent) => {
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      cube.q = qNorm(qMul(qFromAxis(0,1,0, dx * 0.5), qMul(qFromAxis(1,0,0, -dy * 0.5), cube.q)));
      cube.vX = -dy * 0.5; cube.vY = dx * 0.5;
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

  const BOX_REVEAL_DURATION = 0.6;
  const BOX_REVEAL_STAGGER = 0.08;

  // Boxes reveal first (same choreography as the Sandbox module windows), then
  // the cubes build on top of them once they've landed.
  function playAll() {
    const boxes = root.value ? Array.from(root.value.querySelectorAll<HTMLElement>('.module-display')) : [];
    gsap.killTweensOf(boxes);
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
    const state = states.find(c => c.el === cube);
    if (state) {
      state.building = true;
      const rxDeg = gsap.utils.random(-40, 20);
      const ryDeg = gsap.utils.random(-360, 360);
      state.q = qNorm(qMul(qFromAxis(0,1,0, ryDeg), qFromAxis(1,0,0, rxDeg)));
      state.idleVX = gsap.utils.random([-1, 1]) * gsap.utils.random(0.02, 0.08);
      state.idleVY = gsap.utils.random([-1, 1]) * gsap.utils.random(0.07, 0.22);
      state.vX = state.idleVX; state.vY = state.idleVY;
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

  // Leave fires immediately (no delay) — mirrors the Sandbox module windows:
  // the whole box slides down off screen and fades, carrying the cube with it.
  // No separate per-face fly-out on leave (that's an enter-only flourish now).
  function playLeave() {
    const boxes = root.value ? Array.from(root.value.querySelectorAll<HTMLElement>('.module-display')) : [];
    gsap.killTweensOf(boxes);
    gsap.to(boxes, { y: '60vh', opacity: 0, duration: 0.22, stagger: 0.035, ease: 'power3.in', overwrite: 'auto' });

    gsap.killTweensOf(shadowEls);
    gsap.to(shadowEls, { opacity: 0, scaleX: 0.5, duration: 0.22, ease: 'power2.in', overwrite: 'auto' });
    playLabelLeave(nameEls);

    cubeEls.forEach(cube => gsap.killTweensOf(cube.querySelectorAll('.pc-face-anim')));
    states.forEach(state => { state.building = false; });
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

  // Overrides the base .module-display: a fixed 1:1 square (border-box, so padding
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

  // Elliptical glow floor under each cube — colour injected inline per cube.
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
