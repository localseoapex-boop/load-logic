# Fonts

**Archivo** (variable: `wght` 400-800, `wdth` 75-125), self-hosted.

- `archivo-latin-var.woff2` — latin subset, preloaded, covers all site copy
- `archivo-latin-ext-var.woff2` — latin-extended subset, loaded on demand
- `OFL.txt` — SIL Open Font License 1.1, under which Archivo is distributed

Downloaded from the Google Fonts CDN and committed so the site has no runtime
dependency on a third-party font host. No `<link>` to fonts.googleapis.com and no
`@fontsource` package.

One family covers both display and text roles through its weight and width axes,
which keeps the payload to a single 90 KB file for the latin subset. Numbers in
data contexts use the system monospace stack instead, at zero download cost.
See DESIGN.md section 3.

To update: re-request the CSS from the Google Fonts API with a modern browser
user agent, then download the woff2 URLs it returns.
