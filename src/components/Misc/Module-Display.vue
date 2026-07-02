<template>
  <!-- Reusable panel "window": a box/border frame with a label header,
       section-accent aware. Shared by Sandbox, Extra, and Profile's cubes —
       see CLAUDE.md Current Task 3. -->
  <div ref="root" class="module-display" :style="{ '--accent': accent, opacity: staticVisible ? 1 : undefined }">
    <div v-if="hue" class="module-display-hue"></div>
    <div class="module-display-label" :class="{ 'module-display-label--over': labelOver }">
      <slot name="label">{{ label }}</slot>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, onBeforeUnmount, ref } from 'vue';

  const props = withDefaults(defineProps<{
    label?: string;
    accent?: string;
    hue?: boolean;          // cursor-following border glow
    labelOver?: boolean;    // label floats above overlay content (z-index, no pointer events)
    staticVisible?: boolean; // skip the default opacity:0 — use when content reveals itself internally rather than via a container-level enter tween
  }>(), {
    label: '',
    accent: '#5bfd5b',
    hue: false,
    labelOver: false,
    staticVisible: false,
  });

  const root = ref<HTMLElement | null>(null);
  const listeners: Array<() => void> = [];

  defineExpose({ get el() { return root.value; } });

  onMounted(() => {
    if (!props.hue || !root.value) return;
    const el = root.value;
    const glow = el.querySelector<HTMLElement>('.module-display-hue');
    if (!glow) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      glow.style.setProperty('--mx', `${e.clientX - r.left}px`);
      glow.style.setProperty('--my', `${e.clientY - r.top}px`);
      glow.style.opacity = '1';
    };
    const onLeave = () => { glow.style.opacity = '0'; };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    listeners.push(() => el.removeEventListener('mousemove', onMove), () => el.removeEventListener('mouseleave', onLeave));
  });

  onBeforeUnmount(() => {
    listeners.forEach((off) => off());
    listeners.length = 0;
  });
</script>

<style scoped lang="scss">
  .module-display {
    position: relative;
    border: 1px solid #262626;
    border-radius: 12px;
    background: rgba(18, 18, 18, 0.85);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    opacity: 0;
    will-change: transform, opacity;
  }

  // Cursor-following accent glow, masked to only show on the box's border ring.
  // `--mx` / `--my` are updated per-box from the pointer on mousemove.
  .module-display-hue {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1.5px;
    pointer-events: none;
    z-index: 4;
    background: radial-gradient(
      150px circle at var(--mx, 50%) var(--my, 50%),
      color-mix(in srgb, var(--accent) 65%, transparent),
      transparent 70%
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

  .module-display-label {
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
</style>
