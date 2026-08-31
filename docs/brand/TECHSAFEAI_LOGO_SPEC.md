# TechSafeAI Logo — LOCKED SPECIFICATION (Founder, 31 Aug 2026)

Status: **LOCKED.** Do not restyle, reinterpret, or substitute without explicit Founder authority.
Master raster reference: `docs/brand/techsafeai-logo-master-reference.jpg` (Founder-supplied).
Production vector implementation: `src/components/BrandMark.astro` (traced from the master) + `.wordmark` / `.wordmark-ai` styles.

The following is the Founder's specification, recorded verbatim in substance:

## Prompt: TechSafeAI Logo

A professional, corporate logo centered on a solid dark charcoal gray background. The overall style is clean, minimalist, and forward-looking. The design is horizontally oriented, with a distinct visual emblem to the left and text to the right.

**Emblem details:** To the left is a geometric visual that symbolizes encryption, structure, and nested data.
- **Core symbol:** a wireframe neon cyan **hexagonal** border that encloses a single **3D isometric cube**, also rendered in cyan line work.
- **Connected network:** delicate, thin cyan lines extend outwards from the bottom vertices of the hexagonal border, connecting to a small cyan node (dot) at their terminals. This represents a dynamic, connected secure network or a data stream.

**Text details:** immediately to the right of the emblem, horizontally aligned, the company name **TechSafeAI**.
- **Colour and alignment:** all text clean white, baseline aligned to the bottom of the hexagonal symbol.
- **Typography:** modern, high-tech, geometric sans-serif.
- **Font weights:** distinct visual contrast — **"TechSafe"** moderately weighted; **"AI"** distinctly thinner, ultra-light/hairline, same family. Creates technical hierarchy and subtle differentiation.

**Final presentation:** centrally positioned with ample clear space; the neon cyan glow focused and sharp, not bleeding.

| Parameter | Specification |
| --- | --- |
| Orientation | Horizontal |
| Style | Minimalist, Corporate, Modern Tech |
| Primary palette | Neon Cyan **#00E5FF**, Clean White **#FFFFFF** |
| Background | Solid Dark Charcoal Gray #2D3436 (site renders on canonical navy surfaces) |
| Emblem structure | Hexagon with isometric cube + extended node network |
| Text | "TechSafe" (medium weight) + "AI" (ultra-light weight) |
| Font family | Geometric tech sans — implemented in Montserrat (500 / 200), per the spec's allowed families |

## Implementation notes (traced from the master at high zoom)

- Outer pointy-top hexagon, rounded corners; inner isometric cube (hexagon silhouette + top-face rhombus V + centre vertical edge) at ≈46% of frame width; **no** internal strut between cube and frame.
- Network is one continuous thin polyline: left open-circle node → vertical drop outside the left edge → 45° elbow passing beneath the bottom vertex → 45° rise to a right open-circle node beside the lower-right edge. Line weight ≈0.3× the hexagon stroke; nodes are small open circles.
- Colour is flat #00E5FF (no gradient). Any glow comes from context (CSS drop-shadow), never baked into the mark.
- `BrandMark.astro` accepts `compact` to omit the network at tiny sizes (favicon-class uses); default renders the full locked emblem.
- Applied: site header, footer, homepage hero eyebrow chip.
