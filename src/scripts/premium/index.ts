/**
 * WEB-PHASE-10 S5 — Fable 5 Premium Experience entry (homepage only).
 * Gates: reduced motion → nothing runs (static experience is complete);
 * Lenis + Three.js → desktop pointer:fine only; Three.js additionally
 * requires WebGL and passes a frame-rate guard (see hero-scene.ts).
 * Everything is dynamically imported after the page is interactive —
 * zero blocking work, zero effect on the intake route.
 */
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Stage the hero entrance as early as possible (module eval, before load) so
// the GSAP timeline animates from hidden without a visible flash. The class
// exists only when JS runs with motion allowed — no-JS and reduced-motion
// render the complete static hero. Failsafe: if the premium layer never
// starts (network/runtime failure), unstage after 2.5s.
if (!reduced && window.matchMedia('(min-width: 1251px)').matches) {
  document.documentElement.classList.add('hero-staged');
  window.setTimeout(() => {
    if (!(window as Window & { __heroEntranceRan?: boolean }).__heroEntranceRan) {
      document.documentElement.classList.remove('hero-staged');
    }
  }, 2500);
}

if (!reduced) {
  const boot = () => {
    void init().catch(() => {
      document.documentElement.classList.remove('hero-staged');
      /* premium layer is best-effort; the static site is complete without it */
    });
  };
  if (document.readyState === 'complete') boot();
  else window.addEventListener('load', boot, { once: true });
}

async function init(): Promise<void> {
  const desktop = window.matchMedia('(min-width: 1251px)').matches;
  const fine = window.matchMedia('(pointer: fine)').matches;

  // Below the desktop tier: the lean gsap-free continuum keeps the mobile
  // JS ceiling honest while preserving the experience's character.
  if (!desktop) {
    const { initMobile } = await import('./mobile');
    initMobile();
    return;
  }

  const { gsap } = await import('gsap');
  const { ScrollTrigger } = await import('gsap/ScrollTrigger');
  gsap.registerPlugin(ScrollTrigger);

  // Lenis — desktop only, behind the Founder's gates (native keyboard and
  // anchor behaviour retained; never on mobile; never under reduced motion).
  if (desktop && fine) {
    try {
      const { default: Lenis } = await import('lenis');
      const lenis = new Lenis({ autoRaf: false, lerp: 0.115, anchors: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } catch {
      /* native scroll retained */
    }
  }

  const { initContinuum } = await import('./continuum');
  initContinuum(gsap, ScrollTrigger, { desktop });

  if (desktop && fine) {
    const startScene = () => {
      void import('./hero-scene')
        .then((m) => m.mountHeroScene(gsap, ScrollTrigger))
        .catch(() => {
          /* CSS shell remains — the designed fallback */
        });
    };
    if ('requestIdleCallback' in window) {
      (window as Window & typeof globalThis).requestIdleCallback(startScene, { timeout: 2500 });
    } else {
      setTimeout(startScene, 700);
    }
  }
}
