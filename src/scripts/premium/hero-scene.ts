/**
 * WEB-PHASE-10 S6 — Three.js hero ENVIRONMENT (desktop only, lazy).
 * The governed cockpit capture stays a plain DOM <img> at native crispness —
 * WebGL renders the operational atmosphere behind and beneath the command
 * monolith: receding floor grid, volumetric aqua glow, drifting light
 * particles, cursor parallax. Everything rendered here is website-owned;
 * no product truth is generated.
 *
 * Guards: WebGL availability; frame-rate guard (sustained <45fps over the
 * first ~2.5s → dispose and remove — the CSS gradient environment remains
 * the designed fallback, identical to reduced-motion/mobile).
 */
import * as THREE from 'three';
import type { gsap as GSAP } from 'gsap';
import type { ScrollTrigger as ST } from 'gsap/ScrollTrigger';

export function mountHeroScene(gsap: typeof GSAP, _st: typeof ST): void {
  const env = document.querySelector<HTMLElement>('.hero-env');
  const hero = document.querySelector<HTMLElement>('.hero');
  if (!env || !hero) return;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch {
    return; // CSS environment remains
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.opacity = '0';
  env.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
  camera.position.set(0, 0.4, 8);
  camera.lookAt(0, 0, 0);

  // ---- Receding floor grid (GLSL; fades toward the horizon) ----
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 22),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uColor: { value: new THREE.Color(0x2db8f9) } },
      vertexShader:
        'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader:
        'varying vec2 vUv; uniform vec3 uColor;' +
        'void main(){' +
        ' vec2 g = abs(fract(vUv * vec2(46.0,26.0)) - 0.5);' +
        ' float line = smoothstep(0.055,0.010,min(g.x,g.y));' +
        ' float fade = smoothstep(0.0,0.42,vUv.y) * (1.0 - smoothstep(0.42,0.95,vUv.y));' +
        ' float cx = 1.0 - smoothstep(0.15,0.5,abs(vUv.x - 0.62));' +
        ' gl_FragColor = vec4(uColor, line * fade * (0.018 + 0.055 * cx));' +
        '}'
    })
  );
  floor.rotation.x = -Math.PI / 2.05;
  floor.position.set(0, -2.6, -4);
  scene.add(floor);

  // ---- Volumetric glow behind the monolith (right of centre) ----
  const glowTex = radialTexture(256, 'rgba(45,184,249,0.42)');
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, opacity: 0.55, depthWrite: false }));
  glow.scale.set(11, 7, 1);
  glow.position.set(2.4, 0.3, -3);
  scene.add(glow);

  const underTex = radialTexture(256, 'rgba(45,184,249,0.5)');
  const under = new THREE.Sprite(new THREE.SpriteMaterial({ map: underTex, transparent: true, opacity: 0.5, depthWrite: false }));
  under.scale.set(8, 2.2, 1);
  under.position.set(2.2, -2.7, -2.5);
  scene.add(under);

  // ---- Drifting light particles ----
  const COUNT = 46;
  const pos = new Float32Array(COUNT * 3);
  const drift: number[] = [];
  for (let i = 0; i < COUNT; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 16;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
    pos[i * 3 + 2] = -2 - Math.random() * 6;
    drift.push(0.02 + Math.random() * 0.05);
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const points = new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({
      size: 0.055,
      map: radialTexture(64, 'rgba(111,206,251,0.9)'),
      color: 0x6fcefb,
      transparent: true,
      opacity: 0.33,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );
  scene.add(points);

  const fit = () => {
    const r = hero.getBoundingClientRect();
    if (r.width < 50) return;
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
  };
  fit();

  // ---- Cursor parallax ----
  const cursor = { x: 0, y: 0 };
  const onMove = (e: PointerEvent) => {
    cursor.x = (e.clientX / window.innerWidth - 0.5) * 2;
    cursor.y = (e.clientY / window.innerHeight - 0.5) * 2;
  };
  window.addEventListener('pointermove', onMove, { passive: true });

  // ---- Render loop + frame-rate guard ----
  let raf = 0;
  let frames = 0;
  let guardStart = performance.now();
  let guarded = false;
  let alive = true;
  const sway = { x: 0, y: 0 };

  const loop = () => {
    if (!alive) return;
    raf = requestAnimationFrame(loop);
    const t = performance.now() / 1000;
    sway.x += (cursor.x * 0.35 - sway.x) * 0.05;
    sway.y += (cursor.y * 0.2 - sway.y) * 0.05;
    glow.position.x = 2.4 + sway.x;
    glow.position.y = 0.3 - sway.y;
    glow.material.opacity = 0.5 + Math.sin(t * 0.7) * 0.06;
    const p = pGeo.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < COUNT; i++) {
      let y = p.getY(i) + drift[i] * 0.016;
      if (y > 4.2) y = -4.2;
      p.setY(i, y);
    }
    p.needsUpdate = true;
    camera.position.x = sway.x * 0.25;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
    if (!guarded) {
      frames++;
      const dt = performance.now() - guardStart;
      if (dt > 2500) {
        guarded = true;
        const fps = (frames / dt) * 1000;
        (window as unknown as { __heroFps?: number }).__heroFps = Math.round(fps);
        if (fps < 45) teardown();
      }
    }
  };

  const teardown = () => {
    alive = false;
    cancelAnimationFrame(raf);
    window.removeEventListener('pointermove', onMove);
    gsap.to(canvas, {
      opacity: 0, duration: 0.4, onComplete: () => {
        canvas.remove();
        renderer.dispose();
      }
    });
  };

  guardStart = performance.now();
  frames = 0;
  gsap.to(canvas, { opacity: 1, duration: 1.2, ease: 'power2.out' });
  loop();

  window.addEventListener('resize', fit);
  (window as unknown as { __heroSceneActive?: boolean }).__heroSceneActive = true;
}

/* ---- tiny texture helper (no assets, no network) ---- */
function radialTexture(size: number, color: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, color);
  g.addColorStop(0.55, color.replace(/[\d.]+\)$/, '0.10)'));
  g.addColorStop(1, 'rgba(45,184,249,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}
