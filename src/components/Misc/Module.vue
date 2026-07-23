<template>
  <!-- Reusable panel "window": a box/border frame with a label header,
       section-accent aware. Shared by Sandbox, Extra, and the Logs cubes -
       see CLAUDE.md Current Task 3. -->
  <div ref="root" class="module" :style="[accent ? { '--accent': accent } : {}, staticVisible ? { opacity: 1 } : {}]">
    <div class="module-hue"></div>
    <div class="module-label" :class="{ 'module-label--over': labelOver }">
      <slot name="label">{{ label }}</slot>
    </div>
    <!-- Optional info affordance: a small "i" in the top-right corner that reveals
         a card on hover/focus. Rendered only when the `info` slot is provided. -->
    <div v-if="$slots.info" class="module-info" tabindex="0" role="note" :aria-label="infoTitle || 'More information'">
      <span class="module-info-mark" aria-hidden="true">i</span>
      <div class="module-info-card">
        <div v-if="infoTitle" class="module-info-title">{{ infoTitle }}</div>
        <slot name="info" />
      </div>
    </div>
    <div class="module-content">
      <slot />
    </div>
    <div v-if="caption" class="module-caption">{{ caption }}</div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, onBeforeUnmount, ref } from 'vue';
  import { gsap } from 'gsap';
  import { isLiteMode } from '@modules/miscAnimationMode';

  const props = withDefaults(defineProps<{
    label?: string;
    /** Overrides the live section colour; leave unset so the box follows the section. */
    accent?: string;
    labelOver?: boolean;    // label floats above overlay content (z-index, no pointer events)
    staticVisible?: boolean; // skip the default opacity:0; use when content reveals itself internally rather than via a container-level enter tween
    caption?: string;       // optional hint line pinned to the bottom centre of the box
    animateHeight?: boolean; // smoothly tween the box height when its content's natural height changes (e.g. text re-wrapping) instead of snapping
    infoTitle?: string;     // heading for the optional info card (also its aria-label); the card body comes from the `info` slot
  }>(), {
    label: '',
    accent: '',
    labelOver: false,
    staticVisible: false,
    caption: '',
    animateHeight: true,
    infoTitle: '',
  });

  const root = ref<HTMLElement | null>(null);
  const listeners: Array<() => void> = [];
  let resizeObserver: ResizeObserver | null = null;
  let previousHeight: number | null = null;

  defineExpose({ get element() { return root.value; } });

  onMounted(() => {
    if (!root.value) return;
    const element = root.value;
    // The hue ring is hidden outright in lite mode (see style.scss), so tracking
    // the pointer for it would be per-move work for nothing.
    const glow = isLiteMode.value ? null : element.querySelector<HTMLElement>('.module-hue');
    if (glow) {
      const onMove = (event: MouseEvent) => {
        const bounds = element.getBoundingClientRect();
        glow.style.setProperty('--mx', `${event.clientX - bounds.left}px`);
        glow.style.setProperty('--my', `${event.clientY - bounds.top}px`);
        glow.style.opacity = '1';
      };
      const onLeave = () => { glow.style.opacity = '0'; };
      element.addEventListener('mousemove', onMove);
      element.addEventListener('mouseleave', onLeave);
      listeners.push(() => element.removeEventListener('mousemove', onMove), () => element.removeEventListener('mouseleave', onLeave));
    }

    // ── height scaling transition ──
    // Content whose natural height changes (e.g. Projects' description
    // re-wrapping when the centred card changes) would otherwise snap the box
    // to its new size. Watch for that and tween height instead; a no-op for
    // modules whose height is pinned by a parent grid track (Sandbox/Extra),
    // since those never report a size change here.
    if (props.animateHeight) {
      previousHeight = element.offsetHeight;
      resizeObserver = new ResizeObserver(() => {
        if (!root.value) return;
        const newHeight = root.value.offsetHeight;
        if (previousHeight === null) { previousHeight = newHeight; return; }
        if (Math.abs(newHeight - previousHeight) < 1) return;
        const from = previousHeight;
        previousHeight = newHeight;
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
      resizeObserver.observe(element);
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
  .module {
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

    // Dim base tint on hover; the hue layer supplies the bright falloff around
    // the cursor so the ring reads as one glow with a hot spot, not two states.
    &:hover {
      border-color: color-mix(in srgb, var(--accent) 30%, #262626);
    }
  }

  // Accent glow masked to only show on the box's border ring. The whole ring
  // lights up on hover, but the gradient's final stop keeps everything past the
  // cursor's radius at a low hue so the pointer still has a bright hot spot.
  // `--mx` / `--my` are updated per-box from the pointer on mousemove.
  .module-hue {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1.5px;
    pointer-events: none;
    z-index: 4;
    background: radial-gradient(
      180px circle at var(--mx, 50%) var(--my, 50%),
      color-mix(in srgb, var(--accent) 95%, transparent),
      color-mix(in srgb, var(--accent) 50%, transparent) 45%,
      color-mix(in srgb, var(--accent) 20%, transparent) 100%
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
  .module-label {
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

  .module-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding: 44px 16px 16px;
  }

  .module-caption {
    position: absolute;
    bottom: 12px;
    left: 0;
    right: 0;
    transform: translateY(55%);
    text-align: center;
    font-family: 'Mono';
    font-size: 12px;
    color: #4a4a4a;
    pointer-events: none;
    z-index: 4;
  }

  // ── optional info affordance ──
  // Sits in the top-right corner, opposite the label. The card opens downward and
  // stays inside the box, which clips overflow.
  .module-info {
    position: absolute;
    top: 10px;
    right: 12px;
    z-index: 6;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #3a3a3a;
    border-radius: 50%;
    color: #6a6a6a;
    cursor: help;
    transition: color 0.2s, border-color 0.2s;

    &:hover,
    &:focus-visible {
      color: var(--accent);
      border-color: var(--accent);
      outline: none;
    }
  }

  .module-info-mark {
    font-family: 'Mono';
    font-size: 14px;
    line-height: 1;
  }

  .module-info-card {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: min(500px, 900vw);
    padding: 12px 14px;
    background: #141414;
    border: 1px solid #2c2c2c;
    border-radius: 8px;
    text-align: left;
    opacity: 0;
    transform: translateY(-6px);
    pointer-events: none;
    transition: opacity 0.2s ease, transform 0.2s ease;
  }

  .module-info:hover .module-info-card,
  .module-info:focus-visible .module-info-card {
    opacity: 1;
    transform: translateY(0);
  }

  .module-info-title {
    margin-bottom: 8px;
    font-family: 'Audiowide';
    font-size: 14px;
    text-align: end;
    letter-spacing: 2px;
    color: var(--accent);
  }

  // Slotted body copy carries the consumer's scope, not this one; reach it with
  // :deep so a plain <p> in the info slot picks up the shared card styling.
  .module-info-card :deep(p) {
    margin: 0 0 8px;
    font-family: 'Mono';
    font-size: 12px;
    line-height: 1.6;
    color: #8a8a8a;

    &:last-child {
      margin-bottom: 0;
    }
  }
</style>
