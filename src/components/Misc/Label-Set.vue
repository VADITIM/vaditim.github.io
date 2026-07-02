<template>
  <!-- Reusable corner/edge label set — see "Label Reveal Pattern" in CLAUDE.md.
       Any section can drop this in with its own labels/accent/sectionId. -->
  <div ref="root" class="label-set">
    <div v-for="(label, i) in labels" :key="'label-' + i" class="pc-label" :style="label.pos">
      <!-- wrap: each word becomes its own stacked line, revealed as an
           independent label (own bar sweep + own positional delay). -->
      <template v-if="label.wrap">
        <div v-for="(word, w) in label.text.split(/\s+/)" :key="'word-' + w" class="pc-label-line">
          <div class="pc-label-inner">
            <div class="pc-label-text" :style="{ color: textColor }">{{ word }}</div>
            <div class="pc-label-bar" :style="{ background: accent, boxShadow: `0 0 26px ${accent}` }"></div>
          </div>
        </div>
      </template>
      <!-- stretch: words laid out side by side, each its own reveal unit. -->
      <div v-else-if="label.stretch" class="pc-label-row">
        <div v-for="(word, w) in label.text.split(/\s+/)" :key="'word-' + w" class="pc-label-inner">
          <div class="pc-label-text" :style="{ color: textColor }">{{ word }}</div>
          <div class="pc-label-bar" :style="{ background: accent, boxShadow: `0 0 26px ${accent}` }"></div>
        </div>
      </div>
      <div v-else class="pc-label-inner">
        <div class="pc-label-text" :style="{ color: textColor }">{{ label.text }}</div>
        <div class="pc-label-bar" :style="{ background: accent, boxShadow: `0 0 26px ${accent}` }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, onBeforeUnmount, ref, type CSSProperties } from 'vue';
  import { gsap } from 'gsap';
  import { onSectionStatesChange, type SectionTransitionMeta } from '@modules/sectionsStateMachine';
  import { getSectionIndexById } from '@modules/sectionsRegistry';
  import { currentSection } from '@modules/sectionsCore';
  import { SECTION_ENTER_DELAY } from '@modules/sectionsTransition';
  import { hideLabels, playLabelReveals, playLabelLeave } from '@modules/miscLabelReveal';

  gsap.defaults({ immediateRender: false });

  const props = withDefaults(defineProps<{
    labels: { text: string; pos: CSSProperties; wrap?: boolean; stretch?: boolean }[];
    sectionId: string;
    accent: string;
    textColor?: string;
    delay?: number; // extra delay on top of SECTION_ENTER_DELAY, relative to section enter
  }>(), {
    textColor: '#fff',
    delay: 0.2,
  });

  const root = ref<HTMLElement | null>(null);
  let labelEls: HTMLElement[] = [];
  let cleanupStates: (() => void) | null = null;

  const sectionIdx = getSectionIndexById(props.sectionId);

  function setup() {
    if (!root.value) return;
    // Collect per-reveal units: for wrapped labels each word line is its own
    // unit, so every word gets its own bar sweep and positional delay.
    labelEls = [...root.value.querySelectorAll<HTMLElement>('.pc-label-inner')];

    hideLabels(labelEls);

    cleanupStates = onSectionStatesChange((meta: SectionTransitionMeta) => {
      if (meta.isEnteringSection(sectionIdx)) playLabelReveals(labelEls, SECTION_ENTER_DELAY + props.delay);
      else if (meta.isLeavingSection(sectionIdx)) playLabelLeave(labelEls);
    });

    // Cold-mount case: if this section is already active, reveal immediately.
    if (currentSection.value === sectionIdx) playLabelReveals(labelEls, SECTION_ENTER_DELAY + props.delay);
  }

  onMounted(setup);

  onBeforeUnmount(() => {
    if (cleanupStates) cleanupStates();
  });
</script>

<style lang="scss" scoped>
  .label-set {
    position: absolute;
    inset: 0;
    font-family: Mono, monospace;
    overflow: hidden;
    pointer-events: none;
  }

  .pc-label {
    position: absolute;
    pointer-events: none;
  }

  // Wrapped labels: one line per word, stacked flush under the label's anchor.
  .pc-label-line {
    display: block;

    + .pc-label-line {
      margin-top: 0.18em;
    }
  }

  // Stretch labels: words laid out side by side, each an independent reveal unit.
  .pc-label-row {
    display: flex;
    flex-wrap: nowrap;
    gap: 0.4em;
  }

  .pc-label-inner {
    position: relative;
    display: inline-block;
    overflow: hidden;
  }

  .pc-label-text {
    font-size: clamp(22px, 2.4vw, 40px);
    letter-spacing: 3px;
    line-height: 1.05;
    white-space: pre;
    clip-path: inset(0 100% 0 0);
  }

  .pc-label-bar {
    position: absolute;
    top: -6%;
    bottom: -6%;
    left: 0;
    width: 100%;
    border-radius: 0;
    transform-origin: left center;
    transform: scaleX(0);
  }
</style>
