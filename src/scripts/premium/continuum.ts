/**
 * WEB-PHASE-10 S5 — Operational Continuum choreography.
 * The evidence thread: born in the cockpit, drawn by scroll down the page,
 * branching at 3Ps, connecting the support layer, routing through digital
 * and human capability, converging at Evidence, STOPPING at the human
 * decision boundary (only the human node carries it across) and
 * terminating at the CTA start node. Sequence per Founder approval —
 * behaviour communicates system meaning, never decoration.
 *
 * Static DOM is always the complete final state; this module only ever
 * animates FROM hidden states it sets itself at runtime.
 */
import type { gsap as GSAP } from 'gsap';
import type { ScrollTrigger as ST } from 'gsap/ScrollTrigger';

type Gsap = typeof GSAP;
type STType = typeof ST;

interface Opts {
  desktop: boolean;
}

const EASE = 'power3.out';

export function initContinuum(gsap: Gsap, ScrollTrigger: STType, opts: Opts): void {
  const main = document.querySelector<HTMLElement>('main');
  if (!main) return;

  buildSpine(gsap, ScrollTrigger, main, opts);
  heroHandoff(gsap, ScrollTrigger);
  igniteTrust(gsap);
  spatial3Ps(gsap, opts);
  flowSequence(gsap);
  constellation(gsap, ScrollTrigger);
  splitFork(gsap, opts);
  boundaryMoment(gsap);
  network(gsap);
  industries(gsap, opts);
  valueSweeps(gsap);
  genericReveals(gsap);
  headlineReveals(gsap);
}

/* ---- The spine: one continuous thread down the page ---- */
function buildSpine(gsap: Gsap, ScrollTrigger: STType, main: HTMLElement, opts: Opts): void {
  const hero = document.querySelector<HTMLElement>('.hero');
  const cta = document.querySelector<HTMLElement>('.cta-band');
  if (!hero || !cta) return;

  const wrap = document.createElement('div');
  wrap.className = 'continuum';
  wrap.setAttribute('aria-hidden', 'true');
  const line = document.createElement('div');
  line.className = 'continuum-line';
  const head = document.createElement('div');
  head.className = 'continuum-head';
  wrap.append(line, head);
  main.appendChild(wrap);

  const layout = () => {
    const mainTop = main.getBoundingClientRect().top + window.scrollY;
    const top = hero.getBoundingClientRect().top + window.scrollY + hero.offsetHeight - 40 - mainTop;
    const end = cta.getBoundingClientRect().top + window.scrollY + cta.offsetHeight * 0.5 - mainTop;
    const shell = document.querySelector<HTMLElement>('.trust-strip .shell');
    const left = opts.desktop && shell
      ? Math.max(shell.getBoundingClientRect().left - 34, 16)
      : 14;
    line.style.top = `${top}px`;
    line.style.height = `${end - top}px`;
    line.style.left = `${left}px`;
    head.style.left = `${left}px`;
    // section nodes (the thread acknowledges each stage; human node at the boundary)
    wrap.querySelectorAll('.continuum-node').forEach((n) => n.remove());
    const sections = main.querySelectorAll<HTMLElement>('section');
    sections.forEach((s) => {
      if (s.classList.contains('hero')) return;
      const y = s.getBoundingClientRect().top + window.scrollY - mainTop;
      if (y <= top || y >= end) return;
      const node = document.createElement('div');
      node.className = 'continuum-node' + (s.classList.contains('section-tight') ? ' human' : '');
      node.style.top = `${y + 2}px`;
      node.style.left = `${left}px`;
      wrap.appendChild(node);
    });
    return { top, end };
  };

  const pos = layout();
  if (!pos) return;
  gsap.set(line, { scaleY: 0 });
  gsap.set(head, { top: pos.top, opacity: 0 });
  const nodes = () => wrap.querySelectorAll<HTMLElement>('.continuum-node');
  nodes().forEach((n) => gsap.set(n, { scale: 0 }));

  ScrollTrigger.create({
    trigger: main,
    start: () => `top+=${pos.top - window.innerHeight * 0.62} top`,
    end: () => `top+=${pos.end - window.innerHeight * 0.62} top`,
    scrub: 0.6,
    onUpdate: (self) => {
      const p = self.progress;
      gsap.set(line, { scaleY: p });
      const y = pos.top + (pos.end - pos.top) * p;
      gsap.set(head, { top: y, opacity: p > 0.002 && p < 0.998 ? 1 : 0 });
      nodes().forEach((n) => {
        const ny = parseFloat(n.style.top);
        if (ny <= y && n.dataset.lit !== '1') {
          n.dataset.lit = '1';
          gsap.to(n, { scale: 1, duration: 0.45, ease: 'back.out(2.5)' });
        }
      });
    }
  });

  let t = 0;
  window.addEventListener('resize', () => {
    clearTimeout(t);
    t = window.setTimeout(() => {
      const p2 = layout();
      if (p2) { pos.top = p2.top; pos.end = p2.end; }
      ScrollTrigger.refresh();
    }, 250);
  });
}

/* ---- Hero experience: GSAP entrance timeline, depth-plane cursor rig,
        scroll-linked console transformation. The console yaws as a single
        physical object; the chair (foreground) and environment (background,
        in hero-scene) move at different rates for true plane separation. ---- */
function heroHandoff(gsap: Gsap, _st: STType): void {
  const laptop = document.querySelector<HTMLElement>('.laptop');
  if (!laptop) return;
  const screen = laptop.querySelector<HTMLElement>('.laptop-screen');
  const copyKids = document.querySelectorAll('.hero-copy > *');
  const callout = document.querySelector('.cockpit-callout.b');
  const topology = document.querySelector<SVGSVGElement>('.hero-topology');
  const envType = document.querySelector('.env-type');
  const ring = document.querySelector('.monolith-ring');
  const underglow = document.querySelector('.monolith-underglow');
  const reflection = document.querySelector('.monolith-reflection');

  const BASE_Y = -13;
  const BASE_X = 6;
  const SCREEN_X = -3;
  const sway = { y: 0 }; // idle rotation offset, composed with cursor rig

  /* Entrance (desktop): the laptop rises and its screen opens. */
  const staged = document.documentElement.classList.contains('hero-staged');
  if (staged) {
    (window as Window & { __heroEntranceRan?: boolean }).__heroEntranceRan = true;
    gsap.set(copyKids, { autoAlpha: 0, y: 16, filter: 'blur(4px)' });
    gsap.set(laptop, { autoAlpha: 0, y: 52, rotationY: BASE_Y - 8, rotationX: BASE_X });
    if (screen) gsap.set(screen, { rotationX: -68, transformOrigin: 'bottom center' });
    if (callout) gsap.set(callout, { autoAlpha: 0, y: 10 });
    if (envType) gsap.set(envType, { autoAlpha: 0, x: 24 });
    if (topology) {
      gsap.set(topology, { autoAlpha: 1 });
      topology.querySelectorAll<SVGPathElement>('.tp').forEach((p) => {
        const len = p.getTotalLength();
        p.style.strokeDasharray = `${len}`;
        p.style.strokeDashoffset = `${len}`;
      });
      gsap.set(topology.querySelectorAll('.tn'), { autoAlpha: 0, scale: 0.4, transformOrigin: '50% 50%' });
    }
    if (ring) gsap.set(ring, { autoAlpha: 0, scale: 0.85 });
    if (reflection) gsap.set(reflection, { autoAlpha: 0 });
    document.documentElement.classList.remove('hero-staged');

    const EXPO = 'expo.out';
    const tl = gsap.timeline({ defaults: { ease: EXPO } });
    tl.to(laptop, { autoAlpha: 1, y: 0, rotationY: BASE_Y, duration: 1.2 }, 0.05);
    if (ring) tl.to(ring, { autoAlpha: 1, scale: 1, duration: 1.0 }, 0.3);
    if (screen) tl.to(screen, { rotationX: SCREEN_X, duration: 1.25, ease: 'power3.inOut' }, 0.4);
    tl.to(laptop, { '--rim': '112%', duration: 1.0, ease: 'power2.inOut' }, 1.2)
      .set(laptop, { '--rim': '-12%' }, '>')
      .to(laptop, { '--rim': '50%', duration: 0.8, ease: 'power2.out' }, '>');
    if (envType) tl.to(envType, { autoAlpha: 1, x: 0, duration: 1.2 }, 0.5);
    if (topology) {
      tl.to(topology.querySelectorAll('.tp'), { strokeDashoffset: 0, duration: 1.0, stagger: 0.12, ease: 'power2.inOut' }, 1.1)
        .to(topology.querySelectorAll('.tn'), { autoAlpha: 1, scale: 1, duration: 0.4, stagger: 0.1, ease: 'back.out(2)' }, 1.5);
    }
    if (reflection) tl.to(reflection, { autoAlpha: 1, duration: 0.9 }, 1.3);
    if (callout) tl.to(callout, { autoAlpha: 1, y: 0, duration: 0.6 }, 1.5);
    tl.to(copyKids, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.85, stagger: 0.14 }, 0.25);
  }

  /* Continuous 3D rotation: a slow showcase sway (composed with the cursor
     rig below via the shared sway offset). */
  gsap.to(sway, { y: 5, duration: 6.5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: staged ? 1.8 : 0 });

  /* Scroll: the laptop settles flatter and the glow dims into the seam. */
  const scroll = { p: 0 };
  gsap.to(scroll, {
    p: 1,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'center top+=220', end: 'bottom top', scrub: 0.5 }
  });
  if (underglow) {
    gsap.to(underglow, {
      opacity: 0.35,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'center top+=220', end: 'bottom top', scrub: 0.5 }
    });
  }

  /* Cursor light-rig + composition loop: cursor, idle sway and scroll all
     drive one transform so nothing fights (single writer per property). */
  const cursor = { x: 0, y: 0 };
  if (window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('pointermove', (e) => {
      cursor.x = (e.clientX / window.innerWidth - 0.5) * 2;
      cursor.y = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
  }
  const eased = { x: 0, y: 0 };
  const rimObj = { v: 50 };
  gsap.ticker.add(() => {
    eased.x += (cursor.x - eased.x) * 0.04;
    eased.y += (cursor.y - eased.y) * 0.04;
    const flat = scroll.p;
    gsap.set(laptop, {
      rotationY: (BASE_Y + sway.y + eased.x * 2.4) * (1 - flat * 0.75),
      rotationX: (BASE_X + eased.y * -2.2) * (1 - flat * 0.6),
      y: flat * -16,
      scale: 1 - flat * 0.03
    });
    rimObj.v += (50 + eased.x * 34 - rimObj.v) * 0.06;
    laptop.style.setProperty('--rim', `${rimObj.v}%`);
  });
}

/* ---- Trust strip: the thread passes through three governance keylines ---- */
function igniteTrust(gsap: Gsap): void {
  const items = document.querySelectorAll('.trust-strip .shell > span');
  if (!items.length) return;
  gsap.from(items, {
    opacity: 0,
    y: 14,
    duration: 0.55,
    ease: EASE,
    stagger: 0.14,
    scrollTrigger: { trigger: '.trust-strip', start: 'top 82%', once: true }
  });
  document.querySelectorAll('.trust-strip .icon').forEach((icon, i) => {
    gsap.from(icon, {
      scale: 0.4,
      opacity: 0,
      duration: 0.5,
      ease: 'back.out(2)',
      delay: 0.12 + i * 0.14,
      scrollTrigger: { trigger: '.trust-strip', start: 'top 82%', once: true }
    });
  });
}

/* ---- 3Ps: plates settle from depth; the chain illuminates left→right ---- */
function spatial3Ps(gsap: Gsap, opts: Opts): void {
  const cards = document.querySelectorAll('.p3-card');
  if (cards.length) {
    gsap.from(cards, {
      y: 44,
      opacity: 0,
      scale: 0.96,
      duration: 0.8,
      ease: EASE,
      stagger: 0.16,
      scrollTrigger: { trigger: '.p3-grid', start: 'top 80%', once: true }
    });
  }
  const chain = document.querySelector('.p3-chain');
  if (chain) {
    const terms = chain.querySelectorAll('span');
    const links = chain.querySelectorAll('i');
    gsap.from(terms, {
      opacity: 0.15,
      duration: 0.5,
      stagger: 0.22,
      ease: 'none',
      scrollTrigger: { trigger: chain, start: 'top 86%', once: true }
    });
    gsap.from(links, {
      scaleX: 0,
      transformOrigin: 'left center',
      duration: 0.45,
      stagger: 0.22,
      delay: 0.18,
      ease: 'power2.out',
      scrollTrigger: { trigger: chain, start: 'top 86%', once: true }
    });
  }
  if (opts.desktop) {
    document.querySelectorAll<HTMLElement>('.p3-card').forEach((card, i) => {
      gsap.to(card, {
        y: i === 0 ? -10 : i === 2 ? 12 : 0,
        ease: 'none',
        scrollTrigger: { trigger: '.p3-grid', start: 'top bottom', end: 'bottom top', scrub: 0.8 }
      });
    });
  }
}

/* ---- How it works: the thread becomes the 01→04 path; steps ignite ---- */
function flowSequence(gsap: Gsap): void {
  const steps = document.querySelectorAll('.flow-step');
  if (!steps.length) return;
  gsap.from(steps, {
    y: 34,
    opacity: 0,
    duration: 0.65,
    ease: EASE,
    stagger: 0.18,
    scrollTrigger: { trigger: '.flow-rail', start: 'top 82%', once: true }
  });
  document.querySelectorAll('.flow-arrow').forEach((a, i) => {
    gsap.from(a, {
      scaleX: 0,
      transformOrigin: 'left center',
      duration: 0.4,
      delay: 0.3 + i * 0.18,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.flow-rail', start: 'top 82%', once: true }
    });
  });
}

/* ---- Support Functions: connected substrate, not eight boxes ---- */
function constellation(gsap: Gsap, ScrollTrigger: STType): void {
  const grid = document.querySelector<HTMLElement>('.support-grid');
  if (!grid) return;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'support-links');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('viewBox', '0 0 100 100');
  const segs: Array<[number, number, number, number]> = [
    [12.5, 25, 87.5, 25], [12.5, 75, 87.5, 75],
    [12.5, 25, 12.5, 75], [37.5, 25, 37.5, 75], [62.5, 25, 62.5, 75], [87.5, 25, 87.5, 75]
  ];
  for (const [x1, y1, x2, y2] of segs) {
    const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    l.setAttribute('x1', String(x1)); l.setAttribute('y1', String(y1));
    l.setAttribute('x2', String(x2)); l.setAttribute('y2', String(y2));
    l.setAttribute('vector-effect', 'non-scaling-stroke');
    svg.appendChild(l);
  }
  grid.prepend(svg);
  gsap.from(svg.querySelectorAll('line'), {
    scale: 0,
    transformOrigin: '50% 50%',
    opacity: 0,
    duration: 0.7,
    stagger: 0.08,
    ease: 'power2.out',
    scrollTrigger: { trigger: grid, start: 'top 78%', once: true }
  });
  ScrollTrigger.refresh();
}

/* ---- Product / Consultancy: evidence routes through digital + human capability ---- */
function splitFork(gsap: Gsap, opts: Opts): void {
  const panels = document.querySelectorAll<HTMLElement>('.split-panel');
  if (!panels.length) return;
  gsap.from(panels, {
    y: 40,
    opacity: 0,
    duration: 0.75,
    ease: EASE,
    stagger: 0.18,
    scrollTrigger: { trigger: '.split-grid', start: 'top 80%', once: true }
  });
  if (!opts.desktop) return;
  panels.forEach((panel) => {
    const rx = gsap.quickTo(panel, 'rotationX', { duration: 0.5, ease: 'power2.out' });
    const ry = gsap.quickTo(panel, 'rotationY', { duration: 0.5, ease: 'power2.out' });
    panel.addEventListener('pointermove', (e) => {
      const r = panel.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * 3.2);
      rx(-((e.clientY - r.top) / r.height - 0.5) * 2.4);
    });
    panel.addEventListener('pointerleave', () => { rx(0); ry(0); });
  });
}

/* ---- Evidence & Human Review: converge → STOP → human carries it across ---- */
function boundaryMoment(gsap: Gsap): void {
  const flow = document.querySelector<HTMLElement>('.boundary-flow');
  const band = document.querySelector('.boundary-band');
  if (!flow || !band) return;
  const left = flow.querySelector('.bf-line.l');
  const right = flow.querySelector('.bf-line.r');
  const dots = flow.querySelectorAll('.bf-dot');
  const rings = flow.querySelectorAll('.bf-rings i');
  const human = flow.querySelector('.bf-human');
  const decideItems = band.querySelectorAll('.boundary-side:last-child li');

  const tl = gsap.timeline({
    scrollTrigger: { trigger: band, start: 'top 72%', once: true }
  });
  tl.from(left, { scaleX: 0, duration: 0.9, ease: 'power2.inOut' })
    .from(dots, { scale: 0, duration: 0.3, stagger: 0.12, ease: 'back.out(2.5)' }, 0.25)
    // the thread STOPS: held pulse at the boundary
    .fromTo(rings, { scale: 0.35, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, stagger: 0.1 }, '>-0.1')
    .to(rings, { scale: 1.28, opacity: 0.2, duration: 0.55, yoyo: true, repeat: 1, ease: 'sine.inOut' })
    // only the human carries it across
    .from(human, { scale: 0, duration: 0.45, ease: 'back.out(2.2)' }, '>-0.15')
    .from(right, { scaleX: 0, duration: 0.8, ease: 'power2.out' })
    .from(decideItems, { opacity: 0, x: 14, duration: 0.4, stagger: 0.1, ease: EASE }, '<0.15');
}

/* ---- Integrations: systems converge spatially into the hub ---- */
function network(gsap: Gsap): void {
  const net = document.querySelector<HTMLElement>('.int-network');
  if (!net || getComputedStyle(net).display === 'none') return;
  const paths = net.querySelectorAll<SVGPathElement>('.int-links path:not(.int-orbit)');
  paths.forEach((p) => {
    const len = p.getTotalLength();
    p.style.strokeDasharray = `${len}`;
    p.style.strokeDashoffset = `${len}`;
  });
  const nodes = net.querySelectorAll('.int-node');
  const tl = gsap.timeline({
    scrollTrigger: { trigger: net, start: 'top 76%', once: true }
  });
  tl.from(net.querySelector('.int-hub'), { scale: 0.6, opacity: 0, duration: 0.6, ease: 'back.out(1.8)' })
    .from(nodes, { opacity: 0, scale: 0.7, duration: 0.45, stagger: 0.07, ease: EASE }, 0.15)
    .to(paths, { strokeDashoffset: 0, duration: 0.9, stagger: 0.08, ease: 'power2.inOut' }, 0.35);
}

/* ---- Industries: terrain drifts; the thread is the horizon ---- */
function industries(gsap: Gsap, opts: Opts): void {
  if (!opts.desktop) return;
  document.querySelectorAll<HTMLElement>('.industry-terrain').forEach((t, i) => {
    gsap.to(t, {
      y: i % 2 ? 10 : -10,
      ease: 'none',
      scrollTrigger: { trigger: '.industry-grid', start: 'top bottom', end: 'bottom top', scrub: 0.9 }
    });
  });
}

/* ---- Value: one light sweep settles each outcome ---- */
function valueSweeps(gsap: Gsap): void {
  document.querySelectorAll<HTMLElement>('.value-panel').forEach((panel, i) => {
    const sheen = panel.querySelector('.value-sheen');
    gsap.from(panel.querySelector('h3'), {
      y: 22,
      opacity: 0,
      duration: 0.6,
      ease: EASE,
      delay: i * 0.1,
      scrollTrigger: { trigger: '.value-grid', start: 'top 80%', once: true }
    });
    if (sheen) {
      gsap.fromTo(sheen, { xPercent: 0 }, {
        xPercent: 420,
        duration: 1.1,
        delay: 0.25 + i * 0.12,
        ease: 'power2.inOut',
        scrollTrigger: { trigger: '.value-grid', start: 'top 80%', once: true }
      });
    }
  });
}

/* ---- Grids that keep the simple reveal (support tiles etc.) ---- */
function genericReveals(gsap: Gsap): void {
  document.querySelectorAll<HTMLElement>('.reveal-group').forEach((group) => {
    if (group.classList.contains('p3-grid') || group.classList.contains('flow-rail')) return;
    gsap.from(group.children, {
      y: 26,
      opacity: 0,
      duration: 0.6,
      ease: EASE,
      stagger: 0.08,
      scrollTrigger: { trigger: group, start: 'top 82%', once: true }
    });
  });
}

/* ---- Section headline choreography ---- */
function headlineReveals(gsap: Gsap): void {
  document.querySelectorAll<HTMLElement>('main section:not(.hero) .section-title h2').forEach((h2) => {
    gsap.from(h2, {
      y: 26,
      opacity: 0,
      duration: 0.7,
      ease: EASE,
      scrollTrigger: { trigger: h2, start: 'top 86%', once: true }
    });
  });
}
