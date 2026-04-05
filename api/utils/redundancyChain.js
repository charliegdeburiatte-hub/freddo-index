import { getLastKnownPrice, insertPriceRecord } from '../db/queries/priceRecords.js'
import { insertFreddoPrice } from '../db/queries/freddoPrices.js'
import { insertScrapeLog } from '../db/queries/scrapeLogs.js'

// Runs all scrapers in priority order for an item.
// Never throws — always returns a price even if stale.
export const scrapeWithFallback = async (item, scraperModules) => {
  const { slug: itemSlug, scraper_priority: scraperPriority } = item
  const results = []

  for (const scraperName of scraperPriority) {
    const mod = scraperModules[scraperName]
    if (!mod) continue

    const result = await mod.scrape(itemSlug)

    await insertScrapeLog({
      scraper: scraperName,
      itemSlug,
      status: result.isAvailable ? 'success' : 'failed',
    })

    if (result.isAvailable && result.pricePence != null) {
      results.push(result)

      // Freddo prices go to their own table
      if (itemSlug === 'freddo') {
        await insertFreddoPrice({ supermarket: scraperName, pricePence: result.pricePence, isAvailable: true, isStale: false })
      } else {
        await insertPriceRecord({ itemSlug, supermarket: scraperName, pricePence: result.pricePence, isAvailable: true, isStale: false })
      }
    }
  }

  if (results.length > 0) return results

  // Why: all scrapers failed — use last known good price so the site never shows nothing
  const lastKnown = await getLastKnownPrice(itemSlug)
  if (lastKnown) {
    console.warn(`All scrapers failed for ${itemSlug} — using last known price from ${lastKnown.recorded_at}`)
    await insertPriceRecord({ itemSlug, supermarket: lastKnown.supermarket, pricePence: lastKnown.price_pence, isAvailable: true, isStale: true })
    return [{ ...lastKnown, isStale: true }]
  }

  console.error(`No price at all for ${itemSlug} — no fallback exists yet`)
  return null
}
