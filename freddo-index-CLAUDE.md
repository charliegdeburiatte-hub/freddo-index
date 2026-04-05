# CLAUDE.md — The Freddo Index

## What This Project Is
A live economic dashboard tracking the price of everything in Freddos. From a single grain of Sainsbury's basic long grain rice to a Boeing 747 and a Queen Elizabeth class aircraft carrier. Meticulously sourced. Historically accurate. Presented in a Royal Charter typeface on a background of thousands of frogs.

It looks absolutely deranged. The data is serious. That contrast is the entire point.

> *"By Royal Appointment. 10p was a fair price."*

This is a public website. It is meant to grow indefinitely — new items are added over time without structural changes. The foundation must be solid enough to support that from day one.

---

## Pre-Coding Checklist
These must exist before any code is written:
- [ ] GitHub repository — public, named `freddo-index`
- [ ] Vercel project connected to the repository
- [ ] Supabase project created and connection string available
- [ ] Domain confirmed — freddo-index.co.uk

---

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Hosting | Vercel (frontend + serverless functions + cron) |
| Database | Supabase (PostgreSQL) |
| Scraping | Cheerio + node-fetch |
| Scheduling | Vercel Cron Jobs |

There is no traditional backend. No Express server. No Railway. No server to babysit. Everything runs through Vercel serverless functions and Supabase.

---

## Project Structure
```
freddo-index/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Hero.jsx              # Rotating showcase
│   │   │   ├── LoadingScreen.jsx     # Horrified frog animation
│   │   │   └── Footer.jsx            # Frog thumb disclaimer
│   │   ├── freddo/
│   │   │   ├── FreddoPrice.jsx       # National average + supermarket breakdown
│   │   │   └── SupermarketTable.jsx  # Price comparison table
│   │   ├── items/
│   │   │   ├── ItemCard.jsx          # Individual item card
│   │   │   ├── ItemChart.jsx         # Historical chart for an item
│   │   │   └── FreddoConversion.jsx  # Freddo conversion display
│   │   ├── categories/
│   │   │   └── CategoryTab.jsx       # Tab content wrapper
│   │   └── shared/
│   │       ├── SnideRemark.jsx       # Consistent snide remark display
│   │       └── StaleIndicator.jsx    # Shows when data is stale
│   ├── pages/
│   │   ├── Home.jsx                  # Page 1 — curated scroll
│   │   ├── Index.jsx                 # Page 2 — full tabbed index
│   │   └── Disclaimer.jsx            # Page 3 — the important one
│   ├── hooks/
│   │   ├── useFreddoPrice.js         # Current national average
│   │   ├── useItemPrice.js           # Individual item price + history
│   │   └── useConversion.js          # Freddo conversion calculations
│   ├── utils/
│   │   ├── freddoConversion.js       # Core conversion logic
│   │   └── formatPrice.js            # Price formatting helpers
│   └── App.jsx
├── api/                              # Vercel serverless functions
│   ├── scrapers/
│   │   ├── base.scraper.js           # Shared scraping logic
│   │   ├── sainsburys.scraper.js
│   │   ├── tesco.scraper.js
│   │   ├── asda.scraper.js
│   │   ├── morrisons.scraper.js
│   │   ├── waitrose.scraper.js
│   │   ├── coop.scraper.js
│   │   ├── iceland.scraper.js
│   │   └── ocado.scraper.js
│   ├── fetchers/
│   │   ├── beis.fetcher.js           # Fuel — BEIS CSV
│   │   ├── ofgem.fetcher.js          # Energy — Ofgem
│   │   ├── ons.fetcher.js            # ONS datasets
│   │   ├── landregistry.fetcher.js   # House prices
│   │   ├── ofcom.fetcher.js          # Phone + broadband
│   │   └── nationalrail.fetcher.js   # Rail prices
│   ├── cron/
│   │   ├── daily.js                  # Daily scrape trigger
│   │   ├── weekly.js                 # Weekly government data trigger
│   │   └── quarterly.js              # Quarterly Ofgem trigger
│   └── db/
│       ├── client.js                 # Supabase client — initialised once
│       └── queries/                  # One file per domain
│           ├── freddoPrices.js
│           ├── priceRecords.js
│           ├── items.js
│           └── scrapeLogs.js
├── vercel.json                       # Cron schedule config
└── README.md
```

---

## Code Quality Rules
Non-negotiable. Every file. Every change.

### File Size
- No file exceeds ~200 lines
- Split before approaching the limit — not after
- Never cram logic into a file because it's loosely related

### Single Responsibility
- Every file does one thing
- Every function does one thing
- If you need "and" to describe what a function does — split it

### Scrapers
- All scrapers extend or import from `base.scraper.js`
- Each scraper handles one supermarket only
- Scrapers return a consistent data shape — never custom per scraper
- Every scraper has a try/catch — a failing scraper must never crash the cron job
- Log every scrape attempt to `scrape_logs` — success or failure

### Fetchers
- Fetchers handle government and official data sources only
- Separate from scrapers — different reliability characteristics
- Each fetcher handles one data source only
- Always validate the data shape before writing to Supabase

### Database
- Supabase client initialised once in `api/db/client.js`
- All queries in `api/db/queries/` — never write SQL inline anywhere else
- Never write to the database from the frontend — always via API routes

### Freddo Conversion
- All conversion logic lives in `src/utils/freddoConversion.js`
- Never calculate conversions inline in components
- Always use the national average Freddo price — never a single supermarket price

### Error Handling
- Every async operation has a try/catch
- A failing scraper uses last known good price — never breaks the site
- Stale data is flagged with a timestamp — never silently presented as current
- User facing errors are clear and human — never raw error messages

### No Magic Numbers
- All constants named — `const RICE_GRAIN_WEIGHT_GRAMS = 0.025` not `0.025`
- Conversion factors, scrape intervals, retry limits — all named constants

### Comments
- Comments explain why — not what
- Workarounds and intentional decisions always commented
- Obvious code never commented

### Naming
- Files: `kebab-case` with type suffix — `sainsburys.scraper.js`, `freddoPrices.js`
- React components: `PascalCase` — `ItemCard.jsx`
- Functions and variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Database query functions: named after what they do — `getLatestFreddoPrice`, `insertPriceRecord`

---

## Scraper Rules

### Redundancy Chain
For every scraped product, always follow this order:
1. Try primary supermarket scraper
2. If fails → try secondary supermarket scraper
3. If all fail → use last known good price from Supabase
4. Mark record as stale with `is_stale: true` and `last_updated` timestamp
5. The site never goes down because a scraper failed

### Consistent Return Shape
Every scraper returns the same shape — no exceptions:
```javascript
{
  supermarket: 'sainsburys',
  itemSlug: 'freddo',
  pricePence: 45,
  isAvailable: true,
  scrapedAt: new Date().toISOString()
}
```

### Rate Limiting
- Scrapers run on a schedule — never on demand from the frontend
- Add random delay between requests — never hammer a supermarket site
- Respect robots.txt where applicable
- If a supermarket blocks scraping — log it, use fallback, do not retry aggressively

---

## Vercel Cron Schedule
Defined in `vercel.json`:
```json
{
  "crons": [
    { "path": "/api/cron/daily", "schedule": "0 6 * * *" },
    { "path": "/api/cron/weekly", "schedule": "0 7 * * 1" },
    { "path": "/api/cron/quarterly", "schedule": "0 8 1 1,4,7,10 *" }
  ]
}
```

---

## Design Rules
This site must look deranged at first glance and immaculate on closer inspection. That contrast is the point.

### Typeface
**Rufina Alt02** — everywhere, no exceptions. Connected to Cadbury's Royal Charter. No other fonts.

### Colours
- Freddo Green `#4CAF50` — primary, everywhere
- Cadbury Purple `#4A1C6E` — accent, purposeful
- Dark base `#0F0F0F` — panel backgrounds
- Panel fill `rgba(15,15,15,0.88)` — transparent, frogs bleed through subtly
- Border `#4CAF50` — sharp, 1-2px, no glow, no shadow

### What Not To Do — Design
- No glassmorphism
- No gradients
- No blur effects
- No glowing borders
- No floating boxes
- No purple AI aesthetic
- No generic dashboard feel
- No font below 11px

### The Background
Tiling frog illustration — chaotic, joyful, contains hidden easter eggs. Never modify or override the background on any page. The frogs are always there.

### Panels
- Sharp border — 1-2px Freddo green
- 88% opacity dark fill — never fully opaque
- No border radius above 6px
- Generous whitespace inside

---

## Copy & Tone
The writing on this site is as important as the data. Every section has a snide remark. Every supermarket gets called out appropriately. The tone is:
- Factually accurate
- Deeply unimpressed
- Specifically British
- Funny — but the joke is always the data, never the user

Full tone rules are in `copy-tone-guide.md`. Follow them for every label, tooltip, error message, and remark.

---

## Freddo Conversion Logic
All conversion happens in `src/utils/freddoConversion.js`.

```javascript
// How many Freddos does this cost?
const toFreddos = (pricePence, freddoPricePence) =>
  pricePence / freddoPricePence

// How many of this item does one Freddo buy?
const perFreddo = (pricePence, freddoPricePence) =>
  freddoPricePence / pricePence

// Grains of rice per Freddo
const RICE_GRAIN_WEIGHT_GRAMS = 0.025
const grainsPerFreddo = (bagPricePence, bagWeightGrams, freddoPricePence) => {
  const totalGrains = bagWeightGrams / RICE_GRAIN_WEIGHT_GRAMS
  const pricePerGrain = bagPricePence / totalGrains
  return freddoPricePence / pricePerGrain
}
```

Always use national average Freddo price. Never a single supermarket price.

---

## Adding New Items
The site grows over time. Adding a new item requires exactly these steps — nothing more:
1. Add a row to the `items` table in Supabase
2. Add a scraper or fetcher function
3. Add the item to the relevant category tab on Page 2
4. Optionally add to Page 1 curated highlights

No structural changes to the codebase. No new pages. Slots straight in.

---

## What Not To Do
- Do not add a traditional backend server
- Do not write SQL outside of `api/db/queries/`
- Do not calculate Freddo conversions outside of `src/utils/freddoConversion.js`
- Do not write to the database from the frontend
- Do not let a failing scraper crash the cron job
- Do not silently present stale data as current
- Do not use any design patterns that look like a generic AI product
- Do not use any font other than Rufina Alt02
- Do not add blur, gradients, or glassmorphism under any circumstances
- Do not let any file exceed ~200 lines

---

## Features Explicitly Out of Scope for V1
- Easter egg frog illustrations in the background
- Ukrainian and EU flag frogs
- Community price reporting
- Social sharing cards
- Email digest
- User accounts

---

## The Tagline
Permanent. Every page. Top. Rufina Alt02.

> **The Freddo Index**
> *By Royal Appointment*
> *10p was a fair price.*

## The Footer
Permanent. Every page. Bottom. Small. Rufina Alt02.

> *🐸 Frogs do not have thumbs. Any errors are therefore inevitable and legally excusable.*
