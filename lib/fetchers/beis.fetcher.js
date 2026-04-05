import { insertPriceRecord } from '../db/queries/priceRecords.js'
import { insertScrapeLog } from '../db/queries/scrapeLogs.js'

// Why: BEIS publishes weekly CSV — more reliable than HTML scraping
// URL may change — check https://www.gov.uk/government/statistical-data-sets/oil-and-petroleum-products-weekly-statistics
const BEIS_CSV_URL = 'https://assets.publishing.service.gov.uk/media/oil-and-petroleum-products.csv'
const UNLEADED_COLUMN = 'Unleaded petrol pence per litre'

export const fetchPetrolPrice = async () => {
  try {
    const response = await fetch(BEIS_CSV_URL)
    if (!response.ok) throw new Error(`BEIS fetch failed: HTTP ${response.status}`)

    const csv = await response.text()
    const rows = csv.trim().split('\n').map(row => row.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')))
    const headers = rows[0]
    const latestRow = rows[rows.length - 1]

    const colIdx = headers.indexOf(UNLEADED_COLUMN)
    if (colIdx === -1) throw new Error(`BEIS column not found — CSV format may have changed. Headers: ${headers.join(', ')}`)

    const pricePence = Math.round(parseFloat(latestRow[colIdx]))
    if (isNaN(pricePence)) throw new Error(`BEIS price unparseable: "${latestRow[colIdx]}"`)

    await insertPriceRecord({ itemSlug: 'petrol-litre', supermarket: 'beis', pricePence, isStale: false })
    await insertScrapeLog({ scraper: 'beis', itemSlug: 'petrol-litre', status: 'success' })

    return pricePence
  } catch (error) {
    console.error('BEIS petrol fetch failed:', error.message)
    await insertScrapeLog({ scraper: 'beis', itemSlug: 'petrol-litre', status: 'failed', errorMessage: error.message })
    return null
  }
}
