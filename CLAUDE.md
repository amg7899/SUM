# ECOES JV website

Static site (plain HTML + CSS + a little JS, no build step) for ECOES JV, built page by page from the client's PDFs in `source/`. Published by GitHub Pages from the branch `claude/website-build-files-m52uk7` (root): https://amg7899.github.io/SUM/

## Working with the client
- The client writes in Bulgarian (sometimes English); answer in the language of their message. Site content is English only for now; Bulgarian may come later.
- Use the client's text verbatim. Do not add copy, taglines or sections. Fix only obvious typos, and report every fix. When unsure, ask.
- After every change: commit, push to the branch above, and send the live link plus screenshots.
- Photos for the HISTORY section of About us come from https://bulfire.ecoes.eu/about-us/. That host is not reachable from the cloud sandbox, so ask the client to upload them.

## Skills
Use both for all UI work:
- `.claude/skills/frontend-design` (Anthropic, Apache-2.0): design approach, plan → review against generic defaults → build → screenshot critique.
- `.claude/skills/ui-ux-pro-max` (MIT): UX rules and searchable design data. Run from the repo root, e.g.
  `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "focus visible keyboard" --domain ux`
  (the `${CLAUDE_PLUGIN_ROOT}` paths in its SKILL.md don't apply to this project install).

## Design system
Subject: an engineering company converting diesel trucks, buses and agricultural/construction machinery to electric, plus a mobile-charging franchise. Audience: fleet owners, municipalities, bodybuilders, farmers, investors.

- Palette: signal red `#e30613` (logo red; only for the € device, current-page marks and hover/focus), chassis graphite `#22282e` (text, frames, footer), steel `#5b6670` (secondary text), aluminium `#e9edf0` (page ground), white `#ffffff` (header, panels).
- Type: Science Gothic (display: masthead, panel titles; Bank Gothic lineage, reads like truck/machinery badging) + IBM Plex Sans (text, nav, labels). Both cover Cyrillic for a future Bulgarian version.
- About us: the JV plate is wired to the three company plates like a schematic (trunk, bus and drops in 2px graphite; on phones a rail down the left with ticks). Flags are SVGs in `assets/img/flags/` and mark each company's paragraph. The CEO photo is small (262×343), so it is never upscaled on desktop.
- Layout: left-aligned. White header with a 2px graphite rule. Masthead: full company name small, then the slogan "€CONOMY & €COLOGY" on one line spanning the content width, with the € glyphs in red (the one bold element). Home sections are one framed 2×2 grid of panels with shared 2px graphite rules, echoing the bordered boxes in `source/Home.pdf`. No floating cards, shadows or gradients.
- Document pages (Electric Conversion and later ones): ruled sections, heading column (sticky) + text column ≥1024px, square list markers, bold runs from the PDF as <strong> (IBM Plex 600), the closing all-caps sentence as the one big Science Gothic statement.
- Motion: only in response to the user (nav underline, panel caption turns red on hover/focus). Respect reduced motion.
- Quality floor: contrast ≥ 4.5:1, visible focus, 44px targets, WebP + JPEG with width/height, no horizontal scroll at 320–1920px. Check screenshots at 375 / 768 / 1024 / 1440.

## Structure
- `index.html`: Home. Each section page will live in its own folder with an `index.html`, matching the original ecoes.eu URLs: `about-us/`, `electric-conversion/`, `franchise/`, `electric-conversions-bus-truck/`, `electric-agro-truck-construction/`, `contact-us/`.
- `assets/css/style.css`, `assets/js/main.js`, `assets/img/`. The logo is redrawn as `assets/img/logo.svg`.
- Home collages in `assets/img/home/` are rebuilt from the images embedded in `source/Home.pdf` at their original positions (PyMuPDF + Pillow). The labels over them are HTML, positioned as in the PDF.

## Content issues to raise when building each page
- Home: "€COCLOGY" in the title was fixed to "€COLOGY" (reported).
- About us (built): fixed the Cyrillic "е" in "Turkish trade company" (reported). Still open: the HISTORY section (photos from bulfire.ecoes.eu/about-us/, *without* the three struck-through paragraphs after the note) and where it goes; add the "* * *" divider together with it. Asked whether "Electric power" should be lowercase.
- Contact us: London phone and address and Istanbul phone are still "XXX"; the client will send them later.
- ECOES Electric Conversion (built): added the missing "1." and "3.3." to the numbered headings and turned "*whether*" / "*when*" into italics (reported). Asked about "The carrot for electrical" (electric?).
- Images: the gear-and-lightning emblem (in Electric Conversion, Bus & trucks, Agro, FRANCHISE PDFs) is a Depositphotos preview with a visible watermark, so it is left off the site until the client buys the licence and uploads a clean file, or decides otherwise. One tractor photo carries a "TRACTOR.BG" mark (Home and Agro collages); mentioned to the client.
- Bus & trucks (built): text verbatim, no fixes needed (the "•The" spacing disappears in the list). Product layout: collage sticky beside the text on wide screens.
- Agro & construction: stray "-" near the top; EUIPO reference "015051941 0001" probably should be "015051941-0001" (ask).
- FRANCHISE (built): removed the duplicated opening sentence, "to to-e-cars" → "to e-cars", "100,000EUR" → "100,000 EUR", made "Flexible Configuration Tailored to Your Region:" a heading, and linked "Contact our central integration office in Sofia" to Contact us (all reported). Asked about: "Guaranteed Margins" wording, 2.5x–3x vs 250%–400%, payback "less than 12 months" vs "12 to 14 months", "about 70 vehicles" vs 1600 kWh ÷ 30–40 kWh ≈ 40–53, "$/€0.04/kW" (per kWh?), and "your complete Franchise Investment" (missing a word?).
