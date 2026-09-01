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
      uniforms: { uColor: { value: new THREE.Color(0x00e5ff) } },
      vertexShader:
        'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader:
        'varying vec2 vUv; uniform vec3 uColor;' +
        'void main(){' +
        ' vec2 g = abs(fract(vUv * vec2(46.0,26.0)) - 0.5);' +
        ' float line = smoothstep(0.055,0.010,min(g.x,g.y));' +
        ' float fade = smoothstep(0.0,0.42,vUv.y) * (1.0 - smoothstep(0.42,0.95,vUv.y));' +
        ' float cx = 1.0 - smoothstep(0.15,0.5,abs(vUv.x - 0.62));' +
        ' gl_FragColor = vec4(uColor, line * fade * (0.012 + 0.04 * cx));' +
        '}'
    })
  );
  floor.rotation.x = -Math.PI / 2.05;
  floor.position.set(0, -2.6, -4);
  scene.add(floor);

  // ---- Volumetric glow behind the monolith (right of centre) ----
  const glowTex = radialTexture(256, 'rgba(0,229,255,0.30)');
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, opacity: 0.55, depthWrite: false }));
  glow.scale.set(11, 7, 1);
  glow.position.set(2.4, 0.3, -3);
  scene.add(glow);

  const underTex = radialTexture(256, 'rgba(0,229,255,0.36)');
  const under = new THREE.Sprite(new THREE.SpriteMaterial({ map: underTex, transparent: true, opacity: 0.5, depthWrite: false }));
  under.scale.set(8, 2.2, 1);
  under.position.set(2.2, -2.7, -2.5);
  scene.add(under);

  // ---- Horizon line (thin luminous band where floor meets the dark) ----
  const horizonTex = gradientTexture(512, 6, (g) => {
    g.addColorStop(0, 'rgba(0,229,255,0)');
    g.addColorStop(0.35, 'rgba(0,229,255,0.36)');
    g.addColorStop(0.65, 'rgba(0,229,255,0.45)');
    g.addColorStop(1, 'rgba(0,229,255,0)');
  }, true);
  const horizon = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 0.05),
    new THREE.MeshBasicMaterial({ map: horizonTex, transparent: true, opacity: 0.5, depthWrite: false })
  );
  horizon.position.set(1.5, -1.05, -9);
  scene.add(horizon);

  // ---- Vertical light shafts falling toward the console ----
  const shaftTex = gradientTexture(8, 256, (g) => {
    g.addColorStop(0, 'rgba(0,229,255,0.18)');
    g.addColorStop(0.7, 'rgba(0,229,255,0.04)');
    g.addColorStop(1, 'rgba(0,229,255,0)');
  });
  const shafts: THREE.Mesh[] = [];
  [[1.1, 0.5], [2.9, 0.9], [4.4, 0.4]].forEach(([x, w]) => {
    const shaft = new THREE.Mesh(
      new THREE.PlaneGeometry(w, 6.5),
      new THREE.MeshBasicMaterial({ map: shaftTex, transparent: true, opacity: 0.30, depthWrite: false, blending: THREE.AdditiveBlending })
    );
    shaft.position.set(x, 1.6, -5.5);
    shaft.rotation.z = -0.06;
    scene.add(shaft);
    shafts.push(shaft);
  });

  // ---- Floor light streak beneath the console ----
  const streak = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 1.1),
    new THREE.MeshBasicMaterial({ map: horizonTex, transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending })
  );
  streak.rotation.x = -Math.PI / 2.05;
  streak.position.set(2.1, -2.55, -2.2);
  scene.add(streak);

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
    shafts.forEach((sh, i) => {
      (sh.material as THREE.MeshBasicMaterial).opacity = 0.24 + Math.sin(t * (0.5 + i * 0.17) + i * 2.1) * 0.08;
      sh.position.x += (([1.1, 2.9, 4.4][i] + sway.x * (0.5 + i * 0.2)) - sh.position.x) * 0.04;
    });
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

  // Pause rendering when the hero is offscreen or the tab is hidden
  // (optimize-web-animations: no continuously animated offscreen content).
  let paused = false;
  const setPaused = (v: boolean) => {
    if (v === paused || !alive) return;
    paused = v;
    if (paused) cancelAnimationFrame(raf);
    else loop();
  };
  let heroInView = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      heroInView = entries[0].isIntersecting;
      if (guarded) setPaused(!heroInView || document.hidden);
    }).observe(hero);
  }
  document.addEventListener('visibilitychange', () => {
    if (guarded) setPaused(!heroInView || document.hidden);
  });

  window.addEventListener('resize', fit);
  (window as unknown as { __heroSceneActive?: boolean }).__heroSceneActive = true;
}

/* ---- tiny texture helpers (no assets, no network) ---- */
function gradientTexture(
  w: number, h: number,
  stops: (g: CanvasGradient) => void,
  horizontal = false
): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d')!;
  const g = horizontal ? ctx.createLinearGradient(0, 0, w, 0) : ctx.createLinearGradient(0, 0, 0, h);
  stops(g);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  return new THREE.CanvasTexture(c);
}

function radialTexture(size: number, color: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, color);
  g.addColorStop(0.55, color.replace(/[\d.]+\)$/, '0.10)'));
  g.addColorStop(1, 'rgba(0,229,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}
