import { fetchEnergyPrices } from '../../lib/fetchers/ofgem.fetcher.js'
import { insertScrapeLog }   from '../../lib/db/queries/scrapeLogs.js'

// Triggers: Ofgem electricity and gas price cap (quarterly — Jan, Apr, Jul, Oct)
export default async function handler(req, res) {
  if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorised' })
  }

  try {
    const results = await fetchEnergyPrices()
    await insertScrapeLog({ scraper: 'quarterly-cron', status: 'success' })
    return res.status(200).json({ success: true, results })
  } catch (error) {
    console.error('Quarterly cron failed:', error.message)
    await insertScrapeLog({ scraper: 'quarterly-cron', status: 'failed', errorMessage: error.message })
    return res.status(500).json({ error: error.message })
  }
}
