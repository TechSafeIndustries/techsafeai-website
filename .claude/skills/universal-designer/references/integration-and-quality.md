# UniversalDesigner — Integration & Quality (Phases 3–4)

How to make multiple specialist skills work together (Phase 3) and the
non-negotiable quality gates before declaring done (Phase 4). For the full
architecture detail, also invoke `web3d-integration-patterns`.

## Phase 3 — Composition

### Assign every library a single layer
Give each library ONE job and ONE layer; never let two own the same concern.

| Layer | Owner (typical) |
|---|---|
| Design tokens / structure | `ui-ux-pro-max` output (colors, type, spacing) |
| DOM/UI motion | `motion-framer` OR `react-spring-physics` (pick one primary) |
| Scroll orchestration | `gsap-scrolltrigger` (+ `locomotive-scroll` container) |
| Page navigation transitions | `barba-js` |
| 3D scene | ONE engine (`react-three-fiber` / `threejs-webgl` / `babylonjs-engine` / …) |
| 2D overlay / particles | `pixijs-2d` |
| Decorative background | `lightweight-3d-effects` |
| Asset playback | `lottie-animations` / `rive-interactive` |

### The cardinal rule: one animator per property
**Never let two libraries animate the same property on the same element.** This is the
#1 cause of jank and "fighting" animations. If GSAP scrubs an element's `y`, Motion must
not also animate its `y`. Split responsibilities by property or by element.

### The 5 integration patterns (from web3d-integration-patterns)
1. **Layered Separation** — Three.js scene layer + GSAP animation layer + React/DOM UI
   layer, communicating through shared state/refs. Best for vanilla + GSAP.
2. **Unified React** — R3F `<Canvas>` + Motion overlays in one component tree.
3. **Hybrid** — R3F scene driven by GSAP timelines (GSAP animates object refs).
4. **Physics-Based** — R3F + React Spring (`@react-spring/three`) for natural 3D motion.
5. **Scroll-Driven** — R3F `ScrollControls`, or Three.js + ScrollTrigger, to map scroll
   to camera/object state.

### State & render-loop coordination
- Global 3D state → **Zustand** or refs; avoid React state that re-renders `<Canvas>`.
- Mutate in `useFrame`/ticker via **refs**, never `setState` per frame.
- One render loop owns the frame; prefer on-demand rendering (`frameloop="demand"`)
  when the scene is mostly static.
- Sync external animation (GSAP/Spring) into the 3D loop by writing to object refs, not
  by triggering React renders.

### Scroll stack wiring
- `locomotive-scroll` provides the smooth-scroll container; `gsap-scrolltrigger` proxies
  into it via `ScrollTrigger.scrollerProxy` + `ScrollTrigger.refresh()` (see Locomotive's
  `gsap_integration.md`). Don't run two competing scroll systems unproxied.

## Phase 4 — Quality gates (all must pass)

### Performance
- Animate **transform/opacity only**; never animate layout props (width/height/top/left).
- GPU-accelerate; keep heavy work off the main thread (DotLottieWorker, web workers).
- **Lazy-load** heavy 3D/WebGL; code-split; gate WebGL component fleets by device
  (`navigator.hardwareConcurrency`, mobile UA).
- 3D: instancing/LOD/culling; compress assets (Draco, ≤2K textures); on-demand render.
- Respect a stated performance budget; measure on a low-end device.

### Accessibility
- Honor `prefers-reduced-motion` everywhere (Motion `useReducedMotion`, GSAP
  `matchMedia`, AOS disable, Spring `skipAnimation`). Provide a reduced/none path.
- Maintain WCAG contrast (use `ui-ux-pro-max` palettes with documented ratios).
- Keyboard navigation intact; scroll-hijacking (Locomotive) must not trap keyboard/SR
  users — provide an escape/disable.
- Don't convey meaning by motion/color alone.

### Responsive
- Verify mobile / tablet / desktop. Provide device-specific LOD/scene variants for 3D.
- Confirm the change does not break the Flutter app (`apps/mobile`) when UX is shared.

### Memory & cleanup (the #1 SPA bug for these libraries)
- **Three.js / R3F:** `.dispose()` geometries, materials, textures on unmount.
- **PixiJS:** `.destroy()` textures, sprites, filters.
- **GSAP:** kill tweens/timelines; `ScrollTrigger.kill()` on unmount.
- **Locomotive / Vanta / Tilt / Lottie / Rive:** call `.destroy()` on unmount.
- **Anime.js / event listeners:** pause/remove in `useEffect` cleanup.
- **Barba:** clean listeners in `beforeLeave`.

### Correctness traps to check
- Three.js texture color space (`SRGBColorSpace`); normal-map Y-flip; metallic/roughness
  channel order on glTF.
- Magic UI: `cn()` util present, `@keyframes` added to globals.css, Tailwind content
  paths include component dir.
- Vanta colors are hex **numbers** not strings.
- Next/RSC: 3D/motion in `"use client"`; no function props server→client; Spline via
  `/next` or `ssr:false`.
- Rive/Lottie: an authored asset actually exists; Rive input/state names match exactly.

## Definition of done
A frontend deliverable is complete only when: it fits the architecture (Phase 0), has a
deliberate design direction (Phase 1), uses the right tool per job (Phase 2), composes
cleanly with one-animator-per-property (Phase 3), and passes performance, accessibility,
responsive, and cleanup gates (Phase 4) — including not breaking the mobile app.
