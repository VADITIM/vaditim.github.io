<template>
  <div class="info-background-container">
    <div
      class="dots-grid"
      ref="gridRef"
      :style="{
        gridTemplateColumns: `repeat(${columns}, 3px)`,
        gridTemplateRows: `repeat(${rows}, 3px)`,
        gap: `${gapRem}rem`,
      }"
    >
      <span
        v-for="dot in dots"
        :key="dot"
        ref="dotRefs"
        class="dot"
      ></span>
    </div>
  </div>
</template>

<script setup lang="ts">
    import {
    nextTick,
    onBeforeUnmount,
    onBeforeUpdate,
    onMounted,
    ref,
    } from "vue";

    const dotSizePx = 3;
    const gapRem = 2;
    const dragRadiusRem = 6;
    const scaleRadiusRem = 2;
    const maxScale = 1.1;

    const columns = ref(0);
    const rows = ref(0);
    const dots = ref<number[]>([]);
    const gridRef = ref<HTMLElement | null>(null);
    const dotRefs = ref<HTMLElement[]>([]);
    const rootFontSize = ref(16);

    type DotState = {
    baseX: number;
    baseY: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    scale: number;
    };

    const dotStates = ref<DotState[]>([]);
    const mouse = {
    x: 0,
    y: 0,
    active: false,
    };

    const computeGrid = () => {
    const rootSize = parseFloat(
        getComputedStyle(document.documentElement).fontSize
    );
    rootFontSize.value = rootSize;
    const gapPx = rootSize * gapRem;
    const width = window.innerWidth;
    const height = window.innerHeight;

    const cols = Math.max(
        0,
        Math.floor((width + gapPx) / (dotSizePx + gapPx))
    );
    const rws = Math.max(
        0,
        Math.floor((height + gapPx) / (dotSizePx + gapPx))
    );

    columns.value = cols;
    rows.value = rws;
    const count = cols * rws;
    dots.value = Array.from({ length: count }, (_, index) => index);
    nextTick(() => {
        updateDotStates();
    });
    };

    const updateDotStates = () => {
    if (!gridRef.value) return;
    const gridRect = gridRef.value.getBoundingClientRect();
    const newStates: DotState[] = dotRefs.value.map((el) => {
        const rect = el.getBoundingClientRect();
        const baseX = rect.left - gridRect.left + rect.width / 2;
        const baseY = rect.top - gridRect.top + rect.height / 2;
        return {
        baseX,
        baseY,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        scale: 1,
        };
    });
    dotStates.value = newStates;
    };

    let resizeRaf = 0;
    const handleResize = () => {
    if (resizeRaf) return;
    resizeRaf = window.requestAnimationFrame(() => {
        resizeRaf = 0;
        computeGrid();
    });
    };

    let animationRaf = 0;
    const animateDots = () => {
    const states = dotStates.value;
    const elements = dotRefs.value;

    const dragRadiusPx = rootFontSize.value * dragRadiusRem;
    const scaleRadiusPx = rootFontSize.value * scaleRadiusRem;
    const stiffness = 0.12;
    const damping = 0.82;
    const scaleLerp = 0.18;

    if (states.length && states.length === elements.length) {
        for (let i = 0; i < states.length; i += 1) {
        const state = states[i];
        let targetX = 0;
        let targetY = 0;
        let targetScale = 1;

        if (mouse.active) {
            const dx = mouse.x - state.baseX;
            const dy = mouse.y - state.baseY;
            const dist = Math.hypot(dx, dy);

            if (dist < dragRadiusPx && dist > 0) {
            const strength = 1 - dist / dragRadiusPx;
            targetX = dx * strength;
            targetY = dy * strength;
            }

            if (dist < scaleRadiusPx) {
            const scaleStrength = 1 - dist / scaleRadiusPx;
            targetScale = 1 + scaleStrength * (maxScale - 1);
            }
        }

        state.vx += (targetX - state.x) * stiffness;
        state.vx *= damping;
        state.x += state.vx;

        state.vy += (targetY - state.y) * stiffness;
        state.vy *= damping;
        state.y += state.vy;

        state.scale += (targetScale - state.scale) * scaleLerp;

        elements[i].style.transform = `translate(${state.x}px, ${state.y}px) scale(${state.scale})`;
        }
    }

    animationRaf = window.requestAnimationFrame(animateDots);
    };

    const handleMouseMove = (event: MouseEvent) => {
    if (!gridRef.value) return;
    const rect = gridRef.value.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

    mouse.x = x;
    mouse.y = y;
    mouse.active = inside;
    };

    const handleMouseLeave = () => {
    mouse.active = false;
    };

    onBeforeUpdate(() => {
    dotRefs.value = [];
    });

    onMounted(() => {
    computeGrid();
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("blur", handleMouseLeave);
    animationRaf = window.requestAnimationFrame(animateDots);
    });

    onBeforeUnmount(() => {
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseleave", handleMouseLeave);
    window.removeEventListener("blur", handleMouseLeave);
    if (resizeRaf) {
        window.cancelAnimationFrame(resizeRaf);
        resizeRaf = 0;
    }
    if (animationRaf) {
        window.cancelAnimationFrame(animationRaf);
        animationRaf = 0;
    }
    });
</script>

<style lang="scss" scoped>
  .info-background-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: -1;
  }

  .dot {
    width: 5px;
    height: 5px;
    background-color: rgba(38, 27, 192, 0.582);
    border-radius: 50%;
    transform-origin: center;
    will-change: transform;
  }

  .dots-grid {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: repeat(20, 1fr);
    grid-template-rows: repeat(20, 1fr);
    gap: 20px;
  }
</style>
