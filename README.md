# AsianShop: interactive UI prototype

Front-end prototype of the new AsianShop storefront, built from the **UI Blueprint** and the **Experience Script** (`../AsianShop_UI_Blueprint.md`, `../AsianShop_Experience_Script.md`), using the real catalogue scraped from asianshop.pl.

Next.js 16 (App Router, Cache Components) · React 19.3 · Tailwind CSS 4 · GSAP 3.15 + ScrollTrigger (homepage film) · Motion · Fuse.js · Zustand

## Run it

```bash
npm install
npm run dev          # http://localhost:3000 → redirects to /pl-pl
```

Useful URLs:
- `/pl-pl`, `/pl-en`, `/de-de`, `/de-en`: the four markets (country + language are separate; PLN or EUR).
- `?sky=morning|day|evening|night`: preview the hero window's lighting. By default it follows the visitor's local time.
- Press `/` anywhere to open search.
- **On a phone** (same Wi-Fi): open `http://<computer's IP>:3000` (e.g. `http://192.168.1.64:3100` in our setup). The IP must be listed in `allowedDevOrigins` in `next.config.ts`, otherwise Next.js blocks the phone's dev requests. If the phone has *Reduce Motion* / *Remove animations* switched on, the film shows still frames by design.

> **Dev note:** in this setup, edits to `app/globals.css` are not picked up by a running `next dev` (the Tailwind loader configured by the scaffold doesn't watch it). Restart the dev server after CSS changes. The Turbopack on-disk dev cache is switched off in `next.config.ts` because it served stale CSS.

## Deploy to Cloudflare (Workers)

The app runs on Cloudflare Workers through the OpenNext adapter (`@opennextjs/cloudflare`). Config: `wrangler.jsonc` (worker name `asianshop`), `open-next.config.ts` (prerendered pages are served read-only from the deployed static assets, so no R2 bucket is needed), `public/_headers`.

**From GitHub (automatic deploys):** Cloudflare dashboard → *Workers & Pages* → *Create* → *Import a repository* → pick this repo. Cloudflare's default settings work as they are:

| Setting | Value |
|---|---|
| Build command | `npm run build` (default) |
| Deploy command | `npx wrangler deploy` (default; it detects OpenNext and runs `opennextjs-cloudflare deploy`) |
| Root directory | `/` |
| Node version | 22 (from `.node-version`) |

`npm run build` is the Cloudflare build: it runs `scripts/patch-opennext.mjs`, then `opennextjs-cloudflare build`, which builds Next itself with `npx next build` (`buildCommand` in `open-next.config.ts`). Use `npm run build:next` for a plain Next build. Every push to `main` then builds and deploys. The worker name in the dashboard must match `name` in `wrangler.jsonc`.

The patch is needed because Next.js 16.4 added a server file (`preview-props.json`) that the adapter doesn't bundle yet; without it every page returns 500 on Cloudflare. Remove it once `@opennextjs/cloudflare` handles that file.

**From this computer:** `npx wrangler login` once, then `npm run deploy`. `npm run preview` runs the production build locally in Cloudflare's runtime.

The prototype is marked *noindex* (header, meta tag and `robots.txt`) so it never competes with the live asianshop.pl in search.

## What's built (milestone 1)

| Area | Status |
|---|---|
| Design tokens, typography, motion language "Steam & Settle" | ✅ `app/globals.css` |
| Header: search trigger, market switcher, basket with bump, category nav, mobile menu | ✅ |
| **Currency switch** (złoty or euro in any country): in the country/language dropdown on PC and phone, and in the phone menu. Product prices are the shop's real PLN/EUR prices; delivery costs and the free-delivery threshold are converted at the shop's 4.38 rate (threshold rounded up: 50 zł → 12 €). Payment methods that can't settle in the chosen currency are hidden (BLIK, cash on delivery: złoty only; SEPA, Klarna: euro only). Saved orders keep the currency they were paid in. Stored on the device (`lib/currency.ts`) | ✅ |
| **Sign in** (`/{market}/login`, `lib/session.ts`): email first, then a password for known emails or a short sign-up for new ones; sign-in code instead of a password; forgot password; Google and Apple (demo); guest checkout offered when coming from checkout; returns you to where you were (`?next=`, same-site only). Account pages need a sign-in, checkout pre-fills email and name, the header shows your initial. Prototype: accounts live on this device, passwords only as a SHA-256 hash; demo login `demo@asianshop.pl` / `chai-masala` | ✅ |
| **The shop's own artwork** (`public/brand`, `lib/brand-assets.ts`): the real elephant emblem in the header lockup with the real line "Bringing Home Closer", a round seal (SVG, text on a path) in the footer, at the end of the film and on the order confirmation; favicon from the emblem | ✅ |
| **Shop by category:** all 10 aisles as image tiles. Rice and Masala are large tiles with the shop's real photos (rice terraces, spices on slate); the other 8 each show a still life of 3–4 real packs, cut out (`public/products/cutout-cat`, `make_cutouts.py`) on the aisle's own colour | ✅ |
| Shop's aisle illustrations in the phone menu and on category pages (two drawn to match: ghee & oils, home & beauty); the real photos also head the Rice and Masala pages | ✅ |
| Shop's campaign banners: "On the shelf now" row on the homepage and on each brand's page, each leading to the pack it advertises. Banners with Polish text only show on the Polish site | ✅ |
| **Homepage film** (scroll-driven, `components/film/`): 1 dusk over a European old town → camera push through one warm window · 2 the kitchen shelf, packs drop in, headline + search · 3 tracking shot along the shelf of brands from home · 4 freshness stamp with rolling best-before date · 5 scroll cooks tonight's dal tadka: spoonfuls from each ingredient tile land in the kadai, then sizzle and steam, "Add all" · 6 delivery routes drawn from Kraków | ✅ |
| Film finish: depth-plane parallax, header night mode over dark scenes, film grain, "Skip to shop", reduced-motion = still frames | ✅ |
| **Phone version of the film:** the same pinned, scroll-driven scenes as desktop, with phone layouts that fit one screen (checked at 390×844 and 375×667) | ✅ |
| Home shop section: pantry staples + "Add all", category tiles, founders note | ✅ |
| Search in your own words (haldi, jeera, atta, chawal, achar…), typo-tolerant, multi-word | ✅ in-browser |
| Product card: freshness badge, unit price, Omnibus-correct promo, add → quantity stepper, spice-dot flight | ✅ |
| Basket drawer, free-delivery bar with unlock sweep, toasts with Undo | ✅ |
| Category listing: sub-category chips, brand filter, in-stock, sort (incl. price per kg, freshest), Show more | ✅ |
| Product page: card → page match cut (React `<ViewTransition>`), gallery + zoom, Freshness sheet, allergens in bold, sticky add bar (mobile) | ✅ |
| Recipe page: untick what you have, add the rest | ✅ |
| Consent bar (equal Accept/Reject, after the hero settles) | ✅ |
| Polish, German, English | ✅ |

| Checkout (S11–S12): one page, four sections that collapse to a summary, field errors on blur, market-aware postcode, real delivery methods and prices per market with arrival dates, free delivery over the threshold, local payment methods, BLIK code, "Packing your order…" (BLIK 000000 shows a declined payment) | ✅ `/checkout` |
| Order confirmed (S13): chai still life in the warmest light, expected date, recipe idea from the basket | ✅ `/order/{id}` |
| Tracking (S15): route drawn from Kraków to the customer's city, steps advance with (simulated) time | ✅ `/account/orders/{id}` |
| Account: orders, "Your usual" with buying rhythm + reminders, back-in-stock alerts (S17–S18); seeds a labelled demo history | ✅ `/account`, `/account/usual` |
| Brand pages | ✅ `/brand/{slug}` |
| Info pages with the shop's **current** texts, clearly labelled; German privacy policy falls back to English (it doesn't exist on today's site); contact page flags the three different phone numbers | ✅ `/info/{slug}` |
| Trade (B2B) entry: quick order by name/code with quantities, net prices, EU VAT number format check (demo) | ✅ `/trade` |
| Not-found page (E3) | ✅ |

**Not built yet:** festival themes (Diwali first), real backend (orders, payments, batch stock), email templates.

## Prototype data: what is real and what isn't

| Real (from asianshop.pl, 13 Oct 2026) | Demo / draft, to be replaced |
|---|---|
| 1,303 products: names PL/DE/EN, brands, prices in PLN and EUR, promotions, stock, descriptions, ingredients | **Best-before dates**: generated demo values (the source shop has no batch data) |
| 1,433 product photos (1,302 products; one product has none), cleaned into one consistent style | **Founders' text and photo**: placeholder until the real story and photo shoot |
| Logo, aisle illustrations, 5 campaign banners, 2 photo backdrops (labels baked into the photos removed). Not used: a Daawat banner with a film star (the brand's licence, not the shop's) and the "2500 products" banner (the catalogue lists ~1,300) | |
| Categories (remapped to 10 simple ones), delivery methods | **Germany free-delivery threshold (€49) and delivery days**: assumptions |
| | **Allergen highlighting**: keyword detection from ingredient text, a prototype aid only. Real allergen data must come from labels |
| | **Memory lines** (6 products): draft copy for a community copywriter to rewrite |

## How the data is made

```bash
# from poland_work/
python3 scripts/build_mock_data.py asianshop_data asianshop-ui/data        # catalog, details, categories, recipes, synonyms, search index
python3 scripts/fetch_images.py asianshop_data                              # downloads photos (1 request/s, resumable)
python3 scripts/process_images.py asianshop_data/images_raw asianshop-ui/public/products asianshop-ui/data/image_report.json
python3 scripts/make_cutouts.py asianshop-ui/public/products asianshop-ui/public/products/cutout <ids…>   # film cut-outs
python3 scripts/build_info_pages.py asianshop_data/pages asianshop-ui/data/info.json                       # current info/legal texts
python3 -I scripts/fetch_storefront.py                                    # the shop's logo, banners and aisle icons
python3 -I scripts/build_brand_assets.py asianshop_data/storefront asianshop-ui/public/brand
```

`data/image_report.json` lists photos that need a better version (low resolution or not a packshot).

## Structure

```
app/[market]/                 layout (html lang, fonts, sky script), home, c/[category], p/[slug], search, recipes/[slug], checkout (placeholder)
components/global/            header, market context, basket drawer, free-delivery bar, toasts, consent, footer
components/product/           pack image, card, price, badges, add-to-basket, gallery, buy box
components/home/              hero shelf + window scene, sections, add-all, product row
components/listing|search|recipe/
lib/                          catalog (mock API layer, server only), markets, i18n, format, basket store, spice-dot flight, search, allergens
data/                         generated JSON (do not edit by hand)
public/products/              processed photos (800 px, 400 px, hero cut-outs)
```

The UI only talks to `lib/catalog.ts` (server) and `public/search-index.json` (browser). Swapping in the real commerce backend later replaces those, not the screens.
