<template>
  <div
    ref="wrapRef"
    class="mag-wrap"
    :style="{ padding: `${zone}px` }"
    @mousemove="onMove"
    @mouseleave="onLeave"
  >
    <button
      ref="btnRef"
      class="mag-btn"
      :type="type"
      :disabled="disabled"
      @click="onClick"
    >
      <slot />
    </button>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { gsap } from 'gsap'

  const props = withDefaults(defineProps<{
    zone?: number      // px padding around the button; defines the magnetic attraction area
    strength?: number  // 0–1, how far the button travels toward the cursor
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
  }>(), {
    zone: 32,
    strength: 0.4,
    type: 'button',
    disabled: false,
  })

  const emit = defineEmits<{ click: [e: MouseEvent] }>()

  const wrapRef = ref<HTMLElement | null>(null)
  const btnRef  = ref<HTMLElement | null>(null)

  defineExpose({ get element() { return btnRef.value } })

  const onMove = (event: MouseEvent) => {
    const wrap = wrapRef.value, button = btnRef.value
    if (!wrap || !button) return
    const bounds  = wrap.getBoundingClientRect()
    const dx = event.clientX - (bounds.left + bounds.width  / 2)
    const dy = event.clientY - (bounds.top  + bounds.height / 2)
    gsap.to(button, { x: dx * props.strength, y: dy * props.strength, duration: 0.4, ease: 'power3.out' })
  }

  const onLeave = () => {
    if (btnRef.value) gsap.to(btnRef.value, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.3)' })
  }

  const onClick = (event: MouseEvent) => {
    if (!props.disabled) emit('click', event)
  }
</script>

<style scoped lang="scss">
  .mag-wrap {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  // Bare reset; all visual styling is done by the consumer via :deep(.mag-btn).
  .mag-btn {
    -webkit-appearance: none;
    appearance: none;
    margin: 0;
    padding: 0;
    background: none;
    border: none;
    font: inherit;
    color: inherit;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    will-change: transform;
    cursor: pointer;

    &:disabled {
      cursor: not-allowed;
    }
  }
</style>
