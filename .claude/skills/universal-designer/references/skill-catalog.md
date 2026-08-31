# UniversalDesigner — Skill Catalog (all 24 specialist skills)

Deep dossier for every skill UniversalDesigner orchestrates. Each entry: **invoke
name**, what it does, when to use, key gotchas, and what it pairs with. Invoke any
of these with the **Skill tool** using the `Invoke` name. Plugin-namespaced names
are noted where they differ.

Categories: [Design-system / taste](#1-design-system--taste-layer) ·
[UI motion](#2-ui-motion-layer) · [Scroll & transitions](#3-scroll--transition-layer)
· [3D engines](#4-3d-engine-layer) · [2D / effects / assets](#5-2d-effects--asset-layer)
· [3D authoring pipeline](#6-3d-authoring-pipeline) · [Integration meta](#7-integration-meta).

---

## 1. Design-system / taste layer

Run these FIRST (Phase 1) to set direction. They are **complementary, not
redundant**: `modern-web-design` = STRATEGY, `ui-ux-pro-max` = STRUCTURE & RULES,
`frontend-design` = TASTE & AESTHETICS.

### modern-web-design
- **Invoke:** `modern-web-design`
- **What:** Meta-skill synthesizing 2024–2025 web-design trends + principles:
  performance-first design, accessibility, micro-interactions, scrollytelling,
  cursor UX, glassmorphism/depth, design-system architecture. Ships 7 complete
  patterns (hero w/ Vanta+GSAP, horizontal gallery, R3F product viewer, count-up
  data-viz, page transitions, custom cursors, staggered reveals).
- **When:** Establishing overall visual/motion strategy, perf budget, a11y baseline,
  and choosing which pattern fits — BEFORE execution.
- **Gotchas:** Strategy-only; does NOT teach library code — always pair with an
  execution skill. References: `design_trends_2024.md`, `interaction_patterns.md`,
  `accessibility_guide.md`, `performance_checklist.md`; scripts `pattern_generator.py`,
  `design_audit.py`.
- **Pairs:** everything below; it's the strategy umbrella.

### ui-ux-pro-max
- **Invoke:** `ui-ux-pro-max` (plugin form: `ui-ux-pro-max:ui-ux-pro-max`)
- **What:** Data-driven UI/UX intelligence: 50+ styles, 161 product-type color
  palettes, 57 font pairings, 161 product patterns, 99 UX guidelines, 25 chart
  types, across 10 stacks (React, Next, Vue, Svelte, SwiftUI, RN, Flutter, Tailwind,
  shadcn, HTML/CSS). Priority-ordered rules engine (`ui-reasoning.csv`) auto-ranks
  recommendations by product type + anti-patterns.
- **When:** Any concrete UI decision — colors, type, layout, forms, nav, charts,
  component design, dark mode, accessibility review.
- **How:** **Run `--design-system` FIRST** for an AI-reasoned full system. Use
  `--persist` to write `design-system/MASTER.md` + page overrides into the project.
  Search domains: product, style, color, typography, landing, chart, ux, react, web.
- **Gotchas:** Needs Python 3. Data lives in `/data/*.csv` (colors.csv 161,
  typography.csv 57, products.csv 161, ux-guidelines.csv 99, google-fonts.csv 1924,
  stacks/*.csv). shadcn integration needs shadcn MCP. Mobile/RN-leaning but covers web.
- **Pairs:** `modern-web-design` (strategy first), `frontend-design` (taste after),
  `motion-framer`/`lottie-animations` (its timing guidance).

### frontend-design
- **Invoke:** `frontend-design` (plugin form: `frontend-design:frontend-design`)
- **What:** Guidance skill for distinctive, production-grade interfaces that AVOID
  generic "AI slop." Forces ONE bold/refined aesthetic direction (minimal,
  maximalist, brutalist, retro-futuristic, luxury, editorial, organic…), distinctive
  typography (avoids Inter/Roboto clichés), intentional color, spatial composition,
  high-impact motion.
- **When:** Aesthetic distinctiveness matters — portfolios, brand/marketing,
  design-first products, hero/landing, creative work.
- **Gotchas:** SKILL.md-only (no data/CLI). Demands commitment to a direction; not
  for timid/generic UIs. Doesn't cover a11y/responsive/perf — get those from
  `modern-web-design` + `ui-ux-pro-max`.
- **Pairs:** `ui-ux-pro-max` (structure first) → `frontend-design` (elevate) →
  motion/3D execution skills.

---

## 2. UI motion layer

### motion-framer
- **Invoke:** `motion-framer`
- **What:** Motion (formerly Framer Motion) for React — declarative `motion`
  components, variants + stagger, spring physics, gestures (whileHover/whileTap/drag),
  `AnimatePresence` exit animations, `layout`/`layoutId` shared-element transitions,
  `whileInView` scroll reveals, `useAnimate` sequences.
- **When:** React UI animation, micro-interactions, page/route transitions,
  drag-and-drop, layout/shared-element animation, gesture-driven UI. **Default React
  animation choice.**
- **Gotchas:** Layout animations costly at scale (use `layout="position"`);
  `AnimatePresence` children need unique `key`; animate transforms not left/top/width;
  springs costlier than tweens; `useReducedMotion` for a11y. Magic UI/React Bits use
  it under the hood.
- **Pairs:** `react-spring-physics` (heavier physics), `gsap-scrolltrigger` (complex
  scroll timelines), `react-three-fiber` (sync values into useFrame),
  `animated-component-libraries`.

### react-spring-physics
- **Invoke:** `react-spring-physics`
- **What:** React Spring + Popmotion — true spring-physics (tension/friction/mass),
  interruptible & momentum-preserving. Hooks: `useSpring`, `useSprings`, `useTrail`,
  `useTransition`, `useScroll`, `useInView`. `@react-spring/three` animates R3F
  objects. Popmotion `spring/inertia/decay` for framework-agnostic low-level motion.
- **When:** Natural, physically-accurate motion that must respond mid-flight —
  carousel swipes, inertia dismissals, momentum, scroll-linked numeric interpolation.
  Choose over Motion when physics realism + interruption continuity matter.
- **Gotchas:** Less predictable than tweens (use presets / `physics_calculator.py`);
  imperative updates via `api.start({...})` not `.set()`; raise `precision` to ~0.01
  for UI; animate numeric values then reconstruct transforms.
- **Pairs:** `motion-framer` (pick one as primary), `react-three-fiber`
  (`@react-spring/three`), `gsap-scrolltrigger`.

### animejs
- **Invoke:** `animejs`
- **What:** Anime.js — lightweight (~9KB) framework-agnostic engine for timeline
  choreography of DOM/CSS/SVG/JS objects. Strong stagger utilities, SVG morphing &
  line-drawing, keyframes, spring/steps/cubic-bezier easing, path-following.
- **When:** Vanilla/non-React projects, SVG-heavy effects, tight timeline timing,
  small bundle. Avoid when React integration is the priority (use Motion).
- **Gotchas:** Transform props must be individual (translateX, not transform string);
  CSS values need units; manual cleanup in React `useEffect`; >1000 elements tanks;
  relative timeline operators (`+=`,`-=`) easy to misuse.
- **Pairs:** `gsap-scrolltrigger` (scroll), `lightweight-3d-effects` (2D+3D),
  `motion-framer` (React side).

### animated-component-libraries
- **Invoke:** `animated-component-libraries`
- **What:** Pre-built animated React components — **Magic UI** (150+: GridPattern,
  Marquee, ShimmerButton, BorderBeam…) + **React Bits** (90+: BlurText, Dock, Magnet,
  CountUp, WebGL Particles/Plasma/Aurora, Bento). Copy-paste, Tailwind + Motion under
  the hood; Magic UI installs via shadcn CLI.
- **When:** Ship landing pages/dashboards fast with polished components instead of
  hand-crafting. Magic UI = structural/shadcn-integrated; React Bits = micro-interactions
  & visual effects.
- **Gotchas:** Needs `motion`+`clsx`+`tailwind-merge` (+`ogl` for WebGL bits); requires
  `cn()` util; manual `@keyframes` in globals.css or animations fail silently; z-index
  layering of bg patterns; WebGL components costly on mobile (gate by device); Tailwind
  content paths must include component dir.
- **Pairs:** `motion-framer` (customize internals), `modern-web-design`,
  `gsap-scrolltrigger` (scroll-driven reveals), `ui-ux-pro-max`.

---

## 3. Scroll & transition layer

> **Overlap warning** — the four below are the most-confused skills. AOS = simple
> reveals; GSAP = complex timelines/scrub/pin; Locomotive = smooth-scroll *container*;
> Barba = page *navigation* transitions. See `decision-matrix.md` for tie-breakers.

### gsap-scrolltrigger
- **Invoke:** `gsap-scrolltrigger`
- **What:** GSAP + ScrollTrigger — industry-standard animation engine. Tweens (700+
  eases), timelines (labels, relative timing), ScrollTrigger (scrub, pin, snap,
  viewport), stagger, `batch()`, `matchMedia()`. Animates DOM/SVG/Canvas/WebGL/Three.js.
- **When:** Complex scroll orchestration, parallax, pinning, scrubbed image sequences,
  horizontal scroll, pixel-perfect timing. Overkill for simple reveals (use AOS).
- **Gotchas:** ~27KB; kill tweens on unmount; `ScrollTrigger.refresh()` after DOM
  changes; animate transform/opacity not layout props; scroll-hijack a11y care.
  References: `common_patterns.md` (12+ patterns), `easing_guide.md`.
- **Pairs:** `locomotive-scroll` (proxy its container), `barba-js` (transition
  timelines), `react-three-fiber`/`threejs-webgl` (scroll-driven 3D),
  `web3d-integration-patterns`.

### locomotive-scroll
- **Invoke:** `locomotive-scroll`
- **What:** Smooth-scroll library (lerp) providing GPU smooth scroll, parallax via
  `data-scroll-speed`, viewport detection, sticky elements, horizontal scroll,
  programmatic `scrollTo`. Often the **scroll container that ScrollTrigger proxies into**.
- **When:** Apple-style smooth-scroll UX, parallax depth, narrative sites where
  scroll feel > semantic scrolling. NOT for a11y-first sites without mitigation.
- **Gotchas:** Scroll-hijack breaks keyboard/SR (respect `prefers-reduced-motion`);
  perf on low-end mobile (disable); fixed-positioning workarounds; destroy on route
  change. Reference: `gsap_integration.md` (scrollerProxy setup).
- **Pairs:** `gsap-scrolltrigger` (canonical combo), `barba-js`,
  `scroll-reveal-libraries` (simpler alt).

### scroll-reveal-libraries
- **Invoke:** `scroll-reveal-libraries`
- **What:** AOS (Animate On Scroll) — lightweight, CSS-driven, data-attribute reveals
  (50+ effects: fade/slide/zoom/flip), anchor placement, mirror/once, custom CSS
  animations. Near-zero JS.
- **When:** Marketing/landing/blog/docs needing basic fade/slide on scroll. Quick
  prototypes. NOT for timelines (GSAP), physics (Spring), or scrubbing.
- **Gotchas:** Max 3000ms without custom CSS; React needs careful `AOS.refresh()` on
  route/content change; `once:true`/disable-on-mobile for perf; CSS `!important`
  conflicts. References: `aos_api.md`, `animation_catalog.md`.
- **Pairs:** `gsap-scrolltrigger` (upgrade path), `motion-framer` (React alt), `barba-js`.

### barba-js
- **Invoke:** `barba-js`
- **What:** Barba.js (~7KB) — intercepts navigation, fetches pages via AJAX, runs
  transitions between them (SPA-feel for multi-page sites). Namespaces, 11 lifecycle
  hooks, from/to transition rules, router/prefetch/head plugins.
- **When:** Multi-page sites needing animated route transitions + SPA feel without a
  full SPA framework. NOT for real SPA interactivity (use Next/Remix) or single static
  pages.
- **Gotchas:** Hooks must return promises or animation won't wait; external links need
  `prevent()`; namespace-scope CSS; set container min-height (layout shift); manual
  scroll reset; cleanup listeners in `beforeLeave`. References: `hooks_guide.md`,
  `transition_patterns.md`.
- **Pairs:** `gsap-scrolltrigger` (transition timelines), `locomotive-scroll`,
  `motion-framer` (React-first alt).

---

## 4. 3D engine layer

> **Pick one engine.** React app → `react-three-fiber`. Max control/vanilla →
> `threejs-webgl`. Physics/game/production → `babylonjs-engine`. ECS + cloud editor →
> `playcanvas-engine`. VR/AR/360/HTML-first → `aframe-webxr`.

### threejs-webgl
- **Invoke:** `threejs-webgl`
- **What:** Three.js — imperative WebGL/WebGPU. Full scene graph, cameras/controls,
  lights+shadows, material system (Basic→PBR→custom GLSL), GLTF/DRACO loading,
  post-processing (bloom/DOF), raycasting, instancing, disposal.
- **When:** High-control 3D, custom shaders/effects, data-viz, configurators outside
  React, performance-critical scenes.
- **Gotchas:** Manual scene-graph mgmt; `.dispose()` geometry/material/texture or leak;
  set `texture.colorSpace = SRGBColorSpace`; z-fighting near/far; no built-in physics.
  Resources: `materials_guide.md`, `optimization_checklist.md`, `starter_scene/`.
- **Pairs:** `react-three-fiber` (React wrapper), `gsap-scrolltrigger`,
  `blender-web-pipeline`/`substance-3d-texturing` (assets), `pixijs-2d` (2D HUD).

### react-three-fiber
- **Invoke:** `react-three-fiber`
- **What:** R3F — declarative React renderer for Three.js. JSX→Three objects,
  `useFrame` (per-frame w/o re-render), `useThree`, `useLoader`+Suspense, Drei helpers
  (OrbitControls, Environment, Text3D, ScrollControls, Html), instancing, TS support.
- **When:** 3D inside React/Next/Vite — configurators, portfolios, games w/ state,
  3D dashboards. **Default 3D choice for React.**
- **Gotchas:** Never `setState` in `useFrame` (mutate refs); don't allocate
  Vector3/Matrix4 per frame (memo); **drei had React-19 peer conflicts (dropped in
  THIS repo)** — verify before adding; Canvas needs explicit parent height.
- **Pairs:** Drei, `motion-framer`/`react-spring-physics` (`@react-spring/three`),
  `gsap-scrolltrigger`, `web3d-integration-patterns`, asset pipeline skills.

### babylonjs-engine
- **Invoke:** `babylonjs-engine`
- **What:** Babylon.js — feature-rich engine with built-in **Havok physics**, WebXR,
  advanced shadows/post-FX, GUI system (2D + mesh-attached), Node Materials, scene
  optimizer, Playground editor.
- **When:** Production games/3D apps needing physics, complex interactions, WebXR, or
  integrated tooling.
- **Gotchas:** Heavier (~2MB gz vs Three ~150KB core); Havok async + WASM; use
  `PhysicsAggregate` not deprecated `PhysicsImpostor`; GUI perf with many controls;
  dispose scenes/meshes.
- **Pairs:** Havok (built-in), `gsap-scrolltrigger`, React (hooks wrapper),
  asset pipeline skills.

### playcanvas-engine
- **Invoke:** `playcanvas-engine`
- **What:** PlayCanvas — lightweight ECS WebGL engine, editor-first (cloud editor),
  Ammo.js physics, script components w/ editor-exposed attributes, asset streaming,
  thin instances.
- **When:** Browser games, editor-driven collaborative workflows, mobile web games,
  ECS architecture.
- **Gotchas:** ECS paradigm shift; script attributes must be declared upfront; Ammo
  async; smaller ecosystem; cloud editor needs account. References: `editor_workflow.md`,
  `optimization_guide.md`.
- **Pairs:** PlayCanvas Editor, Ammo.js, `gsap-scrolltrigger` (external animation).

### aframe-webxr
- **Invoke:** `aframe-webxr`
- **What:** A-Frame — declarative HTML-first ECS on Three.js for VR/AR/360. Primitives
  (`<a-box>`…), declarative animation, controllers + hand tracking, AR hit-test,
  gaze interaction, direct Three.js access via `.object3D`.
- **When:** VR/AR experiences, 360° media viewers, WebXR prototypes, HTML-first/SEO
  3D, low-JS rapid prototyping.
- **Gotchas:** More overhead than raw Three for complex scenes; controller/hand-track
  support varies; CORS needs `crossorigin`; CSS transforms don't apply to 3D objects;
  use A-Frame inspector to debug. References: `webxr_guide.md`, `components_library.md`.
- **Pairs:** Three.js (`.object3D`), WebXR API, `gsap-scrolltrigger`, aframe-extras.

---

## 5. 2D, effects & asset layer

### pixijs-2d
- **Invoke:** `pixijs-2d`
- **What:** PixiJS — high-perf 2D WebGL/WebGPU. 100k+ sprites @60fps, filters
  (blur/displacement/color/custom shaders), vector Graphics, `ParticleContainer`,
  `AnimatedSprite`, BitmapText, object pooling.
- **When:** 2D games, particle systems, real-time data-viz with thousands of elements,
  sprite animation, 2D HUD over a 3D scene. When Canvas2D is too slow.
- **Gotchas:** `.destroy()` textures/sprites/filters (GPU leak); `Assets.load()` before
  `Sprite.from`; limit filters (1–2); BitmapText for changing numbers; display-tree
  z-order. References: `filters_effects.md`, `performance_guide.md`.
- **Pairs:** `threejs-webgl` (2D HUD over 3D), `gsap-scrolltrigger`, `motion-framer`.

### lightweight-3d-effects
- **Invoke:** `lightweight-3d-effects`
- **What:** Zdog (pseudo-3D vector) + Vanta.js (14+ animated WebGL backgrounds) +
  Vanilla-Tilt (parallax mouse/gyro tilt). Decorative 3D polish, <30KB combined, 60fps.
- **When:** Hero backgrounds, tilt cards, micro-interactions, parallax — visual polish
  WITHOUT Three.js overhead. Upgrade to Three when complexity grows.
- **Gotchas:** Vanta colors are hex **numbers** (`0x23153c`), not strings; one Vanta
  per page / lazy-load; `.destroy()` on unmount (SPA leaks); Zdog ≤~100 shapes,
  `updateRenderGraph()` after changes; Tilt needs gyro on mobile.
- **Pairs:** `gsap-scrolltrigger` (scroll-drive), `motion-framer` (container),
  `threejs-webgl` (upgrade path).

### lottie-animations
- **Invoke:** `lottie-animations`
- **What:** Lottie — render After Effects animations as vector JSON / `.lottie`.
  Play/pause/seek/loop/segment, runtime property edits, `DotLottieWorker` off-thread,
  scroll-driven playback. 10–100× smaller than GIF/video.
- **When:** **Designer-authored** AE animations, loaders, onboarding, animated icons,
  marketing motion — when a source animation file exists.
- **Gotchas:** **Requires an authored asset** (none → cannot use; this repo skipped
  Lottie for that reason). Only Bodymovin-supported AE features export; `.destroy()`
  on unmount; CORS for remote URLs; SVG vs Canvas renderer trade-off. References:
  `after_effects_export.md`, `performance_guide.md`.
- **Pairs:** `gsap-scrolltrigger` (scroll-driven), `motion-framer` (container),
  `rive-interactive` (when stateful interactivity is needed instead).

### rive-interactive
- **Invoke:** `rive-interactive`
- **What:** Rive — state-machine vector animation with runtime interactivity + two-way
  **ViewModel data binding**. Boolean/number/trigger inputs, custom events, React hooks
  (`useRive`, `useStateMachineInput`, `useViewModel`). Web/RN/iOS/Android/Flutter.
- **When:** Interactive animations with LOGIC — toggles, progress-bound loaders, form
  validation, data-reactive UI, stateful game-like UI. Beats Lottie when animation must
  know app state.
- **Gotchas:** **Requires an authored .riv asset.** Input/state names case-sensitive
  exact match; `autoBind:false` for manual ViewModel; `automaticallyHandleEvents:true`
  for events; store refs in `useRef`.
- **Pairs:** `motion-framer` (container), `gsap-scrolltrigger` (scroll-trigger states),
  `lottie-animations` (simpler timeline-only alt). **Flutter note:** Rive has a Flutter
  runtime — relevant for `apps/mobile`.

---

## 6. 3D authoring pipeline

> These CREATE assets that feed the 3D engines. Flow: **Blender/Spline (model) →
> Substance (PBR textures) → glTF/GLB → three/R3F/Babylon (render).**

### blender-web-pipeline
- **Invoke:** `blender-web-pipeline`
- **What:** Blender → glTF 2.0 (.glb) export + optimization automation via Python
  (bpy): batch export, Draco compression (60–90% smaller), decimation, texture
  downscale, LOD generation, PBR (Principled BSDF) → glTF.
- **When:** Producing/optimizing web 3D assets, batch processing, CI/CD asset pipelines.
- **Gotchas:** Enable Draco or files huge; save textures externally (packed/relative
  paths fail); bake NLA actions; only Principled BSDF exports; test in glTF viewer.
  Scripts: `batch_export.py`, `optimize_model.py`, `generate_lods.py`.
- **Pairs:** `substance-3d-texturing` (textures), `threejs-webgl`/`react-three-fiber`
  (GLTFLoader/useGLTF), `babylonjs-engine`.

### spline-interactive
- **Invoke:** `spline-interactive`
- **What:** Spline — browser-based no-code 3D editor; design/animate/export as React
  component, vanilla JS, public URL, or glTF. Built-in physics/particles, state-based
  animation, interactive events, AI generation.
- **When:** Designer-friendly/no-code 3D, fast prototyping, 3D landing pages,
  configurators where speed > fine control.
- **Gotchas:** Scene loads async (refs undefined until `onLoad`); store refs in
  `useRef`; full export URL only; mobile needs LOD/responsive; Next needs `/next`
  import or `ssr:false`.
- **Pairs:** `threejs-webgl` (export glTF + enhance), `motion-framer`,
  `gsap-scrolltrigger`, `substance-3d-texturing`.

### substance-3d-texturing
- **Invoke:** `substance-3d-texturing`
- **What:** Adobe Substance 3D Painter PBR authoring + web export. Metallic/roughness
  channels (baseColor/normal/metallic/roughness/AO), engine presets (Three/Babylon/
  glTF), batch export, channel/ORM packing, mobile optimization, Python API.
- **When:** Authoring PBR materials for web 3D, texture pipelines, batch export,
  real-time optimization.
- **Gotchas:** Correct color space (sRGB baseColor); normal Y-flip (OpenGL vs DirectX);
  metallic/roughness channel order (glTF: B=metallic, G=roughness); AO needs uv2;
  ≤2K hero / 1K standard; "infinite" padding for seams. Templates:
  `gltf_standard.json`, `mobile_webgl.json`, `threejs_optimized.json`.
- **Pairs:** `blender-web-pipeline`, `threejs-webgl`/`react-three-fiber`/`babylonjs-engine`.

---

## 7. Integration meta

### web3d-integration-patterns
- **Invoke:** `web3d-integration-patterns`
- **What:** META-skill for COMBINING Three.js + GSAP + R3F + Motion + React Spring into
  one app. Teaches 5 architecture patterns (Layered Separation; Unified React R3F+Motion;
  Hybrid R3F+GSAP; Physics R3F+React Spring; Scroll-Driven), state strategy (Zustand/
  refs), render-loop coordination, animation-conflict resolution, memory mgmt.
- **When:** Any experience layering **3+ libraries**, scroll-driven 3D + UI, or when
  deciding which library owns which layer. NOT a tutorial for single libraries.
- **Gotchas:** Needs competence in the underlying libs; the cardinal rule is **never
  let two libraries animate the same property**; React re-renders can tank Canvas perf
  (use refs); manual Three.js disposal.
- **Pairs:** all five foundation skills + `modern-web-design`. Load
  `references/integration-and-quality.md` alongside it.
