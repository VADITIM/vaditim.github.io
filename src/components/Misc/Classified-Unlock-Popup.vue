<template>
  <div v-if="mounted" ref="overlayRef" class="sup-overlay">
    <div ref="cardRef" class="sup-card">
      <div class="sup-eyebrow">CLASSIFIED SECTION</div>
      <div class="sup-title">UNLOCKED!</div>
      <p class="sup-note">A new entry just landed at the bottom of the nav.</p>
      <MagneticButton type="button" class="sup-confirm-wrap" :zone="18" @click="dismiss">GOT IT</MagneticButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { nextTick, ref, watch } from 'vue'
  import { gsap } from 'gsap'
  import { showUnlockPopup } from '@modules/sectionsClassifiedUnlock'
  import MagneticButton from '@components/Misc/Magnetic-Button.vue'

  const mounted = ref(false)
  const overlayRef = ref<HTMLElement | null>(null)
  const cardRef = ref<HTMLElement | null>(null)

  function playReveal() {
    if (!overlayRef.value || !cardRef.value) return
    gsap.killTweensOf([overlayRef.value, cardRef.value])
    gsap.fromTo(overlayRef.value, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' })
    gsap.fromTo(cardRef.value, { y: 24, opacity: 0, scale: 0.94 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.6)', delay: 0.05 })
  }

  function dismiss() {
    if (!overlayRef.value || !cardRef.value) return
    gsap.killTweensOf([overlayRef.value, cardRef.value])
    gsap.to(cardRef.value, { y: 16, opacity: 0, scale: 0.96, duration: 0.22, ease: 'power2.in' })
    gsap.to(overlayRef.value, {
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        mounted.value = false
        showUnlockPopup.value = false
      },
    })
  }

  watch(showUnlockPopup, async (shouldShow) => {
    if (!shouldShow) return
    mounted.value = true
    await nextTick()
    playReveal()
  })
</script>

<style scoped lang="scss">
  @use "@styleVariables" as *;

  // Sits above every section but below the nav (z-index 20 in Navigator.vue),
  // so the nav reads as untouched by the darken-out while everything else dims.
  .sup-overlay {
    position: fixed;
    inset: 0;
    z-index: 18;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.65);
  }

  .sup-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 40px 56px;
    border-radius: 16px;
    background: rgba(18, 18, 18, 0.95);
    border: 1px solid #8a2be2;
    box-shadow: 0 0 60px rgba(138, 43, 226, 0.45);
    text-align: center;
  }

  .sup-eyebrow {
    font-family: 'Audiowide';
    font-size: 11px;
    letter-spacing: 5px;
    color: #8a2be2;
  }

  .sup-title {
    font-family: 'Wosker';
    font-size: 2.6rem;
    line-height: 1;
    color: #fff;
    text-shadow: 0 0 22px #8a2be2;
  }

  .sup-note {
    font-family: 'Mono';
    font-size: 12px;
    color: #9a9a9a;
    margin: 4px 0 6px;
  }

  .sup-confirm-wrap {
    :deep(.mag-btn) {
      padding: 14px 32px;
      font-family: 'Audiowide';
      font-size: 12px;
      letter-spacing: 2px;
      color: #0e0e0e;
      background: #8a2be2;
      border-radius: 6px;
    }
  }
</style>
