import { gsap } from 'gsap';

export interface GlowOptions {
  /** Comma-separated RGB values, e.g. '255,255,255'. Default: white. */
  color?: string;
  /** Peak opacity of the glow at the center of the radial gradient. Default: 0.45. */
  peakOpacity?: number;
  /** Duration of the initial left-to-right sweep in seconds. Default: 1.4. */
  sweepDuration?: number;
  /** Duration of each breathe half-cycle in seconds. Default: 2.8. */
  breatheDuration?: number;
  /** Pixel amount the glow drifts left and right during the loop. Default: 14. */
  driftPx?: number;
}

/**
 * Injects a white (or custom) radial glow into `target` that:
 *  1. Sweeps from left to right once (intro).
 *  2. Settles at center, then loops: slow left-right drift + independent opacity breathe.
 *
 * Returns a cleanup function that kills all tweens and removes the glow element.
 * `delay` (seconds) offsets the entire animation — useful for syncing with page load sequences.
 */
export function attachGlowAnimation(
  target: HTMLElement,
  options: GlowOptions = {},
  delay = 0,
): () => void {
  const {
    color = '255,255,255',
    peakOpacity = 0.7,
    sweepDuration = 1.4,
    breatheDuration = 2.8,
    driftPx = 14,
  } = options;

  const glow = document.createElement('div');
  Object.assign(glow.style, {
    position: 'absolute',
    top: '-50%',
    left: '50%',
    width: '140%',
    height: '300%',
    background: `radial-gradient(ellipse at center, rgba(${color},${peakOpacity}) 0%, transparent 60%)`,
    filter: 'blur(28px)',
    pointerEvents: 'none',
    zIndex: '5',
    mixBlendMode: 'screen',
    borderRadius: '0',
    opacity: '0',
  });

  target.appendChild(glow);

  let driftTween: gsap.core.Tween | null = null;
  let breatheTween: gsap.core.Tween | null = null;

  // xPercent -250 → glow center is at 50% - 250% × 80% = 50% - 200% = -150% of parent (off-left)
  // xPercent  -50 → glow center is at 50% -  50% × 80% = 50% -  40% =   10%+40% = 50% of parent (centered)
  gsap.set(glow, { xPercent: -250, opacity: 0 });

  const tl = gsap.timeline({
    delay,
    onComplete() {
      // Drift: oscillate ± driftPx horizontally, independent of the sweep transform
      driftTween = gsap.fromTo(
        glow,
        { x: -driftPx },
        {
          x: driftPx,
          duration: breatheDuration * 1.3,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        },
      );

      // Breathe: pulse opacity independently
      breatheTween = gsap.to(glow, {
        opacity: peakOpacity * 0.28,
        duration: breatheDuration,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
    },
  });

  // Sweep left → center
  tl.to(glow, {
    xPercent: -50,
    opacity: 1,
    duration: sweepDuration,
    ease: 'power2.inOut',
  });

  return () => {
    tl.kill();
    driftTween?.kill();
    breatheTween?.kill();
    glow.remove();
  };
}
