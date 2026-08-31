/**
 * WEB-PHASE-10 S5 — lean mobile/tablet continuum (<1251px).
 * No gsap, no ScrollTrigger, no Three.js: a ~2KB module keeps the mobile
 * JS ceiling honest while preserving the experience's character — the
 * left-gutter evidence spine drawn by scroll, section nodes igniting,
 * and staged reveals. All hidden states are applied at runtime only, so
 * no-JS and reduced-motion render the complete static page.
 */
export function initMobile(): void {
  const main = document.querySelector<HTMLElement>('main');
  const hero = document.querySelector<HTMLElement>('.hero');
  const cta = document.querySelector<HTMLElement>('.cta-band');
  if (!main || !hero || !cta) return;

  /* ---- spine ---- */
  const wrap = document.createElement('div');
  wrap.className = 'continuum';
  wrap.setAttribute('aria-hidden', 'true');
  const line = document.createElement('div');
  line.className = 'continuum-line';
  const head = document.createElement('div');
  head.className = 'continuum-head';
  wrap.append(line, head);
  main.appendChild(wrap);

  let top = 0;
  let end = 0;
  const nodes: HTMLElement[] = [];

  const layout = () => {
    const mainTop = main.getBoundingClientRect().top + window.scrollY;
    top = hero.getBoundingClientRect().top + window.scrollY + hero.offsetHeight - 30 - mainTop;
    end = cta.getBoundingClientRect().top + window.scrollY + cta.offsetHeight * 0.5 - mainTop;
    line.style.top = `${top}px`;
    line.style.height = `${end - top}px`;
    line.style.left = '14px';
    head.style.left = '14px';
    nodes.forEach((n) => n.remove());
    nodes.length = 0;
    main.querySelectorAll<HTMLElement>('section').forEach((s) => {
      if (s.classList.contains('hero')) return;
      const y = s.getBoundingClientRect().top + window.scrollY - mainTop;
      if (y <= top || y >= end) return;
      const node = document.createElement('div');
      node.className = 'continuum-node' + (s.classList.contains('section-tight') ? ' human' : '');
      node.style.top = `${y + 2}px`;
      node.style.left = '14px';
      node.style.transform = 'scale(0)';
      node.style.transition = 'transform .4s cubic-bezier(.34,1.56,.64,1)';
      wrap.appendChild(node);
      nodes.push(node);
    });
  };
  layout();
  line.style.transform = 'scaleY(0)';

  let ticking = false;
  const update = () => {
    ticking = false;
    const anchor = window.scrollY + window.innerHeight * 0.62;
    const mainTop = main.getBoundingClientRect().top + window.scrollY;
    const p = Math.min(1, Math.max(0, (anchor - mainTop - top) / (end - top)));
    line.style.transform = `scaleY(${p})`;
    const y = top + (end - top) * p;
    head.style.top = `${y}px`;
    head.style.opacity = p > 0.002 && p < 0.998 ? '1' : '0';
    for (const n of nodes) {
      if (parseFloat(n.style.top) <= y) n.style.transform = 'scale(1)';
    }
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  let rt = 0;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = window.setTimeout(() => { layout(); update(); }, 250);
  });
  update();

  /* ---- staged reveals (IntersectionObserver; below-fold only) ---- */
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          io.unobserve(e.target);
          e.target.classList.add('revealed');
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px' }
  );
  const vh = window.innerHeight * 0.92;
  const stage = (el: Element, index: number) => {
    const h = el as HTMLElement;
    if (h.getBoundingClientRect().top <= vh) return;
    h.style.transitionDelay = `${Math.min(index * 60, 180)}ms`;
    h.classList.add('reveal-pending');
    io.observe(h);
  };
  document.querySelectorAll<HTMLElement>('.reveal-group').forEach((group) => {
    Array.from(group.children).forEach(stage);
  });
  document.querySelectorAll('.trust-strip .shell > span').forEach(stage);
}
