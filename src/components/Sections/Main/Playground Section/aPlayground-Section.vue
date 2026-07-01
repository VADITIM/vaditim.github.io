<template>
  <div ref="rootRef" class="playground-section">

    <div class="pg-header">
      <div ref="eyebrowRef" class="pg-eyebrow">INTERACTION&nbsp;·&nbsp;PLAYGROUND</div>
    </div>

    <!-- Kickable physics title — each glyph is its own no-gravity body that
         bounces off the viewport edges and the module windows, and gets shoved
         by the cursor on contact. -->
    <div ref="lettersRef" class="pg-letters">
      <span
        v-for="(ch, i) in TITLE_LETTERS"
        :key="i"
        ref="charRefs"
        class="pg-char"
      >{{ ch }}</span>
    </div>

    <div class="pg-grid">

      <!-- WINDOW 1 · magnetic button -->
      <div class="pg-win">
        <div class="pg-win-hue"></div>
        <div class="pg-win-label">01 · MAGNETIC&nbsp;+&nbsp;IMPACT</div>
        <div class="pg-win-body">
          <div ref="magCountRef" class="mi-mag-count">{{ magClicks }}</div>
          <div ref="magWrapRef" class="mi-mag-wrap">
            <div ref="magBtnRef" class="mi-mag-btn">HIT&nbsp;ME</div>
          </div>
          <div class="pg-caption">move toward it ◂▸ then click · how big can you get it?</div>
        </div>
      </div>

      <!-- WINDOW 2 · hover-focus list -->
      <div class="pg-win">
        <div class="pg-win-hue"></div>
        <div class="pg-win-label">02 · HOVER&nbsp;FOCUS&nbsp;·&nbsp;LIST</div>
        <div class="pg-win-body pg-list-body">
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
      </div>

      <!-- WINDOW 3 · zero-g space -->
      <div class="pg-win">
        <div class="pg-win-hue"></div>
        <div class="pg-win-label pg-win-label--over">03 · ZERO-G&nbsp;SPACE</div>
        <div ref="gravRef" class="pg-grav"></div>
        <div class="pg-grav-controls">
          <button type="button" class="pg-grav-btn" @click="addParticle">+</button>
          <button type="button" class="pg-grav-btn" @click="removeParticle">−</button>
        </div>
        <div class="pg-caption pg-caption--over">drift in zero-g · hold to pull · release to burst</div>
      </div>

      <!-- WINDOW 4 · tilt parallax -->
      <div class="pg-win">
        <div class="pg-win-hue"></div>
        <div class="pg-win-label pg-win-label--over">04 · TILT&nbsp;PARALLAX</div>
        <div ref="tiltWrapRef" class="pg-tilt-wrap">
          <div ref="tiltRef" class="pg-tilt">
            <div class="pg-tilt-frame"></div>
            <img :src="qrSrc" class="pg-tilt-qr" alt="Scan me" draggable="false" />
            <div class="pg-tilt-chip">2026</div>
            <div class="pg-tilt-name">SCAN&nbsp;ME</div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref } from 'vue'
  import { gsap } from 'gsap'
  import { currentSection } from '@modules/Sections/sections'
  import { getSectionIndexById } from '@modules/Sections/section-registry'
  import { onSectionStatesChange } from '@modules/Sections/section-state-machine'
  import { SECTION_ENTER_DELAY } from '@modules/Sections/section-transition'
  import qrSrc from '../../../../assets/images/rickroll-qr.png'

  const LIST_ITEMS = ['NEBULA UI', 'HELIX', 'PULSE', 'ARCADE']
  const TITLE_LETTERS = 'SANDBOX'.split('')

  const rootRef = ref<HTMLElement | null>(null)
  const lettersRef = ref<HTMLElement | null>(null)
  const charRefs = ref<HTMLElement[]>([])
  const eyebrowRef = ref<HTMLElement | null>(null)
  const listItemRefs = ref<HTMLElement[]>([])
  const magWrapRef = ref<HTMLElement | null>(null)
  const magBtnRef = ref<HTMLElement | null>(null)
  const magCountRef = ref<HTMLElement | null>(null)
  const magClicks = ref(0)
  const tiltWrapRef = ref<HTMLElement | null>(null)
  const tiltRef = ref<HTMLElement | null>(null)
  const gravRef = ref<HTMLElement | null>(null)

  const pgIndex = getSectionIndexById('playground')
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

  // ── pull-field visuals (black-hole effect while holding click in zero-g space) ──
  let pullField: HTMLElement | null = null   // wrapper anchored at cursor
  let pullVoid: HTMLElement | null = null    // the dark singularity
  let pullDisk: HTMLElement | null = null    // hot accretion disk (conic gradient)
  let pullIdleTween: gsap.core.Timeline | null = null

  // ── kickable title physics (no gravity) ──
  // Each glyph stores its top-left position (x,y) in section-space, velocity,
  // measured size (w,h) and "home" slot (hx,hy) it animates into on enter.
  type Glyph = { el: HTMLElement; w: number; h: number; x: number; y: number; vx: number; vy: number; rot: number; vr: number; hx: number; hy: number }
  type Box = { l: number; t: number; r: number; b: number }
  let glyphs: Glyph[] = []
  let glyphBoxes: Box[] = []
  let glyphsReleased = false          // physics only runs once the title has landed
  const gPtr = { x: -9999, y: -9999, px: -9999, py: -9999 }
  const G_DRIFT = 0.94                // near-frictionless space, no gravity — drifts to rest
  const G_REST = 0.72                 // energy kept after a bounce
  const G_MAXV = 46                   // velocity clamp so a fast flick can't fling letters off-screen
  const G_MAXVR = 40                  // angular velocity clamp (deg/frame)
  const G_SPIN_FRICTION = 0.985       // spin slowly bleeds off
  const G_CURSOR_R = 28               // cursor "paddle" radius
  const G_PULL = 0.135                // module-03 black-hole pull on letters — 50% of the particle magnet (0.27)

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

  // ── magnetic button ──
  function initMagnetic() {
    const wrap = magWrapRef.value, btn = magBtnRef.value
    if (!wrap || !btn) return
    on(wrap, 'mousemove', (e) => {
      const ev = e as MouseEvent
      const r = wrap.getBoundingClientRect()
      const dx = ev.clientX - (r.left + r.width / 2)
      const dy = ev.clientY - (r.top + r.height / 2)
      gsap.to(btn, { x: dx * 0.4, y: dy * 0.4, duration: 0.4, ease: 'power3.out' })
    })
    on(wrap, 'mouseleave', () => gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.3)' }))
    on(btn, 'click', () => {
      clearTimeout(magResetTimer)
      magCombo++
      magClicks.value = magCombo
      gsap.fromTo(magCountRef.value, { scale: 1.3, color: '#5bfd5b' }, { scale: 1, color: '#fff', duration: 0.35, ease: 'power3.out', overwrite: 'auto' })

      // each successive hit closes a fraction of the remaining gap to max — gets
      // harder to reach max (asymptotic) but, unlike a fixed-size diminishing
      // increment, it can actually still reach MAG_MAX_SCALE regardless of its value
      const remaining = MAG_MAX_SCALE - magGrowth
      magGrowth += remaining * 0.22
      if (MAG_MAX_SCALE - magGrowth < 0.05) magGrowth = MAG_MAX_SCALE

      gsap.killTweensOf(btn, 'scale')
      gsap.to(btn, { scale: magGrowth, duration: 0.12, ease: 'back.out(2)', overwrite: 'auto' })
      gsap.to(btn, { scale: Math.max(1, magGrowth - 0.12), duration: 0.35, ease: 'power2.in', delay: 0.16, overwrite: 'auto' })

      // punch impact — quick multi-axis vibration (rotation + skew, distinct from the
      // magnetic x/y offset). Unlike a decaying shake, the offset is HELD at the end
      // of each hit (not reset to 0) so hits visibly accumulate/alternate until the
      // combo resets or the next punch lands — reads as sustained impact, not a blip.
      const kick = 3 + Math.min(magCombo, 5)
      const dir = magCombo % 2 === 0 ? 1 : -1
      gsap.killTweensOf(btn, 'rotation,skewX,skewY')
      gsap.timeline({ overwrite: 'auto' })
        .to(btn, { rotation: -dir * kick, skewX: -dir * kick * 0.6, skewY: dir * kick * 0.3, duration: 0.04, ease: 'power1.out' })
        .to(btn, { rotation: dir * kick * 0.8, skewX: dir * kick * 0.5, skewY: -dir * kick * 0.25, duration: 0.05, ease: 'power1.inOut' })
        .to(btn, { rotation: dir * kick * 0.5, skewX: dir * kick * 0.3, skewY: -dir * kick * 0.15, duration: 0.08, ease: 'power2.out' })

      if (magGrowth >= MAG_MAX_SCALE) {
        gsap.timeline({ overwrite: 'auto' })
          .set(btn, { backgroundColor: '#ff2b2b', boxShadow: '0 0 24px 6px rgba(255,43,43,0.85)' })
          .to(btn, { backgroundColor: '#ff2b2b', boxShadow: '0 0 32px 10px rgba(255,43,43,0.95)', duration: 0.12, ease: 'power2.out', repeat: 1, yoyo: true })
          .to(btn, { backgroundColor: '#5bfd5b', boxShadow: '0 0 0 0 rgba(255,43,43,0)', duration: 0.4, ease: 'power2.out' })
      }

      magResetTimer = window.setTimeout(() => {
        magCombo = 0
        magGrowth = 1
        magClicks.value = 0
        gsap.to(btn, { scale: 1, duration: 0.4, ease: 'power2.out', overwrite: 'auto' })
        gsap.to(btn, { rotation: 0, skewX: 0, skewY: 0, duration: 0.4, ease: 'power2.out', overwrite: 'auto' })
        gsap.to(magCountRef.value, { opacity: 0.4, duration: 0.3, overwrite: 'auto', onComplete: () => gsap.to(magCountRef.value, { opacity: 1, duration: 0.3 }) })
      }, MAG_RESET_MS)
    })
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

  // ── tilt parallax card ──
  function initTilt() {
    const wrap = tiltWrapRef.value, card = tiltRef.value
    if (!wrap || !card) return
    on(wrap, 'mousemove', (e) => {
      const ev = e as MouseEvent
      const r = wrap.getBoundingClientRect()
      const px = (ev.clientX - (r.left + r.width / 2)) / (r.width / 2)
      const py = (ev.clientY - (r.top + r.height / 2)) / (r.height / 2)
      gsap.to(card, { rotationY: px * 16, rotationX: -py * 16, duration: 0.4, ease: 'power3.out', transformPerspective: 900 })
    })
    on(wrap, 'mouseleave', () => gsap.to(card, { rotationY: 0, rotationX: 0, duration: 0.8, ease: 'elastic.out(1,0.4)' }))
  }

  // ── cursor-following border hue (green glow tracing the edge of each window) ──
  // Each window owns a masked `.pg-win-hue` ring; we feed the pointer position
  // (relative to that window) into its CSS vars and reveal it only while hovered.
  function initHue() {
    const wins = rootRef.value ? Array.from(rootRef.value.querySelectorAll<HTMLElement>('.pg-win')) : []
    wins.forEach((win) => {
      const hue = win.querySelector<HTMLElement>('.pg-win-hue')
      if (!hue) return
      on(win, 'mousemove', (e) => {
        const ev = e as MouseEvent
        const r = win.getBoundingClientRect()
        hue.style.setProperty('--mx', `${ev.clientX - r.left}px`)
        hue.style.setProperty('--my', `${ev.clientY - r.top}px`)
        hue.style.opacity = '1'
      })
      on(win, 'mouseleave', () => { hue.style.opacity = '0' })
    })
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

  // ── pull-field: simple black hole under the cursor while holding ──
  function buildPullField(cont: HTMLElement) {
    const field = document.createElement('div')
    field.style.cssText =
      'position:absolute;left:0;top:0;width:0;height:0;pointer-events:none;z-index:2;' +
      'opacity:0;will-change:transform,opacity;'

    // accretion disk — flat ellipse spinning around the void
    const disk = document.createElement('div')
    disk.style.cssText =
      'position:absolute;left:-52px;top:-14px;width:104px;height:28px;border-radius:50%;' +
      'background:conic-gradient(from 0deg,' +
      'rgba(255,180,40,0) 0deg,rgba(255,160,30,0.9) 60deg,rgba(255,80,10,0.7) 120deg,' +
      'rgba(255,180,40,0) 180deg,rgba(255,180,40,0) 190deg,rgba(255,160,30,0.6) 270deg,' +
      'rgba(255,180,40,0) 360deg);' +
      'filter:blur(1.5px);will-change:transform;'

    // void — pitch-black event horizon with a thin orange photon ring
    const void_ = document.createElement('div')
    void_.style.cssText =
      'position:absolute;left:-18px;top:-18px;width:36px;height:36px;border-radius:50%;' +
      'background:#000;' +
      'box-shadow:0 0 0 2px rgba(255,150,30,0.8),0 0 16px 4px rgba(255,100,10,0.45);' +
      'will-change:transform;'

    field.appendChild(disk)
    field.appendChild(void_)
    cont.appendChild(field)

    pullField = field
    pullVoid  = void_
    pullDisk  = disk
  }

  function showPullField() {
    if (!pullField) return
    pullField.style.transform = `translate(${pointer.x}px,${pointer.y}px)`
    gsap.killTweensOf([pullField, pullVoid, pullDisk])
    pullIdleTween?.kill()

    gsap.set([pullVoid, pullDisk], { scale: 0, opacity: 0 })
    gsap.fromTo(pullField, { opacity: 0 }, { opacity: 1, duration: 0.15, ease: 'none' })
    gsap.to(pullVoid, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.8)' })
    gsap.to(pullDisk, { scale: 1, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.05 })

    gsap.to(pullDisk, { rotation: 360, duration: 2.8, ease: 'none', repeat: -1 })
  }

  function hidePullField() {
    if (!pullField) return
    pullIdleTween?.kill()
    pullIdleTween = null
    gsap.killTweensOf([pullVoid, pullDisk])

    gsap.to(pullDisk, { scale: 2, opacity: 0, duration: 0.3, ease: 'power3.out' })
    gsap.to(pullVoid, { scale: 0, duration: 0.2, ease: 'power3.in', delay: 0.05 })
    gsap.to(pullField, { opacity: 0, duration: 0.3, ease: 'power2.in', delay: 0.1 })
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
    const active = currentSection.value === pgIndex
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

  // Cache the module-window rectangles in section-space; letters bounce off these.
  function refreshGlyphBounds() {
    const sec = sectionRect()
    if (!sec || !rootRef.value) return
    // The zero-g window (module 03) is intentionally NOT a wall — letters can fly
    // into it, get tugged by its black hole, and bump the floating shapes.
    const gravWin = gravRef.value?.closest('.pg-win') ?? null
    glyphBoxes = Array.from(rootRef.value.querySelectorAll<HTMLElement>('.pg-win'))
      .filter((w) => w !== gravWin)
      .map((w) => {
        const r = w.getBoundingClientRect()
        return { l: r.left - sec.left, t: r.top - sec.top, r: r.right - sec.left, b: r.bottom - sec.top }
      })
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

  // Push a glyph back out of a module box along the shallowest axis and reflect.
  function resolveGlyphBox(g: Glyph, b: Box) {
    if (g.x + g.w <= b.l || g.x >= b.r || g.y + g.h <= b.t || g.y >= b.b) return
    const penL = g.x + g.w - b.l
    const penR = b.r - g.x
    const penT = g.y + g.h - b.t
    const penB = b.b - g.y
    const min = Math.min(penL, penR, penT, penB)
    if (min === penL) { g.x -= penL; g.vx = -Math.abs(g.vx) * G_REST; g.vr += g.vy * 0.1 }
    else if (min === penR) { g.x += penR; g.vx = Math.abs(g.vx) * G_REST; g.vr -= g.vy * 0.1 }
    else if (min === penT) { g.y -= penT; g.vy = -Math.abs(g.vy) * G_REST; g.vr -= g.vx * 0.1 }
    else { g.y += penB; g.vy = Math.abs(g.vy) * G_REST; g.vr += g.vx * 0.1 }
  }

  function letterStep() {
    const sec = sectionRect()
    if (!sec) return
    const W = sec.width, H = sec.height

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

      // viewport walls — a wall bounce also kicks the glyph into a roll
      if (g.x < 0) { g.x = 0; g.vx = -g.vx * G_REST; g.vr -= g.vy * 0.1 }
      else if (g.x + g.w > W) { g.x = W - g.w; g.vx = -g.vx * G_REST; g.vr += g.vy * 0.1 }
      if (g.y < 0) { g.y = 0; g.vy = -g.vy * G_REST; g.vr += g.vx * 0.1 }
      else if (g.y + g.h > H) { g.y = H - g.h; g.vy = -g.vy * G_REST; g.vr -= g.vx * 0.1 }

      // module boxes
      for (const b of glyphBoxes) resolveGlyphBox(g, b)
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
    const wins = rootRef.value ? Array.from(rootRef.value.querySelectorAll<HTMLElement>('.pg-win')) : []
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
    const wins = rootRef.value ? Array.from(rootRef.value.querySelectorAll<HTMLElement>('.pg-win')) : []
    const items = listItemRefs.value
    const btn = magBtnRef.value
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
    initMagnetic()
    initList()
    initTilt()
    initHue()
    initParticles()
    initGlyphs()
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

    // Fonts can land after mount and change glyph metrics — re-measure once ready.
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
      if (meta.isLeavingSection(pgIndex)) playLeave()
      else if (meta.isEnteringSection(pgIndex)) playReveal()
    })

    if (currentSection.value === pgIndex) playReveal()
  })

  onBeforeUnmount(() => {
    if (rafId) cancelAnimationFrame(rafId)
    rafId = 0
    clearTimeout(magResetTimer)
    stopSectionWatch?.()
    stopSectionWatch = null
    pullIdleTween?.kill()
    pullIdleTween = null
    gsap.killTweensOf([pullField, pullVoid, pullDisk])
    pullField = pullVoid = pullDisk = null
    listeners.forEach((off) => off())
    listeners.length = 0
    shapes = []
  })
</script>

<style scoped lang="scss">
  @use "@styleVariables" as *;

  .playground-section {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    // Section wrappers collapse to 0 height and stack below the full-height Perks
    // wrapper, landing one viewport down — pull back up to fill the viewport.
    transform: translateY(-100vh);
    background: #161616;
    overflow: hidden;
  }

  .pg-header {
    position: absolute;
    top: 4%;
    left: 0;
    right: 0;
    text-align: center;
    z-index: 3;
  }

  .pg-eyebrow {
    font-family: 'Audiowide';
    font-size: 11px;
    letter-spacing: 5px;
    color: #5bfd5b;
    will-change: transform, opacity;
  }

  // ── kickable title ──
  // Full-section layer the glyphs roam across. pointer-events:none so the cursor
  // still reaches the module windows beneath — kicking is driven by tracked
  // cursor position, not real hit-testing.
  .pg-letters {
    position: absolute;
    inset: 0;
    z-index: 6;
    pointer-events: none;
    overflow: hidden;
  }

  .pg-char {
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

  .pg-grid {
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

  .pg-win {
    position: relative;
    border: 1px solid #262626;
    border-radius: 12px;
    background: #121212;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    opacity: 0;
    will-change: transform, opacity;
  }

  // Cursor-following green glow, masked to only show on the window's border ring.
  // `--mx` / `--my` are updated per-window from the pointer in initHue.
  .pg-win-hue {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1.5px;
    pointer-events: none;
    z-index: 4;
    background: radial-gradient(
      150px circle at var(--mx, 50%) var(--my, 50%),
      rgba(91, 253, 91, 0.65),
      rgba(91, 253, 91, 0) 70%
    );
    -webkit-mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
            mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.25s ease;
    will-change: opacity;
  }

  .pg-win-label {
    font-family: 'Mono';
    font-size: 10px;
    letter-spacing: 3px;
    color: #5f5f5f;
    padding: 13px 16px;

    &--over {
      position: relative;
      z-index: 4;
      pointer-events: none;
    }
  }

  .pg-win-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .pg-list-body {
    gap: 2px;
  }

  .pg-caption {
    font-family: 'Mono';
    font-size: 10px;
    color: #4a4a4a;

    &--over {
      position: absolute;
      bottom: 12px;
      left: 0;
      right: 0;
      text-align: center;
      pointer-events: none;
      z-index: 4;
    }
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

  .mi-mag-wrap {
    position: relative;
    width: 260px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mi-mag-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 18px 40px;
    background: #5bfd5b;
    color: #0e0e0e;
    font-family: 'Audiowide';
    font-size: 16px;
    letter-spacing: 2px;
    border-radius: 6px;
    cursor: pointer;
    will-change: transform;
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

  .pg-grav {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  .pg-grav-controls {
    position: absolute;
    top: 50%;
    right: 14px;
    transform: translateY(-50%);
    z-index: 4;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .pg-grav-btn {
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Mono';
    font-size: 1.5rem;
    line-height: 1;
    color: #9a9a9a;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid #2c2c2c;
    border-radius: 5px;
    cursor: pointer;
    transition: color 0.2s ease, border-color 0.2s ease;

    &:hover {
      color: #6fae7c;
      border-color: #6fae7c;
    }
  }

  .pg-tilt-wrap {
    flex: 1;
    min-height: 0;
    display: grid;
    place-items: center;
    perspective: 900px;
    // Establish a size container so the card can derive BOTH dimensions from
    // the window's height (cqh) — guaranteeing the portrait aspect ratio
    // regardless of grid/flex auto-sizing quirks.
    container-type: size;
  }

  .pg-tilt {
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
  }

  .pg-tilt-frame {
    position: absolute;
    inset: 14px;
    border: 1px solid #2a2a2a;
    border-radius: 10px;
    transform: translateZ(20px);
  }

  // QR code parallax layer — sits highest on the Z axis so it floats most
  // prominently above the card face as it tilts. Rendered as-is from the PNG.
  .pg-tilt-qr {
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

  .pg-tilt-chip {
    position: absolute;
    top: 18px;
    left: 18px;
    font-family: 'Audiowide';
    font-size: 9px;
    letter-spacing: 3px;
    color: #5bfd5b;
    transform: translateZ(60px);
  }

  .pg-tilt-name {
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
