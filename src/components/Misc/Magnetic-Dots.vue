<template>
  <div class="magnetic-dots-root">
    <div ref="hueRef" class="click-hue" />
    <canvas ref="canvasRef" class="magnetic-dots-canvas" :class="{ disabled: isDisabled }" />
  </div>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
  import { onSectionChange, isTransitioning } from '@modules/sectionsCore';

  defineProps<{ isDisabled?: boolean }>();

  type DotState = {
    baseX: number; baseY: number;
    x: number; y: number;
    vx: number; vy: number;
    scale: number; alpha: number;
  };

  const canvasRef = ref<HTMLCanvasElement | null>(null);
  const hueRef = ref<HTMLDivElement | null>(null);

  const dotSizePx = 3;
  const gapRem = 2;
  const dragRadius = 6;
  const scaleRadius = 2;
  const brightnessRadius = 9;
  const maxScale = 1.1;
  const minAlpha = 0.15;
  const maxAlpha = 0.9;
  const stiffness = 0.12;
  const damping = 0.82;
  const scaleLerp = 0.18;
  const alphaLerp = 0.2;

  // Global field fade applied to every dot. On a section change the whole field
  // fades out, swaps to the new color while invisible, then fades back in once
  // the transition has fully ended.
  let fieldAlpha = 1;
  let fade: 'none' | 'out' | 'in' = 'none';
  let colorSwapPending = false;
  const fadeOutSpeed = 0.14; // fast fade-out before the color changes
  const fadeInSpeed = 0.05;  // gentle fade-in at the very end

  // While the pointer is held, the magnetic pull strengthens.
  const pressPullBoost = 2.2;

  let dotStates: DotState[] = [];
  const mouse = { x: 0, y: 0, active: false, pressed: false };
  let animationRaf = 0;
  let resizeRaf = 0;
  let rootFontSize = 16;

  function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
  }

  // Start at the loading color and lerp toward the current section color each frame
  let currentRgb = { r: 91, g: 253, b: 91 };
  let targetRgb  = { r: 91, g: 253, b: 91 };

  const buildGrid = () => {
    const canvas = canvasRef.value;
    if (!canvas) return;

    rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const gapPx = rootFontSize * gapRem;
    const step = dotSizePx + gapPx;

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);

    const cols = Math.max(0, Math.floor((w + gapPx) / step));
    const rows = Math.max(0, Math.floor((h + gapPx) / step));

    dotStates = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const baseX = c * step + dotSizePx / 2;
        const baseY = r * step + dotSizePx / 2;
        dotStates.push({ baseX, baseY, x: 0, y: 0, vx: 0, vy: 0, scale: 1, alpha: minAlpha });
      }
    }
  };

  const animateDots = () => {
    const canvas = canvasRef.value;
    if (!canvas) { animationRaf = requestAnimationFrame(animateDots); return; }
    const ctx = canvas.getContext('2d');
    if (!ctx) { animationRaf = requestAnimationFrame(animateDots); return; }

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    const cssColor = getComputedStyle(document.documentElement).getPropertyValue('--section-color');
    const parsed = hexToRgb(cssColor);
    if (parsed) targetRgb = parsed;

    if (fade === 'out') {
      fieldAlpha = Math.max(0, fieldAlpha - fadeOutSpeed);
    } else if (fade === 'in') {
      fieldAlpha = Math.min(1, fieldAlpha + fadeInSpeed);
      if (fieldAlpha >= 1) fade = 'none';
    }
    // Swap to the new color only once the field is invisible (or immediately when
    // not mid-fade, e.g. the loading → first-section handoff).
    if (colorSwapPending && (fieldAlpha <= 0.02 || fade === 'none')) {
      currentRgb = { ...targetRgb };
      colorSwapPending = false;
    }
    const dotR = Math.round(currentRgb.r);
    const dotG = Math.round(currentRgb.g);
    const dotB = Math.round(currentRgb.b);

    const dragRadiusPx = rootFontSize * dragRadius;
    const scaleRadiusPx = rootFontSize * scaleRadius;
    const brightnessRadiusPx = rootFontSize * brightnessRadius;
    const r = dotSizePx / 2;

    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < dotStates.length; i++) {
      const s = dotStates[i];
      let targetX = 0, targetY = 0, targetScale = 1, targetAlpha = minAlpha;

      if (mouse.active) {
        const dx = mouse.x - s.baseX;
        const dy = mouse.y - s.baseY;
        const dist = Math.hypot(dx, dy);

        if (dist < dragRadiusPx && dist > 0) {
          const strength = (1 - dist / dragRadiusPx) * (mouse.pressed ? pressPullBoost : 1);
          targetX = dx * strength;
          targetY = dy * strength;
        }
        if (dist < scaleRadiusPx) {
          targetScale = 1 + (1 - dist / scaleRadiusPx) * (maxScale - 1);
        }
        if (dist < brightnessRadiusPx) {
          targetAlpha = minAlpha + (1 - dist / brightnessRadiusPx) * (maxAlpha - minAlpha);
        }
      }

      s.vx += (targetX - s.x) * stiffness;
      s.vx *= damping;
      s.x += s.vx;

      s.vy += (targetY - s.y) * stiffness;
      s.vy *= damping;
      s.y += s.vy;

      s.scale += (targetScale - s.scale) * scaleLerp;
      s.alpha += (targetAlpha - s.alpha) * alphaLerp;

      const cx = s.baseX + s.x;
      const cy = s.baseY + s.y;
      const sr = r * s.scale;

      ctx.beginPath();
      ctx.arc(cx, cy, sr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${dotR},${dotG},${dotB},${s.alpha * fieldAlpha})`;
      ctx.fill();
    }

    animationRaf = requestAnimationFrame(animateDots);
  };

  const handleMouseMove = (e: MouseEvent) => {
    const canvas = canvasRef.value;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active =
      e.clientX >= rect.left && e.clientX <= rect.right &&
      e.clientY >= rect.top  && e.clientY <= rect.bottom;

    if (hueHeld) positionHue(e.clientX, e.clientY);
  };

  const handleMouseLeave = () => { mouse.active = false; };

  // Click anywhere → a subtle hue centered on the pointer flashes in (fast) and
  // holds while the button is held, following the cursor when dragged, then fades
  // out on release. Tinted by the active section color via --section-color.
  let hueHeld = false;

  const positionHue = (x: number, y: number) => {
    const hue = hueRef.value;
    if (!hue) return;
    hue.style.setProperty('--hue-x', `${x}px`);
    hue.style.setProperty('--hue-y', `${y}px`);
  };

  const showHue = (e: MouseEvent) => {
    hueHeld = true;
    mouse.pressed = true;
    positionHue(e.clientX, e.clientY);
    hueRef.value?.classList.add('held');
  };

  const hideHue = () => {
    hueHeld = false;
    mouse.pressed = false;
    hueRef.value?.classList.remove('held');
  };

  const handleResize = () => {
    if (resizeRaf) return;
    resizeRaf = requestAnimationFrame(() => { resizeRaf = 0; buildGrid(); });
  };

  // On a section change, fade the field out and queue the color swap; the fade
  // back in happens when the transition fully ends (isTransitioning → false).
  const stopSectionWatch = onSectionChange((_current, previous) => {
    if (previous === -1) {
      // Loading → first section: no transition curtain, just adopt the color.
      colorSwapPending = true;
      return;
    }
    fade = 'out';
    colorSwapPending = true;
  });

  const stopTransitionWatch = watch(isTransitioning, (transitioning) => {
    if (!transitioning) fade = 'in';
  });

  onMounted(() => {
    buildGrid();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('blur', handleMouseLeave);
    window.addEventListener('mousedown', showHue);
    window.addEventListener('mouseup', hideHue);
    window.addEventListener('blur', hideHue);
    animationRaf = requestAnimationFrame(animateDots);
  });

  onBeforeUnmount(() => {
    stopSectionWatch();
    stopTransitionWatch();
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseleave', handleMouseLeave);
    window.removeEventListener('blur', handleMouseLeave);
    window.removeEventListener('mousedown', showHue);
    window.removeEventListener('mouseup', hideHue);
    window.removeEventListener('blur', hideHue);
    if (resizeRaf) { cancelAnimationFrame(resizeRaf); resizeRaf = 0; }
    if (animationRaf) { cancelAnimationFrame(animationRaf); animationRaf = 0; }
  });
</script>

<style lang="scss" scoped>
  .magnetic-dots-root {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  .magnetic-dots-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: auto;
    opacity: 1;

    &.disabled {
      pointer-events: none;
    }
  }

  // Pointer-click hue: a soft radial wash in the active section color, centered
  // on the click. Holds while the button is held, fades out on release.
  .click-hue {
    --hue-x: 50%;
    --hue-y: 50%;
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.45s ease-out; // slow fade-out on release
    background: radial-gradient(
      circle 6.8vmax at var(--hue-x) var(--hue-y),
      color-mix(in srgb, var(--section-color, #5bfd5b) 12%, transparent) 0%,
      transparent 62%
    );

    &.held {
      opacity: 1;
      transition: opacity 0.12s ease-out; // fast flash-in on press
    }
  }
</style>
