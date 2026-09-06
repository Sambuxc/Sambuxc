# Interest themes

The portfolio remains a static HTML/CSS/JavaScript site. There are no new dependencies or build steps. The four interests are independent of light/dark mode; Tech + Dark is the first-visit default. The existing footer colour switch still works.

## Where to customise

| File | Responsibility |
| --- | --- |
| `assets/themes/config.js` | Labels, short descriptions, both palettes, heading fonts, corners, hover/reveal/parallax motion and validated preference storage |
| `assets/themes/themes.css` | Background patterns, theme-specific styling, responsive selector, reduced-motion and print rules |
| `assets/themes/controller.js` | Selector interactions, native mobile dialog, footer switch and scroll-driven parallax |
| `index.html` | Content, script/style inclusion and parallax targets |

In `config.js`, each `light` / `dark` palette contains these seven colours in order:

1. Page background
2. Card/menu surface
3. Raised/selected surface
4. Primary text
5. Secondary text
6. Primary accent
7. Secondary accent

Both palettes update the existing `--color-*` and `--card-*` tokens. Heading `font` values reuse the site's existing loaded fonts or system fallbacks. `radius` controls card, tag and portrait corners.

Default personalities:

| Key | Appearance | Interaction |
| --- | --- | --- |
| `boards` | Lime accents, angular cards, bold headings, diagonal lines | Snappy lift/tilt, sideways parallax |
| `paragliding` | Sky blue, rounded cards, open gradients, serif headings | Gentle lift, slower reveals, vertical drift |
| `tech` | Indigo and mint, monospace headings, subtle grid | Precise short transitions, fine hover border, restrained depth |
| `music` | Amber and rose, warm surfaces, italic serif heading, horizontal lines | Soft tilt/scale, eased reveals, diagonal parallax |

Motion fields: `duration` (milliseconds), `easing` (CSS timing function), `lift` (pixels), `tilt` (degrees), `scale` (ratio), `revealX` / `revealY` (pixels), `parallaxX` / `parallaxY` (maximum pixels). Set both parallax values to `0` to disable it for a theme. Parallax currently moves the decorative background and portrait, is capped after one viewport of scrolling, and is reduced to 40% on mobile. It never moves body copy or controls. Hover transforms apply only to hover-capable devices. All nonessential motion respects `prefers-reduced-motion`, including live preference changes.

The selector is built from the configuration, so changing a label updates it everywhere. To add an interest, add a unique key to `themes` and optionally its `[data-interest="your-key"]` CSS pattern. Keep Tech available unless you also change the default.

For personal photos, replace the existing portrait asset references in `index.html`, or extend a theme's CSS background with an image you own. No stock or generated photos have been added.

## Behaviour and integration

- The small configuration script runs before CSS so saved colours are applied before paint.
- Appearance uses `sb-appearance-v1` in local storage; this version has no expiry. Unexpired `theme-preference` and the old `sb-theme` light/dark choices migrate on first use. Invalid choices are ignored. Blocked storage degrades to session-only switching.
- Desktop uses a floating button and non-modal dialog. Mobile uses `showModal()` for native focus containment, an inert background, and a side drawer. Escape, the close button and clicking outside close it; focus returns to the trigger. Crossing the mobile breakpoint closes it to reset modality.
- Native radio groups support keyboard selection. Theme changes keep focus and the menu open so visitors can compare. Colour is supplemented by checked radio indicators.
- Without JavaScript, the content stays visible and the nonfunctional selector is omitted.
- The existing career timeline remains horizontal on desktop and vertical on mobile. Its cards now account for the mobile gutter. Desktop wheel scrolling releases at either end, and the track can receive keyboard focus.
- `sb:themechange` dispatches on `document` with `{ interest, scheme }` as its detail. `window.SBThemes.apply({ interest, scheme }, true)` applies and stores an appearance; `getPreference()` returns a copy.
- The unused `assets/theme.js` and standalone `pages/` / `components/` prototype fragments have been preserved. The live `index.html` uses `assets/main.js` plus the new theme scripts.

## Validation

Run the dependency-free preference regression tests:

```sh
node --test tests/themes.test.cjs
node --check assets/themes/config.js
node --check assets/themes/controller.js
node --check assets/main.js
```

Browser/visual testing is still required before merging: compare all eight interest/scheme combinations; reload a saved selection; use Tab, radio arrow keys and Escape; verify the mobile drawer's focus containment and backdrop; resize while open; enable reduced motion; inspect 320px width and 200% text zoom; check the horizontal timeline and print layout. No browser QA was performed for this change.

## Deployment

This repository's current workflow deploys pushes to `main` to Fasthosts. Review and merge deliberately. This change does not alter hosting, deploy the site, or add a second Sites project.

An unrelated existing workflow issue was observed: SSH setup writes `~/.ssh/id_ed25519`, while the rsync command references `~/.ssh/gh_deploy_sambuxc`. This theme change leaves that workflow untouched; check the key path before relying on deployment.
