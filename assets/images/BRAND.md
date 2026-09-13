# Visual identity — Sales Rep

**Mark:** a location pin with a checkmark cut into its head — a visit, confirmed.
Reads clearly down to favicon size since it's two flat shapes, no gradients or fine detail.

**Color:** brand blue `#0A6EBD` (`#3B9EE5` in dark mode) — the same blue already used
for `primary` throughout the app's theme (`src/theme/tokens.ts`), so the icon/splash
aren't a separate palette bolted on, they're the app's own accent color. Blue reads
as trustworthy/enterprise, fits a B2B field-sales tool talking to Odoo.

**Where it's used** (`assets/images/`, wired in `app.json`):
- `icon.png` — full-bleed blue square, white mark centered (OS applies its own corner mask). Flat PIL mark, `py -3 scripts/gen_brand_assets.py`.
- `android-icon-background.png` + `android-icon-foreground.png` + `android-icon-monochrome.png` — same flat mark split into Android's adaptive-icon layers.
- `favicon.png` / `splash-icon.png` / `splash-icon-dark.png` — swapped to the glossy neon-glass version generated in Gemini (same pin+check shape, brand blue), chroma-keyed to a transparent cutout for the splash via `py -3 scripts/process_gemini_mark.py <source.jpg>` since expo-splash-screen paints its own background color behind it.

Two mark styles coexist on purpose right now (flat PIL vs. glossy Gemini) — say the
word to unify `icon.png`/Android layers onto the Gemini version too once you've
picked a direction. No image-gen API key is configured in this environment, so any
further Gemini-side generation has to happen in the Gemini UI directly and get
dropped into `assets/images/` (or `scripts/process_gemini_mark.py`'d) from there.
