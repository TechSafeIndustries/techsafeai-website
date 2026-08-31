# UniversalDesigner — Architecture Playbook (Phase 0)

Goal: before any design decision, **understand the product and its architecture** so
the chosen skills fit the codebase instead of fighting it. Run the detector, then
read the project, then map stack → eligible skills and constraints.

## Step 1 — Run the detector

```bash
bash scripts/detect_stack.sh [project-root]   # defaults to CWD
```

Outputs: framework + version, package manager, monorepo workspaces, already-installed
design/animation/3D libraries, presence of a Flutter app, and a recommended-skills
shortlist. Treat its output as a starting hypothesis, then confirm by reading files.

## Step 2 — Read the project (confirm by hand)

1. **Manifests:** `package.json` (deps + versions, esp. React/Next/Vue/Svelte and any
   of three/@react-three/fiber/gsap/motion/framer-motion/locomotive-scroll/aos/
   lottie/@rive-app/pixi.js), `pubspec.yaml` for Flutter.
2. **Framework config:** `next.config.*`, `vite.config.*`, `svelte.config.*`,
   `tailwind.config.*`, tsconfig — establishes SSR/RSC, bundler, styling system.
3. **One representative component:** match the existing styling approach (Tailwind /
   CSS Modules / styled-components / vanilla), component patterns, and file layout.
4. **Existing design infrastructure:** search for already-built motion/effects/3D
   utilities and reusable components — **extend these, don't duplicate**.

## Step 3 — Map stack → eligible skills

| Detected stack | Primary execution skills | Avoid / N/A |
|---|---|---|
| **React (Vite/CRA)** | `react-three-fiber`, `motion-framer`, `react-spring-physics`, `animated-component-libraries`, `gsap-scrolltrigger` (via `useGSAP`) | raw `threejs-webgl`/`animejs` only when a reason exists |
| **Next.js (App Router/RSC)** | same as React + mind **client boundaries**: 3D/motion must be in `"use client"` components; never pass functions server→client | SSR-unsafe direct imports (Spline → `/next` or `ssr:false`) |
| **Vue** | `gsap-scrolltrigger`, `locomotive-scroll`, `scroll-reveal-libraries`, `animejs`, `threejs-webgl`, `lottie-animations` (vue), `aframe-webxr` | React-only: `motion-framer`, `react-spring-physics`, `react-three-fiber`, `animated-component-libraries` |
| **Svelte** | `gsap-scrolltrigger`, `locomotive-scroll`, `animejs`, `threejs-webgl`, `lottie-animations`, AOS | the React-only skills above |
| **Vanilla / static** | `gsap-scrolltrigger`, `locomotive-scroll`, `scroll-reveal-libraries`, `barba-js`, `animejs`, `threejs-webgl`, `babylonjs-engine`, `aframe-webxr`, `pixijs-2d`, `lightweight-3d-effects` | all React-only skills |
| **Flutter (`apps/mobile`)** | `ui-ux-pro-max` (Flutter profile), `rive-interactive` (Flutter runtime), `lottie-animations` (Flutter pkg) → otherwise translate intent to Flutter animation primitives | all web-DOM/WebGL skills |

The **design-system/taste skills** (`modern-web-design`, `ui-ux-pro-max`,
`frontend-design`) apply to **every** stack — they inform decisions, not DOM code.

## Step 4 — Capture hard constraints (project facts, not preferences)

Always check and respect:
- **React version & peer deps.** React 19 broke several peer ranges. In THIS repo,
  **drei was dropped** due to a React-19 peer conflict — verify before adding any
  three-ecosystem package; prefer plain `@react-three/fiber` + `three` if drei conflicts.
- **SSR / RSC boundaries (Next).** 3D/animation are client-only; mark `"use client"`;
  never pass a function as a prop from a server component to a client component (a known
  RSC 500 source). Dynamic-import heavy 3D with `ssr:false`.
- **Authored-asset availability.** `lottie-animations` needs a `.json`/`.lottie`,
  `rive-interactive` needs a `.riv`. No asset → choose a code-driven skill instead
  (this repo skipped Lottie/Rive for lack of authored assets).
- **Bundle / performance budget.** Babylon (~2MB) vs Three core (~150KB); GSAP ~27KB;
  WebGL component fleets are mobile-expensive. Lazy-load and gate by device.
- **Responsive requirement.** Every UI change must work on mobile/tablet/desktop and
  must not break the Flutter app — standing repo rule. Verify before finishing.
- **Existing infra.** Reuse current AnimatedNumber/Accordion/Skeleton/effects/AuthShell
  etc.; don't rebuild equivalents.

## Step 5 — Decide the layer(s) and proceed

Classify the work into one or more layers, then go to Phase 1 (taste) and Phase 2
(routing via `decision-matrix.md`):
- **Taste/design-system** — direction, colors, type, UX rules.
- **UI motion** — component animation, micro-interactions, transitions.
- **Scroll** — reveals, scrollytelling, parallax, smooth scroll.
- **3D** — scenes, configurators, viewers, VR/AR.
- **Asset authoring** — models + textures feeding 3D.
- **Integration** — when 3+ libraries combine.

## This repo (codex0max) — known facts

- **Monorepo**: web app in `apps/web` (Next.js), Flutter app in `apps/mobile`.
- Active branch work has been **browse/listing-card UX + currency** defect fixes.
- Prior web UI redesign used **three + @react-three/fiber**, **drei dropped**
  (React-19 peer conflict), **Lottie/Rive skipped** (no authored assets), and reused
  existing effects/AuthShell/AnimatedNumber/Accordion/Skeleton infra.
- Standing rule: responsive across mobile/tablet/desktop and **do not break the mobile
  app**. Confirm `apps/web` exact framework/version with the detector before assuming.
