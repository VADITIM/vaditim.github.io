<template>
  <div class="section-transition" aria-hidden="true">
    <div class="section-transition-shutters">
      <div
        v-for="i in BAR_COUNT"
        :key="i"
        class="section-transition-shutter"
        :class="i % 2 === 1 ? 'origin-left' : 'origin-right'"
      ></div>
    </div>
    <div class="section-transition-label">
      <div class="section-transition-kicker-clip">
        <div class="section-transition-kicker"></div>
      </div>
      <div class="section-transition-heading-clip">
        <div class="section-transition-heading"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, onMounted } from 'vue'
  import { RegisterSectionTransition } from '@modules/sectionsTransition'

  const BAR_COUNT = 6

  let cleanup: (() => void) | null = null

  onMounted(() => {
    cleanup = RegisterSectionTransition()
  })

  onBeforeUnmount(() => {
    cleanup?.()
    cleanup = null
  })
</script>

<style scoped lang="scss">
  .section-transition {
    position: fixed;
    inset: 0;
    z-index: 40;
    pointer-events: none;
  }

  .section-transition-shutters {
    position: absolute;
    // Extend 2px past each edge so subpixel gaps at the viewport border can't show.
    top: -2px;
    left: 0;
    right: 0;
    bottom: -2px;
    display: flex;
    flex-direction: column;
  }

  .section-transition-shutter {
    flex: 1;
    border-radius: 0;
    transform: scaleX(0);
    will-change: transform;

    &.origin-left {
      transform-origin: left center;
    }

    &.origin-right {
      transform-origin: right center;
    }
  }

  .section-transition-label {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .section-transition-kicker-clip {
    overflow: hidden;
    padding: 2px 0;
    margin-bottom: 6px;
  }

  .section-transition-kicker {
    font-family: 'Audiowide';
    font-size: 12px;
    letter-spacing: 6px;
    opacity: 0;
  }

  .section-transition-heading-clip {
    overflow: hidden;
    padding: 4px 0;
  }

  .section-transition-heading {
    font-family: 'Wosker';
    font-size: clamp(60px, 10vw, 110px);
    line-height: 0.95;
    color: #fff;
    opacity: 0;
    will-change: transform;
  }
</style>
