import * as cheerio from 'cheerio'

const SCRAPE_DELAY_MS = 2000
const MAX_RETRIES = 2
const REQUEST_TIMEOUT_MS = 10000

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const fetchWithRetry = async (url, retries = MAX_RETRIES) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; FreddoIndex/1.0; +https://freddo-index.co.uk)',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-GB,en;q=0.9',
        },
      })

      clearTimeout(timeout)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.text()

    } catch (error) {
      // Why: on last attempt, propagate error to caller for scrape log
      if (attempt === MAX_RETRIES) throw error
      await delay(SCRAPE_DELAY_MS * attempt) // progressive delay between attempts
    }
  }
}

// Returns price in pence as integer — throws if not found or unparseable
export const extractPrice = (html, selector) => {
  const $ = cheerio.load(html)
  const priceText = $(selector).first().text().trim()

  if (!priceText) throw new Error(`Price element not found: ${selector}`)

  const cleaned = priceText.replace(/[^0-9.]/g, '')
  const price = parseFloat(cleaned)

  if (isNaN(price)) throw new Error(`Could not parse price from: "${priceText}"`)

  // Why: everything stored in pence as integers — never floats for currency
  return priceText.includes('p') && !priceText.includes('£')
    ? Math.round(price)
    : Math.round(price * 100)
}

export const buildResult = (supermarket, itemSlug, pricePence) => ({
  supermarket,
  itemSlug,
  pricePence,
  isAvailable: true,
  scrapedAt: new Date().toISOString(),
})

export const buildUnavailable = (supermarket, itemSlug) => ({
  supermarket,
  itemSlug,
  pricePence: null,
  isAvailable: false,
  scrapedAt: new Date().toISOString(),
})
