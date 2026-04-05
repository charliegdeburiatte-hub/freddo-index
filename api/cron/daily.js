import * as sainsburys from '../../lib/scrapers/sainsburys.scraper.js'
import * as tesco      from '../../lib/scrapers/tesco.scraper.js'
import * as asda       from '../../lib/scrapers/asda.scraper.js'
import * as morrisons  from '../../lib/scrapers/morrisons.scraper.js'
import * as waitrose   from '../../lib/scrapers/waitrose.scraper.js'
import * as coop       from '../../lib/scrapers/coop.scraper.js'
import * as iceland    from '../../lib/scrapers/iceland.scraper.js'
import * as ocado      from '../../lib/scrapers/ocado.scraper.js'
import { scrapeWithFallback }             from '../../lib/utils/redundancyChain.js'
import { calculateFreddoNationalAverage } from '../../lib/utils/calculateNationalAverage.js'
import { getDailyItems }                  from '../../lib/db/queries/items.js'
import { insertScrapeLog }                from '../../lib/db/queries/scrapeLogs.js'

const scraperModules = { sainsburys, tesco, asda, morrisons, waitrose, coop, iceland, ocado }

export default async function handler(req, res) {
  // Why: protect cron endpoint — Vercel sends this header on scheduled triggers
  if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorised' })
  }

  let itemsProcessed = 0

  try {
    const dailyItems = await getDailyItems()

    // Why: sequential not parallel — avoids hammering supermarket sites simultaneously
    for (const item of dailyItems) {
      if (!item.scraper_priority || item.scraper_priority.length === 0) continue
      await scrapeWithFallback(item, scraperModules)
      itemsProcessed++
    }

    await calculateFreddoNationalAverage()

    await insertScrapeLog({ scraper: 'daily-cron', status: 'success', itemsUpdated: itemsProcessed })
    return res.status(200).json({ success: true, itemsProcessed })

  } catch (error) {
    console.error('Daily cron failed:', error.message)
    await insertScrapeLog({ scraper: 'daily-cron', status: 'failed', errorMessage: error.message, itemsUpdated: itemsProcessed })
    return res.status(500).json({ error: error.message })
  }
}
