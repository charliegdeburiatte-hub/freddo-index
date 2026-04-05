import { insertPriceRecord } from '../db/queries/priceRecords.js'
import { insertScrapeLog } from '../db/queries/scrapeLogs.js'

// ONS Annual Survey of Hours and Earnings (ASHE) — median annual gross earnings
// Published annually in November. Historical data from 1997.
// Download from: https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/bulletins/annualsurveyofhoursandearnings/

export const fetchMedianSalary = async (annualGrossPounds) => {
  // Why: ONS ASHE data requires parsing complex Excel/CSV sheets — manual update preferred
  // Call this with the figure from the ONS bulletin directly when it's published
  try {
    const pricePence = Math.round(annualGrossPounds * 100)
    await insertPriceRecord({
      itemSlug: 'salary-uk-annual', supermarket: 'ons',
      pricePence, isStale: false, source: 'ONS ASHE annual bulletin'
    })
    await insertScrapeLog({ scraper: 'ons', itemSlug: 'salary-uk-annual', status: 'success' })
    return pricePence
  } catch (error) {
    console.error('ONS salary insert failed:', error.message)
    await insertScrapeLog({ scraper: 'ons', itemSlug: 'salary-uk-annual', status: 'failed', errorMessage: error.message })
    return null
  }
}

// ONS private rental market statistics — median monthly rent UK and London
// Published monthly. For initial data, insert manually via Supabase dashboard.
export const fetchRentPrices = async ({ ukMonthlyPounds, londonMonthlyPounds }) => {
  const items = [
    { slug: 'rent-uk-monthly',     pounds: ukMonthlyPounds },
    { slug: 'rent-london-monthly', pounds: londonMonthlyPounds },
  ]

  for (const { slug, pounds } of items) {
    if (!pounds) continue
    try {
      const pricePence = Math.round(pounds * 100)
      await insertPriceRecord({ itemSlug: slug, supermarket: 'ons', pricePence, isStale: false, source: 'ONS private rental statistics' })
      await insertScrapeLog({ scraper: 'ons', itemSlug: slug, status: 'success' })
    } catch (error) {
      console.error(`ONS rent insert failed for ${slug}:`, error.message)
      await insertScrapeLog({ scraper: 'ons', itemSlug: slug, status: 'failed', errorMessage: error.message })
    }
  }
}
