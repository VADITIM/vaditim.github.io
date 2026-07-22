// Canvas renderer for the Projects DNA-strand helix backdrop.
//
// Previously each strand was a DOM node with an infinite 3D CSS rotateX
// animation, `preserve-3d`, and two box-shadowed dots; ~120 composited
// layers repainting every frame made the whole section laggy. Here the same
// motion is drawn onto a single 2D canvas (rotateX + perspective projected
// manually), with the dot glow baked into a pre-rendered sprite so no
// per-frame shadows or filters are needed. The render loop only runs while
// the helix is visible (or fading), so off-section cost is zero.

import { isLiteMode } from './miscAnimationMode'

// ── geometry (mirrors the old .proj-strand CSS) ──
const STRAND_SPACING = 44
const ROTATION_PERIOD_SECONDS = 9
const STRAND_PHASE_DELAY_SECONDS = 0.34
const LINE_HALF_HEIGHT = 140
const DOT_CENTER_OFFSET = 153 // line end (140) + dot overhang (13)
const PERSPECTIVE = 1000
const DOT_DIAMETER = 12
const DOT_GLOW_RADIUS = 16
const BACKDROP_OPACITY = 0.2 // the old .proj-helix container opacity
const DOT_ALPHA_MULTIPLIER = 1.8 // dots punch through the backdrop dimming more than the lines

// ── show/hide (mirrors the old GSAP .proj-strand opacity tweens) ──
const SHOW_DURATION = 0.22
const SHOW_STAGGER = 0.006
const HIDE_DURATION = 0.12
const HIDE_STAGGER = 0.004

// ── ripple ──
// A narrow pulse: half duration ≈ stagger means only ~2 strands are lit at
// any moment, sweeping outward fast — a long half duration with a tiny
// stagger lights every strand at once and reads as one big gradient smear.
const RIPPLE_HALF_DURATION = 0.07
const RIPPLE_STAGGER = 0.06
const RIPPLE_MAX_EXTRA_SCALE = 0.9
const RIPPLE_MAX_EXTRA_BRIGHTNESS = 1.4

type FadeMode = 'hidden' | 'showing' | 'visible' | 'hiding'

let canvasElement: HTMLCanvasElement | null = null
let renderingContext: CanvasRenderingContext2D | null = null
let animationFrame = 0
let strandCount = 0

let fadeMode: FadeMode = 'hidden'
let fadeStartTime = 0
let fadeDelaySeconds = 0

let rippleStartTime: number | null = null
let rippleOriginIndex = 0

let dotSprite: HTMLCanvasElement | null = null
let brightDotSprite: HTMLCanvasElement | null = null

function easeOutQuad(progress: number) {
  return 1 - (1 - progress) * (1 - progress)
}

function easeInQuad(progress: number) {
  return progress * progress
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

// Bake the dot + glow once (the old box-shadow) so frames just drawImage.
function buildDotSprite(brightness: number): HTMLCanvasElement {
  const size = (DOT_DIAMETER + DOT_GLOW_RADIUS * 2) * 2 // 2x for crisp downscale
  const sprite = document.createElement('canvas')
  sprite.width = size
  sprite.height = size
  const spriteContext = sprite.getContext('2d')!
  const center = size / 2
  const glow = spriteContext.createRadialGradient(center, center, 0, center, center, center)
  const mix = clamp01((brightness - 1) / RIPPLE_MAX_EXTRA_BRIGHTNESS)
  const coreColor = `rgba(${220 + (255 - 220) * mix}, ${20 + (150 - 20) * mix}, ${60 + (170 - 60) * mix}, 0.9)`
  glow.addColorStop(0, coreColor)
  glow.addColorStop(DOT_DIAMETER / (DOT_DIAMETER + DOT_GLOW_RADIUS * 2), coreColor)
  glow.addColorStop(1, 'rgba(220, 20, 60, 0)')
  spriteContext.fillStyle = glow
  spriteContext.fillRect(0, 0, size, size)
  return sprite
}

function resizeCanvas() {
  if (!canvasElement || !renderingContext) return
  const devicePixelRatio = window.devicePixelRatio || 1
  const width = canvasElement.offsetWidth
  const height = canvasElement.offsetHeight
  canvasElement.width = width * devicePixelRatio
  canvasElement.height = height * devicePixelRatio
  renderingContext.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
  strandCount = Math.ceil(width / STRAND_SPACING) + 1
}

function strandAlpha(index: number, now: number): number {
  if (fadeMode === 'visible') return 1
  if (fadeMode === 'hidden') return 0
  if (fadeMode === 'showing') {
    const progress = clamp01((now - fadeStartTime - fadeDelaySeconds - index * SHOW_STAGGER) / SHOW_DURATION)
    return easeOutQuad(progress)
  }
  const progress = clamp01((now - fadeStartTime - index * HIDE_STAGGER) / HIDE_DURATION)
  return 1 - easeInQuad(progress)
}

// 0 → no ripple; otherwise the yoyo peak factor for this strand's dots.
function rippleFactor(index: number, now: number): number {
  if (rippleStartTime === null) return 0
  const distance = Math.abs(index - rippleOriginIndex)
  const elapsed = now - rippleStartTime - distance * RIPPLE_STAGGER
  if (elapsed <= 0 || elapsed >= RIPPLE_HALF_DURATION * 2) return 0
  return elapsed < RIPPLE_HALF_DURATION
    ? easeOutQuad(elapsed / RIPPLE_HALF_DURATION)
    : easeOutQuad(1 - (elapsed - RIPPLE_HALF_DURATION) / RIPPLE_HALF_DURATION)
}

function drawFrame(now: number) {
  if (!canvasElement || !renderingContext || !dotSprite || !brightDotSprite) return
  const context = renderingContext
  const width = canvasElement.offsetWidth
  const height = canvasElement.offsetHeight
  const centerY = height / 2
  context.clearRect(0, 0, width, height)

  // Shared vanishing point at the canvas centre; this mirrors the old CSS
  // `perspective: 1000px` living on the .proj-helix container (not on each
  // strand), where strands away from the centre shear sideways as their
  // points swing forward. Per-strand straight-on projection loses that and
  // flattens the whole backdrop.
  const originX = width / 2

  for (let index = 0; index < strandCount; index++) {
    const alpha = strandAlpha(index, now) * BACKDROP_OPACITY
    if (alpha <= 0.002) continue

    const x = index * STRAND_SPACING
    const angle = ((now + index * STRAND_PHASE_DELAY_SECONDS) / ROTATION_PERIOD_SECONDS) * Math.PI * 2
    const cosine = Math.cos(angle)
    const sine = Math.sin(angle)

    // rotateX then perspective projection through the shared origin:
    // rotated point = (x, y·cosθ, −y·sinθ); scale = p / (p − z);
    // screen = origin + (point − origin) · scale.
    const project = (y: number) => {
      const depth = -y * sine
      const scale = PERSPECTIVE / (PERSPECTIVE - depth)
      return {
        screenX: originX + (x - originX) * scale,
        screenY: centerY + y * cosine * scale,
        scale,
      }
    }

    const lineTop = project(-LINE_HALF_HEIGHT)
    const lineBottom = project(LINE_HALF_HEIGHT)
    context.strokeStyle = `rgba(255, 255, 255, ${0.55 * alpha})`
    context.lineWidth = 2
    context.beginPath()
    context.moveTo(lineTop.screenX, lineTop.screenY)
    context.lineTo(lineBottom.screenX, lineBottom.screenY)
    context.stroke()

    const ripple = rippleFactor(index, now)
    const dotScale = 1 + RIPPLE_MAX_EXTRA_SCALE * ripple
    const sprite = ripple > 0.02 ? brightDotSprite : dotSprite
    const dotTop = project(-DOT_CENTER_OFFSET)
    const dotBottom = project(DOT_CENTER_OFFSET)
    const dotAlpha = Math.min(1, alpha * DOT_ALPHA_MULTIPLIER)
    for (const dot of [dotTop, dotBottom]) {
      const size = (DOT_DIAMETER + DOT_GLOW_RADIUS * 2) * dot.scale * dotScale
      context.globalAlpha = dotAlpha
      context.drawImage(sprite, dot.screenX - size / 2, dot.screenY - size / 2, size, size)
      // Cross-fade toward the bright sprite instead of a hard swap.
      if (ripple > 0.02 && ripple < 0.98) {
        context.globalAlpha = dotAlpha * (1 - ripple)
        context.drawImage(dotSprite, dot.screenX - size / 2, dot.screenY - size / 2, size, size)
      }
    }
    context.globalAlpha = 1
  }
}

function renderLoop() {
  const now = performance.now() / 1000

  if (fadeMode === 'showing' && now - fadeStartTime - fadeDelaySeconds > SHOW_DURATION + strandCount * SHOW_STAGGER) {
    fadeMode = 'visible'
  }
  if (fadeMode === 'hiding' && now - fadeStartTime > HIDE_DURATION + strandCount * HIDE_STAGGER) {
    fadeMode = 'hidden'
  }
  if (rippleStartTime !== null && now - rippleStartTime > RIPPLE_HALF_DURATION * 2 + strandCount * RIPPLE_STAGGER) {
    rippleStartTime = null
  }

  drawFrame(now)

  if (fadeMode === 'hidden') {
    // Fully faded out; clear once and park the loop until the next show.
    renderingContext?.clearRect(0, 0, canvasElement?.offsetWidth ?? 0, canvasElement?.offsetHeight ?? 0)
    animationFrame = 0
    return
  }
  animationFrame = requestAnimationFrame(renderLoop)
}

function ensureLoopRunning() {
  if (!animationFrame && canvasElement) animationFrame = requestAnimationFrame(renderLoop)
}

// ── public API ──

export function initializeProjectHelixCanvas(canvas: HTMLCanvasElement): () => void {
  // A full-viewport canvas repainting every dot every frame is the single most
  // expensive thing on the page without hardware acceleration; lite mode drops
  // it entirely. `canvasElement` stays null, so show/hide/ripple are no-ops too.
  if (isLiteMode.value) {
    canvas.style.display = 'none'
    return () => {}
  }

  canvasElement = canvas
  renderingContext = canvas.getContext('2d')
  dotSprite = buildDotSprite(1)
  brightDotSprite = buildDotSprite(1 + RIPPLE_MAX_EXTRA_BRIGHTNESS)
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
  return () => {
    window.removeEventListener('resize', resizeCanvas)
    if (animationFrame) cancelAnimationFrame(animationFrame)
    animationFrame = 0
    canvasElement = null
    renderingContext = null
    fadeMode = 'hidden'
    rippleStartTime = null
  }
}

export function showProjectHelix(delaySeconds = 0) {
  if (fadeMode === 'visible' || fadeMode === 'showing') return
  fadeMode = 'showing'
  fadeStartTime = performance.now() / 1000
  fadeDelaySeconds = delaySeconds
  ensureLoopRunning()
}

export function hideProjectHelix() {
  if (fadeMode === 'hidden' || fadeMode === 'hiding') return
  fadeMode = 'hiding'
  fadeStartTime = performance.now() / 1000
  ensureLoopRunning()
}

// Ripple the dots from a random strand outward in both directions; triggered
// whenever the centred project card changes (see Projects-Section.vue).
export function rippleProjectHelix() {
  if (!strandCount) return
  rippleOriginIndex = Math.floor(Math.random() * strandCount)
  rippleStartTime = performance.now() / 1000
  ensureLoopRunning()
}
