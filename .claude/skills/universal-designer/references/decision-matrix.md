# UniversalDesigner — Decision Matrix (intent → skill)

Use at **Phase 2**. Find the row matching the intent, invoke the skill with the
**Skill tool**. When two skills could fit, the tie-breakers section is authoritative.

## A. By intent

| The task is… | Use | Notes |
|---|---|---|
| Set overall design strategy / motion philosophy / perf+a11y baseline | `modern-web-design` | Phase 1, first |
| Pick colors / fonts / layout / UX rules by product type | `ui-ux-pro-max` | run `--design-system` first |
| Make it look distinctive / bold / non-generic | `frontend-design` | after structure is set |
| Simple fade / slide / zoom reveal on scroll | `scroll-reveal-libraries` (AOS) | don't use GSAP for this |
| Scroll timeline, pin, scrub, parallax, horizontal-scroll, image-sequence | `gsap-scrolltrigger` | the scroll workhorse |
| Buttery smooth-scroll container / parallax depth feel | `locomotive-scroll` | usually + GSAP |
| Animated page-to-page transitions on a multi-page site | `barba-js` | + GSAP for the transition |
| React component animation: hover/tap/drag/layout/exit | `motion-framer` | default React motion |
| Natural physics, interruptible, momentum, inertia | `react-spring-physics` | over Motion for realism |
| Vanilla/SVG timeline, morph, line-draw, no React | `animejs` | small bundle |
| Drop in ready-made animated React components | `animated-component-libraries` | Magic UI + React Bits |
| 3D scene inside a React app | `react-three-fiber` | default 3D for React |
| 3D with maximum control / custom shaders / vanilla | `threejs-webgl` | imperative |
| 3D game / physics / WebXR / production tooling | `babylonjs-engine` | Havok built in |
| 3D game with ECS + visual cloud editor | `playcanvas-engine` | editor-first |
| VR / AR / 360° media / HTML-first 3D | `aframe-webxr` | WebXR |
| Thousands of 2D sprites / particles / 2D HUD over 3D | `pixijs-2d` | WebGL 2D |
| Decorative animated background / tilt cards, lightweight | `lightweight-3d-effects` | Vanta/Zdog/Tilt |
| Play a designer's After-Effects animation | `lottie-animations` | needs .json/.lottie asset |
| Interactive stateful vector animation w/ data binding | `rive-interactive` | needs .riv asset |
| Produce/optimize a 3D model for the web | `blender-web-pipeline` | → glTF |
| No-code 3D scene authored in a visual editor | `spline-interactive` | exports React/glTF |
| Author PBR textures/materials for a 3D asset | `substance-3d-texturing` | feeds the engines |
| Combine 3+ of the above into one experience | `web3d-integration-patterns` | architecture first |

## B. Overlap tie-breakers (the skills that get confused)

### Scroll reveal: AOS vs GSAP vs Motion
- **One-shot fade/slide as elements enter** → `scroll-reveal-libraries` (AOS). Lowest cost.
- **Scrubbed-to-scroll, pinned, sequenced, parallax, precise easing** → `gsap-scrolltrigger`.
- **Already in React and want `whileInView` reveals tied to component state** → `motion-framer`.
- Rule: don't run AOS and GSAP on the *same* element.

### Smooth scroll: Locomotive vs native
- Add `locomotive-scroll` ONLY when the design needs smooth-scroll/parallax *feel*. It
  is a **container**, not an animation engine — pair it with `gsap-scrolltrigger`
  (proxy) for the actual animations. Skip it on a11y-first/content sites.

### React motion: Motion vs React Spring
- **Motion** (`motion-framer`): declarative, gestures, layout/shared-element, exit,
  variants. Default for UI choreography.
- **React Spring** (`react-spring-physics`): physically accurate, interruptible,
  momentum-preserving. Choose for swipe/inertia/drag-to-dismiss and anything that must
  react mid-flight. Pick ONE as the project's primary; don't mix on one element.

### Vanilla motion: Anime.js vs GSAP
- **Anime.js**: smaller, great SVG morph/stagger, no scroll plugin depth.
- **GSAP**: richer ecosystem, ScrollTrigger, more robust for complex work. Prefer GSAP
  when scroll or large timelines are involved.

### 3D engine selection
| Need | Engine |
|---|---|
| React integration, component model | `react-three-fiber` |
| Full low-level control, custom render pipeline | `threejs-webgl` |
| Built-in physics, WebXR, GUI, production game | `babylonjs-engine` |
| ECS + cloud collaborative editor | `playcanvas-engine` |
| VR/AR/360, HTML-first, fastest prototyping | `aframe-webxr` |

R3F and Three.js are the same renderer — choose R3F in React, Three.js in
vanilla/when you need imperative control R3F abstracts away.

### Animation asset: Lottie vs Rive vs lightweight-effects
- **Lottie**: timeline playback of a designer's AE file. No app-state logic.
- **Rive**: state machine + two-way data binding; animation reacts to app state.
- **lightweight-3d-effects**: decorative, code-only, no authored asset needed.
- Decisive question: *is there an authored asset?* No asset → not Lottie/Rive. Needs
  logic/state → Rive over Lottie.

### 3D component: code vs no-code
- **Designers/no-code/speed** → `spline-interactive` (visual editor, exports React/glTF).
- **Engineers/control/perf** → `blender-web-pipeline` (model) + `threejs-webgl`/R3F (render).

## C. Common multi-skill recipes

| Goal | Skill stack (in order) |
|---|---|
| Premium animated landing page | `modern-web-design` → `ui-ux-pro-max` → `frontend-design` → `gsap-scrolltrigger` (+`locomotive-scroll`) → `animated-component-libraries` |
| 3D product configurator (React) | `ui-ux-pro-max` → `blender-web-pipeline` + `substance-3d-texturing` (assets) → `react-three-fiber` → `motion-framer` (UI) → `web3d-integration-patterns` |
| Scrollytelling story w/ 3D | `modern-web-design` → `gsap-scrolltrigger` → `react-three-fiber` (or `threejs-webgl`) → `web3d-integration-patterns` |
| Marketing site, simple + fast | `ui-ux-pro-max` → `scroll-reveal-libraries` → `animated-component-libraries` |
| Multi-page site w/ slick transitions | `frontend-design` → `barba-js` + `gsap-scrolltrigger` (+`locomotive-scroll`) |
| Dashboard / data-viz | `ui-ux-pro-max` (chart types) → `motion-framer` (count-ups, transitions) → `pixijs-2d` (only if 1000s of points) |
| Interactive stateful icon/loader | `rive-interactive` (if .riv exists) else `lottie-animations` (if .json) else `motion-framer`/`animejs` |
| VR / AR experience | `aframe-webxr` (or `babylonjs-engine` for advanced) + asset pipeline skills |

## D. Mobile (Flutter `apps/mobile`)

Most of these are **web-only**. For the Flutter app:
- `ui-ux-pro-max` has a Flutter stack profile — use it for color/type/UX decisions.
- `rive-interactive` has a Flutter runtime — viable for interactive vector animation.
- `lottie-animations` has a Flutter package (`lottie`) — viable if an asset exists.
- The 3D/web-DOM skills (Three.js, R3F, GSAP, AOS, Barba, Motion, etc.) **do not apply**
  to Flutter; translate the *design intent* to Flutter's own animation primitives
  (AnimationController, implicit/explicit animations, Hero, Rive/Lottie packages).
