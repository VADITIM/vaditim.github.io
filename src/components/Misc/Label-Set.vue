<template>
  <!-- Reusable corner/edge label set; see "Label Reveal Pattern" in CLAUDE.md.
       Any section can drop this in with its own labels/accent/sectionId. -->
  <div ref="root" class="label-set" :class="{ 'label-set--glitch': glitch }">
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
  import { getSectionIndexById } from '@modules/sectionLookup';
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
    glitch?: boolean; // continuous RGB-split glitch flicker on the revealed text
  }>(), {
    textColor: '#fff',
    delay: 0.2,
    glitch: false,
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

  // Opt-in glitch: brief RGB-split + horizontal jitter that fires a few times
  // across the cycle rather than continuously, so the text mostly reads clean
  // and only "breaks up" in bursts. Each label offsets its timing so they don't
  // glitch in unison.
  .label-set--glitch .pc-label-text {
    animation: sc-label-glitch 3.6s steps(1, end) infinite;
  }

  .label-set--glitch .pc-label:nth-child(2) .pc-label-text { animation-delay: -0.9s; animation-duration: 4.2s; }
  .label-set--glitch .pc-label:nth-child(3) .pc-label-text { animation-delay: -2.1s; animation-duration: 3.1s; }
  .label-set--glitch .pc-label:nth-child(4) .pc-label-text { animation-delay: -1.5s; animation-duration: 4.7s; }

  @keyframes sc-label-glitch {
    0%, 90%, 100% {
      text-shadow: none;
      transform: translateX(0);
    }
    91% {
      text-shadow: -2px 0 #ff2e88, 2px 0 #2ee6ff;
      transform: translateX(1px);
    }
    93% {
      text-shadow: 2px 0 #ff2e88, -2px 0 #2ee6ff;
      transform: translateX(-2px);
    }
    95% {
      text-shadow: -1px 0 #ff2e88, 1px 0 #2ee6ff;
      transform: translateX(1px);
    }
    97% {
      text-shadow: none;
      transform: translateX(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .label-set--glitch .pc-label-text {
      animation: none;
    }
  }
</style>
