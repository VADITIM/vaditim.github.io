<template>
  <div class="magnetic-dots-root">
    <div ref="hueRef" class="click-hue" />
    <canvas ref="canvasRef" class="magnetic-dots-canvas" :class="{ disabled: isDisabled }" />
  </div>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
  import { onSectionChange, isTransitioning, currentSection } from '@modules/sectionsCore';
  import { getSectionIndexById } from '@modules/sectionLookup';

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

  function hexToRgb(hex: string): { red: number; green: number; blue: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
    return result ? { red: parseInt(result[1], 16), green: parseInt(result[2], 16), blue: parseInt(result[3], 16) } : null;
  }

  // Start at the loading color and lerp toward the current section color each frame
  let currentRgb = { red: 91, green: 253, blue: 91 };
  let targetRgb  = { red: 91, green: 253, blue: 91 };

  // Perks' bright yellow reads too hot at the same alpha range as the other
  // sections' dot fields; dim it specifically for that section.
  const perksSectionIndex = getSectionIndexById('perks');
  const perksBrightness = 0.55;

  const buildGrid = () => {
    const canvas = canvasRef.value;
    if (!canvas) return;

    rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const gapPx = rootFontSize * gapRem;
    const step = dotSizePx + gapPx;

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    const context = canvas.getContext('2d');
    if (context) context.scale(pixelRatio, pixelRatio);

    const columnCount = Math.max(0, Math.floor((width + gapPx) / step));
    const rowCount = Math.max(0, Math.floor((height + gapPx) / step));

    dotStates = [];
    for (let row = 0; row < rowCount; row++) {
      for (let column = 0; column < columnCount; column++) {
        const baseX = column * step + dotSizePx / 2;
        const baseY = row * step + dotSizePx / 2;
        dotStates.push({ baseX, baseY, x: 0, y: 0, vx: 0, vy: 0, scale: 1, alpha: minAlpha });
      }
    }
  };

  const animateDots = () => {
    const canvas = canvasRef.value;
    if (!canvas) { animationRaf = requestAnimationFrame(animateDots); return; }
    const context = canvas.getContext('2d');
    if (!context) { animationRaf = requestAnimationFrame(animateDots); return; }

    const pixelRatio = window.devicePixelRatio || 1;
    const width = canvas.width / pixelRatio;
    const height = canvas.height / pixelRatio;

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
    const dotRed = Math.round(currentRgb.red);
    const dotGreen = Math.round(currentRgb.green);
    const dotBlue = Math.round(currentRgb.blue);

    const dragRadiusPx = rootFontSize * dragRadius;
    const scaleRadiusPx = rootFontSize * scaleRadius;
    const brightnessRadiusPx = rootFontSize * brightnessRadius;
    const dotRadius = dotSizePx / 2;

    context.clearRect(0, 0, width, height);

    for (let index = 0; index < dotStates.length; index++) {
      const dot = dotStates[index];
      let targetX = 0, targetY = 0, targetScale = 1, targetAlpha = minAlpha;

      if (mouse.active) {
        const dx = mouse.x - dot.baseX;
        const dy = mouse.y - dot.baseY;
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

      dot.vx += (targetX - dot.x) * stiffness;
      dot.vx *= damping;
      dot.x += dot.vx;

      dot.vy += (targetY - dot.y) * stiffness;
      dot.vy *= damping;
      dot.y += dot.vy;

      dot.scale += (targetScale - dot.scale) * scaleLerp;
      dot.alpha += (targetAlpha - dot.alpha) * alphaLerp;

      const centerX = dot.baseX + dot.x;
      const centerY = dot.baseY + dot.y;
      const scaledRadius = dotRadius * dot.scale;

      const sectionDim = currentSection.value === perksSectionIndex ? perksBrightness : 1;

      context.beginPath();
      context.arc(centerX, centerY, scaledRadius, 0, Math.PI * 2);
      context.fillStyle = `rgba(${dotRed},${dotGreen},${dotBlue},${dot.alpha * fieldAlpha * sectionDim})`;
      context.fill();
    }

    animationRaf = requestAnimationFrame(animateDots);
  };

  const handleMouseMove = (event: MouseEvent) => {
    const canvas = canvasRef.value;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
    mouse.active =
      event.clientX >= rect.left && event.clientX <= rect.right &&
      event.clientY >= rect.top  && event.clientY <= rect.bottom;

    if (hueHeld) positionHue(event.clientX, event.clientY);
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

  const showHue = (event: MouseEvent) => {
    hueHeld = true;
    mouse.pressed = true;
    positionHue(event.clientX, event.clientY);
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
