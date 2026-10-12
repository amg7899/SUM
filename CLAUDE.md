# ECOES JV website

Static site (plain HTML + CSS + a little JS, no build step) for ECOES JV, built page by page from the client's PDFs in `source/`. Published by GitHub Pages from the branch `claude/website-build-files-m52uk7` (root): https://amg7899.github.io/SUM/

## Working with the client
- The client writes in Bulgarian (sometimes English); answer in the language of their message. Site content is English only for now; Bulgarian may come later.
- Use the client's text verbatim. Do not add copy, taglines or sections. Fix only obvious typos, and report every fix. When unsure, ask.
- After every change: commit, push to the branch above, and send the live link plus screenshots.
- Photos for the HISTORY section of About us come from https://bulfire.ecoes.eu/about-us/. That host is not reachable from the cloud sandbox, so ask the client to upload them. The client will come back to HISTORY once they have all the information.
- Publishing: GitHub Pages must be switched on by the client (Settings → Pages → Deploy from a branch → this branch, / (root)); no tool here can do it. ecoes.eu currently answers with a certificate for another name (NET::ERR_CERT_COMMON_NAME_INVALID); moving the domain to GitHub Pages later needs DNS changes at the client's registrar.

## Skills
Use both for all UI work:
- `.claude/skills/frontend-design` (Anthropic, Apache-2.0): design approach, plan → review against generic defaults → build → screenshot critique.
- `.claude/skills/ui-ux-pro-max` (MIT): UX rules and searchable design data. Run from the repo root, e.g.
  `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "focus visible keyboard" --domain ux`
  (the `${CLAUDE_PLUGIN_ROOT}` paths in its SKILL.md don't apply to this project install).

## Design system (v2, "charged": dark, futuristic, translation-proof)
Subject: an engineering company converting diesel trucks, buses and agricultural/construction machinery to electric, plus a mobile-charging franchise. Audience: fleet owners, municipalities, bodybuilders, farmers, investors. The client asked for a futuristic, modern, professional look that still fits when the browser translates the page (v1, light "spec sheet", was rejected).

- Palette: void `#06090e` (page), hull `#0c1219` (plates), trace `rgba(148,178,210,.18)` (hairlines), ion `#edf2f8` (headings/emphasis), text `#c3cdd9`, mist `#93a1b3` (secondary), volt `#3db8ff` (energy: traces, focus, links, list markers), signal `#ff3344` (brand red: the € glyphs, current page, the solar-owners plate), paper `#fff` (plates that carry photos with white backgrounds).
- Type: Jost (display, 400–700; clean geometric, Futura lineage) + Geologica (text, 300–700, slnt for italics). Both have Cyrillic. Tektur was tried and rejected by the client as "childish, like a video game"; Jost approved.
- Shape: chamfered plates (top-right and bottom-left corners cut) with a 1px edge drawn along the cuts too; one shared rule in style.css (`.plate` and the component list next to it). Thin volt lines with a soft glow act as wiring: hero trace, About us schematic (trunk, bus, drops; rail with ticks on phones), section nodes on document pages.
- Home: hero with the company name small and "€CONOMY & €COLOGY" huge (wraps to two lines), the logo's globe drawn large and faint behind it, a trace that draws in once on load (the only non-user motion). Four tiles (plates) with the photo on a white inner plate, the PDF labels as chips above the photo, title + arrow below.
- Document pages: page head with grid texture and a short volt line under the title; ruled sections with a volt node, sticky heading column + text column ≥1024px; diamond list markers; callouts on a faint volt plate; the closing all-caps sentence as the big statement.
- Translation-proof rules: no nowrap on body text; containers grow with content; labels never sit on top of photos (chips wrap instead). Header: the menu button (☰) always sits left of the logo and opens every section full-screen; the row of links always stays on ONE line (client's rule): main.js scales its font and gaps down (to 74% at most) until it fits, re-checking on resize, font loads (`loadingdone`, a translation pulls in Cyrillic) and translation (`<html lang>`/class changes, link text changes); below 1024px, or if 74% is not enough, only the menu button remains. Each link carries our own Bulgarian name in `span.nav-l10n[lang=bg]`, shown via `html[lang|=bg]` when the browser translates to Bulgarian (client's wording: "ECOES конверсия…"; also Начало / Контакти and "селскостопанска и строителна техника"). Brand names, the slogan, e-mails, phone numbers and addresses carry `translate="no"`, with the neighbouring spaces moved inside those spans (translation drops the space next to them otherwise: "ECOESпреустройство").
- Test: pseudo-translate every page (Cyrillic, words ~45% longer) at 320/390/768/1024/1440 and check for horizontal overflow and clipped boxes (script used: Playwright, see git history of this note).
- Background drawings (client asked for faint ecology/future figures, patterns, symbols, diagrams): `assets/img/bg/eco-pattern.svg` (scattered Lucide symbols joined by dotted traces, behind the tiles and every page body at 13% opacity), `energy-flow.svg` (sun, wind, solar → battery → plug → truck, bottom-right of each page head at 30%; a dimmer copy in the full-screen menu), `eco-horizon.svg` (turbines, solar rows, pylons, trees, charger and an electric truck above the footer at 32%). Generated by a script from Lucide icons (ISC, licence in `assets/img/bg/LICENSE-lucide.txt`) plus hand-drawn turbines and pylons. The hero is unchanged (client likes it).
- Photos are being replaced by the client; image frames take any aspect ratio (the tile media flexes, figures are max 960px wide).
- Quality floor: contrast ≥ 4.5:1, visible 2px volt focus ring, 44px targets, WebP + JPEG with width/height, no horizontal scroll at 320–1920px, reduced motion respected.

## Structure
- `index.html`: Home. Each section page will live in its own folder with an `index.html`, matching the original ecoes.eu URLs: `about-us/`, `electric-conversion/`, `franchise/`, `electric-conversions-bus-truck/`, `electric-agro-truck-construction/`, `contact-us/`.
- `assets/css/style.css`, `assets/js/main.js` (nav fit + menu), `assets/img/`. The logo is redrawn as `assets/img/logo.svg` (light) and `assets/img/logo-dark.svg` (used on the dark site; brighter globe and a dark halo around the lettering; 62px tall in the header, 58px in the footer).
- Home collages in `assets/img/home/` are rebuilt from the images embedded in `source/Home.pdf` at their original positions (PyMuPDF + Pillow). The labels over them are HTML, positioned as in the PDF.

## Content issues to raise when building each page
- Home: "€COCLOGY" in the title was fixed to "€COLOGY" (reported).
- About us (built): fixed the Cyrillic "е" in "Turkish trade company" (reported). Still open: the HISTORY section (photos from bulfire.ecoes.eu/about-us/, *without* the three struck-through paragraphs after the note) and where it goes; add the "* * *" divider together with it. "Electric power" lowercased to "electric power" at the client's request.
- Contact us (built): one plate per office, rows aligned with subgrid; phones are tel: links, e-mails mailto:. London phone and address and Istanbul phone are still "XXX" (shown in signal red like the PDF); the client will send them. Asked about the Istanbul address order and "Bakirköy" (Bakırköy?). The large logo at the bottom of the PDF is left out (header and footer already carry it).
- ECOES Electric Conversion (built): added the missing "1." and "3.3." to the numbered headings and turned "*whether*" / "*when*" into italics (reported). "The carrot for electrical" stays as written (client's decision).
- Images: the gear-and-lightning emblem (in Electric Conversion, Bus & trucks, Agro, FRANCHISE PDFs) is a Depositphotos preview with a visible watermark, so it is left off the site until the client buys the licence and uploads a clean file, or decides otherwise. One tractor photo carries a "TRACTOR.BG" mark (Home and Agro collages); mentioned to the client.
- Bus & trucks (built): text verbatim, no fixes needed (the "•The" spacing disappears in the list). Product layout: collage sticky beside the text on wide screens.
- Agro & construction (built): dropped the stray "-" inside the collage box; EUIPO reference shown as "015051941-0001" to match the link in the PDF (reported). Asked: EUIPO registers designs, not patents ("protected by a patent").
- FRANCHISE (built): removed the duplicated opening sentence, "to to-e-cars" → "to e-cars", "100,000EUR" → "100,000 EUR", made "Flexible Configuration Tailored to Your Region:" a heading, and linked "Contact our central integration office in Sofia" to Contact us (all reported). Asked about: "Guaranteed Margins" wording, 2.5x–3x vs 250%–400%, payback "less than 12 months" vs "12 to 14 months", "about 70 vehicles" vs 1600 kWh ÷ 30–40 kWh ≈ 40–53, "$/€0.04/kW" (per kWh?), and "your complete Franchise Investment" (missing a word?).
