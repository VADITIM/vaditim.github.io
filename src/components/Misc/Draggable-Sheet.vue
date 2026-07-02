<template>
  <div ref="sheetRef" class="ds-sheet" :style="{ '--ds-glow': accent ?? '#fff' }" @wheel.stop>
    <!-- arch handle — always visible at the bottom edge, drag up to open -->
    <div ref="handleRef" class="ds-handle" @pointerdown.prevent="onDown">
      <svg
        class="ds-arch"
        viewBox="0 0 1000 44"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,44 C180,44 320,2 500,2 C680,2 820,44 1000,44 Z"
          :fill="accent ?? '#fff'"
        />
      </svg>
      <div class="ds-hint">
        <slot name="hint">DRAG UP ▲</slot>
      </div>
    </div>

    <!-- content panel — hidden below the section edge when closed -->
    <div class="ds-body">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
  import { gsap } from 'gsap'

  const props = defineProps<{
    modelValue: boolean
    accent?: string
  }>()
  const emit = defineEmits<{ 'update:modelValue': [val: boolean] }>()

  const sheetRef  = ref<HTMLElement | null>(null)
  const handleRef = ref<HTMLElement | null>(null)

  const ARCH_H   = 44       // px — visible arch height (matches viewBox height)
  const SNAP_VEL = 0.35     // px/ms — flick threshold to force snap direction

  let isOpen      = false
  let contentH    = 0        // 110vh in px, recalculated on measure()
  let openY       = 0        // y when fully open (-20vh, sheet extends above viewport)
  let dragging    = false
  let startY      = 0
  let startTransY = 0
  let velBuf: { t: number; y: number }[] = []

  function measure() {
    const vh = window.innerHeight
    contentH = vh * 1.1
    openY    = vh * 0.2
    gsap.set(sheetRef.value, { y: contentH + ARCH_H })
  }

  function snapTo(open: boolean) {
    const el = sheetRef.value
    if (!el) return
    isOpen = open
    emit('update:modelValue', open)
    if (open) {
      gsap.to(el, { y: openY, duration: 0.72, ease: 'expo.out', overwrite: 'auto' })
    } else {
      gsap.to(el, { y: contentH, duration: 0.45, ease: 'expo.in', overwrite: 'auto' })
    }
  }

  // Section-level enter: arch springs up from below the edge into resting position.
  function reveal(delay = 0) {
    const el = sheetRef.value
    if (!el) return
    gsap.fromTo(el,
      { y: contentH + ARCH_H },
      { y: contentH, duration: 0.62, ease: 'back.out(1.6)', delay, overwrite: 'auto' }
    )
  }

  // Section-level leave: arch drops back below the edge.
  function hide() {
    const el = sheetRef.value
    if (!el) return
    isOpen = false
    emit('update:modelValue', false)
    gsap.to(el, { y: contentH + ARCH_H, duration: 0.28, ease: 'power3.in', overwrite: 'auto' })
  }

  function close() { snapTo(false) }

  function onDown(e: PointerEvent) {
    const el = sheetRef.value
    if (!el) return
    dragging    = true
    startY      = e.clientY
    startTransY = gsap.getProperty(el, 'y') as number
    velBuf      = [{ t: performance.now(), y: e.clientY }]
    gsap.killTweensOf(el, 'y')
    handleRef.value?.setPointerCapture(e.pointerId)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  function onMove(e: PointerEvent) {
    if (!dragging) return
    const el = sheetRef.value
    if (!el) return
    const dy   = e.clientY - startY
    const newY = Math.max(openY, Math.min(contentH, startTransY + dy))
    gsap.set(el, { y: newY })
    velBuf.push({ t: performance.now(), y: e.clientY })
    if (velBuf.length > 6) velBuf.shift()
  }

  function onUp() {
    if (!dragging) return
    dragging = false
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)

    // Velocity (px/ms, negative = upward)
    let vel = 0
    if (velBuf.length >= 2) {
      const a = velBuf[0], b = velBuf[velBuf.length - 1]
      const dt = b.t - a.t
      if (dt > 0) vel = (b.y - a.y) / dt
    }

    if (vel < -SNAP_VEL) { snapTo(true);  return }
    if (vel > SNAP_VEL)  { snapTo(false); return }

    const el = sheetRef.value
    if (!el) return
    snapTo((gsap.getProperty(el, 'y') as number) < (openY + contentH) / 2)
  }

  watch(() => props.modelValue, (val) => { if (val !== isOpen) snapTo(val) })

  onMounted(() => {
    measure()
    window.addEventListener('resize', measure)
  })
  onBeforeUnmount(() => {
    window.removeEventListener('resize', measure)
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
  })

  defineExpose({ el: sheetRef, reveal, hide, close })
</script>

<style scoped lang="scss">
  .ds-sheet {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: calc(44px + 110vh);
    z-index: 1000;
    will-change: transform, opacity;
  }

  // ── arch handle ──
  .ds-handle {
    position: relative;
    height: 44px;
    cursor: grab;
    touch-action: none;
    user-select: none;

    &:active { cursor: grabbing; }
  }

  .ds-arch {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .ds-hint {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    font-family: 'Mono', monospace;
    font-size: 9px;
    letter-spacing: 3px;
    color: rgba(0, 0, 0, 0.55);
    pointer-events: none;
    white-space: nowrap;
  }

  // ── content panel ──
  .ds-body {
    position: relative;
    width: 100%;
    height: 110vh;
    margin-top: -6px;
    background: var(--ds-glow);
    color: #161616;
    padding: 32px 30px 60px;
    overflow-y: auto;
    box-sizing: border-box;
  }
</style>
