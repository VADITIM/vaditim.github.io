<template>
  <!-- Standalone typewriter; see miscTypewriter.ts. Caret bar + text both use
       the section's main colour (passed as `color`). Drive play/clear from a
       parent ref or a section animation handler. `reverse` types/clears from
       the end of the string so the reveal reads right-to-left; the root is
       given a fixed width (measured from the full text) so it has a stable
       right edge for the text to grow from instead of drifting. -->
  <span ref="root" class="tw" :class="{ 'tw--reverse': reverse }" :style="{ color }">
    <span class="tw-text"></span><span
      class="tw-caret"
      :style="{ background: caretColor, boxShadow: `0 0 8px ${caretColor}` }"
    ></span>
  </span>
</template>

<script setup lang="ts">
  import { computed, onMounted, onBeforeUnmount, ref } from 'vue';
  import {
    createTypewriter, playType, playClear, resetTypewriter, killTypewriter,
    type TypewriterOptions,
  } from '@modules/miscTypewriter';

  const props = withDefaults(defineProps<{
    text: string;
    color?: string;
    // Caret color, defaults to the text color.
    caretColor?: string;
    options?: TypewriterOptions;
    // Type out automatically on mount.
    autoplay?: boolean;
    // Reveal right-to-left instead of left-to-right.
    reverse?: boolean;
  }>(), {
    color: '#fff',
    caretColor: undefined,
    autoplay: false,
    reverse: false,
  });

  const caretColor = computed(() => props.caretColor ?? props.color);

  const root = ref<HTMLElement | null>(null);
  let handle: ReturnType<typeof createTypewriter> | null = null;

  function type() { if (handle) return playType(handle, props.options); return Promise.resolve(); }
  function clear() { if (handle) return playClear(handle, props.options); return Promise.resolve(); }
  function reset() { if (handle) resetTypewriter(handle); }

  defineExpose({ type, clear, reset });

  onMounted(() => {
    if (!root.value) return;
    handle = createTypewriter(root.value, props.text, props.reverse);

    // Reverse needs a fixed width to grow into; measure the full text's
    // rendered width (font/letter-spacing aware) once, up front.
    if (props.reverse) {
      const textEl = root.value.querySelector<HTMLElement>('.tw-text')!;
      const caretEl = root.value.querySelector<HTMLElement>('.tw-caret')!;
      textEl.textContent = props.text;
      const width = textEl.getBoundingClientRect().width + caretEl.getBoundingClientRect().width;
      textEl.textContent = '';
      root.value.style.width = `${width}px`;
    }

    if (props.autoplay) type();
  });

  onBeforeUnmount(() => { if (handle) killTypewriter(handle); });
</script>

<style lang="scss" scoped>
  .tw {
    display: inline-flex;
    align-items: baseline;
    white-space: pre;
  }

  // Fixed-width (set in script) with the reveal anchored to the right edge -
  // the caret sits at the growing text's leading (left) edge instead of
  // trailing it.
  .tw--reverse {
    justify-content: flex-end;

    .tw-caret {
      order: -1;
      margin-left: 0;
      margin-right: 0.04em;
    }
  }

  .tw-text {
    white-space: pre;
  }

  // The classic text-editor caret: a thin vertical bar the height of the text.
  .tw-caret {
    display: inline-block;
    width: 0.08em;
    height: 1em;
    margin-left: 0.04em;
    border-radius: 0;
    transform: translateY(0.08em);
  }
</style>
