<template>
  <div ref="sheetRef" class="ls-sheet">
    <!-- bow; always visible at the bottom edge, raised by its section's label -->
    <div class="ls-bow">
      <svg
        class="ls-bow-curve"
        viewBox="0 0 1000 44"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path :d="BOW_PATH" :fill="accent ?? '#fff'" />
      </svg>
      <div class="ls-hint">
        <slot name="hint">LEGAL</slot>
      </div>
    </div>

    <!-- content panel; hidden below the section edge when closed -->
    <div class="ls-body" :style="{ background: accent ?? '#fff' }">
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
  const emit = defineEmits<{ 'update:modelValue': [isOpen: boolean] }>()

  const BOW_HEIGHT = 44
  /** Flat shoulders rising into a tight crown — a taut bow rather than a wide dome. */
  const BOW_PATH = 'M0,44 C140,44 230,36 320,20 C400,6 450,0 500,0 C550,0 600,6 680,20 C770,36 860,44 1000,44 Z'
  /** Share of the viewport the open panel covers; also the sheet's whole travel range. */
  const BODY_HEIGHT_RATIO = 0.3

  const sheetRef = ref<HTMLElement | null>(null)

  let isOpen = false
  let isRevealed = false
  let bodyHeight = 0

  // Resting offsets: open sits flush with the section edge, closed drops the body
  // out of sight leaving only the bow, un-revealed drops the bow away too.
  function restingY() {
    if (isOpen) return 0
    return isRevealed ? bodyHeight : bodyHeight + BOW_HEIGHT
  }

  function measure() {
    bodyHeight = window.innerHeight * BODY_HEIGHT_RATIO
    gsap.set(sheetRef.value, { xPercent: -50, y: restingY() })
  }

  function snapTo(open: boolean) {
    const element = sheetRef.value
    if (!element) return
    isOpen = open
    emit('update:modelValue', open)

    if (open) {
      window.addEventListener('pointerdown', handleOutsidePress)
      gsap.to(element, { y: 0, duration: 0.55, ease: 'back.out(1.4)', overwrite: 'auto' })
    } else {
      window.removeEventListener('pointerdown', handleOutsidePress)
      gsap.to(element, { y: restingY(), duration: 0.28, ease: 'power3.in', overwrite: 'auto' })
    }
  }

  function handleOutsidePress(event: PointerEvent) {
    const target = event.target as HTMLElement
    if (sheetRef.value?.contains(target)) return
    // The label that raises the sheet sits outside it and fires on `click`, one
    // step behind this `pointerdown`. Closing here would just be undone by it,
    // so leave that press alone and let the label toggle itself shut.
    if (target.closest('.pc-label--pressable')) return
    snapTo(false)
  }

  // Section-level enter: the bow springs up from below the edge into resting position.
  function reveal(delay = 0) {
    const element = sheetRef.value
    if (!element) return
    isRevealed = true
    gsap.fromTo(element,
      { y: bodyHeight + BOW_HEIGHT },
      { y: bodyHeight, duration: 0.62, ease: 'back.out(1.6)', delay, overwrite: 'auto' }
    )
  }

  // Section-level leave: whatever state it was in, the whole sheet drops away.
  function hide() {
    const element = sheetRef.value
    if (!element) return
    isRevealed = false
    if (isOpen) snapTo(false)
    gsap.to(element, { y: bodyHeight + BOW_HEIGHT, duration: 0.28, ease: 'power3.in', overwrite: 'auto' })
  }

  watch(() => props.modelValue, (value) => { if (value !== isOpen) snapTo(value) })

  onMounted(() => {
    measure()
    window.addEventListener('resize', measure)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', measure)
    window.removeEventListener('pointerdown', handleOutsidePress)
  })

  defineExpose({ el: sheetRef, reveal, hide })
</script>

<style scoped lang="scss">
  .ls-sheet {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 35%;
    height: calc(44px + 30vh);
    z-index: 1000;
    will-change: transform;
  }

  .ls-bow {
    position: relative;
    height: 44px;
    user-select: none;
  }

  .ls-bow-curve {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .ls-hint {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    font-family: 'Mono', monospace;
    font-size: 9px;
    letter-spacing: 3px;
    color: rgba(0, 0, 0, 0.55);
    pointer-events: none;
    white-space: nowrap;
  }

  .ls-body {
    position: relative;
    width: 100%;
    height: 30vh;
    // Pulled under the bow so no seam shows between the two shapes.
    margin-top: -6px;
    color: #161616;
    padding: 24px 28px;
    overflow: hidden;
    box-sizing: border-box;
  }
</style>
