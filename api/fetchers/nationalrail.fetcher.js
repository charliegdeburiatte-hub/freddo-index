import { insertPriceRecord } from '../db/queries/priceRecords.js'
import { insertScrapeLog } from '../db/queries/scrapeLogs.js'

// National Rail — anytime single walk-up fares, no advance, no railcard
// The honest price for someone who needs to travel

const ROUTES = [
  { slug: 'rail-london-edinburgh',  origin: 'KGX', destination: 'EDB' },
  { slug: 'rail-london-manchester', origin: 'EUS', destination: 'MAN' },
  { slug: 'rail-london-bristol',    origin: 'PAD', destination: 'BRI' },
  { slug: 'rail-london-leeds',      origin: 'KGX', destination: 'LDS' },
  { slug: 'rail-liverpool-london',  origin: 'LIV', destination: 'EUS' },
  { slug: 'rail-brighton-london',   origin: 'BTN', destination: 'VIC' },
  { slug: 'rail-cardiff-london',    origin: 'CDF', destination: 'PAD' },
  { slug: 'rail-glasgow-london',    origin: 'GLC', destination: 'EUS' },
  { slug: 'rail-southern-any',      origin: 'ECR', destination: 'VIC' },
]

// Why: National Rail doesn't have a public JSON API for walk-up fares
// Prices are scraped from the booking engine — complex JS-rendered pages
// For now: manual insert via Supabase dashboard when prices change
// TODO: Implement headless browser scrape (Playwright) when time allows
export const insertRailFare = async ({ routeSlug, pricePounds, source }) => {
  try {
    const pricePence = Math.round(pricePounds * 100)
    await insertPriceRecord({
      itemSlug: routeSlug, supermarket: 'national-rail',
      pricePence, isStale: false,
      source: source ?? 'National Rail walk-up anytime single'
    })
    await insertScrapeLog({ scraper: 'national-rail', itemSlug: routeSlug, status: 'success' })
    return pricePence
  } catch (error) {
    console.error(`Rail fare insert failed for ${routeSlug}:`, error.message)
    await insertScrapeLog({ scraper: 'national-rail', itemSlug: routeSlug, status: 'failed', errorMessage: error.message })
    return null
  }
}

export const RAIL_ROUTES = ROUTES
