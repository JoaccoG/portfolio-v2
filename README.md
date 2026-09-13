<div align="center">

# The Daily Godoy

**A software engineer's portfolio, printed as a 1926 broadsheet. Blackletter masthead, engraved portrait, a stock ticker across the top — and every headline is about code shipped in 2026.**

[![License: MIT](https://img.shields.io/badge/License-MIT-F2EAD8?style=flat-square&labelColor=1C1710)](LICENSE)
[![Astro](https://img.shields.io/badge/Astro-7-F2EAD8?style=flat-square&labelColor=1C1710)](https://astro.build/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-F2EAD8?style=flat-square&labelColor=1C1710)](https://www.typescriptlang.org/)
[![Biome](https://img.shields.io/badge/Biome-lint_&_format-F2EAD8?style=flat-square&labelColor=1C1710)](https://biomejs.dev/)
[![Railway](https://img.shields.io/badge/Railway-deploy-F2EAD8?style=flat-square&labelColor=1C1710)](https://railway.app/)

[![CI](https://github.com/JoaccoG/portfolio-v2/actions/workflows/ci.yml/badge.svg)](https://github.com/JoaccoG/portfolio-v2/actions/workflows/ci.yml)

**[▶ joaquingodoy.com](https://joaquingodoy.com)**

<img src=".github/media/preview.webp" width="820" alt="The front page: a blackletter masthead reading 'The Daily Godoy' over a cream newsprint sheet, the headline 'SOFTWARE WITH A SPINE.' set beside an engraved portrait captioned 'MR. J. GODOY, ENGINEER', a stock ticker running across the top and an 'In this edition' index down the right." />

</div>

---

> All the code that is fit to ship.

**The Daily Godoy** is the personal site of Joaquín Godoy, laid out as the front page of a newspaper that went to press in 1926 — nameplate in blackletter, a weather box, a running ticker, an engraved portrait of the correspondent. Every story underneath is about software written in 2026. The furniture is period; the chronicle is current; the gap between the two is the whole joke.

It is one long broadsheet you scroll, in English or in Spanish: a masthead that assembles itself on load, a pinned *Profile Piece* told in four parts, a hall of machinery where each project opens into its own inside page, a standing column with its own archive and index, a postmaster you can wire a telegram to, and a torn back page for anything that 404s. No framework runs the motion — the intro, the reveal, the custom cursor, the pinned scroll and the project drawers are a small hand-written engine. What React would carry, this carries itself.

## The type

Five faces, one of them cut by hand. **UnifrakturMaguntia** sets the nameplate, **Abril Fatface** the headlines, **Old Standard TT** the body columns, **Caveat** the marginalia. The fifth is **TDG Ornaments** — the pointing hands, the fleuron and the ticker's markers (`▼ ☜ ☞ ✦ ❦`). Those glyphs are the kind a browser renders from whatever the operating system happens to keep, so they land differently on every machine. So they were subset out of Noto Sans Symbols 2 with `pyftsubset` into a face that carries those five characters and nothing else — **4,476 bytes** — and prepended to every stack. Now a fleuron is a fleuron everywhere, not a tofu box on the one laptop that lacks it.

## Measured, not claimed

The paper is the whole atmosphere, and it nearly sank the frame rate. The mottle, grain and dots began as procedural SVG (`feTurbulence`) composited live — beautiful, and **raster-bound**: every scroll re-rasterised the turbulence, and the compositor throttled the page to a crawl. So the textures were baked once, in the browser, into opacity-folded WebP tiles and fused with a single `background-blend-mode: multiply` instead of a stack of `mix-blend-mode` layers — one raster per tile, no per-tile `saveLayer`. Same paper, measured back to the same speed as no paper at all, and the mobile textures that had been cut came back for free.

| paper pipeline | per-frame | scroll |
|:--|--:|--:|
| procedural SVG `feTurbulence`, live | ~33 ms | ~30 fps |
| textures off — the ceiling | ~8 ms | ~120 fps |
| **baked WebP + blend fusion — shipped** | **~15 ms** | **~65 fps** |

Taken on an Apple M1 Pro at DPR 2 in Chrome — wall-clock per frame from an inline probe, while actually scrolling. The shipped figure held on an external DPR-1 monitor and on an iPhone. It varies with the machine, which was exactly the point of baking them: a visitor is not owed an M-series to read a newspaper. The baked tiles are lossless on purpose — a lossy encode passed the eye but failed a wrap-around seam check, and a tile that doesn't seam wrecks a repeating background.

The scroll used to be hand-rolled too: the page held still while a script translated the whole broadsheet on every frame. Chrome coped; Safari fell to 7–19 fps, because rewriting custom properties on the root element sixty times a second made it recalculate the style of the entire document. So the browser scrolls natively now, on every page and every device. The effects that ride on the scroll (the portrait's drift, the four chapters of the Profile Piece, the finale) write their variables onto their own sections, and only while those sections are on screen; the pin is `position: sticky`; the deckled edges are painted strips instead of masks over a sheet thousands of pixels tall. Measured the same way in Safari's engine, the front page and the columns went from 7–19 fps to 71–72, and the long column stopped dropping frames in Chrome.

## The postmaster

The site is static except for a few doors. Two of them belong to the postmaster: the *Telegrams to the Editor* postcard wires a telegram through an on-demand route, [`/api/telegram`](src/pages/api/telegram.ts), and *Have the columns wired to you* enters a subscriber in the Resend contact book through [`/api/subscribe`](src/pages/api/subscribe.ts). The rest, bar the circulation desk below, is prerendered. There is no third-party form widget and no key in the browser.

Both routes rate-limit **before** they parse a body, each with its own counter. It keys on `CF-Connecting-IP` — the true visitor IP that Cloudflare sets in front of the origin and a client can't spoof through it — and falls back to the last hop of `X-Forwarded-For` when the origin is reached directly, with a per-IP window, a global ceiling that protects the Resend quota against IP rotation, and a bounded in-memory map that sweeps expired keys and evicts the oldest. The message goes out via [Resend](https://resend.com/) from a verified subdomain, and the API key lives only in the server environment, validated through `astro:env`. The counter is per-instance memory, so it is a courtesy bouncer, not a distributed one — named as such rather than oversold.

## The circulation desk

Readership is counted by [Umami](https://umami.is/): no cookies, nothing stored on the reader's device, no banner. The tracker and its collector are both served from the paper's own address, through [`/ink/press.js`](src/pages/ink/press.js.ts) and [`/ink/api/send`](src/pages/ink/api/send.ts), so a blocker that drops third-party analytics doesn't drop the count. The relay passes along the visitor's `CF-Connecting-IP` and Cloudflare's location headers, so the geography is the reader's, not the server's. Events are named on the elements themselves (`data-ev`, `data-ev-*`) and sent by a single listener that never holds up a link: CV downloads, opened accounts, shares by network, columns read to the sign-off, telegrams that actually went out.

## The columns

Section D of the front page is *The Columns*, the paper's standing column, and it keeps its own archive at [`/columns`](https://joaquingodoy.com/columns). Each column is an MDX file in a typed collection — title, dek, headings, date and sign-off in the frontmatter, the prose underneath — with two pieces of period furniture for the body: an `<Aside>` for the notes ruled into the margin and a `<Figure>` for the plates, which open enlarged when pressed. Nothing else is written by hand. The roman numeral comes from the column's place in the archive, the year block from its date (shown a century behind, like every date on the paper), the reading time and the word count from the body itself. The feed filters by heading and keeps the filter in the address, and the archive is set on a third sheet of paper, mottled with its own seed so it never reads as the front page reprinted.

## Two editions

The paper also runs in Spanish, at [`/es`](https://joaquingodoy.com/es/). The Spanish copy is rewritten, not translated: the furniture keeps its 1926 register in the Spanish of a Buenos Aires newsroom, the puns are rebuilt rather than carried over, and the trade's own vocabulary — deploy, merge, OUTAGE — stays in English, the way it does on any Spanish-speaking engineering team. The columns are written again for the edition, captions and all, and each edition carries its own social card.

Switching editions doesn't reload the page. The button fetches the other edition's twin, morphs its copy into the live document with [idiomorph](https://github.com/bigskysoftware/idiomorph) — so the scroll position, a half-typed telegram and the engine's state all survive — and slides the visible text out and back in under a View Transition. The choice is kept in a cookie. Readers from Spanish-speaking South America and Spain are sent to `/es` by a Cloudflare redirect rule, decided by country at the edge before any HTML is served, and the cookie overrides it the moment they pick English. Every page but the 404 declares its `hreflang` alternates, and the 404 renders on demand in the edition of the address that missed.

## Reads on paper

It is a newspaper, so it prints like one. `@media print` clears the cursor, the ticker and the drawers, drops the textures to plain white stock and reflows the broadsheet into about five clean A4 pages. `Ctrl-P` is a feature, not an afterthought.

## Running locally

```bash
npm install
npm run dev          # http://localhost:4321
```

```bash
npm run build        # static pages + node server → dist/
npm run check        # astro check — types and templates
npm run lint         # biome check .
npm run format       # biome format --write .
```

The postmaster needs a Resend key to actually send; everything else runs without one.

## Environment

Three variables, in `.env` locally and in the host's dashboard in production. See [`.env.example`](.env.example):

```bash
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM=The Daily Godoy <telegrams@mail.yourdomain.com>
RESEND_SEGMENT_ID=
```

All three are declared in the `astro:env` schema and validated at build. `RESEND_FROM` carries a safe default (`onboarding@resend.dev`) and `RESEND_SEGMENT_ID` is optional — set it to file subscribers under a Resend segment, leave it empty and they go in the book unfiled — so the site builds and runs without any of them; it just can't post a telegram or enter a subscriber until the key is set.

## Deploy

A multi-stage [`Dockerfile`](Dockerfile) (node:22-alpine) builds the site and runs the Node standalone server, serving on `$PORT`. It ships to [Railway](https://railway.app/) behind [Cloudflare](https://www.cloudflare.com/), or to any Docker host:

```bash
docker build -t daily-godoy .
docker run -p 8080:8080 daily-godoy   # → http://localhost:8080
```

## Built with

**[Astro 7](https://astro.build/)** with the Node standalone adapter and `@astrojs/sitemap`, **TypeScript** in strict mode and **Biome** for lint and format. Images run through Astro's `<Image>` and `sharp`; the projects are a typed content collection (Zod-validated JSON) and the columns another (MDX under a Zod frontmatter), with the copy in one i18n bundle per edition. All the motion is the hand-written engine under [`src/engine/`](src/engine), and idiomorph swaps the editions in place; the mail is Resend, the readership count is Umami, and Cloudflare sits in front for DNS and the edition redirect. CI runs Biome, `astro check` and the build on every push.

## License

[MIT](LICENSE) © 2026 Joaquín Godoy, for the design and the engineering. The editorial content and the portrait are the author's own.
