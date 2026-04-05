import { getLatestFreddoPrices, insertFreddoPrice } from '../db/queries/freddoPrices.js'
import { insertScrapeLog } from '../db/queries/scrapeLogs.js'

// Calculates and stores the national average Freddo price.
// Called after all supermarket scrapers complete. Excludes stale prices.
export const calculateFreddoNationalAverage = async () => {
  try {
    const prices = await getLatestFreddoPrices()
    const freshPrices = prices.filter(p => !p.is_stale && p.is_available && p.price_pence)

    if (freshPrices.length === 0) {
      console.error('No fresh Freddo prices available — cannot calculate national average')
      await insertScrapeLog({ scraper: 'daily-cron', itemSlug: 'freddo', status: 'failed', errorMessage: 'No fresh supermarket prices to average' })
      return null
    }

    const averagePence = Math.round(
      freshPrices.reduce((sum, p) => sum + p.price_pence, 0) / freshPrices.length
    )

    await insertFreddoPrice({ supermarket: 'national_average', pricePence: averagePence, isAvailable: true, isStale: false })
    await insertScrapeLog({ scraper: 'daily-cron', itemSlug: 'freddo', status: 'success', itemsUpdated: freshPrices.length })

    return averagePence
  } catch (error) {
    console.error('National average calculation failed:', error.message)
    await insertScrapeLog({ scraper: 'daily-cron', itemSlug: 'freddo', status: 'failed', errorMessage: error.message })
    return null
  }
}
