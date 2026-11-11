# Outset Innovation landing page

Static "coming soon" page for outsetinno.com, deployed by the Vercel project outsetinno-landing.

## Sprout easter egg

The sprout in the logo starts as an outline. Colour it in (finger, mouse or pen) and the page unlocks a
portfolio section (`#growing`) below the fold. Enter or Space on the focused sprout also unlocks it.

- `logo-wordmark.png` is `logo.png` with the sprout removed; `sprout.png` is the sprout alone
  (box x 592–778, y 22–226 of the 800 × 406 logo). Together they rebuild `logo.png` exactly.
- `THRESHOLD` (0.55) and `PAINT` (the accent the sprout is painted in) sit at the top of the script.
- Every visit starts locked (no memory of past unlocks); a page restored with the Back button reloads locked too.
- With JavaScript off the page is the plain coming-soon page.
