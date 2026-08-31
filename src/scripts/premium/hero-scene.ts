/**
 * WEB-PHASE-10 S5 — Three.js hero environment (desktop only, lazy).
 * The governed cockpit capture is a FLAT textured plane — never warped,
 * never overlaid, cropped identically to the CSS shell (top 575/692,
 * synthetic-data badge in view). Everything dimensional is website-owned:
 * floor grid, reflection, rim light, bloom, camera and light rig.
 *
 * Guards: WebGL availability; frame-rate guard (sustained <45fps →
 * dispose and restore the CSS shell); full teardown on failure. The CSS
 * shell is the designed fallback and the reduced-motion/mobile experience.
 */
import * as THREE from 'three';
import type { gsap as GSAP } from 'gsap';
import type { ScrollTrigger as ST } from 'gsap/ScrollTrigger';

const CROP = 575 / 692; // identical to the CSS crop
const PLANE_W = 2;
const PLANE_H = PLANE_W * (575 / 1506);

export function mountHeroScene(gsap: typeof GSAP, ScrollTrigger: typeof ST): void {
  const stage = document.querySelector<HTMLElement>('.cockpit-stage');
  const shellEl = document.querySelector<HTMLElement>('.cockpit-shell');
  const reflEl = document.querySelector<HTMLElement>('.cockpit-reflection');
  const img = document.querySelector<HTMLImageElement>('.cockpit-crop img');
  if (!stage || !shellEl || !img) return;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch {
    return; // CSS shell remains
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'absolute', left: '-12%', top: '-16%', width: '124%', height: '150%',
    pointerEvents: 'none', opacity: '0', zIndex: '0'
  });
  stage.style.position = 'relative';
  stage.prepend(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 30);

  const group = new THREE.Group();
  scene.add(group);

  // Governed cockpit plane — flat, undistorted, CSS-identical crop.
  const tex = new THREE.Texture(img);
  tex.needsUpdate = true;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.repeat.set(1, CROP);
  tex.offset.set(0, 1 - CROP);
  tex.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
  const cockpitMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
  const cockpit = new THREE.Mesh(new THREE.PlaneGeometry(PLANE_W, PLANE_H), cockpitMat);
  group.add(cockpit);

  // Bezel frame (website-owned): slightly larger dark plane behind.
  const bezel = new THREE.Mesh(
    new THREE.PlaneGeometry(PLANE_W + 0.05, PLANE_H + 0.05),
    new THREE.MeshBasicMaterial({ color: 0x0e2138, transparent: true, opacity: 0.98 })
  );
  bezel.position.z = -0.008;
  group.add(bezel);

  // Rim light strip along the top edge.
  const rimTex = gradientTexture(256, 8, (g) => {
    g.addColorStop(0, 'rgba(45,184,249,0)');
    g.addColorStop(0.45, 'rgba(111,206,251,1)');
    g.addColorStop(0.55, 'rgba(111,206,251,1)');
    g.addColorStop(1, 'rgba(45,184,249,0)');
  }, true);
  const rim = new THREE.Mesh(
    new THREE.PlaneGeometry(PLANE_W + 0.05, 0.014),
    new THREE.MeshBasicMaterial({ map: rimTex, transparent: true })
  );
  rim.position.y = (PLANE_H + 0.05) / 2 + 0.007;
  rim.position.z = 0.002;
  group.add(rim);

  // Floor reflection — mirrored governed plane, faded (website-owned lighting).
  const reflTex = tex.clone();
  reflTex.needsUpdate = true;
  const reflAlpha = gradientTexture(4, 256, (g) => {
    g.addColorStop(0, 'rgba(255,255,255,0.30)');
    g.addColorStop(0.55, 'rgba(255,255,255,0.04)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
  });
  const reflection = new THREE.Mesh(
    new THREE.PlaneGeometry(PLANE_W, PLANE_H),
    new THREE.MeshBasicMaterial({ map: reflTex, alphaMap: reflAlpha, transparent: true, opacity: 0.5 })
  );
  reflection.scale.y = -1;
  reflection.position.y = -PLANE_H - 0.02;
  group.add(reflection);

  // Bloom sprite behind the panel.
  const bloomTex = radialTexture(256, 'rgba(45,184,249,0.55)');
  const bloom = new THREE.Sprite(new THREE.SpriteMaterial({ map: bloomTex, transparent: true, opacity: 0.5, depthWrite: false }));
  bloom.scale.set(4.2, 3.0, 1);
  bloom.position.z = -0.4;
  scene.add(bloom);

  // Receding floor grid (shader).
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 8),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uColor: { value: new THREE.Color(0x2db8f9) } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader:
        'varying vec2 vUv; uniform vec3 uColor;' +
        'void main(){' +
        ' vec2 g = abs(fract(vUv * vec2(28.0,16.0)) - 0.5);' +
        ' float line = smoothstep(0.062,0.012,min(g.x,g.y));' +
        ' float fade = smoothstep(0.0,0.55,vUv.y) * (1.0 - smoothstep(0.55,1.0,vUv.y));' +
        ' gl_FragColor = vec4(uColor, line * fade * 0.16);' +
        '}'
    })
  );
  floor.rotation.x = -Math.PI / 2.15;
  floor.position.set(0, -PLANE_H * 1.55, -1.2);
  scene.add(floor);

  group.rotation.y = -0.105;
  group.rotation.x = 0.028;

  const fit = () => {
    const r = stage.getBoundingClientRect();
    if (r.width < 50) return;
    const w = r.width * 1.24;
    const h = r.height * 1.5;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const vFov = (camera.fov * Math.PI) / 180;
    const targetWorldW = PLANE_W / 0.80; // panel occupies ~80% of stage width
    camera.position.z = targetWorldW / (2 * Math.tan(vFov / 2) * camera.aspect);
    camera.position.y = -PLANE_H * 0.28;
    camera.lookAt(0, -PLANE_H * 0.18, 0);
    camera.updateProjectionMatrix();
  };
  fit();

  // ---- Entrance choreography ----
  const swap = () => {
    gsap.to([shellEl, reflEl].filter(Boolean), { opacity: 0, duration: 0.5 });
    gsap.to(canvas, { opacity: 1, duration: 0.7 });
  };
  gsap.fromTo(group.position, { y: -0.22 }, { y: 0, duration: 1.1, ease: 'power3.out' });
  gsap.fromTo(group.rotation, { y: -0.2 }, { y: -0.105, duration: 1.2, ease: 'power3.out' });
  gsap.fromTo(bloom.material, { opacity: 0 }, { opacity: 0.5, duration: 1.4, ease: 'power2.out' });

  // ---- Scroll scrub: ease toward flat and dock into the trust seam ----
  const scrollState = { p: 0 };
  ScrollTrigger.create({
    trigger: '.hero',
    start: 'center top+=200',
    end: 'bottom top',
    scrub: 0.5,
    onUpdate: (self) => { scrollState.p = self.progress; }
  });

  // ---- Cursor light rig (±1.2°) ----
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
  const clockY = { v: 0 };

  const loop = () => {
    if (!alive) return;
    raf = requestAnimationFrame(loop);
    const baseY = -0.105 * (1 - scrollState.p * 0.85);
    clockY.v += ((cursor.x * 0.021 + baseY) - clockY.v) * 0.06;
    group.rotation.y = clockY.v;
    group.rotation.x = 0.028 + cursor.y * -0.012 + scrollState.p * -0.02;
    group.position.y = scrollState.p * 0.1;
    bloom.material.opacity = 0.5 * (1 - scrollState.p * 0.6);
    rim.position.x = cursor.x * 0.12;
    renderer.render(scene, camera);
    // guard: sustained fps over the first ~2.5s after swap
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
    gsap.to([shellEl, reflEl].filter(Boolean), { opacity: 1, duration: 0.5 });
  };

  const start = () => {
    guardStart = performance.now();
    frames = 0;
    swap();
    loop();
  };
  if (img.complete) start();
  else img.addEventListener('load', start, { once: true });

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
  g.addColorStop(0.55, color.replace(/[\d.]+\)$/, '0.12)'));
  g.addColorStop(1, 'rgba(45,184,249,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}
