#!/usr/bin/env bash
# UniversalDesigner — Phase 0 stack detector.
# Inspects a project and reports framework, package manager, monorepo layout,
# already-installed design/animation/3D libraries, and a recommended-skills shortlist.
# Usage: bash detect_stack.sh [project-root]   (defaults to current directory)
# No dependencies beyond coreutils + grep (jq optional, not required).

set -uo pipefail
ROOT="${1:-.}"
ROOT="$(cd "$ROOT" 2>/dev/null && pwd || echo "$ROOT")"

say() { printf '%s\n' "$*"; }
hr()  { printf '%s\n' "----------------------------------------------------------------"; }

if [ ! -d "$ROOT" ]; then
  say "ERROR: '$ROOT' is not a directory."; exit 1
fi

say "UniversalDesigner — stack detection"
say "Project root: $ROOT"
hr

# Collect package.json files (root + up to 3 levels of workspaces), skip node_modules.
PKG_FILES="$(find "$ROOT" -maxdepth 4 -name package.json -not -path '*/node_modules/*' 2>/dev/null)"
ROOT_PKG="$ROOT/package.json"
PUBSPEC="$(find "$ROOT" -maxdepth 4 -name pubspec.yaml -not -path '*/node_modules/*' 2>/dev/null | head -1)"

# Helper: does any package.json mention a dependency name?
has_dep() { # $1 = dep name (literal, dots/hyphens ok)
  [ -n "$PKG_FILES" ] || return 1
  printf '%s\n' "$PKG_FILES" | while read -r f; do
    [ -n "$f" ] && grep -Eq "\"$(printf '%s' "$1" | sed 's/[.[\*^$()+?{|]/\\&/g')\"[[:space:]]*:" "$f" 2>/dev/null && { echo HIT; break; }
  done | grep -q HIT
}

# Helper: read a dep's version string (first match across package.json files).
dep_ver() {
  [ -n "$PKG_FILES" ] || return 0
  printf '%s\n' "$PKG_FILES" | while read -r f; do
    [ -n "$f" ] || continue
    grep -E "\"$1\"[[:space:]]*:" "$f" 2>/dev/null | head -1 | sed -E 's/.*:[[:space:]]*"([^"]+)".*/\1/'
  done | grep -v '^$' | head -1
}

# ---------- Package manager ----------
PM="unknown"
[ -f "$ROOT/pnpm-lock.yaml" ] && PM="pnpm"
[ -f "$ROOT/yarn.lock" ] && PM="yarn"
[ -f "$ROOT/package-lock.json" ] && PM="npm"
[ -f "$ROOT/bun.lockb" ] && PM="bun"

# ---------- Monorepo ----------
MONO="no"
{ [ -f "$ROOT/pnpm-workspace.yaml" ] || grep -q '"workspaces"' "$ROOT_PKG" 2>/dev/null; } && MONO="yes"
WS_COUNT="$(printf '%s\n' "$PKG_FILES" | grep -c . 2>/dev/null || echo 0)"

# ---------- Framework ----------
FW="unknown"
if has_dep "next"; then FW="Next.js (React, may use SSR/RSC)"
elif has_dep "react"; then FW="React"
elif has_dep "vue"; then FW="Vue"
elif has_dep "svelte"; then FW="Svelte"
elif [ -n "$PKG_FILES" ]; then FW="vanilla / other JS"
fi
REACT_VER="$(dep_ver react)"

say "Package manager : $PM"
say "Framework       : $FW${REACT_VER:+   (react $REACT_VER)}"
say "Monorepo        : $MONO   (package.json files found: ${WS_COUNT})"
[ -n "$PUBSPEC" ] && say "Flutter app     : yes  ->  $PUBSPEC"
hr

# ---------- Installed design/animation/3D libraries ----------
say "Already-installed design libraries:"
# label|dep|skill
LIBS="
GSAP|gsap|gsap-scrolltrigger
Locomotive Scroll|locomotive-scroll|locomotive-scroll
AOS (scroll reveal)|aos|scroll-reveal-libraries
Barba.js|@barba/core|barba-js
Framer Motion / Motion|framer-motion|motion-framer
Motion (motion pkg)|motion|motion-framer
React Spring|@react-spring/web|react-spring-physics
Anime.js|animejs|animejs
Three.js|three|threejs-webgl
React Three Fiber|@react-three/fiber|react-three-fiber
drei|@react-three/drei|react-three-fiber
Babylon.js|@babylonjs/core|babylonjs-engine
PlayCanvas|playcanvas|playcanvas-engine
A-Frame|aframe|aframe-webxr
PixiJS|pixi.js|pixijs-2d
Vanta|vanta|lightweight-3d-effects
Zdog|zdog|lightweight-3d-effects
Vanilla-Tilt|vanilla-tilt|lightweight-3d-effects
Lottie (web)|lottie-web|lottie-animations
Lottie (react)|lottie-react|lottie-animations
dotLottie|@lottiefiles/dotlottie-react|lottie-animations
Rive|@rive-app/react-canvas|rive-interactive
Spline|@splinetool/react-spline|spline-interactive
Tailwind|tailwindcss|ui-ux-pro-max
shadcn (ui)|shadcn|animated-component-libraries
"
# Capture matches in a single pass (command substitution avoids subshell scope bugs).
FOUND="$(printf '%s\n' "$LIBS" | while IFS='|' read -r label dep skill; do
  [ -z "$dep" ] && continue
  if has_dep "$dep"; then
    v="$(dep_ver "$dep")"
    printf '  [x] %-26s %-14s -> skill: %s\n' "$label" "${v:-installed}" "$skill"
  fi
done)"
if [ -n "$FOUND" ]; then
  printf '%s\n' "$FOUND"
else
  say "  (none detected — greenfield design surface, or deps not yet installed)"
fi
hr

# ---------- Recommendations ----------
say "Recommended skills for this stack (Phase 2 routing — see decision-matrix.md):"
say "  Always (taste layer): modern-web-design, ui-ux-pro-max, frontend-design"
case "$FW" in
  Next.js*) say "  Motion/3D: motion-framer, react-three-fiber, react-spring-physics, gsap-scrolltrigger";
            say "  NOTE: mark 3D/motion components \"use client\"; no fn props server->client; Spline via /next or ssr:false." ;;
  React)    say "  Motion/3D: motion-framer, react-three-fiber, react-spring-physics, gsap-scrolltrigger, animated-component-libraries" ;;
  Vue)      say "  Motion/3D: gsap-scrolltrigger, locomotive-scroll, scroll-reveal-libraries, animejs, threejs-webgl, lottie-animations";
            say "  AVOID (React-only): motion-framer, react-spring-physics, react-three-fiber, animated-component-libraries" ;;
  Svelte)   say "  Motion/3D: gsap-scrolltrigger, locomotive-scroll, animejs, threejs-webgl, lottie-animations, scroll-reveal-libraries";
            say "  AVOID (React-only): motion-framer, react-spring-physics, react-three-fiber, animated-component-libraries" ;;
  *)        say "  Motion/3D (vanilla): gsap-scrolltrigger, locomotive-scroll, barba-js, scroll-reveal-libraries, animejs, threejs-webgl, babylonjs-engine, pixijs-2d, lightweight-3d-effects, aframe-webxr" ;;
esac
[ -n "$PUBSPEC" ] && {
  say "  Flutter (apps/mobile): ui-ux-pro-max (Flutter profile), rive-interactive (Flutter runtime), lottie-animations (Flutter pkg).";
  say "    Web-DOM/WebGL skills do NOT apply to Flutter — translate design intent to Flutter animation primitives.";
}

# ---------- Constraint flags ----------
hr
say "Constraint checks:"
case "$REACT_VER" in
  *19*) say "  [!] React 19 detected — verify three-ecosystem peer deps (drei often conflicts; this repo dropped drei)." ;;
esac
if has_dep "@react-three/fiber" && ! has_dep "@react-three/drei"; then
  say "  [i] R3F present without drei — consistent with the known React-19/drei-dropped setup; don't add drei without checking peers."
fi
if ! has_dep "lottie-web" && ! has_dep "lottie-react" && ! has_dep "@lottiefiles/dotlottie-react"; then
  say "  [i] No Lottie runtime — lottie-animations needs a runtime + an authored .json/.lottie asset."
fi
if ! has_dep "@rive-app/react-canvas" && ! has_dep "@rive-app/canvas"; then
  say "  [i] No Rive runtime — rive-interactive needs a runtime + an authored .riv asset."
fi
say "  [*] Standing rule: every UI change must be responsive (mobile/tablet/desktop) and must not break apps/mobile."
hr
say "Next: Phase 1 (taste: modern-web-design -> ui-ux-pro-max --design-system -> frontend-design),"
say "      then Phase 2 routing via references/decision-matrix.md."
