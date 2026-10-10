# SZO ART

Local recreation of https://www.szo-art.de/, with a responsive layout, locally hosted artwork and fonts, and an accessible artwork viewer.

```sh
cd /Users/hauju/Nextcloud/lihau/SZO-ART/new
bun run dev
```

Open http://127.0.0.1:4173. No dependencies need installing.

```sh
bun run build # regenerate dist/ after edits
bun run start # serve the generated website
```

The generated `dist/` directory can be deployed to any static host supporting directory index pages. Configure `404.html` as the host's error document. No production deployment has been made.

- `build.ts`: shared layout and content for Home, Werke, Info, Kontakt and the three existing legal pages. Original route names are retained.
- `public/styles.css` and `public/app.js`: responsive styling, mobile menu, keyboard-accessible image viewer and email preparation.
- `works.json`: artwork titles and dimensions. `asset-sources.json` records the original local image paths. Original files were left untouched.

The contact form opens a prefilled email in the visitor's mail application. It does not send messages or store personal data. A copyable draft is provided if no mail application is configured. Direct form delivery would require a backend.

Legal texts live in `legal.json` and describe the GitHub Pages hosting (no cookies, no analytics, no third-party content). `legal-original.json` keeps the original Wix-era texts for reference.

## Verification

Build and local-link/asset checks pass. Desktop and mobile layouts and interactive flows are checked in Chromium using a file-based QA mirror. This environment prevents binding a local HTTP server, so the Bun HTTP preview could not be exercised here.

Design preserves the existing black background, Cinzel headings, logo, German copy and navigation. The refresh adds consistent spacing, responsive local WebP images, focus states and restrained interaction feedback. Paintings retain their original proportions and colors, including on hover. Layout variance: 5/10; motion: 3/10; density: 3/10.

## Review improvements

- Gallery order now follows rows, matching keyboard and viewer navigation. Artwork captions open the viewer; ordinary image links remain usable without JavaScript.
- Mobile selections use a shorter composition. Captions, footer links and viewer controls are larger; the viewer keeps its controls visible in portrait and landscape.
- Pre-generated 400px and 800px artwork variants reduce downloads. The combined 400px files total 604,880 bytes versus 8,587,764 bytes for the full-size artwork (93% smaller); full-size files are retained for the viewer.
- Checked 320px, 390px, 768px and 1440px layouts, keyboard dismissal and focus restoration, image-load error recovery, enquiry prefill, form validation and all generated local references. HTTP preview remains unverified under this environment restriction.

## Artwork detail pages

Every gallery item opens `/werke/<slug>` (for example `/werke/toscana`). Each page includes the original-image viewer, living-room and gallery-wall mockups, previous/next works and an enquiry link that prefills the contact subject. Room views switch with native buttons and remain available without JavaScript.

Artwork facts for 12 matching entries come from `../Beschriftung Bilder.docx` dated 10 December 2022. Unmatched facts are omitted rather than inferred from folder names. Pixel dimensions remain separate from the physical dimensions displayed on the page.

The living-room background comes from the existing mockups folder. The empty gallery wall was generated for this site. Both backgrounds are local WebP files. Original paintings are separate image elements, positioned with CSS without changing colors or aspect ratios. Room views are illustrative, not a calibrated representation of physical size. `asset-sources.json` records background provenance.

Validated all 26 generated pages, all local links/assets, every mockup’s wall bounds, keyboard room switching, the enlarged image and the gallery-to-detail-to-enquiry flow. Updated detail-page screenshots are in `previews/`.

## Themeable SVG logo

`public/assets/szo-art.svg` recreates the supplied logo with outlined letters and Bézier paths. It has a transparent background and no fonts, embedded bitmap, scripts or external dependencies. The build inlines this file in every header so its lettering and outer curve inherit the surrounding text color. The cropped viewBox makes the mark more legible at the existing header dimensions.

The four curves can be themed independently with `--logo-outer`, `--logo-cyan`, `--logo-violet` and `--logo-yellow`; `--logo-ink` optionally overrides the lettering. For example, add these overrides to a light theme:

```css
[data-theme="light"] {
  --logo-cyan: #007f94;
  --logo-violet: #7935ce;
  --logo-yellow: #9b8400;
}
```

For a monochrome logo, set the three colored variables to `currentColor`. Keep the SVG inline when inheriting page colors; an `<img>` does not inherit CSS variables from its parent. The symbol-only `szo-mark.svg` favicon includes its own light/dark system-color variants. The website's default theme remains dark.

`previews/logo-themes.png` compares the original with dark, light and monochrome SVG renders. SVG rendering, path bounds, generated headers and local asset references were checked for this change; a fresh browser check was unavailable in the restricted environment.
