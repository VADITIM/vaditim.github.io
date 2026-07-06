<template>
  <div ref="rootRef" class="sandbox-section">

    <div class="sb-header">
      <div ref="eyebrowRef" class="sb-eyebrow">INTERACTION&nbsp;·&nbsp;SANDBOX</div>
    </div>


    <!-- Kickable physics title; each glyph is its own no-gravity body that
         bounces off the viewport edges and the module windows, and gets shoved
         by the cursor on contact. -->
    <div ref="lettersRef" class="sb-letters">
      <span
        v-for="(ch, i) in TITLE_LETTERS"
        :key="i"
        ref="charRefs"
        class="sb-char"
      >{{ ch }}</span>
    </div>

    <div class="sb-grid">

      <!-- WINDOW 1 · magnetic button -->
      <ModuleDisplay caption="how big can you get it?">
        <template #label>01 · MAGNETIC IMPACT</template>
        <div class="sb-win-body">
          <div ref="magCountRef" class="mi-mag-count">{{ magClicks }}</div>
          <MagneticButton ref="magBtnCompRef" class="mi-mag-btn-wrap" :zone="60" :strength="0.4" @click="onHitMeClick">HIT ME!</MagneticButton>
        </div>
      </ModuleDisplay>

      <!-- WINDOW 2 · hover-focus list -->
      <ModuleDisplay>
        <template #label>02 · HOVER - FOCUS - LIST</template>
        <div class="sb-win-body sb-list-body">
          <div
            v-for="label in LIST_ITEMS"
            :key="label"
            ref="listItemRefs"
            class="mi-item"
          >
            <span class="mi-txt">{{ label }}</span>
            <div class="mi-ul"></div>
          </div>
        </div>
      </ModuleDisplay>

      <!-- WINDOW 3 · zero-g space -->
      <ModuleDisplay label-over caption="hold and release a force!">
        <template #label>03 · SPACE</template>
        <div ref="gravRef" class="sb-grav"></div>
        <div class="sb-grav-controls">
          <MagneticButton type="button" class="sb-grav-btn-wrap" :zone="10" :strength="0.3" @click="addParticle">+</MagneticButton>
          <MagneticButton type="button" class="sb-grav-btn-wrap" :zone="10" :strength="0.3" @click="removeParticle">−</MagneticButton>
        </div>
      </ModuleDisplay>

      <!-- WINDOW 4 · tilt parallax -->
      <ModuleDisplay label-over>
        <template #label>04 · PARALLAX TILT</template>
        <div ref="tiltWrapRef" class="sb-tilt-wrap">
          <div ref="tiltRef" class="sb-tilt" @click="onTiltClick">
            <div class="sb-tilt-frame"></div>
            <img v-if="!isClassifiedUnlocked" :src="qrSrc" class="sb-tilt-qr" alt="Scan me" draggable="false" />
            <div v-else class="sb-tilt-wow">WOW!</div>
            <div class="sb-tilt-chip">2026</div>
            <div class="sb-tilt-name">SCAN ME?</div>
          </div>
        </div>
      </ModuleDisplay>

    </div>
  </div>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref } from 'vue'
  import { gsap } from 'gsap'
  import { currentSection } from '@modules/sectionsCore'
  import { getSectionIndexById } from '@modules/sectionLookup'
  import { onSectionStatesChange } from '@modules/sectionsStateMachine'
  import { SECTION_ENTER_DELAY } from '@modules/sectionsTransition'
  import ModuleDisplay from '@components/Misc/Module-Display.vue'
  import MagneticButton from '@components/Misc/Magnetic-Button.vue'
  import qrSrc from '@assets/images/rickroll-qr.png'
  import { triggerClassifiedUnlock, isClassifiedUnlocked } from '@modules/sectionsClassifiedUnlock'


  const LIST_ITEMS = ['NEBULA UI', 'HELIX', 'PULSE', 'ARCADE']
  const TITLE_LETTERS = 'SANDBOX'.split('')

  const rootRef = ref<HTMLElement | null>(null)
  const lettersRef = ref<HTMLElement | null>(null)
  const charRefs = ref<HTMLElement[]>([])
  const eyebrowRef = ref<HTMLElement | null>(null)
  const listItemRefs = ref<HTMLElement[]>([])
  const magBtnCompRef = ref<InstanceType<typeof MagneticButton> | null>(null)
  const magCountRef = ref<HTMLElement | null>(null)
  const magClicks = ref(0)
  const tiltWrapRef = ref<HTMLElement | null>(null)
  const tiltRef = ref<HTMLElement | null>(null)
  const gravRef = ref<HTMLElement | null>(null)

  const sbIndex = getSectionIndexById('sandbox')
  const MAG_MAX_SCALE = 2.1
  const MAG_RESET_MS = 200
  let magCombo = 0
  let magGrowth = .8
  let magResetTimer = 0

  // ── particle physics state ──
  type Shape = { el: HTMLElement; r: number; x: number; y: number; vx: number; vy: number; rot: number; vr: number }
  const PARTICLE_COUNT = 8
  const PARTICLE_MIN = 3
  const PARTICLE_MAX = 30
  const PARTICLE_COLORS = ['#6fae7c', '#b06a6a', '#8a9a6f']
  const REST = 0.86      // velocity kept after a bounce
  const DRIFT = 0.9995   // near-frictionless space

  let shapes: Shape[] = []
  const pointer = { x: -999, y: -999, down: false }
  let rafId = 0

  // ── pull-field visuals (gravity-well effect while holding click in zero-g
  //    space). Minimal + on-palette: a bright green core, thin rings that fall
  //    continuously inward (matter drawn into the well) and a faint rotating
  //    HUD reticle; replaces the old off-palette fiery black hole. ──
  let pullField: HTMLElement | null = null      // wrapper anchored at cursor
  let pullCore: HTMLElement | null = null       // singularity core dot
  let pullReticle: HTMLElement | null = null    // slow-rotating outer HUD ring
  let pullRings: HTMLElement[] = []             // in-falling rings
  let pullTweens: gsap.core.Tween[] = []        // looping ring/core/reticle tweens

  // ── kickable title physics (no gravity) ──
  // Each glyph stores its top-left position (x,y) in section-space, velocity,
  // measured size (w,h) and "home" slot (hx,hy) it animates into on enter.
  type Glyph = { el: HTMLElement; w: number; h: number; x: number; y: number; vx: number; vy: number; rot: number; vr: number; hx: number; hy: number }
  // A corner background-slice's diagonal edge, as a bumper: p1→p2 is the
  // hypotenuse (section-space), n is the unit normal pointing INTO the solid
  // (colored) triangle so collision math has one consistent sign convention.
  type Bumper = { p1x: number; p1y: number; p2x: number; p2y: number; nx: number; ny: number; l: number; t: number; r: number; b: number; el: HTMLElement }
  let glyphs: Glyph[] = []
  let glyphBumpers: Bumper[] = []
  const BUMPER_KICK = 2.2              // pinball bumpers add a strong energy kick, unlike a plain wall bounce (G_REST)
  const bumperPulseAt = new WeakMap<HTMLElement, number>()
  // Each corner's hypotenuse endpoints (as l/t/r/b box corners) and the
  // right-angle vertex on the solid side, derived from that slice's clip-path
  // polygon in Section-Cover-Slice.vue.
  type Corner = 'tl' | 'tr' | 'bl' | 'br'
  const CORNER_BUMPER_DEFS: Array<{ selector: string; hypo: [Corner, Corner]; solid: Corner }> = [
    { selector: '.sandbox-tl', hypo: ['tr', 'bl'], solid: 'tl' },
    { selector: '.sandbox-tr', hypo: ['tl', 'br'], solid: 'tr' },
    { selector: '.sandbox-bl', hypo: ['tl', 'br'], solid: 'bl' },
    { selector: '.sandbox-br', hypo: ['tr', 'bl'], solid: 'br' },
  ]
  // Resolved slice elements (the DOM lives in the global Section-Cover-Slice
  // layer, not this component), cached so the per-frame re-measure doesn't
  // re-query the document.
  let cornerSlices: Array<{ el: HTMLElement; hypo: [Corner, Corner]; solid: Corner }> = []
  let glyphsReleased = false          // physics only runs once the title has landed
  const gPtr = { x: -9999, y: -9999, px: -9999, py: -9999 }
  const G_DRIFT = 0.94                // near-frictionless space, no gravity; drifts to rest
  const G_REST = 0.72                 // energy kept after a bounce
  const G_MAXV = 46                   // velocity clamp so a fast flick can't fling letters off-screen
  const G_MAXVR = 40                  // angular velocity clamp (deg/frame)
  const G_SPIN_FRICTION = 0.985       // spin slowly bleeds off
  const G_CURSOR_R = 28               // cursor "paddle" radius
  const G_PULL = 0.135                // module-03 black-hole pull on letters; 50% of the particle magnet (0.27)

  // Treat each glyph as a circle for inter-glyph and cursor response so they roll
  // off one another cleanly instead of catching on rectangular corners.
  function glyphRadius(g: Glyph) { return (g.w + g.h) / 4 }

  // ── cleanup bookkeeping ──
  const listeners: Array<() => void> = []
  let stopSectionWatch: (() => void) | null = null

  function on(target: Window | HTMLElement, type: string, handler: EventListenerOrEventListenerObject, opts?: AddEventListenerOptions) {
    target.addEventListener(type, handler, opts)
    listeners.push(() => target.removeEventListener(type, handler, opts))
  }

  // ── magnetic button impact (extra function appended to the base MagneticButton) ──
  function onHitMeClick() {
    const btn = magBtnCompRef.value?.el
    if (!btn) return

    clearTimeout(magResetTimer)
    magCombo++
    magClicks.value = magCombo
    gsap.fromTo(magCountRef.value, { scale: 1.3, color: '#5bfd5b' }, { scale: 1, color: '#fff', duration: 0.35, ease: 'power3.out', overwrite: 'auto' })

    const remaining = MAG_MAX_SCALE - magGrowth
    magGrowth += remaining * 0.22
    if (MAG_MAX_SCALE - magGrowth < 0.05) magGrowth = MAG_MAX_SCALE

    gsap.killTweensOf(btn, 'scale,rotation,skewX,skewY,backgroundColor,boxShadow')

    const kick = 3 + Math.min(magCombo, 5)
    const dir = magCombo % 2 === 0 ? 1 : -1
    const hit = gsap.timeline({ overwrite: 'auto' })
    hit.to(btn, { scale: magGrowth, duration: 0.12, ease: 'back.out(2)' }, 0)
    hit.to(btn, { scale: Math.max(1, magGrowth - 0.12), duration: 0.35, ease: 'power2.in' }, 0.16)
    hit.to(btn, { rotation: -dir * kick, skewX: -dir * kick * 0.6, skewY: dir * kick * 0.3, duration: 0.04, ease: 'power1.out' }, 0)
    hit.to(btn, { rotation: dir * kick * 0.8, skewX: dir * kick * 0.5, skewY: -dir * kick * 0.25, duration: 0.05, ease: 'power1.inOut' }, 0.04)
    hit.to(btn, { rotation: dir * kick * 0.5, skewX: dir * kick * 0.3, skewY: -dir * kick * 0.15, duration: 0.08, ease: 'power2.out' }, 0.09)

    if (magGrowth >= MAG_MAX_SCALE) {
      hit.set(btn, { backgroundColor: '#ff2b2b', boxShadow: '0 0 24px 6px rgba(255,43,43,0.85)' }, 0)
      hit.to(btn, { backgroundColor: '#ff2b2b', boxShadow: '0 0 32px 10px rgba(255,43,43,0.95)', duration: 0.12, ease: 'power2.out', repeat: 1, yoyo: true }, 0)
      hit.to(btn, { backgroundColor: '#5bfd5b', boxShadow: '0 0 0 0 rgba(255,43,43,0)', duration: 0.4, ease: 'power2.out' }, 0.24)
    }

    magResetTimer = window.setTimeout(() => {
      magCombo = 0
      magGrowth = 1
      magClicks.value = 0
      gsap.to(btn, { scale: 1, rotation: 0, skewX: 0, skewY: 0, duration: 0.4, ease: 'power2.out', overwrite: 'auto' })
      gsap.to(magCountRef.value, { opacity: 0.4, duration: 0.3, overwrite: 'auto', onComplete: () => { gsap.to(magCountRef.value, { opacity: 1, duration: 0.3 }) } })
    }, MAG_RESET_MS)
  }

  // ── hover-focus list (overwrite:'auto' everywhere so fast toggling never glitches) ──
  function initList() {
    listItemRefs.value.forEach((item) => {
      const txt = item.querySelector<HTMLElement>('.mi-txt')
      const ul = item.querySelector<HTMLElement>('.mi-ul')
      on(item, 'mouseenter', () => {
        gsap.to(item, { color: '#fff', duration: 0.3, overwrite: 'auto' })
        gsap.to(txt, { x: 16, scale: 1.08, duration: 0.45, ease: 'back.out(2.5)', transformOrigin: 'left center', overwrite: 'auto' })
        gsap.to(ul, { scaleX: 1, transformOrigin: 'left center', duration: 0.45, ease: 'power3.out', overwrite: 'auto' })
      })
      on(item, 'mouseleave', () => {
        gsap.to(item, { color: '#777', duration: 0.3, overwrite: 'auto' })
        gsap.to(txt, { x: 0, scale: 1, duration: 0.4, ease: 'power3.out', overwrite: 'auto' })
        gsap.to(ul, { scaleX: 0, transformOrigin: 'left center', duration: 0.3, ease: 'power3.in', overwrite: 'auto' })
      })
    })
  }

  // ── tilt parallax card: placeholder for the real QR-scan unlock (the real
  //    flow scans this same card's code on a phone; see TASKS.md "Classified
  //    Section; QR code unlock"). No-op after the first unlock. ──
  function onTiltClick() {
    triggerClassifiedUnlock()
  }

  // ── tilt parallax card ──
  function initTilt() {
    const wrap = tiltWrapRef.value, card = tiltRef.value
    if (!wrap || !card) return
    // Pre-register GSAP's transform state so the first mousemove tween has a
    // known starting point and doesn't trigger a scale glitch from reading the
    // browser's computed CSS with no prior GSAP _gsap data on the element.
    gsap.set(card, { rotationX: 0, rotationY: 0, transformPerspective: 900 })
    on(wrap, 'mousemove', (e) => {
      const ev = e as MouseEvent
      const r = wrap.getBoundingClientRect()
      const px = (ev.clientX - (r.left + r.width / 2)) / (r.width / 2)
      const py = (ev.clientY - (r.top + r.height / 2)) / (r.height / 2)
      gsap.to(card, { rotationY: px * 16, rotationX: -py * 16, duration: 0.4, ease: 'power3.out', transformPerspective: 900, overwrite: 'auto' })
    })
    on(wrap, 'mouseleave', () => gsap.to(card, { rotationY: 0, rotationX: 0, duration: 0.8, ease: 'elastic.out(1,0.4)', overwrite: 'auto' }))
  }

  // ── zero-g particles ──
  function createShape(cont: HTMLElement, i: number): Shape {
    const r = 9 + Math.random() * 14
    const type = i % 3 // 0 circle, 1 square, 2 triangle
    const col = PARTICLE_COLORS[i % PARTICLE_COLORS.length]
    const el = document.createElement('div')
    let css = `position:absolute;left:0;top:0;width:${r * 2}px;height:${r * 2}px;will-change:transform;pointer-events:none;`
    if (type === 0) css += `border-radius:50%;background:${col};`
    else if (type === 1) css += `border-radius:4px;background:${col};`
    else css += `background:${col};clip-path:polygon(50% 0,100% 100%,0 100%);`
    el.style.cssText = css
    cont.appendChild(el)
    const rect = cont.getBoundingClientRect()
    const x = r + Math.random() * Math.max(1, rect.width - 2 * r)
    const y = r + Math.random() * Math.max(1, rect.height - 2 * r)
    const a = Math.random() * Math.PI * 2, sp = 0.6 + Math.random() * 1.2
    return { el, r, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, rot: Math.random() * 360, vr: (Math.random() - 0.5) * 8 }
  }

  function addParticle() {
    const cont = gravRef.value
    if (!cont || shapes.length >= PARTICLE_MAX) return
    shapes.push(createShape(cont, shapes.length))
  }

  function removeParticle() {
    if (shapes.length <= PARTICLE_MIN) return
    const s = shapes.pop()
    s?.el.remove()
  }

  function initParticles() {
    const cont = gravRef.value
    if (!cont) return
    shapes = []
    for (let i = 0; i < PARTICLE_COUNT; i++) shapes.push(createShape(cont, i))

    buildPullField(cont)

    on(window, 'mousemove', (e) => {
      const ev = e as MouseEvent
      const r = cont.getBoundingClientRect()
      pointer.x = ev.clientX - r.left
      pointer.y = ev.clientY - r.top
    })
    on(cont, 'mousedown', () => { pointer.down = true; showPullField() })
    on(window, 'mouseup', () => { if (pointer.down) { hidePullField(); burst(); pointer.down = false } })
  }

  // ── pull-field: minimal on-palette gravity well under the cursor while holding ──
  const PULL_GREEN = '#5bfd5b'
  const PULL_RING_R = 44      // in-falling ring start radius (px)
  const PULL_RETICLE_R = 52   // outer HUD reticle radius (px)
  const PULL_RING_PERIOD = 1.4

  function buildPullField(cont: HTMLElement) {
    const field = document.createElement('div')
    field.style.cssText =
      'position:absolute;left:0;top:0;width:0;height:0;pointer-events:none;z-index:2;' +
      'opacity:0;will-change:transform,opacity;'

    // faint dashed reticle at a fixed outer radius; the "instrument" identity
    const reticle = document.createElement('div')
    reticle.style.cssText =
      `position:absolute;left:${-PULL_RETICLE_R}px;top:${-PULL_RETICLE_R}px;` +
      `width:${PULL_RETICLE_R * 2}px;height:${PULL_RETICLE_R * 2}px;border-radius:50%;` +
      'border:1px dashed rgba(91,253,91,0.45);opacity:0;will-change:transform,opacity;'
    field.appendChild(reticle)

    // three thin rings that continuously contract toward the core
    const rings: HTMLElement[] = []
    for (let i = 0; i < 3; i++) {
      const ring = document.createElement('div')
      ring.style.cssText =
        `position:absolute;left:${-PULL_RING_R}px;top:${-PULL_RING_R}px;` +
        `width:${PULL_RING_R * 2}px;height:${PULL_RING_R * 2}px;border-radius:50%;` +
        `border:1.5px solid ${PULL_GREEN};box-shadow:0 0 12px rgba(91,253,91,0.5);` +
        'opacity:0;will-change:transform,opacity;'
      field.appendChild(ring)
      rings.push(ring)
    }

    // bright core singularity with a soft green halo
    const core = document.createElement('div')
    core.style.cssText =
      'position:absolute;left:-7px;top:-7px;width:14px;height:14px;border-radius:50%;' +
      `background:${PULL_GREEN};` +
      'box-shadow:0 0 10px 2px rgba(91,253,91,0.9),0 0 24px 7px rgba(91,253,91,0.4);' +
      'will-change:transform;'
    field.appendChild(core)

    cont.appendChild(field)

    pullField = field
    pullReticle = reticle
    pullRings = rings
    pullCore = core
  }

  function showPullField() {
    if (!pullField) return
    pullField.style.transform = `translate(${pointer.x}px,${pointer.y}px)`
    pullTweens.forEach((t) => t.kill())
    pullTweens = []
    gsap.killTweensOf([pullField, pullReticle, pullCore, ...pullRings])

    gsap.fromTo(pullField, { opacity: 0 }, { opacity: 1, duration: 0.15, ease: 'none' })

    // reticle fades in and rotates slowly, forever
    gsap.set(pullReticle, { scale: 0.85 })
    gsap.to(pullReticle, { scale: 1, opacity: 1, duration: 0.4, ease: 'power2.out' })
    pullTweens.push(gsap.to(pullReticle, { rotation: 360, duration: 9, ease: 'none', repeat: -1 }))

    // core pops in and keeps a gentle pulse
    gsap.set(pullCore, { scale: 0 })
    gsap.to(pullCore, { scale: 1, duration: 0.4, ease: 'back.out(2)' })
    pullTweens.push(gsap.to(pullCore, { scale: 1.28, duration: 0.7, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 0.4 }))

    // rings fall inward on a staggered loop; a perpetual "pulling in" cadence
    pullRings.forEach((ring, i) => {
      pullTweens.push(
        gsap.fromTo(ring,
          { scale: 1, opacity: 0.9 },
          { scale: 0, opacity: 0, duration: PULL_RING_PERIOD, ease: 'power1.in', repeat: -1, delay: i * (PULL_RING_PERIOD / pullRings.length) }
        )
      )
    })
  }

  function hidePullField() {
    if (!pullField) return
    pullTweens.forEach((t) => t.kill())
    pullTweens = []
    gsap.killTweensOf([pullReticle, pullCore, ...pullRings])

    // rings snap the rest of the way in, core collapses, reticle + field fade
    gsap.to(pullRings, { scale: 0, opacity: 0, duration: 0.25, ease: 'power3.in' })
    gsap.to(pullCore, { scale: 0, duration: 0.2, ease: 'power3.in', delay: 0.03 })
    gsap.to(pullReticle, { scale: 1.15, opacity: 0, duration: 0.28, ease: 'power2.in' })
    gsap.to(pullField, { opacity: 0, duration: 0.3, ease: 'power2.in', delay: 0.08 })
  }

  function resetParticles() {
    const cont = gravRef.value
    if (!cont || shapes.length === 0) return
    const r = cont.getBoundingClientRect()
    shapes.forEach((s) => {
      s.x = s.r + Math.random() * (r.width - 2 * s.r)
      s.y = s.r + Math.random() * (r.height - 2 * s.r)
      const a = Math.random() * Math.PI * 2, sp = 0.6 + Math.random() * 1.2
      s.vx = Math.cos(a) * sp
      s.vy = Math.sin(a) * sp
      s.rot = Math.random() * 360
    })
  }

  function burst() {
    const cont = gravRef.value
    if (!cont || shapes.length === 0) return
    const W = cont.getBoundingClientRect().width
    shapes.forEach((s) => {
      const dx = s.x - pointer.x, dy = s.y - pointer.y, d = Math.max(Math.hypot(dx, dy), 1)
      const power = 3 + 9 * (1 - Math.min(d / (W * 0.75), 1))
      s.vx += (dx / d) * power
      s.vy += (dy / d) * power - 1
      s.vr += (Math.random() - 0.5) * 18
    })
  }

  function step() {
    const cont = gravRef.value
    if (!cont) return
    const r = cont.getBoundingClientRect()
    const W = r.width, H = r.height
    const inside = pointer.x >= 0 && pointer.x <= W && pointer.y >= 0 && pointer.y <= H
    const baseK = pointer.down ? 0.27 : 0 // magnet only while clicking

    // keep the pull-field vortex pinned to the cursor while held
    if (pointer.down && pullField) pullField.style.transform = `translate(${pointer.x}px,${pointer.y}px)`

    for (const s of shapes) {
      if (inside) {
        const dx = pointer.x - s.x, dy = pointer.y - s.y, d = Math.max(Math.hypot(dx, dy), 1)
        const f = baseK * (60 / (60 + d))
        s.vx += (dx / d) * f
        s.vy += (dy / d) * f
      }
      s.vx *= DRIFT; s.vy *= DRIFT
      s.x += s.vx; s.y += s.vy; s.rot += s.vr; s.vr *= 0.99
      if (s.x < s.r) { s.x = s.r; s.vx = -s.vx * REST }
      else if (s.x > W - s.r) { s.x = W - s.r; s.vx = -s.vx * REST }
      if (s.y < s.r) { s.y = s.r; s.vy = -s.vy * REST }
      else if (s.y > H - s.r) { s.y = H - s.r; s.vy = -s.vy * REST }
    }

    // shape-to-shape collisions with energy loss
    for (let i = 0; i < shapes.length; i++) {
      for (let j = i + 1; j < shapes.length; j++) {
        const a = shapes[i], b = shapes[j]
        const dx = b.x - a.x, dy = b.y - a.y, dist = Math.hypot(dx, dy), min = a.r + b.r
        if (dist > 0 && dist < min) {
          const nx = dx / dist, ny = dy / dist, overlap = (min - dist) / 2
          a.x -= nx * overlap; a.y -= ny * overlap; b.x += nx * overlap; b.y += ny * overlap
          const rvx = b.vx - a.vx, rvy = b.vy - a.vy, vn = rvx * nx + rvy * ny
          if (vn < 0) {
            const imp = -(1 + REST) * vn / 2
            a.vx -= imp * nx; a.vy -= imp * ny; b.vx += imp * nx; b.vy += imp * ny
            a.vr += vn * 1.2; b.vr -= vn * 1.2
          }
        }
      }
    }

    for (const s of shapes) s.el.style.transform = `translate(${s.x - s.r}px,${s.y - s.r}px) rotate(${s.rot}deg)`
  }

  function loop() {
    const active = currentSection.value === sbIndex
    if (shapes.length && active) step()
    if (glyphsReleased && active) letterStep()
    rafId = requestAnimationFrame(loop)
  }

  // ── kickable title: setup / geometry ──
  function initGlyphs() {
    glyphs = charRefs.value.map((el) => ({
      el, w: el.offsetWidth, h: el.offsetHeight, x: 0, y: 0, vx: 0, vy: 0, rot: 0, vr: 0, hx: 0, hy: 0,
    }))
  }

  function sectionRect() {
    return rootRef.value?.getBoundingClientRect() ?? null
  }

  // Resolve the four Sandbox corner background-slice elements once (they live in
  // the global Section-Cover-Slice layer, not this component's template).
  function resolveCornerSlices() {
    cornerSlices = CORNER_BUMPER_DEFS.flatMap(({ selector, hypo, solid }) => {
      const el = document.querySelector<HTMLElement>(selector)
      return el ? [{ el, hypo, solid }] : []
    })
  }

  // The corner slices act as pinball bumpers: re-measure their diagonal edge in
  // section-space so letterStep can bounce glyphs off it (see
  // resolveGlyphBumper). Called every frame because the slices animate in from
  // off-screen on section enter — a one-time measure would record them hidden.
  function refreshGlyphBounds() {
    const sec = sectionRect()
    if (!sec) { glyphBumpers = []; return }
    const corner = (r: DOMRect, which: Corner) => {
      const x = which === 'tl' || which === 'bl' ? r.left - sec.left : r.right - sec.left
      const y = which === 'tl' || which === 'tr' ? r.top - sec.top : r.bottom - sec.top
      return { x, y }
    }
    glyphBumpers = cornerSlices.map(({ el, hypo, solid }) => {
      const r = el.getBoundingClientRect()
      const p1 = corner(r, hypo[0]), p2 = corner(r, hypo[1]), rightAngle = corner(r, solid)
      const dx = p2.x - p1.x, dy = p2.y - p1.y, len = Math.hypot(dx, dy) || 1
      let nx = -dy / len, ny = dx / len
      if (nx * (rightAngle.x - p1.x) + ny * (rightAngle.y - p1.y) < 0) { nx = -nx; ny = -ny }
      const l = r.left - sec.left, t = r.top - sec.top, right = r.right - sec.left, b = r.bottom - sec.top
      return { p1x: p1.x, p1y: p1.y, p2x: p2.x, p2y: p2.y, nx, ny, l, t, r: right, b, el }
    })
  }

  // Brief bright flash on the bumper that was just hit. Uses filter (not
  // box-shadow) since the slice is clip-path'd to a triangle - a shadow would
  // glow around the invisible clipped bounding box instead of the shape.
  // Throttled so overlap frames don't spam the tween.
  function pulseBumper(el: HTMLElement) {
    const now = performance.now()
    if (now - (bumperPulseAt.get(el) ?? 0) < 180) return
    bumperPulseAt.set(el, now)
    gsap.fromTo(el,
      { filter: 'brightness(1)' },
      { filter: 'brightness(2.2)', duration: 0.08, ease: 'power2.out', yoyo: true, repeat: 1, overwrite: 'auto' }
    )
  }

  // Lay the glyphs out as a centred title row near the top and record those as
  // their "home" slots.
  function computeGlyphHome() {
    const sec = sectionRect()
    if (!sec || glyphs.length === 0) return
    const gap = Math.max(4, sec.width * 0.006)
    glyphs.forEach((g) => { g.w = g.el.offsetWidth; g.h = g.el.offsetHeight })
    const total = glyphs.reduce((sum, g) => sum + g.w, 0) + gap * (glyphs.length - 1)
    let x = (sec.width - total) / 2
    const y = sec.height * 0.075
    glyphs.forEach((g) => { g.hx = x; g.hy = y; x += g.w + gap })
  }

  function drawGlyphs() {
    for (const g of glyphs) g.el.style.transform = `translate(${g.x}px,${g.y}px) rotate(${g.rot}deg)`
  }

  // Bounce a glyph (treated as a circle, see glyphRadius) off a corner slice's
  // diagonal edge like a pinball bumper: reflect the velocity across the edge
  // normal and add energy (unlike a wall/glyph collision, which only
  // conserves it), plus a flash on the slice.
  function resolveGlyphBumper(g: Glyph, bumper: Bumper) {
    const cx = g.x + g.w / 2, cy = g.y + g.h / 2, radius = glyphRadius(g)
    // Line is infinite; clamp to the slice's own rect so its half-plane doesn't
    // reach across the whole viewport past the actual corner shape.
    if (cx < bumper.l - radius || cx > bumper.r + radius || cy < bumper.t - radius || cy > bumper.b + radius) return
    const d = (cx - bumper.p1x) * bumper.nx + (cy - bumper.p1y) * bumper.ny
    if (d <= -radius) return // fully on the open side, no overlap into the solid triangle
    const push = -radius - d
    g.x += bumper.nx * push
    g.y += bumper.ny * push
    const vn = g.vx * bumper.nx + g.vy * bumper.ny
    if (vn > 0) {
      const j = (1 + BUMPER_KICK) * vn
      g.vx -= j * bumper.nx
      g.vy -= j * bumper.ny
      const vt = -g.vx * bumper.ny + g.vy * bumper.nx
      g.vr += vt * 0.15
    }
    pulseBumper(bumper.el)
  }

  function letterStep() {
    const sec = sectionRect()
    if (!sec) return
    const W = sec.width, H = sec.height

    // Re-measure the corner slices each frame: they animate in from off-screen
    // on section enter (and shift on resize), so a one-time measurement would
    // record them at their hidden position and they'd never collide.
    refreshGlyphBounds()

    // cursor velocity this frame (acts as a paddle)
    const cvx = gPtr.x - gPtr.px
    const cvy = gPtr.y - gPtr.py
    gPtr.px = gPtr.x; gPtr.py = gPtr.y
    const cspeed = Math.hypot(cvx, cvy)

    for (const g of glyphs) {
      // ── cursor collision: shove the glyph in the cursor's travel direction
      //    (plus radially away so it never sticks to the pointer) ──
      const closestX = Math.max(g.x, Math.min(gPtr.x, g.x + g.w))
      const closestY = Math.max(g.y, Math.min(gPtr.y, g.y + g.h))
      const ox = gPtr.x - closestX, oy = gPtr.y - closestY
      const od = Math.hypot(ox, oy)
      if (od < G_CURSOR_R) {
        let rx = (g.x + g.w / 2) - gPtr.x
        let ry = (g.y + g.h / 2) - gPtr.y
        const rd = Math.hypot(rx, ry) || 1
        rx /= rd; ry /= rd
        const mx = cspeed > 0.6 ? cvx / cspeed : rx
        const my = cspeed > 0.6 ? cvy / cspeed : ry
        const power = (Math.min(cspeed, 60) * 0.9 + 5) * 0.175
        g.vx += mx * power * 0.7 + rx * power * 0.5
        g.vy += my * power * 0.7 + ry * power * 0.5
        // off-centre hits spin the glyph: tangential component of the push
        g.vr += (mx * ry - my * rx) * power * 0.24
        // nudge out of the cursor so repeated frames don't trap it
        if (od > 0.001) { const push = G_CURSOR_R - od; g.x -= (ox / od) * push; g.y -= (oy / od) * push }
      }

      // ── module 03 black hole: while held, the well (at the cursor) draws the
      //    letters in, with the same distance falloff as the particles but half
      //    the strength ──
      if (pointer.down) {
        const dx = gPtr.x - (g.x + g.w / 2), dy = gPtr.y - (g.y + g.h / 2)
        const d = Math.hypot(dx, dy) || 1
        const f = G_PULL * (60 / (60 + d))
        g.vx += (dx / d) * f
        g.vy += (dy / d) * f
      }

      // integrate (no gravity)
      g.vx *= G_DRIFT; g.vy *= G_DRIFT
      g.vx = Math.max(-G_MAXV, Math.min(G_MAXV, g.vx))
      g.vy = Math.max(-G_MAXV, Math.min(G_MAXV, g.vy))
      g.x += g.vx; g.y += g.vy
      g.rot += g.vr; g.vr *= G_SPIN_FRICTION
      g.vr = Math.max(-G_MAXVR, Math.min(G_MAXVR, g.vr))

      // viewport walls; a wall bounce also kicks the glyph into a roll
      if (g.x < 0) { g.x = 0; g.vx = -g.vx * G_REST; g.vr -= g.vy * 0.1 }
      else if (g.x + g.w > W) { g.x = W - g.w; g.vx = -g.vx * G_REST; g.vr += g.vy * 0.1 }
      if (g.y < 0) { g.y = 0; g.vy = -g.vy * G_REST; g.vr += g.vx * 0.1 }
      else if (g.y + g.h > H) { g.y = H - g.h; g.vy = -g.vy * G_REST; g.vr -= g.vx * 0.1 }

      // corner background-slice bumpers
      for (const bumper of glyphBumpers) resolveGlyphBumper(g, bumper)
    }

    // glyph-vs-glyph: circular elastic collisions with spin transfer
    for (let i = 0; i < glyphs.length; i++) {
      for (let j = i + 1; j < glyphs.length; j++) {
        const a = glyphs[i], c = glyphs[j]
        const ax = a.x + a.w / 2, ay = a.y + a.h / 2, ar = glyphRadius(a)
        const cx = c.x + c.w / 2, cy = c.y + c.h / 2, cr = glyphRadius(c)
        const dx = cx - ax, dy = cy - ay, dist = Math.hypot(dx, dy), min = ar + cr
        if (dist > 0 && dist < min) {
          const nx = dx / dist, ny = dy / dist, overlap = (min - dist) / 2
          a.x -= nx * overlap; a.y -= ny * overlap; c.x += nx * overlap; c.y += ny * overlap
          const rvx = c.vx - a.vx, rvy = c.vy - a.vy, vn = rvx * nx + rvy * ny
          if (vn < 0) {
            const imp = -(1 + G_REST) * vn / 2
            a.vx -= imp * nx; a.vy -= imp * ny; c.vx += imp * nx; c.vy += imp * ny
            // tangential rub spins them in opposite directions
            const vt = -rvx * ny + rvy * nx
            a.vr -= vt * 0.12; c.vr += vt * 0.12
          }
        }
      }
    }

    // ── glyph-vs-shape: letters knock the module-03 particles around ──
    // Shapes live in gravRef-space; convert to section-space with this offset.
    const gravR = gravRef.value?.getBoundingClientRect()
    if (gravR && shapes.length) {
      const offX = gravR.left - sec.left, offY = gravR.top - sec.top
      for (const g of glyphs) {
        const gx = g.x + g.w / 2, gy = g.y + g.h / 2, grad = glyphRadius(g)
        for (const s of shapes) {
          const sx = s.x + offX, sy = s.y + offY
          const dx = sx - gx, dy = sy - gy
          const dist = Math.hypot(dx, dy), min = grad + s.r
          if (dist > 0 && dist < min) {
            const nx = dx / dist, ny = dy / dist
            // push the (light) shape clear of the glyph
            s.x = gx + nx * min - offX
            s.y = gy + ny * min - offY
            const rvx = s.vx - g.vx, rvy = s.vy - g.vy
            const vn = rvx * nx + rvy * ny
            if (vn < 0) {
              const imp = -(1 + REST) * vn
              s.vx += imp * nx; s.vy += imp * ny
              s.vr += vn * 2
              // tiny reaction back on the heavy glyph
              g.vx -= nx * imp * 0.04
              g.vy -= ny * imp * 0.04
            }
          }
        }
      }
    }

    drawGlyphs()
  }

  // ── leave animation ──
  function playLeave() {
    // Hand the title back to GSAP: stop physics, then fling the glyphs upward
    // from wherever they currently sit.
    glyphsReleased = false
    const eyebrow = eyebrowRef.value
    const wins = rootRef.value ? Array.from(rootRef.value.querySelectorAll<HTMLElement>('.module-display')) : []
    gsap.killTweensOf([eyebrow, ...wins, ...glyphs.map((g) => g.el)])
    glyphs.forEach((g, i) => {
      gsap.set(g.el, { x: g.x, y: g.y, rotation: g.rot })   // seed GSAP with the live physics position + spin
      gsap.to(g.el, { y: g.y - sectionRect()!.height * 0.7, opacity: 0, duration: 0.3, ease: 'power3.in', delay: i * 0.02, overwrite: 'auto' })
    })
    // eyebrow note lifts away with the title
    gsap.to(eyebrow, { y: -20, opacity: 0, duration: 0.22, ease: 'power3.in', overwrite: 'auto' })
    // windows slide down off screen
    gsap.to(wins, { y: '60vh', opacity: 0, duration: 0.22, stagger: 0.035, ease: 'power3.in', overwrite: 'auto' })
  }

  // ── enter reveal (adapted from the design's playMicro) ──
  function playReveal() {
    const eyebrow = eyebrowRef.value
    const wins = rootRef.value ? Array.from(rootRef.value.querySelectorAll<HTMLElement>('.module-display')) : []
    const items = listItemRefs.value
    const btn = magBtnCompRef.value?.el ?? null
    const chars = glyphs.map((g) => g.el)

    // Freeze the title physics and recompute its home row + the box geometry it
    // will later collide with (handles viewport resizes between visits).
    glyphsReleased = false
    refreshGlyphBounds()
    computeGlyphHome()
    glyphs.forEach((g) => { g.x = g.hx; g.y = g.hy; g.vx = 0; g.vy = 0; g.rot = 0; g.vr = 0 })

    gsap.killTweensOf([eyebrow, ...wins, ...items, btn, ...chars])
    gsap.set(eyebrow, { y: -20, opacity: 0 })
    gsap.set(wins, { opacity: 0, y: 36, scale: 0.96 })
    gsap.set(items, { opacity: 0, x: -40 })
    gsap.set(btn, { scale: 0, opacity: 0 })
    glyphs.forEach((g) => gsap.set(g.el, { x: g.hx, y: g.hy - 70, opacity: 0, scale: 0.5, rotation: () => Math.random() * 40 - 20 }))

    // Wait for the section-cut curtain to fully close before revealing content,
    // so the reveal happens behind the curtain rather than alongside it.
    const tl = gsap.timeline({ delay: SECTION_ENTER_DELAY })
    tl.to(eyebrow, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.1)
    tl.to(wins, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08, ease: 'back.out(1.6)' }, 0.15)
    // glyphs drop into their title slots, then physics takes over
    glyphs.forEach((g, i) => {
      tl.to(g.el, { x: g.hx, y: g.hy, opacity: 1, scale: 1, rotation: 0, duration: 0.7, ease: 'back.out(1.8)' }, 0.2 + i * 0.05)
    })
    tl.to(btn, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2.5)' }, 0.45)
    tl.to(items, { opacity: 1, x: 0, duration: 0.5, stagger: 0.07, ease: 'power3.out' }, 0.5)
    tl.add(() => {
      glyphs.forEach((g) => { g.x = g.hx; g.y = g.hy; g.vx = 0; g.vy = 0; g.rot = 0; g.vr = 0; g.el.style.opacity = '1' })
      drawGlyphs()
      gPtr.px = gPtr.x; gPtr.py = gPtr.y   // avoid a phantom kick on the first physics frame
      glyphsReleased = true
    }, 0.2 + glyphs.length * 0.05 + 0.7)

    resetParticles()
  }

  onMounted(() => {
    initList()
    initTilt()
    initParticles()
    initGlyphs()
    resolveCornerSlices()
    refreshGlyphBounds()
    computeGlyphHome()
    // place the title at home immediately so it's not stacked at 0,0 before reveal
    glyphs.forEach((g) => { g.x = g.hx; g.y = g.hy })
    drawGlyphs()

    // Track the cursor in section-space to drive the title kicking.
    on(window, 'mousemove', (e) => {
      const ev = e as MouseEvent
      const sec = sectionRect()
      if (!sec) return
      gPtr.x = ev.clientX - sec.left
      gPtr.y = ev.clientY - sec.top
    })
    // Recompute box geometry + home row on resize; reflow the title if it hasn't
    // been kicked loose yet, otherwise just keep the glyphs inside the viewport.
    on(window, 'resize', () => {
      refreshGlyphBounds()
      computeGlyphHome()
      const sec = sectionRect()
      if (!glyphsReleased) {
        glyphs.forEach((g) => { g.x = g.hx; g.y = g.hy })
        drawGlyphs()
      } else if (sec) {
        glyphs.forEach((g) => {
          g.x = Math.max(0, Math.min(g.x, sec.width - g.w))
          g.y = Math.max(0, Math.min(g.y, sec.height - g.h))
        })
      }
    })

    // Fonts can land after mount and change glyph metrics; re-measure once ready.
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (glyphsReleased) return
        computeGlyphHome()
        glyphs.forEach((g) => { g.x = g.hx; g.y = g.hy })
        drawGlyphs()
      })
    }

    rafId = requestAnimationFrame(loop)

    stopSectionWatch = onSectionStatesChange((meta) => {
      if (meta.isLeavingSection(sbIndex)) playLeave()
      else if (meta.isEnteringSection(sbIndex)) playReveal()
    })

    if (currentSection.value === sbIndex) playReveal()
  })

  onBeforeUnmount(() => {
    if (rafId) cancelAnimationFrame(rafId)
    rafId = 0
    clearTimeout(magResetTimer)
    stopSectionWatch?.()
    stopSectionWatch = null
    pullTweens.forEach((t) => t.kill())
    pullTweens = []
    gsap.killTweensOf([pullField, pullReticle, pullCore, ...pullRings])
    pullField = pullReticle = pullCore = null
    pullRings = []
    listeners.forEach((off) => off())
    listeners.length = 0
    shapes = []
  })
</script>

<style scoped lang="scss">
  @use "@styleVariables" as *;

  .sandbox-section {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    // Section wrappers collapse to 0 height and stack below the full-height Perks
    // wrapper, landing one viewport down; pull back up to fill the viewport.
    transform: translateY(-100vh);
    // Transparent so the section background (once built; see CLAUDE.md Current
    // Task 7) remains visible behind the content, matching every other section.
    background: transparent;
    overflow: hidden;
  }

  .sb-header {
    position: absolute;
    top: 4%;
    left: 0;
    right: 0;
    text-align: center;
    z-index: 3;
  }

  .sb-eyebrow {
    font-family: 'Audiowide';
    font-size: 11px;
    letter-spacing: 5px;
    color: #5bfd5b;
    will-change: transform, opacity;
  }

  // ── kickable title ──
  // Full-section layer the glyphs roam across. pointer-events:none so the cursor
  // still reaches the module windows beneath; kicking is driven by tracked
  // cursor position, not real hit-testing.
  .sb-letters {
    position: absolute;
    inset: 0;
    z-index: 6;
    pointer-events: none;
    overflow: hidden;
  }

  .sb-char {
    position: absolute;
    left: 0;
    top: 0;
    font-family: 'Wosker';
    font-size: clamp(38px, 5vw, 60px);
    line-height: 1;
    color: #fff;
    will-change: transform, opacity;
    user-select: none;
  }

  .sb-grid {
    position: absolute;
    left: 0;
    right: 0;
    top: 18%;
    bottom: 4%;
    padding: 0 5%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 18px;
  }

  .sb-win-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .sb-list-body {
    gap: 2px;
  }

  .mi-mag-count {
    font-family: 'Audiowide';
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 2px;
    color: #fff;
    margin-bottom: 6px;
    will-change: transform, color;
  }

  .mi-mag-btn-wrap {
    :deep(.mag-btn) {
      padding: 18px 40px;
      background: #5bfd5b;
      color: #0e0e0e;
      font-family: 'Audiowide';
      font-size: 16px;
      letter-spacing: 2px;
      border-radius: 6px;
    }
  }

  .mi-item {
    position: relative;
    font-family: 'Wosker';
    font-size: 26px;
    color: #777;
    cursor: pointer;
    padding: 4px 4px;
  }

  .mi-ul {
    position: absolute;
    left: 0;
    bottom: 2px;
    height: 3px;
    width: 100%;
    background: #5bfd5b;
    transform: scaleX(0);
    transform-origin: left center;
  }

  .sb-grav {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  .sb-grav-controls {
    position: absolute;
    top: 50%;
    right: 14px;
    transform: translateY(-50%);
    z-index: 4;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .sb-grav-btn-wrap {
    :deep(.mag-btn) {
      width: 2.5rem;
      height: 2.5rem;
      font-family: 'Mono';
      font-size: 1.5rem;
      line-height: 1;
      color: #9a9a9a;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid #2c2c2c;
      border-radius: 5px;
      transition: color 0.2s ease, border-color 0.2s ease;

      &:hover {
        color: #6fae7c;
        border-color: #6fae7c;
      }
    }
  }

  .sb-tilt-wrap {
    flex: 1;
    min-height: 0;
    display: grid;
    place-items: center;
    perspective: 900px;
    // Establish a size container so the card can derive BOTH dimensions from
    // the window's height (cqh); guaranteeing the portrait aspect ratio
    // regardless of grid/flex auto-sizing quirks.
    container-type: size;
  }

  .sb-tilt {
    position: relative;
    // Size the card off the container height to preserve the 1/1 square aspect.
    height: 78cqh;
    width: 78cqh;
    border-radius: 16px;
    background: linear-gradient(150deg, #1d1d1d, #0f0f0f);
    border: 1px solid #2c2c2c;
    transform-style: preserve-3d;
    will-change: transform;
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.55);
    cursor: pointer;
  }

  .sb-tilt-frame {
    position: absolute;
    inset: 14px;
    border: 1px solid #2a2a2a;
    border-radius: 10px;
    transform: translateZ(20px);
  }

  // QR code parallax layer; sits highest on the Z axis so it floats most
  // prominently above the card face as it tilts. Rendered as-is from the PNG.
  .sb-tilt-qr {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 56%;
    height: 56%;
    image-rendering: pixelated;
    transform: translate(-50%, -50%) translateZ(70px);
    pointer-events: none;
    user-select: none;
  }

  // Replaces the QR image once the section is unlocked; same slot/depth so the
  // tilt parallax and layout stay identical, just a payoff instead of a code.
  .sb-tilt-wow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) translateZ(70px);
    font-family: 'Wosker';
    font-size: 42px;
    color: #5bfd5b;
    text-shadow: 0 0 24px rgba(91, 253, 91, 0.6);
    pointer-events: none;
    user-select: none;
  }

  .sb-tilt-chip {
    position: absolute;
    top: 18px;
    left: 18px;
    font-family: 'Audiowide';
    font-size: 9px;
    letter-spacing: 3px;
    color: #5bfd5b;
    transform: translateZ(60px);
  }

  .sb-tilt-name {
    position: absolute;
    bottom: 20px;
    left: 18px;
    right: 18px;
    font-family: 'Wosker';
    font-size: 26px;
    line-height: 0.95;
    color: #fff;
    transform: translateZ(45px);
  }
</style>
