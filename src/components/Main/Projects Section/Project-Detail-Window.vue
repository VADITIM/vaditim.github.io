<template>
  <!-- Always mounted (GSAP needs a persistent target); visibility is driven by
       autoAlpha in the open/close timelines, never v-if. -->
  <div ref="rootRef" class="pdw" aria-hidden="true">
    <div ref="scrimRef" class="pdw-scrim" @click="close"></div>

    <div ref="winRef" class="pdw-window">
      <div ref="borderRef" class="pdw-border"></div>

      <button ref="closeRef" class="pdw-close" @click="close" aria-label="Close">✕</button>

      <div class="pdw-titlebar">
        <div ref="kickerRef" class="pdw-kicker">PROJECT&nbsp;·&nbsp;DETAIL</div>
        <div class="pdw-title-clip">
          <div ref="titleRef" class="pdw-title">{{ project.name }}</div>
        </div>
      </div>

      <div class="pdw-grid">

        <!-- primary image -->
        <div ref="mainRef" class="pdw-media pdw-main">
          <div class="pdw-media-img" :style="{ backgroundImage: `url(${project.image1})` }"></div>
          <div class="pdw-media-tag">IMAGE&nbsp;01</div>
        </div>

        <!-- tech stack column -->
        <div class="pdw-tech">
          <div
            v-for="row in techRows"
            :key="row.label"
            ref="techRefs"
            class="pdw-tech-row"
          >
            <div class="pdw-tech-ico" :style="{ backgroundImage: `url(${row.icon})` }"></div>
            <span class="pdw-tech-label">{{ row.label }}</span>
          </div>
        </div>

        <!-- secondary image -->
        <div ref="sideRef" class="pdw-media pdw-side">
          <div class="pdw-media-img" :style="{ backgroundImage: `url(${project.image2})` }"></div>
          <div class="pdw-media-tag">IMAGE&nbsp;02</div>
        </div>

        <!-- description -->
        <div ref="descRef" class="pdw-desc">
          <div class="pdw-desc-meta">{{ String(project.year).toUpperCase() }}</div>
          <p class="pdw-desc-text">{{ project.description }}</p>
        </div>

        <!-- github / action -->
        <a
          ref="ghubRef"
          class="pdw-ghub"
          :href="project.link"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="pdw-ghub-label">GitHub</span>
          <div class="pdw-ghub-btn">
            <div class="pdw-ghub-ico" :style="{ backgroundImage: `url(${actionIcon})` }"></div>
          </div>
        </a>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
  import { gsap } from 'gsap'
  import { activeProjectIndex, projects } from '@modules/sectionsProjects'

  import downloadIcon from '@assets/images/icons/download.png'
  import infoIcon from '@assets/images/icons/info.png'
  import playIcon from '@assets/images/icons/play.png'

  const rootRef = ref<HTMLElement | null>(null)
  const scrimRef = ref<HTMLElement | null>(null)
  const winRef = ref<HTMLElement | null>(null)
  const borderRef = ref<HTMLElement | null>(null)
  const closeRef = ref<HTMLElement | null>(null)
  const kickerRef = ref<HTMLElement | null>(null)
  const titleRef = ref<HTMLElement | null>(null)
  const mainRef = ref<HTMLElement | null>(null)
  const sideRef = ref<HTMLElement | null>(null)
  const techRefs = ref<HTMLElement[]>([])
  const descRef = ref<HTMLElement | null>(null)
  const ghubRef = ref<HTMLElement | null>(null)

  // Keep showing the last opened project while the close animation plays out so
  // the content never blanks mid-transition.
  const shownIndex = ref(0)
  const project = computed(() => projects[shownIndex.value] ?? projects[0])

  const techRows = computed(() => [
    { label: 'Engine', icon: project.value.engine },
    { label: 'Platform', icon: project.value.platform },
    { label: 'Language', icon: project.value.language },
  ])

  const actionIcon = computed(() => {
    switch (project.value.type) {
      case 'play': return playIcon
      case 'info': return infoIcon
      default: return downloadIcon
    }
  })

  let openTl: gsap.core.Timeline | null = null

  function targets() {
    return {
      win: winRef.value,
      border: borderRef.value,
      close: closeRef.value,
      kicker: kickerRef.value,
      title: titleRef.value,
      main: mainRef.value,
      side: sideRef.value,
      tech: techRefs.value,
      desc: descRef.value,
      ghub: ghubRef.value,
    }
  }

  // ── enter: window slides + scales in, then every element animates in turn ──
  function playOpen() {
    const t = targets()
    openTl?.kill()
    gsap.killTweensOf(Object.values(t).flat())

    gsap.set(rootRef.value, { autoAlpha: 1, pointerEvents: 'auto' })
    gsap.set(scrimRef.value, { autoAlpha: 0 })
    gsap.set(t.win, { autoAlpha: 0, y: 60, scale: 0.9, transformOrigin: 'center bottom' })
    gsap.set(t.border, { '--draw': 0 })
    gsap.set(t.close, { autoAlpha: 0, scale: 0, rotate: -90 })
    gsap.set(t.kicker, { autoAlpha: 0, x: -24 })
    gsap.set(t.title, { yPercent: 120, skewY: 6 })
    gsap.set(t.main, { autoAlpha: 0, x: -70, scale: 0.94 })
    gsap.set(t.side, { autoAlpha: 0, x: 70, scale: 0.94 })
    gsap.set(t.tech, { autoAlpha: 0, x: 40 })
    gsap.set(t.desc, { autoAlpha: 0, y: 28 })
    gsap.set(t.ghub, { autoAlpha: 0, scale: 0 })

    openTl = gsap.timeline()
    openTl.to(scrimRef.value, { autoAlpha: 1, duration: 0.35, ease: 'power2.out' }, 0)
    openTl.to(t.win, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.5)' }, 0.05)
    // the red border draws itself around the frame
    openTl.to(t.border, { '--draw': 1, duration: 0.6, ease: 'power2.inOut' }, 0.2)
    openTl.to(t.title, { yPercent: 0, skewY: 0, duration: 0.7, ease: 'expo.out' }, 0.3)
    openTl.to(t.kicker, { autoAlpha: 1, x: 0, duration: 0.5, ease: 'power3.out' }, 0.35)
    openTl.to(t.main, { autoAlpha: 1, x: 0, scale: 1, duration: 0.7, ease: 'back.out(1.3)' }, 0.38)
    openTl.to(t.side, { autoAlpha: 1, x: 0, scale: 1, duration: 0.7, ease: 'back.out(1.3)' }, 0.46)
    openTl.to(t.tech, { autoAlpha: 1, x: 0, duration: 0.55, ease: 'back.out(1.8)', stagger: 0.1 }, 0.5)
    openTl.to(t.desc, { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power3.out' }, 0.6)
    openTl.to(t.ghub, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(2.4)' }, 0.7)
    openTl.to(t.close, { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.5, ease: 'back.out(2.2)' }, 0.75)
  }

  // ── leave: snappy reverse — every element exits, then the window drops away ──
  function playClose() {
    const t = targets()
    openTl?.kill()
    gsap.killTweensOf(Object.values(t).flat())

    const tl = gsap.timeline({
      onComplete: () => { gsap.set(rootRef.value, { autoAlpha: 0, pointerEvents: 'none' }) },
    })
    tl.to(t.ghub, { autoAlpha: 0, scale: 0, duration: 0.18, ease: 'power2.in' }, 0)
    tl.to(t.close, { autoAlpha: 0, scale: 0, rotate: -90, duration: 0.18, ease: 'power2.in' }, 0)
    tl.to(t.tech, { autoAlpha: 0, x: 40, duration: 0.2, ease: 'power2.in', stagger: { each: 0.05, from: 'end' } }, 0)
    tl.to(t.desc, { autoAlpha: 0, y: 28, duration: 0.2, ease: 'power2.in' }, 0)
    tl.to(t.main, { autoAlpha: 0, x: -70, duration: 0.22, ease: 'power2.in' }, 0.04)
    tl.to(t.side, { autoAlpha: 0, x: 70, duration: 0.22, ease: 'power2.in' }, 0.04)
    tl.to(t.title, { yPercent: -120, skewY: -4, duration: 0.24, ease: 'power2.in' }, 0.06)
    tl.to(t.border, { '--draw': 0, duration: 0.25, ease: 'power2.in' }, 0.06)
    tl.to(t.win, { autoAlpha: 0, y: 60, scale: 0.9, duration: 0.3, ease: 'power3.in' }, 0.12)
    tl.to(scrimRef.value, { autoAlpha: 0, duration: 0.3, ease: 'power2.in' }, 0.16)
  }

  function close() {
    activeProjectIndex.value = null
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape' && activeProjectIndex.value !== null) close()
  }

  watch(activeProjectIndex, (idx) => {
    if (idx !== null) {
      shownIndex.value = idx
      playOpen()
    } else {
      playClose()
    }
  })

  onMounted(() => {
    gsap.set(rootRef.value, { autoAlpha: 0, pointerEvents: 'none' })
    window.addEventListener('keydown', onKey)
  })

  onBeforeUnmount(() => {
    openTl?.kill()
    openTl = null
    window.removeEventListener('keydown', onKey)
  })
</script>

<style scoped lang="scss">
  @use "@styleVariables" as *;

  .pdw {
    position: absolute;
    inset: 0;
    z-index: 40;
    display: flex;
    align-items: center;
    justify-content: center;
    // translateY of the section is undone by inset:0 against the section box;
    // this overlay fills the viewport the section occupies.
  }

  .pdw-scrim {
    position: absolute;
    inset: 0;
    background: rgba(8, 2, 4, 0.78);
    backdrop-filter: blur(6px);
    cursor: pointer;
    will-change: opacity;
  }

  .pdw-window {
    position: relative;
    width: min(1120px, 90vw);
    height: min(660px, 84vh);
    border-radius: 20px;
    background:
      radial-gradient(120% 140% at 0% 0%, #15090c 0%, #0c0608 60%),
      #0c0608;
    box-shadow: 0 50px 120px rgba(0, 0, 0, 0.7);
    padding: clamp(20px, 3vw, 40px);
    will-change: transform, opacity;
  }

  // Self-drawing red frame: the conic mask reveals the border clockwise via --draw.
  .pdw-border {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 2px;
    pointer-events: none;
    background: linear-gradient(135deg, #ff2b4d, #DC143C 50%, #8d0d24);
    box-shadow: 0 0 28px rgba(220, 20, 60, 0.45);
    -webkit-mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
            mask-composite: exclude;
    // reveal sweep
    --draw: 1;
    opacity: var(--draw);
    will-change: opacity;
  }

  .pdw-close {
    position: absolute;
    top: 16px;
    right: 18px;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 1px solid #6a2c38;
    background: rgba(20, 8, 11, 0.7);
    color: #ff7588;
    font-size: 14px;
    cursor: pointer;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    will-change: transform, opacity;
    transition: background 0.25s, color 0.25s;

    &:hover {
      background: #DC143C;
      color: #fff;
    }
  }

  .pdw-titlebar {
    position: relative;
    margin-bottom: clamp(14px, 2vw, 24px);
  }

  .pdw-kicker {
    font-family: 'Audiowide';
    font-size: 10px;
    letter-spacing: 5px;
    color: #ff506e;
    will-change: transform, opacity;
  }

  .pdw-title-clip {
    overflow: hidden;
    padding: 2px 0;
  }

  .pdw-title {
    font-family: 'Wosker';
    font-size: clamp(28px, 4vw, 50px);
    line-height: 1;
    color: #fff;
    will-change: transform;
  }

  .pdw-grid {
    position: relative;
    height: calc(100% - clamp(46px, 6vw, 84px));
    display: grid;
    grid-template-columns: 1.15fr 0.78fr 1fr;
    grid-template-rows: minmax(0, 1fr) auto;
    grid-template-areas:
      "main tech side"
      "desc tech ghub";
    gap: clamp(14px, 1.8vw, 26px);
  }

  .pdw-media {
    position: relative;
    border-radius: 14px;
    overflow: hidden;
    border: 1px solid #2a151a;
    background: #0a0506;
    will-change: transform, opacity;
  }

  .pdw-main { grid-area: main; }
  .pdw-side { grid-area: side; }

  .pdw-media-img {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    transition: transform 0.6s ease;
  }

  .pdw-media:hover .pdw-media-img {
    transform: scale(1.05);
  }

  .pdw-media-tag {
    position: absolute;
    top: 10px;
    left: 12px;
    font-family: 'Mono';
    font-size: 9px;
    letter-spacing: 3px;
    color: rgba(255, 255, 255, 0.55);
    background: rgba(8, 2, 4, 0.5);
    padding: 3px 7px;
    border-radius: 5px;
  }

  .pdw-tech {
    grid-area: tech;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: clamp(14px, 2.2vh, 28px);
  }

  .pdw-tech-row {
    display: flex;
    align-items: center;
    gap: 16px;
    will-change: transform, opacity;
  }

  .pdw-tech-ico {
    width: 90px;
    height: 90px;
    border-radius: 12px;
    border: 1px solid #2a151a;
    background-color: #0a0506;
    background-size: 58%;
    background-position: center;
    background-repeat: no-repeat;
    flex-shrink: 0;
  }

  .pdw-tech-label {
    font-family: 'Wosker';
    font-size: clamp(18px, 2vw, 26px);
    color: #fff;
  }

  .pdw-desc {
    grid-area: desc;
    align-self: end;
    will-change: transform, opacity;
  }

  .pdw-desc-meta {
    font-family: 'Audiowide';
    font-size: 9px;
    letter-spacing: 3px;
    color: #ff7588;
    margin-bottom: 6px;
  }

  .pdw-desc-text {
    font-family: 'Mono';
    font-size: clamp(11px, 1vw, 13px);
    line-height: 1.6;
    color: #b7a7ab;
    margin: 0;
    max-width: 38ch;
  }

  .pdw-ghub {
    grid-area: ghub;
    align-self: end;
    justify-self: end;
    display: flex;
    align-items: center;
    gap: 16px;
    text-decoration: none;
    will-change: transform, opacity;
  }

  .pdw-ghub-label {
    font-family: 'Wosker';
    font-size: clamp(20px, 2.2vw, 30px);
    color: #fff;
  }

  .pdw-ghub-btn {
    width: clamp(54px, 5vw, 70px);
    height: clamp(54px, 5vw, 70px);
    border-radius: 50%;
    border: 2px solid #DC143C;
    background: rgba(20, 8, 11, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 22px rgba(220, 20, 60, 0.4);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .pdw-ghub:hover .pdw-ghub-btn {
    transform: scale(1.1);
    box-shadow: 0 0 34px rgba(220, 20, 60, 0.65);
  }

  .pdw-ghub-ico {
    width: 52%;
    height: 52%;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
  }
</style>
