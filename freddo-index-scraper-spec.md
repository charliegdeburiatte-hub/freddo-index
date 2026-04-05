# 🐸 The Freddo Index — Scraper Specification

## Overview
The scraper system is the engine that keeps the Freddo Index alive. It runs on a schedule via Vercel Cron Jobs, fetches prices from supermarkets and government sources, validates the data, and writes it to Supabase. It never crashes the site. It never silently shows wrong data. It fails loudly in the logs and gracefully in the UI.

---

## Two Types of Data Fetching

### Scrapers
Used for supermarket product prices. Parse HTML from product pages using Cheerio. Fragile by nature — supermarkets can change their HTML structure at any time. Handled by the redundancy chain.

### Fetchers
Used for government and official data sources. Pull from CSV downloads, APIs, or structured data. More reliable than scrapers. Less likely to break without warning.

Both live in `api/` and follow the same logging and error handling patterns.

---

## Architecture

```
api/
├── scrapers/
│   ├── base.scraper.js           # Shared logic all scrapers inherit
│   ├── sainsburys.scraper.js
│   ├── tesco.scraper.js
│   ├── asda.scraper.js
│   ├── morrisons.scraper.js      # (ew)
│   ├── waitrose.scraper.js
│   ├── coop.scraper.js           # (villain)
│   ├── iceland.scraper.js
│   └── ocado.scraper.js
├── fetchers/
│   ├── beis.fetcher.js           # Fuel — BEIS CSV
│   ├── ofgem.fetcher.js          # Energy — Ofgem quarterly
│   ├── ons.fetcher.js            # ONS datasets — multiple items
│   ├── landregistry.fetcher.js   # House prices
│   ├── ofcom.fetcher.js          # Phone + broadband
│   └── nationalrail.fetcher.js   # Rail ticket prices
├── cron/
│   ├── daily.js                  # Triggers daily scrapers
│   ├── weekly.js                 # Triggers weekly fetchers
│   └── quarterly.js              # Triggers quarterly fetchers
└── db/
    ├── client.js                 # Supabase client — initialised once
    └── queries/
        ├── freddoPrices.js
        ├── priceRecords.js
        ├── items.js
        └── scrapeLogs.js
```

---

## Base Scraper

All supermarket scrapers import from `base.scraper.js`. This file contains all shared logic. Individual scrapers contain only what is unique to that supermarket.

### base.scraper.js

```javascript
import * as cheerio from 'cheerio'
import { insertScrapeLog } from '../db/queries/scrapeLogs.js'

// Shared delay to avoid hammering supermarket sites
const SCRAPE_DELAY_MS = 2000
const MAX_RETRIES = 2
const REQUEST_TIMEOUT_MS = 10000

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Core fetch with timeout and retry
export const fetchWithRetry = async (url, retries = MAX_RETRIES) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          // Polite headers — we are guests on their site
          'User-Agent': 'Mozilla/5.0 (compatible; FreddoIndex/1.0)',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-GB,en;q=0.9',
        }
      })

      clearTimeout(timeout)

      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.text()

    } catch (error) {
      // Why: last attempt — propagate error to caller for logging
      if (attempt === MAX_RETRIES) throw error
      await delay(SCRAPE_DELAY_MS * attempt) // progressive delay
    }
  }
}

// Parse price from HTML using a CSS selector
// Returns price in pence as integer, or throws
export const extractPrice = (html, selector) => {
  const $ = cheerio.load(html)
  const priceText = $(selector).first().text().trim()

  if (!priceText) throw new Error(`Price element not found: ${selector}`)

  // Handle formats: £0.45, 45p, 0.45
  const cleaned = priceText.replace(/[^0-9.]/g, '')
  const price = parseFloat(cleaned)

  if (isNaN(price)) throw new Error(`Could not parse price from: ${priceText}`)

  // Why: store everything in pence as integers — never floats for currency
  return priceText.includes('p') && !priceText.includes('£')
    ? Math.round(price)       // already in pence
    : Math.round(price * 100) // convert pounds to pence
}

// Standard return shape — every scraper returns this
export const buildResult = (supermarket, itemSlug, pricePence) => ({
  supermarket,
  itemSlug,
  pricePence,
  isAvailable: true,
  scrapedAt: new Date().toISOString()
})

// Standard unavailable result — when item not found
export const buildUnavailable = (supermarket, itemSlug) => ({
  supermarket,
  itemSlug,
  pricePence: null,
  isAvailable: false,
  scrapedAt: new Date().toISOString()
})
```

---

## Individual Scraper Pattern

Each supermarket scraper follows this exact pattern. Only the URL and CSS selector change.

### sainsburys.scraper.js

```javascript
import { fetchWithRetry, extractPrice, buildResult, buildUnavailable } from './base.scraper.js'

// Item slug → product URL mapping for Sainsbury's
const PRODUCT_URLS = {
  'freddo': 'https://www.sainsburys.co.uk/gol-ui/product/cadbury-freddo-milk-chocolate-18g',
  'milk-pint': 'https://www.sainsburys.co.uk/gol-ui/product/sainsburys-british-whole-milk-1-pint',
  'eggs-12': 'https://www.sainsburys.co.uk/gol-ui/product/sainsburys-british-free-range-large-eggs-x12',
  // ... all items defined here
}

// CSS selector for price on Sainsbury's product pages
// Why: Sainsbury's uses this class consistently across product pages
const PRICE_SELECTOR = '[data-testid="pd-retail-price"]'

export const scrape = async (itemSlug) => {
  const url = PRODUCT_URLS[itemSlug]
  if (!url) throw new Error(`No Sainsbury's URL for item: ${itemSlug}`)

  try {
    const html = await fetchWithRetry(url)
    const pricePence = extractPrice(html, PRICE_SELECTOR)
    return buildResult('sainsburys', itemSlug, pricePence)
  } catch (error) {
    // Why: log the specific failure, return unavailable — never throw
    console.error(`Sainsbury's scrape failed for ${itemSlug}:`, error.message)
    return buildUnavailable('sainsburys', itemSlug)
  }
}
```

All eight supermarket scrapers follow this identical pattern. Only `PRODUCT_URLS`, `PRICE_SELECTOR`, and the supermarket name change.

---

## The Redundancy Chain

For each item, scrapers are tried in priority order. The chain never throws — it always returns a price, even if stale.

```javascript
// api/utils/redundancyChain.js

import { getLastKnownPrice, insertPriceRecord } from '../db/queries/priceRecords.js'
import { insertScrapeLog } from '../db/queries/scrapeLogs.js'

// Priority order per item — defined in items table
// Example for freddo: ['sainsburys', 'tesco', 'asda', 'morrisons', ...]
export const scrapeWithFallback = async (itemSlug, scrapers, scraperModules) => {
  const results = []

  for (const scraperName of scrapers) {
    const scraper = scraperModules[scraperName]
    const result = await scraper.scrape(itemSlug)

    await insertScrapeLog({
      scraperName,
      itemSlug,
      status: result.isAvailable ? 'success' : 'failed',
      ranAt: new Date().toISOString()
    })

    if (result.isAvailable) {
      results.push(result)
    }
  }

  if (results.length > 0) {
    // Write all successful results
    for (const result of results) {
      await insertPriceRecord({ ...result, isStale: false })
    }
    return results
  }

  // Why: all scrapers failed — use last known good price
  // Mark as stale so UI can flag it
  const lastKnown = await getLastKnownPrice(itemSlug)

  if (lastKnown) {
    await insertPriceRecord({ ...lastKnown, isStale: true, scrapedAt: new Date().toISOString() })
    console.warn(`All scrapers failed for ${itemSlug} — using last known price from ${lastKnown.scrapedAt}`)
    return [{ ...lastKnown, isStale: true }]
  }

  // Why: no price at all — log it, return null, do not write to DB
  console.error(`No price available for ${itemSlug} — no fallback exists`)
  return null
}
```

---

## Freddo National Average Calculation

Calculated after all supermarket scrapers have run. Uses only successful (non-stale) results.

```javascript
// api/utils/calculateNationalAverage.js

import { getLatestFreddoPrices } from '../db/queries/freddoPrices.js'
import { insertPriceRecord } from '../db/queries/priceRecords.js'

export const calculateFreddoNationalAverage = async () => {
  const prices = await getLatestFreddoPrices()

  // Why: exclude stale prices from average — stale data skews the result
  const freshPrices = prices.filter(p => !p.isStale && p.isAvailable)

  if (freshPrices.length === 0) {
    console.error('No fresh Freddo prices available — cannot calculate average')
    return null
  }

  const averagePence = Math.round(
    freshPrices.reduce((sum, p) => sum + p.pricePence, 0) / freshPrices.length
  )

  await insertPriceRecord({
    supermarket: 'national_average',
    itemSlug: 'freddo',
    pricePence: averagePence,
    isStale: false,
    scrapedAt: new Date().toISOString()
  })

  return averagePence
}
```

---

## Fetchers — Government Data Sources

Fetchers are more reliable than scrapers but follow the same error handling pattern.

### beis.fetcher.js — Petrol Prices

```javascript
import { insertPriceRecord } from '../db/queries/priceRecords.js'
import { insertScrapeLog } from '../db/queries/scrapeLogs.js'

// Why: BEIS publishes a weekly CSV — more reliable than HTML scraping
const BEIS_CSV_URL = 'https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/oil-and-petroleum-products.csv'

const UNLEADED_COLUMN = 'Unleaded petrol pence per litre'

export const fetchPetrolPrice = async () => {
  try {
    const response = await fetch(BEIS_CSV_URL)
    if (!response.ok) throw new Error(`BEIS fetch failed: HTTP ${response.status}`)

    const csv = await response.text()
    const rows = csv.split('\n').map(row => row.split(','))
    const headers = rows[0]
    const latestRow = rows[rows.length - 2] // last non-empty row

    const columnIndex = headers.indexOf(UNLEADED_COLUMN)
    if (columnIndex === -1) throw new Error('BEIS column not found — format may have changed')

    const pricePence = Math.round(parseFloat(latestRow[columnIndex]))
    if (isNaN(pricePence)) throw new Error('BEIS price could not be parsed')

    await insertPriceRecord({
      supermarket: 'beis',
      itemSlug: 'petrol-litre',
      pricePence,
      isStale: false,
      scrapedAt: new Date().toISOString()
    })

    await insertScrapeLog({ scraperName: 'beis', itemSlug: 'petrol-litre', status: 'success', ranAt: new Date().toISOString() })
    return pricePence

  } catch (error) {
    // Why: log specific error so manual fix is easy to identify
    console.error('BEIS petrol fetch failed:', error.message)
    await insertScrapeLog({ scraperName: 'beis', itemSlug: 'petrol-litre', status: 'failed', error: error.message, ranAt: new Date().toISOString() })
    return null
  }
}
```

All fetchers follow this same pattern — fetch, parse, validate, insert, log. Fail loudly in logs, gracefully in UI.

---

## Cron Jobs

### vercel.json
```json
{
  "crons": [
    {
      "path": "/api/cron/daily",
      "schedule": "0 6 * * *"
    },
    {
      "path": "/api/cron/weekly",
      "schedule": "0 7 * * 1"
    },
    {
      "path": "/api/cron/quarterly",
      "schedule": "0 8 1 1,4,7,10 *"
    }
  ]
}
```

### api/cron/daily.js

```javascript
import * as sainsburys from '../scrapers/sainsburys.scraper.js'
import * as tesco from '../scrapers/tesco.scraper.js'
import * as asda from '../scrapers/asda.scraper.js'
import * as morrisons from '../scrapers/morrisons.scraper.js'
import * as waitrose from '../scrapers/waitrose.scraper.js'
import * as coop from '../scrapers/coop.scraper.js'
import * as iceland from '../scrapers/iceland.scraper.js'
import * as ocado from '../scrapers/ocado.scraper.js'
import { scrapeWithFallback } from '../utils/redundancyChain.js'
import { calculateFreddoNationalAverage } from '../utils/calculateNationalAverage.js'
import { getDailyItems } from '../db/queries/items.js'

const scraperModules = { sainsburys, tesco, asda, morrisons, waitrose, coop, iceland, ocado }

export default async function handler(req, res) {
  // Why: protect cron endpoint — Vercel sends this header on cron triggers
  if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorised' })
  }

  try {
    const dailyItems = await getDailyItems()

    // Why: run sequentially not in parallel — avoid hammering supermarket sites
    for (const item of dailyItems) {
      await scrapeWithFallback(item.slug, item.scraperPriority, scraperModules)
    }

    // Calculate national Freddo average after all scrapes complete
    await calculateFreddoNationalAverage()

    return res.status(200).json({ success: true, itemsProcessed: dailyItems.length })

  } catch (error) {
    console.error('Daily cron failed:', error.message)
    return res.status(500).json({ error: error.message })
  }
}
```

### api/cron/weekly.js
Triggers: BEIS petrol fetcher, National Rail ticket fetcher

### api/cron/quarterly.js
Triggers: Ofgem electricity and gas fetcher

---

## Error Handling Rules

### Scraper fails on one supermarket
→ Log to `scrape_logs`
→ Continue to next supermarket in redundancy chain
→ Never throw, never crash the cron job

### All supermarkets fail for one item
→ Log error
→ Retrieve last known good price from Supabase
→ Mark record as `is_stale: true`
→ UI displays stale indicator with last updated timestamp

### Government fetcher fails
→ Log error with specific reason (HTTP error, parse error, column not found)
→ Do not write stale record — government data doesn't change daily
→ Previous record remains current until next successful fetch

### Cron job itself fails
→ Vercel logs capture the error
→ Previous data remains in Supabase — site stays up
→ Check scrape_logs table to diagnose

### Site never goes down because
- Supabase always has the last known good data
- Frontend reads from Supabase — not directly from scrapers
- Stale data is shown with a flag, not hidden or errored

---

## Scrape Logs

Every scrape attempt is logged — success or failure. This is how you diagnose problems.

```sql
scrape_logs
  id          uuid primary key
  scraper     text        -- 'sainsburys', 'beis', 'ofgem' etc
  item_slug   text        -- 'freddo', 'petrol-litre' etc
  status      text        -- 'success' | 'failed'
  error       text        -- error message if failed, null if success
  ran_at      timestamptz
```

**Reading the logs:**
- Consistent failures on one supermarket = their HTML changed, selector needs updating
- Consistent failures on one item across all supermarkets = product URL changed
- Government fetcher failures = CSV format changed or URL moved
- Everything failing = Vercel cron issue or Supabase connection issue

---

## Manual Update Procedure

For items that don't need automated scraping — annual data, policy changes, one-off events:

1. Open Supabase dashboard
2. Navigate to `price_records` table
3. Insert new row:
   ```
   supermarket: 'manual'
   item_slug: 'tuition-fees-annual'
   price_pence: 925000
   is_stale: false
   scraped_at: now()
   source: 'UK Government announcement April 2024'
   ```
4. Done. Site updates immediately.

This is the correct approach for:
- Annual items (TV licence, salary, tuition fees)
- Policy change events (tuition fee increases)
- Boeing 747 / aircraft carrier price updates
- Any item where automation would be overkill

---

## Adding A New Scraper

When a new item is added to the basket:

1. Add item to `items` table in Supabase with `update_frequency: 'daily'`
2. Add product URL to each supermarket's `PRODUCT_URLS` map
3. Test the selector on the product page — verify it returns a price
4. Run manually once to confirm it writes to `price_records` correctly
5. It will be picked up automatically by the next daily cron run

No changes to cron files needed. The daily cron reads items from the database.

---

## Selector Maintenance

Supermarkets change their HTML. Selectors will break. This is expected.

**Signs a selector has broken:**
- `scrape_logs` shows consistent failures for one supermarket across multiple items
- Error message: `Price element not found: [selector]`

**Fix procedure:**
1. Open the product page in a browser
2. Inspect the price element
3. Find the new selector
4. Update `PRICE_SELECTOR` in that supermarket's scraper file
5. Commit and deploy
6. Verify next cron run succeeds in `scrape_logs`

**Time estimate:** 10–15 minutes per supermarket. Morrisons may take longer.

---

## Environment Variables Required

```
SUPABASE_URL=           # Supabase project URL
SUPABASE_ANON_KEY=      # Supabase anon key for frontend reads
SUPABASE_SERVICE_KEY=   # Supabase service key for scraper writes
CRON_SECRET=            # Secret for authenticating cron endpoint calls
```

Never commit these to the repository. Always use Vercel environment variables.

---

## Status: Scraper Spec Draft — Pending Review
*Written during planning session. Selectors and URLs to be verified during initial implementation.*
