# WKND Trendsetters — AEM + EDS

Fashion blog built on Adobe Edge Delivery Services (EDS) with content managed in AEM.

## Run locally

You need a static file server that serves ES modules correctly (`text/javascript` MIME type). **Do not open `index.html` directly in the browser** — ES module imports will fail over `file://`.

### Option 1 — Node `http-server` (quickest)

```bash
npx http-server . -p 3000 -c-1 --cors
```

Then open: **http://localhost:3000**

### Option 2 — Python

```bash
# Python 3
python3 -m http.server 3000
```

Then open: **http://localhost:3000**

### Option 3 — VS Code Live Server extension

1. Install the **Live Server** extension (ritwickdey.liveserver)
2. Right-click `index.html` → **Open with Live Server**

---

## Project structure

```
aem-eds-ue/
├── index.html              # Full page (simulates AEM Publish output)
├── nav.html                # Nav fragment fetched by nav.js
├── footer.html             # Footer fragment fetched by footer.js
├── fstab.yaml              # EDS mount points → AEM Publish URLs
├── paths.json              # AEM JCR path → EDS URL mappings
│
├── styles/
│   ├── styles.css          # Global tokens, typography, layout (loaded eagerly)
│   └── lazy-styles.css     # Animations, scrollbar (loaded after LCP)
│
├── scripts/
│   ├── aem.js              # EDS runtime: block auto-loader, CSS/JS injector
│   └── scripts.js          # Page init pipeline (eager → lazy → delayed)
│
└── blocks/
    ├── nav/                # Sticky header with dropdowns + mobile hamburger
    ├── hero/               # Full-viewport image carousel (3 slides, auto-play)
    ├── breadcrumb/         # Accessible breadcrumb trail
    ├── article-header/     # Category label, title, author, date, read time
    ├── gallery/            # 8-image responsive grid with lightbox
    ├── testimonials/       # Tabbed testimonials with avatar + star rating
    ├── cards/              # Article cards grid with hover lift effect
    ├── accordion/          # FAQ expandable items with keyboard navigation
    └── footer/             # Multi-column footer + newsletter sign-up
```

---

## How blocks work

Each block follows the EDS convention:

```
blocks/
  hero/
    hero.css   ← auto-injected into <head> when block is on the page
    hero.js    ← auto-imported as ES module; exports default decorate(block)
```

`aem.js` discovers every `<div class="hero">` in the DOM, then loads `/blocks/hero/hero.css` and `/blocks/hero/hero.js` automatically. No bundler, no build step.

---

## AEM + MSM + Translation flow

```
AEM Author
  └── Blueprint (/content/wknd-trendsetters/en)
        ├── MSM Rollout → /de  (German Live Copy)
        ├── MSM Rollout → /fr  (French Live Copy)
        └── MSM Rollout → /es  (Spanish Live Copy)
              └── Translation Workflow → TMS → back to Live Copy
                    └── Activate → AEM Publish
                          └── EDS syncs via fstab.yaml mount points
                                └── Edge CDN serves to end users
```

CSS and JS in this GitHub repo are **shared across all locales** — only content changes per language. Brand theming per locale is handled via CSS custom properties in `styles/styles.css`.

---

## Connect to real AEM

1. Update `fstab.yaml` — replace the placeholder AEM Publish URLs with your actual environment URLs
2. Update `paths.json` — adjust the JCR path mappings to match your content structure
3. Push this repo to GitHub and connect it to your EDS project via the AEM Sidekick plugin
