# 🐸 The Freddo Index — High Level Design

## What This Is
A live economic dashboard that tracks the price of everything in Freddos. Ranging from a single grain of Sainsbury's basic long grain rice to a Boeing 747 and a Queen Elizabeth class aircraft carrier. Meticulously sourced. Historically accurate. Presented with the dignity of a Royal Charter typeface on a background of thousands of frogs.

It looks absolutely deranged. The data is serious. That contrast is the entire point.

> *"By Royal Appointment. 10p was a fair price."*

---

## Pre-Coding Requirements
These must be completed before a single line of code is written:

1. **GitHub repository created** — public, named `freddo-index`
2. **Vercel project connected** to the GitHub repository
3. **Supabase project created** — database ready before any scraping logic is written
4. **Domain decided** — freddo-index.co.uk ideally. Very British. Non negotiable.

---

## The Freddo Standard
The Freddo is the base unit of economic measurement. All prices are expressed as:
- How many Freddos does this cost?
- How many of this item does one Freddo buy?

The national average Freddo price is calculated daily from all available supermarket scrapers. This number anchors the entire site. Everything else is relative to it.

---

## Architecture

### No Traditional Backend
This site runs entirely on Vercel and Supabase. No Express server. No Railway. No server to babysit.

```
┌─────────────────────────────────────────────────────────────┐
│                        VERCEL                               │
│                                                             │
│  ┌──────────────────┐      ┌───────────────────────────┐   │
│  │   React Frontend  │      │   Serverless API Routes   │   │
│  │   (Pages + UI)    │      │   (Scrapers + Data API)   │   │
│  └──────────────────┘      └───────────────────────────┘   │
│           │                            │                    │
│           │                            │                    │
└───────────┼────────────────────────────┼────────────────────┘
            │                            │
            └──────────┬─────────────────┘
                       │
              ┌────────▼────────┐
              │    SUPABASE     │
              │  (PostgreSQL)   │
              │  Price history  │
              │  Freddo prices  │
              │  Scrape logs    │
              └─────────────────┘
```

### Vercel Cron Jobs
Scrapers run on a schedule via Vercel Cron — no server required:
- Supermarket scrapers (Freddo price) — daily
- Fuel prices (BEIS) — weekly
- Energy prices (Ofgem) — quarterly check
- Food items (supermarket scrape) — daily
- Government data sources — weekly check

### Data Flow
```
Cron triggers → Serverless scraper function → Validates data → Stores in Supabase → Frontend reads from Supabase → Converts to Freddos → Displays with appropriate snide remark
```

---

## Pages

### Page 1 — The Main Event
The landing page. Long scroll. Curated greatest hits from each category. First five seconds tells you everything about what this site is.

**Sections in order:**
1. Hero — rotating showcase of most shocking conversions
2. The Freddo Price — current national average, supermarket breakdown
3. Curated highlights — one or two items per category, most impactful
4. Link to Full Index

### Page 2 — The Full Index
Every item. All categories. Full historical charts. Tabbed by category.

**Tabs:**
- 🔌 Utilities
- 🛒 Food & Staples
- 🌍 Regional
- 🏠 Housing
- 🚆 Rail of Doom
- 💻 Technology
- 🎓 Life & Society
- ✈️ Big & Stupid

### Page 3 — The Disclaimer
The most important legal document ever written. See disclaimer spec below.

---

## The Full Basket

### 🐸 The Anchor
- Freddo (per unit) — Sainsbury's, Tesco, Asda, Morrisons, Waitrose, Co-op, Iceland, Ocado

### 🔌 Utilities
- ⛽ Petrol per litre — BEIS weekly
- ⚡ Electricity average monthly bill — Ofgem quarterly
- 🔥 Gas average monthly bill — Ofgem quarterly
- 💧 Water average monthly bill — Water UK annually
- 📱 Average mobile phone bill — Ofcom annually
- 🌐 Average broadband bill — Ofcom annually

### 🛒 Food & Staples
- 🥛 Pint of milk
- 🥚 Dozen eggs
- 🌾 One grain of Sainsbury's basic long grain rice *(and how many grains one Freddo buys)*
- 🍞 Warburtons Toastie 800g
- 🫓 Warburtons 9 pack crumpets *(not the 6 pack, grow up)*
- 🫘 Heinz Baked Beans 400g
- 🫘 Branston Baked Beans 400g *(rivals, same chart)*
- 🍯 Marmite 250g
- 🐄 Bovril 250g *(rivals, same chart)*
- 🌰 Nutella 400g
- 🧈 Lurpak 500g *(national tragedy)*
- 🍵 Yorkshire Tea 80 bags
- 🍵 PG Tips 80 bags *(rivals, same chart)*
- 🧀 Cathedral City Cheddar 400g
- 🧂 Maldon Salt 250g
- 🍅 Heinz Tomato Soup 400g
- 🐟 John West Tuna tin
- 🍫 Dairy Milk 200g *("chocolate" used loosely since Mondelez got involved)*
- 🧴 Fairy washing up liquid
- 🪥 Colgate toothpaste
- 🍕 Domino's large Margarita *(walk-in price AND app price — both tracked)*

### 🌍 Regional Basket
- 🥤 330ml Irn-Bru can — *for the Scots*
- 🌿 One loose leek — *for the Welsh*
- 🥔 One Maris Piper potato — *for the Northern Irish*

### 🏠 Housing
- 🏠 Average UK house price — Land Registry monthly
- 🏘️ Average UK monthly rent — ONS
- 🏘️ Average London monthly rent — ONS *(separately devastating)*

### 🚆 Rail of Doom
- 🚂 London to Edinburgh
- 🚂 London to Manchester *(walk-up, no advance, criminal)*
- 🚂 London to Bristol
- 🚂 London to Leeds
- 🚂 Liverpool to London
- 🚂 Brighton to London *(commuter misery)*
- 🚂 Cardiff to London — *for the Welsh*
- 🚂 Glasgow to London — *for the Scots*
- 🚂 Belfast to Dublin — *for the Northern Irish*
- 🚂 Any Southern Rail route — *for the suffering*

### 💻 Technology
- 🖥️ DDR4 RAM per GB *(going down)*
- 🖥️ DDR5 RAM per GB *(going up — blame AI)*
- 📱 Samsung Galaxy S flagship *(each generation)*
- 🎮 New release video game *(the £49.99 to £69.99 betrayal)*

### 🎓 Life & Society
- 🎓 University tuition fees per year *(the cliff chart)*
- 📺 TV Licence
- 🚌 Average UK bus fare
- 🍺 Average UK pint of beer
- 💰 Average UK salary *(the most important stat on the site)*
- 🚗 Average new car price
- 💊 NHS prescription charge
- 🐾 Average UK vet bill
- ⚰️ Average UK funeral cost
- 👶 Average UK monthly childcare cost *(the most devastating chart)*
- 🚙 Average car insurance premium
- ⚽ Premier League match ticket
- 🎬 Odeon cinema ticket

### ✈️ Big & Stupid
- ✈️ Boeing 747
- 🛳️ HMS Queen Elizabeth class aircraft carrier *(your taxes, in Freddos)*

---

## Data Sources

| Item | Source | Update Frequency |
|---|---|---|
| Freddo price | 8 supermarket scrapers | Daily |
| Petrol | BEIS CSV download | Weekly |
| Electricity / Gas | Ofgem price cap | Quarterly |
| Water | Water UK | Annually |
| Phone / Broadband | Ofcom report | Annually |
| Food items | 8 supermarket scrapers | Daily |
| Regional items | Supermarket scrapers + ONS | Daily / Annually |
| House prices | Land Registry HPI | Monthly |
| Rent | ONS private rental stats | Monthly |
| Rail tickets | National Rail / scrape | Weekly |
| RAM prices | Tech price tracking sites | Monthly |
| Samsung | Samsung UK + scrapers | Per release |
| Salary | ONS ASHE report | Annually |
| Tuition fees | UK Government | Per academic year |
| TV Licence | BBC / UK Government | Annually |
| Beer | ONS + CAMRA data | Annually |
| Boeing 747 | Boeing historical list prices + news archives | Per update |
| Aircraft carrier | UK Government defence spending | Per update |

---

## Scraper Architecture

### Supermarket Scrapers
Eight scrapers, one per supermarket. Each follows the same pattern:

```
scraper/
├── base.scraper.js         # Shared scraping logic, error handling, retry
├── sainsburys.scraper.js
├── tesco.scraper.js
├── asda.scraper.js
├── morrisons.scraper.js    # (ew)
├── waitrose.scraper.js
├── coop.scraper.js         # (villain)
├── iceland.scraper.js
└── ocado.scraper.js
```

### Redundancy Chain
For each product:
1. Try primary scraper
2. If fails → try secondary
3. If all fail → use last known good price
4. Flag as stale with last updated timestamp
5. Never break the site because a scraper failed

### Government Data Fetchers
Separate from scrapers — these pull from official APIs and CSV downloads:

```
fetchers/
├── beis.fetcher.js         # Fuel prices
├── ofgem.fetcher.js        # Energy prices
├── ons.fetcher.js          # ONS datasets
├── landregistry.fetcher.js # House prices
├── ofcom.fetcher.js        # Phone / broadband
└── nationalrail.fetcher.js # Rail prices
```

---

## Database Schema (Supabase)

```sql
-- The anchor — Freddo prices
freddo_prices
  id, supermarket, price_pence, scraped_at, is_available

-- All other tracked items
price_records
  id, item_slug, price_pence, source, recorded_at, is_stale

-- Items catalogue
items
  id, slug, name, emoji, category, unit, description, snide_remark, data_source, update_frequency

-- Scrape logs
scrape_logs
  id, scraper, item_slug, status, error_message, items_updated, ran_at
```

---

## Freddo Conversion Logic
Conversion logic is centralised in a Supabase view (`freddo_conversions`) which computes values on read — nothing is stored as a computed column. The frontend utility `src/utils/freddoConversion.js` handles edge cases not covered by the view, such as the rice grain calculation.

```javascript
// How many Freddos does this cost?
const inFreddos = (priceInPence, freddoPriceInPence) =>
  priceInPence / freddoPriceInPence

// How many of this item does one Freddo buy?
const perFreddo = (priceInPence, freddoPriceInPence) =>
  freddoPriceInPence / priceInPence

// Special case — grain of rice
const grainsPerFreddo = (bagPriceInPence, gramsPerBag, freddoPriceInPence) => {
  const gramsPerGrain = 0.025 // average long grain rice grain
  const totalGrains = gramsPerBag / gramsPerGrain
  const pricePerGrain = bagPriceInPence / totalGrains
  return freddoPriceInPence / pricePerGrain
}
```

---

## Design Language

### Typeface
**Rufina Alt02** — everywhere, no exceptions
Connected to Cadbury's Royal Charter. Whimsical but authoritative. Rufina Alt02 presenting aircraft carrier data in Freddos is the funniest and most correct design decision ever made.

### Colours
| Name | Hex | Usage |
|---|---|---|
| Freddo Green | `#4CAF50` | Primary — everywhere |
| Cadbury Purple | `#4A1C6E` | Accent — purposeful |
| Dark base | `#0F0F0F` | Panel backgrounds |
| Panel fill | `rgba(15,15,15,0.88)` | Transparent panels — frogs visible behind |
| Border | `#4CAF50` | Sharp, 1-2px, no glow |
| Text primary | `#F2F2F2` | Main content |
| Text secondary | `#A0A0A0` | Labels, metadata |

### Background
Tiling frog illustration. Chaotic. Joyful. Thousands of frogs. Contains hidden easter eggs:
- 🐸 Frog holding "10p was a fair price" sign
- 🐸 Frog on a Southern Rail train (delayed)
- 🐸 Frog in a suit, devastated by a mortgage application
- 🐸 Frog eating a Freddo *(cannibalism)*
- 🐸 Mondelez villain frog
- 🐸 Co-op frog, smug, overcharged
- 🐸 PhD frog drowning in debt
- 🐸 Two frogs — Ukrainian national flag + Armed Forces of Ukraine flag *(prominent, dignified)*
- 🐸 EU frog *(background, near Dairy Milk section, holding "35% cocoa solids minimum" sign)*

### Panels
- Sharp border — 1-2px Freddo green
- 88% opacity dark fill — frogs bleed through subtly
- No blur, no glow, no gradients, no glassmorphism
- Generous whitespace inside

---

## Loading Screen
A single frog sitting on an inflation chart line. As loading progresses the frog rides the line upward getting progressively more horrified.

Loading text cycles through:
- *Counting Freddos...*
- *Consulting the Royal Charter...*
- *Asking the frog...*
- *Blaming Mondelez...*
- *Checking if Southern Rail is delayed (it is)...*
- *Converting aircraft carriers to chocolate...*
- *Loading complete. Any mistakes are the frogs' fault. They don't have thumbs.* 🐸

---

## The Tagline
Permanent. Top of every page. Rufina Alt02.

> **The Freddo Index**
> *By Royal Appointment*
> *10p was a fair price.*

---

## Footer
Every page. Tiny. Rufina Alt02.

> *🐸 Frogs do not have thumbs. Any errors are therefore inevitable and legally excusable.*

---

## V1 — Usable From Launch

### Must be working on day one:
- [ ] GitHub public repo created — `freddo-index`
- [ ] Vercel connected and deploying
- [ ] Supabase database set up
- [ ] Loading screen with horrified frog animation
- [ ] Frog background tiling
- [ ] Hero rotating showcase
- [ ] Freddo price — all 8 supermarket scrapers running
- [ ] National average Freddo price calculated and displayed
- [ ] Supermarket price comparison table
- [ ] Page 1 curated scroll — minimum one item per category working:
  - ⛽ Petrol
  - ⚡ Electricity
  - 🥛 Milk
  - 🧈 Lurpak
  - 🏠 House price
  - 💰 Average salary
  - 🎓 Tuition fees
  - 🍺 A pint
  - ✈️ Boeing 747
- [ ] Page 2 tabbed structure in place — tabs present even if not all populated
- [ ] Disclaimer page — legally binding, frog thumb clause included
- [ ] Historical data for government-sourced items

### V1 Out of Scope
- All 50+ items (structure ready, items added over time)
- Easter egg frog illustrations (background tiles in V1, easter eggs added later)
- Ukrainian and EU flag frogs (added post V1)
- Community price reporting
- Social sharing cards
- Email digest

---

## Growing Over Time
The site is designed to grow indefinitely. Adding a new item requires:
1. Add row to `items` table in Supabase
2. Add scraper or fetcher function
3. Add to the relevant category tab on Page 2
4. Optionally promote to Page 1 curated highlights

No structural changes needed. The basket grows, the frogs multiply, the data gets more devastating. 🐸

---

## Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | React + Vite | Familiar, fast |
| Styling | Tailwind CSS | Rapid development |
| Charts | Recharts | Clean, composable |
| Hosting | Vercel | Frontend + serverless functions + cron |
| Database | Supabase (PostgreSQL) | Managed, free tier generous, no server |
| Scraping | Cheerio + node-fetch | Lightweight HTML scraping |
| Scheduling | Vercel Cron | No separate server needed |

---

## Status: HLD Draft — Pending Review
*Written during planning session. To be confirmed before any other documents are written.*
