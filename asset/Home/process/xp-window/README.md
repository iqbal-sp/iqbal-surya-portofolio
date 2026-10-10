# One XP window — Concept 02

Four original 2D vector assets. One centred window per episode, using the portfolio's existing Luna palette and caption-button gradients:

1. **Notepad** — Scope, Budget and Timeline fields.
2. **Paint** — Three connected wireframe pages.
3. **Picture Viewer** — One illustrative interface with a cursor.
4. **Explorer** — Design, Components and Notes files.

Every window has identical bounds and a saturated blue title bar, native-style window controls, a red-orange close button and cream chrome. There are no floating folders, sticky notes or comment cards.

Each asset includes a self-contained editable **SVG**, a transparent **1700 × 1000 PNG**, and a transparent **850 × 500 WebP**. SVGs embed the portfolio's Noto Sans fonts. Background, CRT effect, television bezel and episode captions are separate from the asset. Content is illustrative, not a screenshot of a client project. Brief values are placeholders.

Preview: `prototype/process-desktop/index.html` on the project preview server. `contact-sheet.png` includes the CRT glass layers; `contact-sheet-clean.png` shows the same wallpaper without the glass layers. `mobile-preview.png` shows the mobile layout.

## Blue wallpaper and CRT glass

`crt-wallpaper.svg` (also exported as PNG) adds a softly lit cobalt ribbon to the broadcast-blue background. `crt.css` and `crt-grain.svg` add static monochrome grain, fine scanlines, a restrained edge vignette and a soft reflection across the whole composition. The CRT toggle controls the glass layers while retaining the wallpaper. A short horizontal sweep plays once when the episode changes. Both the sweep and image fade respect reduced motion.

`ep*-crt.png` and `ep*-crt-850.webp` are complete opaque compositions with the wallpaper and glass already applied. They omit the television bezel and episode caption so they can be used directly inside the existing television. The original SVG and transparent PNG files remain available for separate-layer integration.

For a layered composition, use a `.crt-display` container with a `.crt-picture` image and a `.crt-surface` overlay containing `.crt-grain` and `.crt-reflection` spans. An ancestor with `.crt` enables the glass layers. Keep these decorations `aria-hidden` and pointer-transparent. See the preview for the exact markup. `tv-preview.png` shows one episode with the caption included.

Regenerate: `node prototype/process-desktop/generate-xp.mjs`.
Export and verify with `prototype/process-desktop/render.mjs` using the existing Playwright/Sharp runtime. No package installation is needed.
Generate the wallpaper and grain with `node prototype/process-desktop/generate-crt.mjs` before exporting.

Concept 01 is preserved in `asset/Home/process/desktop-story/` and its original generator is `prototype/process-desktop/generate.mjs`.

The approved concept is integrated into the portfolio's process section through `shared/content.js`, `option-a-desktop/app.js`, and the `crt.css` stylesheet loaded by `option-a-desktop/index.html`. The former episode 3D desk renderer is no longer loaded. The original remote and bilingual section copy are preserved. This describes the working checkout; public deployment is a separate action.

Mouse interaction is implemented in `option-a-desktop/process-crt.js`: a local SVG displacement field and faint phosphor glow follow the pointer, respond to movement speed, and settle on rest or exit. Touch and reduced motion do not activate the effect. Verify the real portfolio section with `prototype/process-desktop/verify-integration.mjs` and `verify-pointer.mjs` against the configured local preview URL.
