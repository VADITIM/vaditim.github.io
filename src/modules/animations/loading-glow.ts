import { gsap } from 'gsap';

export interface GlowHandle {
  cleanup: () => void;
}

/**
 * Loading-page glow. One master timeline drives everything.
 *
 *  Phase 1 — left → centre, 17.5% → 15% width  (slower)
 *  Phase 2 — centre → right, 15% → 10% width    (slower)
 *  Phase 3 — nested infinite: right → left → right …
 *  Breathe  — independent opacity pulse
 *
 * transformToLine() kills the loop and collapses the glow into a 2px
 * full-width horizontal line, ready for the CSS border hand-off.
 */
export function playLoadingGlow(container: HTMLElement, delay = 0): GlowHandle {
  const vw = window.innerWidth;

  const W_ENTER = vw * 0.40;
  const W_MID   = vw * 0.32;
  const W_LOOP  = vw * 0.22;

  const X_LEFT   = -vw * 0.35;
  const X_CENTER =  0;
  const X_RIGHT  =  vw * 0.35;

  const glow = document.createElement('div');
  Object.assign(glow.style, {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: `${W_ENTER}px`,
    height: '12vh',
    background: 'radial-gradient(ellipse 100% 40% at center, rgba(255,255,255,0.9) 0%, transparent 70%)',
    filter: 'blur(10px)',
    pointerEvents: 'none',
    zIndex: '5',
    mixBlendMode: 'screen',
    borderRadius: '0',
    opacity: '0',
  });

  container.appendChild(glow);
  gsap.set(glow, { xPercent: -50, yPercent: -50, x: X_LEFT, opacity: 0 });

  const loop = gsap.timeline({ repeat: -1 });
  loop.to(glow, { x: X_LEFT,  duration: 6, ease: 'sine.inOut' });
  loop.to(glow, { x: X_RIGHT, duration: 6, ease: 'sine.inOut' });

  const master = gsap.timeline({ delay });

  // Phase 1 — enter: left → centre, shrink (slower)
  master.to(glow, {
    x: X_CENTER,
    width: W_MID,
    opacity: 0.65,
    duration: 2.0,
    ease: 'power2.inOut',
  });

  // Phase 2 — settle: centre → right, shrink to loop size (slower)
  master.to(glow, {
    x: X_RIGHT,
    width: W_LOOP,
    filter: 'blur(7px)',
    opacity: 0.30,
    duration: 1.6,
    ease: 'power2.inOut',
  });

  // Phase 3 — seamless hand-off into the infinite loop
  master.add(loop);

  // Breathe starts when the settle phase ends
  master.to(glow, {
    opacity: 0.08,
    duration: 3.2,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
  }, `-=${1.6}`);

  function cleanup() {
    master.kill();
    loop.kill();
    glow.remove();
  }

  return { cleanup };
}
