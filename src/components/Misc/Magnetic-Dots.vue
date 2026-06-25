<template>
  <canvas ref="canvasRef" class="magnetic-dots-canvas" :class="{ disabled: isDisabled }" />
</template>

<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref } from 'vue';

  defineProps<{ isDisabled?: boolean }>();

  type DotState = {
    baseX: number; baseY: number;
    x: number; y: number;
    vx: number; vy: number;
    scale: number; alpha: number;
  };

  const canvasRef = ref<HTMLCanvasElement | null>(null);

  const dotSizePx = 3;
  const gapRem = 2;
  const dragRadius = 6;
  const scaleRadius = 2;
  const brightnessRadius = 9;
  const maxScale = 1.1;
  const minAlpha = 0.2;
  const maxAlpha = 0.95;
  const stiffness = 0.12;
  const damping = 0.82;
  const scaleLerp = 0.18;
  const alphaLerp = 0.2;
  const colorLerp = 0.04;

  let dotStates: DotState[] = [];
  const mouse = { x: 0, y: 0, active: false };
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
    currentRgb.r += (targetRgb.r - currentRgb.r) * colorLerp;
    currentRgb.g += (targetRgb.g - currentRgb.g) * colorLerp;
    currentRgb.b += (targetRgb.b - currentRgb.b) * colorLerp;
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
          const strength = 1 - dist / dragRadiusPx;
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
      ctx.fillStyle = `rgba(${dotR},${dotG},${dotB},${s.alpha})`;
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
  };

  const handleMouseLeave = () => { mouse.active = false; };

  const handleResize = () => {
    if (resizeRaf) return;
    resizeRaf = requestAnimationFrame(() => { resizeRaf = 0; buildGrid(); });
  };

  onMounted(() => {
    buildGrid();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('blur', handleMouseLeave);
    animationRaf = requestAnimationFrame(animateDots);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseleave', handleMouseLeave);
    window.removeEventListener('blur', handleMouseLeave);
    if (resizeRaf) { cancelAnimationFrame(resizeRaf); resizeRaf = 0; }
    if (animationRaf) { cancelAnimationFrame(animationRaf); animationRaf = 0; }
  });
</script>

<style lang="scss" scoped>
  .magnetic-dots-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: auto;
    opacity: 1;

    &.disabled {
      pointer-events: none;
    }
  }
</style>
