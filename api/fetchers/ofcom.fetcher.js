import { insertPriceRecord } from '../db/queries/priceRecords.js'
import { insertScrapeLog } from '../db/queries/scrapeLogs.js'

// Ofcom Communications Market Report — published annually in autumn
// Average monthly mobile and broadband spend per user
// Why: Ofcom publishes as PDF and dataset — manual insert preferred for annual data

export const insertOfcomData = async ({ mobileMonthlyPounds, broadbandMonthlyPounds, year }) => {
  const items = [
    { slug: 'phone-monthly',     pounds: mobileMonthlyPounds },
    { slug: 'broadband-monthly', pounds: broadbandMonthlyPounds },
  ]

  for (const { slug, pounds } of items) {
    if (!pounds) continue
    try {
      const pricePence = Math.round(pounds * 100)
      await insertPriceRecord({
        itemSlug: slug, supermarket: 'ofcom',
        pricePence, isStale: false, source: `Ofcom Communications Market Report ${year}`
      })
      await insertScrapeLog({ scraper: 'ofcom', itemSlug: slug, status: 'success' })
    } catch (error) {
      console.error(`Ofcom insert failed for ${slug}:`, error.message)
      await insertScrapeLog({ scraper: 'ofcom', itemSlug: slug, status: 'failed', errorMessage: error.message })
    }
  }
}
