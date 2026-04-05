import * as cheerio from 'cheerio'
import { insertPriceRecord } from '../db/queries/priceRecords.js'
import { insertScrapeLog } from '../db/queries/scrapeLogs.js'

// Ofgem publishes quarterly price cap as HTML — we scrape the announced figures
// Why: more reliable to scrape the stated annual figures and divide by 12 ourselves
const OFGEM_URL = 'https://www.ofgem.gov.uk/check-if-energy-price-cap-affects-you'

// Typical bill figures are stated in the press release text
// Selectors verified against Ofgem page at time of writing — may drift with redesigns
const ELECTRICITY_SELECTOR = '[data-component="price-cap-electricity"]'
const GAS_SELECTOR = '[data-component="price-cap-gas"]'

const parseAnnualBillToMonthlyPence = (text) => {
  const match = text.replace(/,/g, '').match(/[\d]+/)
  if (!match) throw new Error(`Could not parse bill from: "${text}"`)
  const annualPounds = parseFloat(match[0])
  return Math.round((annualPounds / 12) * 100)
}

export const fetchEnergyPrices = async () => {
  const results = { electricity: null, gas: null }

  try {
    const response = await fetch(OFGEM_URL, { headers: { 'Accept': 'text/html' } })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const html = await response.text()
    const $ = cheerio.load(html)

    const elecText = $(ELECTRICITY_SELECTOR).text().trim()
    if (elecText) {
      const elecPence = parseAnnualBillToMonthlyPence(elecText)
      await insertPriceRecord({ itemSlug: 'electricity-monthly', supermarket: 'ofgem', pricePence: elecPence, isStale: false })
      await insertScrapeLog({ scraper: 'ofgem', itemSlug: 'electricity-monthly', status: 'success' })
      results.electricity = elecPence
    }

    const gasText = $(GAS_SELECTOR).text().trim()
    if (gasText) {
      const gasPence = parseAnnualBillToMonthlyPence(gasText)
      await insertPriceRecord({ itemSlug: 'gas-monthly', supermarket: 'ofgem', pricePence: gasPence, isStale: false })
      await insertScrapeLog({ scraper: 'ofgem', itemSlug: 'gas-monthly', status: 'success' })
      results.gas = gasPence
    }

  } catch (error) {
    console.error('Ofgem fetch failed:', error.message)
    await insertScrapeLog({ scraper: 'ofgem', status: 'failed', errorMessage: error.message })
  }

  return results
}
