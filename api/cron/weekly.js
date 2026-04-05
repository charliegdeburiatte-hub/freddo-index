import { fetchPetrolPrice }  from '../fetchers/beis.fetcher.js'
import { insertScrapeLog }   from '../db/queries/scrapeLogs.js'

// Triggers: BEIS petrol prices (weekly), National Rail (manual for now)
export default async function handler(req, res) {
  if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorised' })
  }

  const results = {}

  try {
    results.petrol = await fetchPetrolPrice()
    await insertScrapeLog({ scraper: 'weekly-cron', status: 'success', itemsUpdated: Object.values(results).filter(Boolean).length })
    return res.status(200).json({ success: true, results })
  } catch (error) {
    console.error('Weekly cron failed:', error.message)
    await insertScrapeLog({ scraper: 'weekly-cron', status: 'failed', errorMessage: error.message })
    return res.status(500).json({ error: error.message })
  }
}
