# three.js 0.186.0, served from the site

The loading screen's 3D PC, the live wallpaper and Home's episode desk load three.js from here (`index.html`'s import
map, `crt3d/crt.js`'s Draco path). Until 2026-10-05 they loaded it from cdn.jsdelivr.net. A network that drops
packets to jsDelivr without refusing them kept the loading screen waiting about 150 seconds, since the screen has no
time limit. The fonts were moved onto the site for the same reason (2026-09-29).

Where each file came from (2026-10-05):

- `examples/jsm/**`, `LICENSE`: the npm package three@0.186.0
  (integrity sha512-cr/fIM2ddMSVbYVgkfD4jLJv7Fh/8ZTjvo+7gQeSVGUZHxpx9FDwoL5iC7hUz/LiRA8wMbqfnb90xKfm1/HHkQ==),
  byte for byte. They are the same files cdn.jsdelivr.net/npm/three@0.186.0 serves.
- `build/three.module.min.js`, `build/three.core.min.js`: jsDelivr's own minified copies of the package's
  `build/three.module.js` and `build/three.core.js` (Terser 5.48.0, named in each file's head), the files the site
  ran from the CDN. The npm package ships no `.min.js`. `three.module.min.js` imports `./three.core.js`, so the import
  map points that address at `three.core.min.js`.

three.js is MIT licensed (`LICENSE`). The folder carries its version in its name, and `_headers` at the site's root
lets browsers keep it for a year (immutable). A new version goes in a new folder, never over this one.
