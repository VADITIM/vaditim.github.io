<template>
  <button
    ref="buttonRef"
    type="button"
    class="settings-button"
    :class="{ 'settings-button--open': isOpen }"
    aria-label="Open settings"
    @click="openSettings"
  >
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="3.2" />
      <path
        d="M12 2.6l1.5 2.6 3-.4.6 3 2.6 1.5-1.4 2.7 1.4 2.7-2.6 1.5-.6 3-3-.4L12 21.4l-1.5-2.6-3 .4-.6-3-2.6-1.5L5.7 12 4.3 9.3l2.6-1.5.6-3 3 .4z"
      />
    </svg>
  </button>

  <div v-if="isOpen" ref="backdropRef" class="settings-backdrop" @click.self="closeSettings">
    <Module ref="panelRef" class="settings-panel" accent="#8a8a8a" static-visible>
      <template #label>SETTINGS</template>
      <div class="settings-content">
        <div class="settings-row">
          <div class="settings-row-label">ANIMATIONS</div>
          <div class="settings-row-hint">
            Lite drops ambient loops and heavy transitions for a lighter, flatter ride — pick it
            if your browser has no hardware acceleration.
          </div>
          <div class="settings-options">
            <button
              v-for="option in MODE_OPTIONS"
              :key="option.mode"
              type="button"
              class="settings-option"
              :class="{ 'settings-option--active': draftMode === option.mode }"
              @click="draftMode = option.mode"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <button type="button" class="settings-save" @click="saveAndClose">SAVE &amp; CLOSE</button>
      </div>
    </Module>
  </div>
</template>

<script setup lang="ts">
  import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
  import { gsap } from 'gsap'

  import Module from '@components/Misc/Module.vue'
  import { animationMode, setAnimationMode, type AnimationMode } from '@modules/miscAnimationMode'

  // Hidden until the loading page hands off, then popped in from its fixed spot.
  const props = defineProps<{ revealed: boolean }>()

  const MODE_OPTIONS: { mode: AnimationMode; label: string }[] = [
    { mode: 'full', label: 'RECOMMENDED' },
    { mode: 'lite', label: 'LITE' },
  ]

  const isOpen = ref(false)
  // Edited freely while open; only committed by SAVE & CLOSE, so clicking the
  // backdrop discards rather than half-applies a mode change.
  const draftMode = ref<AnimationMode>(animationMode.value)
  const panelRef = ref<InstanceType<typeof Module> | null>(null)
  const buttonRef = ref<HTMLButtonElement | null>(null)

  watch(
    () => props.revealed,
    (isRevealed) => {
      const button = buttonRef.value
      if (!isRevealed || !button) return
      gsap.fromTo(
        button,
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2.2)' },
      )
    },
    { immediate: true, flush: 'post' },
  )

  function openSettings() {
    draftMode.value = animationMode.value
    isOpen.value = true
    void nextTick(() => {
      const panel = panelRef.value?.element
      if (!panel) return
      gsap.fromTo(panel, { opacity: 0, y: 36, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(1.6)', overwrite: 'auto' })
    })
    window.addEventListener('keydown', handleKeydown)
  }

  function closeSettings() {
    window.removeEventListener('keydown', handleKeydown)
    const panel = panelRef.value?.element
    if (!panel) {
      isOpen.value = false
      return
    }
    gsap.to(panel, { opacity: 0, y: 36, scale: 0.96, duration: 0.22, ease: 'back.in(1.6)', overwrite: 'auto', onComplete: () => { isOpen.value = false } })
  }

  // Reload rather than flip live: animation handlers read the mode once, as they
  // register, so a running page cannot switch modes coherently.
  function saveAndClose() {
    if (draftMode.value === animationMode.value) {
      closeSettings()
      return
    }
    setAnimationMode(draftMode.value)
    window.location.reload()
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') closeSettings()
  }

  onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))
</script>

<style scoped lang="scss">
  // Sticky top-right; the Navigator owns right-centre, so this corner is free.
  .settings-button {
    position: fixed;
    top: 1.2rem;
    right: 1.2rem;
    z-index: 900;
    width: 2.4rem;
    height: 2.4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    background: rgba(18, 18, 18, 0.85);
    border: 1px solid #262626;
    border-radius: 10px;
    color: #6a6a6a;
    cursor: pointer;
    opacity: 0;   // revealed by the GSAP pop-in once loading finishes
    transition: color 0.25s ease, border-color 0.25s ease;

    &:hover,
    &--open {
      color: var(--section-color, #8a8a8a);
      border-color: color-mix(in srgb, var(--section-color, #8a8a8a) 40%, #262626);
    }

    svg {
      width: 1.3rem;
      height: 1.3rem;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.4;
      stroke-linejoin: round;
    }
  }

  .settings-backdrop {
    position: fixed;
    inset: 0;
    z-index: 950;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(10, 10, 10, 0.72);
  }

  .settings-panel {
    width: clamp(320px, 34vw, 460px);
  }

  .settings-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1.4rem;
    padding: 0.4rem 0.2rem 0.2rem;
  }

  .settings-row-label {
    font-family: 'Audiowide';
    font-size: 0.8rem;
    letter-spacing: 3px;
    color: #d8d8d8;
  }

  .settings-row-hint {
    margin-top: 0.5rem;
    font-family: 'Mono';
    font-size: 0.72rem;
    line-height: 1.5;
    color: #6a6a6a;
  }

  .settings-options {
    display: flex;
    gap: 0.6rem;
    margin-top: 0.9rem;
  }

  .settings-option {
    flex: 1;
    padding: 0.5rem 0;
    font-family: 'Audiowide';
    font-size: 0.72rem;
    letter-spacing: 3px;
    color: #6a6a6a;
    background: transparent;
    border: 1px solid #2c2c2c;
    border-radius: 6px;
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s, background-color 0.2s;

    &:hover {
      color: #d8d8d8;
    }

    &--active {
      color: #121212;
      background: var(--section-color, #8a8a8a);
      border-color: var(--section-color, #8a8a8a);
    }
  }

  .settings-save {
    align-self: flex-end;
    padding: 0.5rem 1.2rem;
    font-family: 'Audiowide';
    font-size: 0.7rem;
    letter-spacing: 3px;
    color: #d8d8d8;
    background: transparent;
    border: 1px solid #3a3a3a;
    border-radius: 6px;
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s;

    &:hover {
      color: var(--section-color, #d8d8d8);
      border-color: color-mix(in srgb, var(--section-color, #d8d8d8) 50%, #3a3a3a);
    }
  }
</style>
