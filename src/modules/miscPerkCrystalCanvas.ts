// Canvas renderer for the Perks section's PERK-CRYSTAL showpiece.
//
// A wireframe icosahedron — a deliberate sibling to the Logs cubes (a gem
// rather than a box) — drawn onto a single 2D canvas: an outer shell, a slowly
// counter-rotating inner shell, a glowing nucleus, an orbiting spark ring, and,
// once a perk category is selected, satellite skill nodes tethered to the
// nearest shell vertex. Dragging uses the same world-space quaternion approach
// as the Logs cubes, so "drag right" always spins right regardless of
// orientation. The render loop only runs while the crystal is on screen (or
// fading), so the cost off-section is zero.

import type { PerkGraphNode } from './sectionsPerksGraph'

// ── geometry ──
// Kept close to the crystal's own max projected extent (radius * max
// perspective scale) so the canvas doesn't carry dead margin around the
// shell — that margin, not any CSS gap, was what read as space between the
// category labels and the crystal.
const CANVAS_WIDTH = 820
const CANVAS_HEIGHT = 684
const CRYSTAL_RADIUS = 195
const PERSPECTIVE = 390
const INNER_SHELL_SCALE = 0.45
const NUCLEUS_RADIUS = 50
const BOB_AMPLITUDE = 5
const SPARK_COUNT = 14

// Satellite ring, as multiples of the crystal radius. Kept fairly round rather
// than wide so an outward-facing skill label still has horizontal room before
// it reaches the canvas edge.
const SATELLITE_RING_X = 1.02
const SATELLITE_RING_Y = 0.96
const SATELLITE_LABEL_GAP = 6
const SATELLITE_LABEL_VERTICAL_GAP = 18
const LABEL_EDGE_PADDING = 8
const SATELLITE_LABEL_FONT = '15px Mono, monospace'
// Slow ring drift: enough that the constellation is alive, slow enough that a
// label the cursor is reaching for doesn't crawl out from under it.
const SATELLITE_RING_DRIFT = 0.00008
const SATELLITE_DEPTH_DRIFT = 0.00004

// ── colours ──
// The outer shell carries the section's purple, or the selected category's
// colour. Everything at the core — the inner cage, the nucleus glow, the spark
// accent — carries that colour's complement, so the core always reads against
// the shell. (A fixed accent could not: the C# category is #ffdd1b, which hid
// the old yellow sparks and nucleus against its own shell.)
const CRYSTAL_COLOR = '#7e55dd'
const INNER_SHELL_ALPHA = 0.4
const NUCLEUS_GLOW_ALPHA = 0.9
const NUCLEUS_HOT_LIGHTNESS = 0.92

// ── timing ──
const REVEAL_IN_DURATION_MS = 900
const REVEAL_OUT_DURATION_MS = 300
const UNFOLD_DURATION_MS = 650
const CATEGORY_FLASH_DURATION_MS = 500
// The inner shell/nucleus pop in once the outer shell has established itself.
const INNER_POP_ACTIVATE_DELAY_MS = 400
// How long a full reveal takes end to end (outer grow, then the inner pop and
// its spring settling). Exported so callers can sequence their own content
// after the crystal has finished arriving.
export const PERK_CRYSTAL_REVEAL_DURATION_SECONDS = (REVEAL_IN_DURATION_MS + INNER_POP_ACTIVATE_DELAY_MS) / 1000
// A mass-spring-damper drives the pop scale (target 1) instead of a restart-
// from-zero tween: a category swap gives it a velocity kick so it overshoots
// and settles, but the scale itself is always continuous — it can never
// re-visit 0 once revealed, which is what previously made the glow cut out
// and re-pop instead of transitioning.
const POP_SPRING_STIFFNESS = 170 // rad/s²  per unit displacement
const POP_SPRING_DAMPING = 11    // rad/s   (zeta ≈ 0.42 — a subtle, quick-settling bounce)
const POP_SPRING_KICK_VELOCITY = 5.5
const POP_SPRING_MAX_DT_SECONDS = 0.05 // clamps the integration step after a tab was backgrounded
// Core colours (cage, nucleus, sparks) crossfade over this duration instead of
// snapping instantly whenever the shell colour changes.
const CORE_COLOR_TRANSITION_MS = 380

// ── interaction ──
const SATELLITE_HIT_RADIUS = 30
const DRAG_CLICK_THRESHOLD_PIXELS = 6
// Satellite nodes lean toward the cursor within this radius, tether line
// included, so the crystal reads as magnetically reactive rather than inert.
const MAGNETIC_RADIUS = 120
const MAGNETIC_STRENGTH = 0.7

// ── idle motion ──
// The satellites hang off the shell, so every bit of shell spin is amplified at
// the labels; a slow base rotation that returns quickly after a drag or a
// category kick keeps the constellation readable instead of swimming.
const IDLE_VELOCITY_X = 0.03
const IDLE_VELOCITY_Y = 0.09
const IDLE_SETTLE_RATE = 0.045
const CATEGORY_SPIN_KICK_X = -1.2
const CATEGORY_SPIN_KICK_Y = 3

type Vector3 = [number, number, number]

interface Quaternion { w: number; x: number; y: number; z: number }

interface ProjectedVertex { x: number; y: number; depth: number; scale: number }

interface Spark { angle: number; speed: number; radius: number; tilt: number }

interface SatellitePoint { x: number; y: number; name: string }

let canvasElement: HTMLCanvasElement | null = null
let renderingContext: CanvasRenderingContext2D | null = null
let animationFrame = 0
let onSkillClick: ((name: string) => void) | null = null
const listeners: Array<() => void> = []

// ── crystal state ──
let orientation: Quaternion = { w: 1, x: 0, y: 0, z: 0 }
let angularVelocityX = IDLE_VELOCITY_X
let angularVelocityY = IDLE_VELOCITY_Y
let idleVelocityX = IDLE_VELOCITY_X
let idleVelocityY = IDLE_VELOCITY_Y
let isDragging = false
let sparks: Spark[] = []
let shellColor = CRYSTAL_COLOR
let flashUntil = 0
let lastFrameTime = 0

// ── pop springs (see POP_SPRING_* above). Both shells ride one: the outer from
// the moment the reveal starts, the inner cage + nucleus a beat later so the
// core still pops in on its own delayed beat. ──
interface PopSpring { scale: number; velocity: number; isActive: boolean; activateAt: number }

const outerPopSpring: PopSpring = { scale: 0, velocity: 0, isActive: false, activateAt: 0 }
const innerPopSpring: PopSpring = { scale: 0, velocity: 0, isActive: false, activateAt: 0 }

// ── core colour crossfade (cage, nucleus, sparks); all one hue, so only a
// single hue/saturation/lightness triple needs to be interpolated. ──
let coreColorFrom = complementaryHsl(CRYSTAL_COLOR)
let coreColorTo = complementaryHsl(CRYSTAL_COLOR)
let coreColorTransitionStart = 0

// ── reveal (grow in / shrink out); anchored so an interrupted leg resumes from
// wherever it currently is rather than snapping back to 0 or 1.
let revealDirection: 'in' | 'out' = 'out'
let revealAnchorTime = 0
let revealAnchorValue = 0
let revealStartTime = 0

// ── satellites ──
let activeCategory: PerkGraphNode | null = null
let selectedSkill: string | null = null
let unfoldStartTime = 0
let satellitePoints: SatellitePoint[] = []
// Canvas-space pointer position while hovering (null when the pointer is off
// the canvas or mid-drag), used to pull nearby satellites toward the cursor.
let pointerCanvasX: number | null = null
let pointerCanvasY: number | null = null

// ── icosahedron geometry, built once ──
const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2
const VERTEX_LENGTH = Math.sqrt(1 + GOLDEN_RATIO * GOLDEN_RATIO)

const vertices: Vector3[] = ([
  [-1, GOLDEN_RATIO, 0], [1, GOLDEN_RATIO, 0], [-1, -GOLDEN_RATIO, 0], [1, -GOLDEN_RATIO, 0],
  [0, -1, GOLDEN_RATIO], [0, 1, GOLDEN_RATIO], [0, -1, -GOLDEN_RATIO], [0, 1, -GOLDEN_RATIO],
  [GOLDEN_RATIO, 0, -1], [GOLDEN_RATIO, 0, 1], [-GOLDEN_RATIO, 0, -1], [-GOLDEN_RATIO, 0, 1],
] as Vector3[]).map((vertex) => vertex.map((component) => component / VERTEX_LENGTH) as Vector3)

// An icosahedron's edges are exactly the vertex pairs at the shortest mutual
// distance; 1.2 sits between that edge length (~1.05) and the next one up.
const edges: Array<[number, number]> = (() => {
  const found: Array<[number, number]> = []
  for (let first = 0; first < vertices.length; first++) {
    for (let second = first + 1; second < vertices.length; second++) {
      const distance = Math.hypot(
        vertices[first][0] - vertices[second][0],
        vertices[first][1] - vertices[second][1],
        vertices[first][2] - vertices[second][2],
      )
      if (distance < 1.2) found.push([first, second])
    }
  }
  return found
})()

// ── quaternion helpers (world-space / extrinsic: pre-multiply each increment) ──
function multiplyQuaternions(first: Quaternion, second: Quaternion): Quaternion {
  return {
    w: first.w * second.w - first.x * second.x - first.y * second.y - first.z * second.z,
    x: first.w * second.x + first.x * second.w + first.y * second.z - first.z * second.y,
    y: first.w * second.y - first.x * second.z + first.y * second.w + first.z * second.x,
    z: first.w * second.z + first.x * second.y - first.y * second.x + first.z * second.w,
  }
}

function normalizeQuaternion(quaternion: Quaternion): Quaternion {
  const length = Math.sqrt(quaternion.w ** 2 + quaternion.x ** 2 + quaternion.y ** 2 + quaternion.z ** 2) || 1
  return { w: quaternion.w / length, x: quaternion.x / length, y: quaternion.y / length, z: quaternion.z / length }
}

function quaternionFromAxis(axisX: number, axisY: number, axisZ: number, degrees: number): Quaternion {
  const halfAngle = (degrees * Math.PI) / 360
  const sine = Math.sin(halfAngle)
  return { w: Math.cos(halfAngle), x: axisX * sine, y: axisY * sine, z: axisZ * sine }
}

function rotateVectorByQuaternion(quaternion: Quaternion, vector: Vector3): Vector3 {
  const { w, x, y, z } = quaternion
  const intermediateX = w * vector[0] + y * vector[2] - z * vector[1]
  const intermediateY = w * vector[1] + z * vector[0] - x * vector[2]
  const intermediateZ = w * vector[2] + x * vector[1] - y * vector[0]
  const intermediateW = -x * vector[0] - y * vector[1] - z * vector[2]
  return [
    intermediateX * w - intermediateW * x - intermediateY * z + intermediateZ * y,
    intermediateY * w - intermediateW * y - intermediateZ * x + intermediateX * z,
    intermediateZ * w - intermediateW * z - intermediateX * y + intermediateY * x,
  ]
}

function initialOrientation(): Quaternion {
  return normalizeQuaternion(multiplyQuaternions(quaternionFromAxis(0, 1, 0, -28), quaternionFromAxis(1, 0, 0, -20)))
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

function clampNumber(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum)
}

function easeOutCubic(progress: number) {
  return 1 - Math.pow(1 - progress, 3)
}

function lerp(from: number, to: number, progress: number) {
  return from + (to - from) * progress
}

// Advances the pop spring by dtSeconds toward target 1. Continuous by
// construction — there is no "restart" state, only ever a current position and
// velocity — so a kick (see kickPopSpring) overshoots and settles instead of
// cutting back to zero.
function stepPopSpring(spring: PopSpring, now: number, dtSeconds: number) {
  if (!spring.isActive && now >= spring.activateAt) spring.isActive = true
  if (!spring.isActive) return
  const displacement = 1 - spring.scale
  const acceleration = displacement * POP_SPRING_STIFFNESS - spring.velocity * POP_SPRING_DAMPING
  spring.velocity += acceleration * dtSeconds
  spring.scale += spring.velocity * dtSeconds
}

function kickPopSpring(spring: PopSpring) {
  if (spring.isActive) spring.velocity += POP_SPRING_KICK_VELOCITY
}

// A genuine 0→1 rise; only ever called for a fresh reveal, never for a category
// swap (those only kick, so the scale stays continuous).
function armPopSpring(spring: PopSpring, activateAt: number) {
  spring.scale = 0
  spring.velocity = 0
  spring.isActive = false
  spring.activateAt = activateAt
}

// ── colour ──
// The core opposes whatever colour the outer shell currently carries, so the
// layers stay legible as separate objects on every category. That means a real
// hue rotation (HSL, +180°), not an RGB inversion — inverting #7e55dd would
// land on a washed-out olive rather than its complement.
function complementaryHsl(hex: string): { hue: number; saturation: number; lightness: number } {
  const red = parseInt(hex.slice(1, 3), 16) / 255
  const green = parseInt(hex.slice(3, 5), 16) / 255
  const blue = parseInt(hex.slice(5, 7), 16) / 255
  const maximum = Math.max(red, green, blue)
  const minimum = Math.min(red, green, blue)
  const lightness = (maximum + minimum) / 2
  const chroma = maximum - minimum

  let hue = 0
  let saturation = 0
  if (chroma !== 0) {
    saturation = chroma / (1 - Math.abs(2 * lightness - 1))
    if (maximum === red) hue = ((green - blue) / chroma) % 6
    else if (maximum === green) hue = (blue - red) / chroma + 2
    else hue = (red - green) / chroma + 4
    hue *= 60
    if (hue < 0) hue += 360
  }
  return { hue: (hue + 180) % 360, saturation, lightness }
}

function hslToRgba(hue: number, saturation: number, lightness: number, alpha: number): string {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation
  const second = chroma * (1 - Math.abs(((hue / 60) % 2) - 1))
  const lightnessMatch = lightness - chroma / 2
  let red = 0
  let green = 0
  let blue = 0
  if (hue < 60) { red = chroma; green = second }
  else if (hue < 120) { red = second; green = chroma }
  else if (hue < 180) { green = chroma; blue = second }
  else if (hue < 240) { green = second; blue = chroma }
  else if (hue < 300) { red = second; blue = chroma }
  else { red = chroma; blue = second }
  const toChannel = (value: number) => Math.round((value + lightnessMatch) * 255)
  return `rgba(${toChannel(red)}, ${toChannel(green)}, ${toChannel(blue)}, ${alpha})`
}

// Shortest-path hue interpolation (never the "long way round" the wheel).
function lerpHue(from: number, to: number, progress: number) {
  const delta = ((to - from + 540) % 360) - 180
  return (from + delta * progress + 360) % 360
}

function currentCoreHsl(now: number): { hue: number; saturation: number; lightness: number } {
  const progress = easeOutCubic(clamp01((now - coreColorTransitionStart) / CORE_COLOR_TRANSITION_MS))
  return {
    hue: lerpHue(coreColorFrom.hue, coreColorTo.hue, progress),
    saturation: lerp(coreColorFrom.saturation, coreColorTo.saturation, progress),
    lightness: lerp(coreColorFrom.lightness, coreColorTo.lightness, progress),
  }
}

// One hue drives the whole core: the cage stroke, the three nucleus gradient
// stops, and the spark accent. Crossfades from wherever the core currently sits
// (not from the previous target) so an interrupted transition — e.g. clicking a
// second category before the first swap finishes — never jumps.
function setShellColor(hex: string, now: number) {
  shellColor = hex
  coreColorFrom = currentCoreHsl(now)
  coreColorTo = complementaryHsl(hex)
  coreColorTransitionStart = now
}

function revealAt(now: number): number {
  if (revealDirection === 'in') {
    if (now < revealStartTime) return revealAnchorValue
    return clamp01(revealAnchorValue + (now - Math.max(revealAnchorTime, revealStartTime)) / REVEAL_IN_DURATION_MS)
  }
  return clamp01(revealAnchorValue - (now - revealAnchorTime) / REVEAL_OUT_DURATION_MS)
}

function startRevealLeg(direction: 'in' | 'out', now: number, startTime: number) {
  revealAnchorValue = revealAt(now)
  revealAnchorTime = now
  revealDirection = direction
  revealStartTime = startTime
}

// ── drawing ──
function drawFrame(now: number) {
  if (!canvasElement || !renderingContext) return
  const context = renderingContext
  const centerX = CANVAS_WIDTH / 2
  const centerY = CANVAS_HEIGHT / 2 - 6
  context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  const reveal = easeOutCubic(revealAt(now))
  if (reveal <= 0) { lastFrameTime = now; return }

  const dtSeconds = lastFrameTime ? Math.min((now - lastFrameTime) / 1000, POP_SPRING_MAX_DT_SECONDS) : 0
  stepPopSpring(outerPopSpring, now, dtSeconds)
  stepPopSpring(innerPopSpring, now, dtSeconds)
  lastFrameTime = now
  const outerPopRadius = Math.max(0, outerPopSpring.scale)
  const popRadius = Math.max(0, innerPopSpring.scale)
  const { hue: coreHue, saturation: coreSaturation, lightness: coreLightness } = currentCoreHsl(now)
  const innerShellColor = hslToRgba(coreHue, coreSaturation, coreLightness, INNER_SHELL_ALPHA)
  const nucleusHotColor = hslToRgba(coreHue, coreSaturation, NUCLEUS_HOT_LIGHTNESS, 1)
  const nucleusGlowColor = hslToRgba(coreHue, coreSaturation, coreLightness, NUCLEUS_GLOW_ALPHA)
  const nucleusFadeColor = hslToRgba(coreHue, coreSaturation, coreLightness, 0)
  const accentColor = hslToRgba(coreHue, coreSaturation, coreLightness, 1)

  if (!isDragging) {
    orientation = normalizeQuaternion(multiplyQuaternions(
      quaternionFromAxis(0, 1, 0, angularVelocityY),
      multiplyQuaternions(quaternionFromAxis(1, 0, 0, angularVelocityX), orientation),
    ))
    angularVelocityX += (idleVelocityX - angularVelocityX) * IDLE_SETTLE_RATE
    angularVelocityY += (idleVelocityY - angularVelocityY) * IDLE_SETTLE_RATE
  }

  const bob = Math.sin(now / 900) * BOB_AMPLITUDE
  const radius = CRYSTAL_RADIUS * reveal * outerPopRadius
  const isFlashing = flashUntil > now

  const project = (vertex: Vector3): ProjectedVertex => {
    const rotated = rotateVectorByQuaternion(orientation, vertex)
    const scale = PERSPECTIVE / (PERSPECTIVE - rotated[2] * radius)
    return {
      x: centerX + rotated[0] * radius * scale,
      y: centerY + bob + rotated[1] * radius * scale,
      depth: rotated[2],
      scale,
    }
  }
  const projected = vertices.map(project)

  // Inner shell: inherits the drag orientation, plus its own slow
  // counter-rotation so it still reads as a separate layer rather than a
  // scaled-down copy locked to the outer shell. Its scale is the pop spring,
  // not the outer shell's reveal, so it pops in on its own beat.
  const innerRadius = radius * INNER_SHELL_SCALE * popRadius
  if (innerRadius > 0) {
    const innerOrientation = normalizeQuaternion(multiplyQuaternions(
      quaternionFromAxis(0.3, 1, 0.2, -now * 0.012),
      orientation,
    ))
    context.strokeStyle = innerShellColor
    context.lineWidth = 1
    for (const [first, second] of edges) {
      const start = rotateVectorByQuaternion(innerOrientation, vertices[first])
      const end = rotateVectorByQuaternion(innerOrientation, vertices[second])
      context.beginPath()
      context.moveTo(centerX + start[0] * innerRadius, centerY + bob + start[1] * innerRadius)
      context.lineTo(centerX + end[0] * innerRadius, centerY + bob + end[1] * innerRadius)
      context.stroke()
    }
  }

  // Outer wireframe; opacity and glow scale smoothly with depth so back edges
  // recede instead of being hard-culled.
  for (const [first, second] of edges) {
    const averageDepth = (projected[first].depth + projected[second].depth) / 2
    const depthFade = 0.3 + 0.7 * ((averageDepth + 1) / 2)
    context.globalAlpha = depthFade
    context.strokeStyle = shellColor
    context.lineWidth = 1 + 0.6 * depthFade
    context.shadowColor = shellColor
    context.shadowBlur = (isFlashing ? 16 : 8) * depthFade
    context.beginPath()
    context.moveTo(projected[first].x, projected[first].y)
    context.lineTo(projected[second].x, projected[second].y)
    context.stroke()
  }
  context.shadowBlur = 0
  context.globalAlpha = 1

  for (const vertex of projected) {
    const depthFade = 0.3 + 0.7 * ((vertex.depth + 1) / 2)
    context.globalAlpha = depthFade
    context.fillStyle = '#fff'
    context.shadowColor = shellColor
    context.shadowBlur = 8 * depthFade
    context.beginPath()
    context.arc(vertex.x, vertex.y, 1.6 + 0.8 * depthFade * vertex.scale, 0, Math.PI * 2)
    context.fill()
  }
  context.shadowBlur = 0
  context.globalAlpha = 1

  // Nucleus: the glow at the heart of the inner cage, so it carries the same
  // complement and rides the cage's pop rather than the outer shell's reveal.
  // `reveal` still factors in so it collapses with the crystal on leave.
  const pulse = 1 + Math.sin(now / 420) * 0.12
  const nucleusRadius = NUCLEUS_RADIUS * reveal * popRadius * pulse
  if (nucleusRadius > 0) {
    const nucleusGradient = context.createRadialGradient(centerX, centerY + bob, 0, centerX, centerY + bob, nucleusRadius * 2.2)
    nucleusGradient.addColorStop(0, nucleusHotColor)
    nucleusGradient.addColorStop(0.35, nucleusGlowColor)
    nucleusGradient.addColorStop(1, nucleusFadeColor)
    context.fillStyle = nucleusGradient
    context.beginPath()
    context.arc(centerX, centerY + bob, nucleusRadius * 2.2, 0, Math.PI * 2)
    context.fill()
  }

  for (const spark of sparks) {
    spark.angle += spark.speed
    const sparkX = centerX + Math.cos(spark.angle) * radius * spark.radius
    const sparkDepth = Math.sin(spark.angle)
    const sparkY = centerY + bob + Math.sin(spark.angle) * radius * 0.34 + spark.tilt * radius
    context.globalAlpha = (0.35 + 0.45 * (sparkDepth + 1) / 2) * reveal
    context.fillStyle = Math.random() < 0.12 ? accentColor : shellColor
    context.beginPath()
    context.arc(sparkX, sparkY, sparkDepth > 0 ? 2 : 1.3, 0, Math.PI * 2)
    context.fill()
  }
  context.globalAlpha = 1

  drawSatellites(context, now, centerX, centerY, bob, radius, projected)
}

// The selected category's skills unfold as labelled nodes ringing the crystal,
// each tethered by a dashed line to whichever shell vertex it sits nearest.
function drawSatellites(
  context: CanvasRenderingContext2D,
  now: number,
  centerX: number,
  centerY: number,
  bob: number,
  radius: number,
  projected: ProjectedVertex[],
) {
  satellitePoints = []
  if (!activeCategory) return

  const unfold = easeOutCubic(clamp01((now - unfoldStartTime) / UNFOLD_DURATION_MS))
  const skills = activeCategory.children
  context.font = SATELLITE_LABEL_FONT

  skills.forEach((name, index) => {
    const angle = -Math.PI / 2 + (index / skills.length) * Math.PI * 2 + now * SATELLITE_RING_DRIFT
    let satelliteX = centerX + Math.cos(angle) * radius * SATELLITE_RING_X * unfold
    let satelliteY = centerY + bob + Math.sin(angle) * radius * SATELLITE_RING_Y * unfold

    // Magnetic hover: pull the node toward the cursor, falling off with
    // distance, so the tether line (drawn from the displaced position below)
    // adapts to the pull on every frame instead of snapping.
    if (pointerCanvasX !== null && pointerCanvasY !== null) {
      const pullDeltaX = pointerCanvasX - satelliteX
      const pullDeltaY = pointerCanvasY - satelliteY
      const pullDistance = Math.hypot(pullDeltaX, pullDeltaY)
      if (pullDistance < MAGNETIC_RADIUS) {
        const pull = (1 - pullDistance / MAGNETIC_RADIUS) * MAGNETIC_STRENGTH
        satelliteX += pullDeltaX * pull
        satelliteY += pullDeltaY * pull
      }
    }

    let nearest = projected[0]
    let nearestDistance = Infinity
    for (const vertex of projected) {
      const distance = (vertex.x - satelliteX) ** 2 + (vertex.y - satelliteY) ** 2
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearest = vertex
      }
    }

    // Depth fade combines the tether vertex's true depth with the satellite's
    // own drift, so nodes recede smoothly instead of popping front-to-back.
    const satelliteDepth = Math.sin(angle * 0.5 + now * SATELLITE_DEPTH_DRIFT)
    const depthFade = 0.35 + 0.65 * ((nearest.depth + 1) / 2) * ((satelliteDepth + 1) / 2 + 0.3)
    const fade = Math.min(1, depthFade) * unfold
    const isHot = selectedSkill === name

    context.globalAlpha = 0.5 * fade
    context.strokeStyle = activeCategory!.color
    context.lineWidth = 1
    context.setLineDash([4, 4])
    context.beginPath()
    context.moveTo(nearest.x, nearest.y)
    context.lineTo(satelliteX, satelliteY)
    context.stroke()
    context.setLineDash([])

    context.globalAlpha = fade
    context.fillStyle = isHot ? '#fff' : activeCategory!.color
    context.shadowColor = activeCategory!.color
    context.shadowBlur = (isHot ? 16 : 8) * fade
    context.beginPath()
    context.arc(satelliteX, satelliteY, isHot ? 7 : 5, 0, Math.PI * 2)
    context.fill()
    context.shadowBlur = 0

    // Label placement interpolates on the node's angle rather than switching
    // between left/centre/right anchors at fixed thresholds: a bucketed anchor
    // makes the label jump the instant a drifting node crosses a threshold, and
    // each bucket clamped against the canvas edge differently, so the jump was
    // several times the text width. Everything below is continuous in `angle`.
    context.textAlign = 'left'
    context.fillStyle = isHot ? '#fff' : `${activeCategory!.color}dd`
    const label = name.toUpperCase()
    const labelWidth = context.measureText(label).width
    // -1 → label sits fully left of the node, 0 → centred on it, 1 → fully right.
    const horizontalBias = Math.cos(angle)
    const labelY = satelliteY + 5 + Math.sin(angle) * SATELLITE_LABEL_VERTICAL_GAP
    const labelX = clampNumber(
      satelliteX + horizontalBias * (SATELLITE_LABEL_GAP + labelWidth / 2) - labelWidth / 2,
      LABEL_EDGE_PADDING,
      CANVAS_WIDTH - labelWidth - LABEL_EDGE_PADDING,
    )
    context.fillText(label, labelX, labelY)
    context.globalAlpha = 1

    satellitePoints.push({ x: satelliteX, y: satelliteY, name })
  })
}

function renderLoop() {
  const now = performance.now()
  drawFrame(now)

  if (revealDirection === 'out' && revealAt(now) <= 0) {
    renderingContext?.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    animationFrame = 0
    return
  }
  animationFrame = requestAnimationFrame(renderLoop)
}

function ensureLoopRunning() {
  if (!animationFrame && canvasElement) animationFrame = requestAnimationFrame(renderLoop)
}

function toCanvasPoint(event: PointerEvent | MouseEvent) {
  const bounds = canvasElement!.getBoundingClientRect()
  return {
    x: (event.clientX - bounds.left) * (CANVAS_WIDTH / bounds.width),
    y: (event.clientY - bounds.top) * (CANVAS_HEIGHT / bounds.height),
  }
}

function satelliteAt(point: { x: number; y: number }): SatellitePoint | null {
  return satellitePoints.find(
    (satellite) => (satellite.x - point.x) ** 2 + (satellite.y - point.y) ** 2 < SATELLITE_HIT_RADIUS ** 2,
  ) ?? null
}

// ── public API ──

export function initializePerkCrystalCanvas(
  canvas: HTMLCanvasElement,
  options: { onSkillClick: (name: string) => void },
): () => void {
  canvasElement = canvas
  renderingContext = canvas.getContext('2d')
  onSkillClick = options.onSkillClick

  const devicePixelRatio = window.devicePixelRatio || 1
  canvas.width = CANVAS_WIDTH * devicePixelRatio
  canvas.height = CANVAS_HEIGHT * devicePixelRatio
  renderingContext?.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)

  orientation = initialOrientation()
  const initNow = performance.now()
  shellColor = CRYSTAL_COLOR
  coreColorFrom = complementaryHsl(CRYSTAL_COLOR)
  coreColorTo = coreColorFrom
  coreColorTransitionStart = initNow
  armPopSpring(outerPopSpring, initNow)
  armPopSpring(innerPopSpring, initNow)
  lastFrameTime = 0
  sparks = Array.from({ length: SPARK_COUNT }, (_unused, index) => ({
    angle: (index / SPARK_COUNT) * Math.PI * 2,
    speed: 0.008 + Math.random() * 0.006,
    radius: 1.55 + Math.random() * 0.25,
    tilt: Math.random() * 0.5 - 0.25,
  }))

  let lastX = 0
  let lastY = 0
  let dragDistance = 0

  const handleMove = (event: PointerEvent) => {
    const deltaX = event.clientX - lastX
    const deltaY = event.clientY - lastY
    lastX = event.clientX
    lastY = event.clientY
    dragDistance += Math.abs(deltaX) + Math.abs(deltaY)
    orientation = normalizeQuaternion(multiplyQuaternions(
      quaternionFromAxis(0, 1, 0, deltaX * 0.5),
      multiplyQuaternions(quaternionFromAxis(1, 0, 0, -deltaY * 0.5), orientation),
    ))
    angularVelocityX = -deltaY * 0.5
    angularVelocityY = deltaX * 0.5
  }
  const handleUp = () => {
    isDragging = false
    canvas.style.cursor = 'grab'
    window.removeEventListener('pointermove', handleMove)
    window.removeEventListener('pointerup', handleUp)
  }
  const handleDown = (event: PointerEvent) => {
    isDragging = true
    canvas.style.cursor = 'grabbing'
    lastX = event.clientX
    lastY = event.clientY
    dragDistance = 0
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    event.preventDefault()
  }
  // A drag that ends over a node must not also select it; only a near-stationary
  // press counts as a click.
  const handleClick = (event: MouseEvent) => {
    if (dragDistance > DRAG_CLICK_THRESHOLD_PIXELS) return
    const satellite = satelliteAt(toCanvasPoint(event))
    if (satellite) onSkillClick?.(satellite.name)
  }
  const handleHover = (event: PointerEvent) => {
    const point = toCanvasPoint(event)
    pointerCanvasX = point.x
    pointerCanvasY = point.y
    if (isDragging) return
    canvas.style.cursor = satelliteAt(point) ? 'pointer' : 'grab'
  }
  const handleLeave = () => {
    pointerCanvasX = null
    pointerCanvasY = null
  }

  canvas.addEventListener('pointerdown', handleDown)
  canvas.addEventListener('click', handleClick)
  canvas.addEventListener('pointermove', handleHover)
  canvas.addEventListener('pointerleave', handleLeave)
  listeners.push(
    () => canvas.removeEventListener('pointerdown', handleDown),
    () => canvas.removeEventListener('click', handleClick),
    () => canvas.removeEventListener('pointermove', handleHover),
    () => canvas.removeEventListener('pointerleave', handleLeave),
    () => window.removeEventListener('pointermove', handleMove),
    () => window.removeEventListener('pointerup', handleUp),
  )

  return () => {
    listeners.forEach((detach) => detach())
    listeners.length = 0
    if (animationFrame) cancelAnimationFrame(animationFrame)
    animationFrame = 0
    canvasElement = null
    renderingContext = null
    onSkillClick = null
    activeCategory = null
    selectedSkill = null
    satellitePoints = []
    revealDirection = 'out'
    revealAnchorValue = 0
    pointerCanvasX = null
    pointerCanvasY = null
  }
}

export function showPerkCrystal(delaySeconds = 0) {
  const now = performance.now()
  const revealAt = now + delaySeconds * 1000
  startRevealLeg('in', now, revealAt)
  armPopSpring(outerPopSpring, revealAt)
  armPopSpring(innerPopSpring, revealAt + INNER_POP_ACTIVATE_DELAY_MS)
  ensureLoopRunning()
}

export function hidePerkCrystal() {
  startRevealLeg('out', performance.now(), 0)
  ensureLoopRunning()
}

// Selecting a category crossfades the core to its complement and gives the pop
// spring a velocity kick — a bounce around its current (already-settled) scale
// rather than a restart from 0, so the glow transitions instead of cutting out.
// Also kicks the crystal into a fast spin and unfolds that category's skills as
// satellites. Passing null collapses them and crossfades the core back.
export function setPerkCrystalCategory(category: PerkGraphNode | null) {
  activeCategory = category
  selectedSkill = null
  const now = performance.now()
  if (!category) {
    setShellColor(CRYSTAL_COLOR, now)
    kickPopSpring(outerPopSpring)
    kickPopSpring(innerPopSpring)
    return
  }
  unfoldStartTime = now
  setShellColor(category.color, now)
  kickPopSpring(outerPopSpring)
  kickPopSpring(innerPopSpring)
  flashUntil = now + CATEGORY_FLASH_DURATION_MS
  angularVelocityY = CATEGORY_SPIN_KICK_Y
  angularVelocityX = CATEGORY_SPIN_KICK_X
  ensureLoopRunning()
}

export function setPerkCrystalSelectedSkill(name: string | null) {
  selectedSkill = name
}
