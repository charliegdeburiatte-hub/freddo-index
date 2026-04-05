import { insertPriceRecord } from '../db/queries/priceRecords.js'
import { insertScrapeLog } from '../db/queries/scrapeLogs.js'

// UK House Price Index — Land Registry monthly CSV release
// Published with ~2 month lag. This URL points to the full historical dataset which is updated monthly.
// Why: using the stable bulk download URL rather than the dated file URL which changes each release
const HPI_CSV_URL = 'https://assets.publishing.service.gov.uk/media/uk-hpi-full-file-latest.csv'
const AVERAGE_PRICE_COLUMN = 'Average price All property types'
const DATE_COLUMN = 'Date'

export const fetchHousePrice = async () => {
  try {
    const response = await fetch(HPI_CSV_URL)
    if (!response.ok) throw new Error(`Land Registry fetch failed: HTTP ${response.status}`)

    const csv = await response.text()
    const rows = csv.trim().split('\n').map(r => r.split(',').map(c => c.trim().replace(/^"|"$/g, '')))
    const headers = rows[0]

    const priceCol = headers.indexOf(AVERAGE_PRICE_COLUMN)
    const dateCol = headers.indexOf(DATE_COLUMN)

    if (priceCol === -1) throw new Error(`Column not found. Headers: ${headers.join(', ')}`)

    // Filter to UK-wide rows (no region specified) and take latest
    const dataRows = rows.slice(1).filter(r => r[dateCol] && r[priceCol] && !isNaN(parseFloat(r[priceCol])))
    const latestRow = dataRows[dataRows.length - 1]

    const priceGBP = parseFloat(latestRow[priceCol])
    const pricePence = Math.round(priceGBP * 100)

    await insertPriceRecord({
      itemSlug: 'house-price-uk', supermarket: 'land-registry',
      pricePence, isStale: false, source: `Land Registry HPI ${latestRow[dateCol]}`
    })
    await insertScrapeLog({ scraper: 'land-registry', itemSlug: 'house-price-uk', status: 'success' })

    return pricePence
  } catch (error) {
    console.error('Land Registry fetch failed:', error.message)
    await insertScrapeLog({ scraper: 'land-registry', itemSlug: 'house-price-uk', status: 'failed', errorMessage: error.message })
    return null
  }
}
