<template>
  <!-- Reusable panel "window": a box/border frame with a label header,
       section-accent aware. Shared by Sandbox, Extra, and the Logs cubes -
       see CLAUDE.md Current Task 3. -->
  <div ref="root" class="module-display" :style="[accent ? { '--accent': accent } : {}, staticVisible ? { opacity: 1 } : {}]">
    <div class="module-display-hue"></div>
    <div class="module-display-label" :class="{ 'module-display-label--over': labelOver }">
      <slot name="label">{{ label }}</slot>
    </div>
    <div class="module-display-content">
      <slot />
    </div>
    <div v-if="caption" class="module-display-caption">{{ caption }}</div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, onBeforeUnmount, ref } from 'vue';
  import { gsap } from 'gsap';

  const props = withDefaults(defineProps<{
    label?: string;
    /** Overrides the live section colour; leave unset so the box follows the section. */
    accent?: string;
    labelOver?: boolean;    // label floats above overlay content (z-index, no pointer events)
    staticVisible?: boolean; // skip the default opacity:0; use when content reveals itself internally rather than via a container-level enter tween
    caption?: string;       // optional hint line pinned to the bottom centre of the box
    animateHeight?: boolean; // smoothly tween the box height when its content's natural height changes (e.g. text re-wrapping) instead of snapping
  }>(), {
    label: '',
    accent: '',
    labelOver: false,
    staticVisible: false,
    caption: '',
    animateHeight: true,
  });

  const root = ref<HTMLElement | null>(null);
  const listeners: Array<() => void> = [];
  let resizeObserver: ResizeObserver | null = null;
  let prevHeight: number | null = null;

  defineExpose({ get el() { return root.value; } });

  onMounted(() => {
    if (!root.value) return;
    const el = root.value;
    const glow = el.querySelector<HTMLElement>('.module-display-hue');
    if (glow) {
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
    }

    // ── height scaling transition ──
    // Content whose natural height changes (e.g. Projects' description
    // re-wrapping when the centred card changes) would otherwise snap the box
    // to its new size. Watch for that and tween height instead; a no-op for
    // modules whose height is pinned by a parent grid track (Sandbox/Extra),
    // since those never report a size change here.
    if (props.animateHeight) {
      prevHeight = el.offsetHeight;
      resizeObserver = new ResizeObserver(() => {
        if (!root.value) return;
        const newHeight = root.value.offsetHeight;
        if (prevHeight === null) { prevHeight = newHeight; return; }
        if (Math.abs(newHeight - prevHeight) < 1) return;
        const from = prevHeight;
        prevHeight = newHeight;
        resizeObserver?.unobserve(root.value);
        gsap.fromTo(root.value, { height: from }, {
          height: newHeight,
          duration: 0.45,
          ease: 'power3.out',
          overwrite: 'auto',
          onComplete: () => {
            if (!root.value) return;
            root.value.style.height = '';
            resizeObserver?.observe(root.value);
          },
        });
      });
      resizeObserver.observe(el);
    }
  });

  onBeforeUnmount(() => {
    listeners.forEach((off) => off());
    listeners.length = 0;
    resizeObserver?.disconnect();
    resizeObserver = null;
  });
</script>

<style scoped lang="scss">
  .module-display {
    position: relative;
    z-index: 7;
    // Follows the section it is rendered in unless the consumer names a colour;
    // App.vue keeps --section-color pointed at the active section's accent.
    --accent: var(--section-color, #5bfd5b);
    border: 1px solid #262626;
    border-radius: 12px;
    background: rgba(18, 18, 18, 0.85);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    opacity: 0;
    will-change: transform, opacity;
    transition: border-color 0.25s ease;

    &:hover {
      border-color: var(--accent);
    }
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
      color-mix(in srgb, var(--accent) 85%, transparent),
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

  // Predetermined top-left position; absolute so it never shifts when a
  // consumer overrides the box's own padding (e.g. Cubes.vue's `.pc-cell`).
  .module-display-label {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 5;
    font-family: 'Mono';
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 3px;
    color: #8a8a8a;
    padding: 13px 16px;
    pointer-events: none;

    &--over {
      z-index: 6;
    }
  }

  .module-display-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding: 44px 16px 16px;
  }

  .module-display-caption {
    position: absolute;
    bottom: 12px;
    left: 0;
    right: 0;
    text-align: center;
    font-family: 'Mono';
    font-size: 10px;
    color: #4a4a4a;
    pointer-events: none;
    z-index: 4;
  }
</style>
