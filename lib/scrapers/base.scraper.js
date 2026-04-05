import * as cheerio from 'cheerio'

const SCRAPE_DELAY_MS = 2000
const MAX_RETRIES    = 2
const REQUEST_TIMEOUT_MS = 12000

// Why: browser-like UA reduces chance of bot detection on HTML scrapes
const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const baseHeaders = {
  'User-Agent':      BROWSER_UA,
  'Accept-Language': 'en-GB,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
}

export const fetchWithRetry = async (url, retries = MAX_RETRIES) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          ...baseHeaders,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      })

      clearTimeout(timeout)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.text()

    } catch (error) {
      if (attempt === retries) throw error
      await delay(SCRAPE_DELAY_MS * attempt)
    }
  }
}

export const fetchJSON = async (url, options = {}, retries = MAX_RETRIES) => {
  const { headers: extraHeaders = {}, method = 'GET', body } = options
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

      const response = await fetch(url, {
        method,
        signal: controller.signal,
        headers: {
          ...baseHeaders,
          'Accept': 'application/json, text/plain, */*',
          ...extraHeaders,
        },
        ...(body ? { body } : {}),
      })

      clearTimeout(timeout)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.json()

    } catch (error) {
      if (attempt === retries) throw error
      await delay(SCRAPE_DELAY_MS * attempt)
    }
  }
}

// Returns price in pence as integer — throws if not found or unparseable
export const extractPrice = (html, selector) => {
  const $ = cheerio.load(html)
  const priceText = $(selector).first().text().trim()

  if (!priceText) throw new Error(`Price element not found: ${selector}`)

  const cleaned = priceText.replace(/[^0-9.]/g, '')
  const price   = parseFloat(cleaned)

  if (isNaN(price)) throw new Error(`Could not parse price from: "${priceText}"`)

  // Why: everything stored in pence as integers — never floats for currency
  return priceText.includes('p') && !priceText.includes('£')
    ? Math.round(price)
    : Math.round(price * 100)
}

// Extracts price from JSON-LD Product schema — most reliable for SSR/SEO pages
export const extractPriceFromJsonLd = (html) => {
  const $ = cheerio.load(html)
  const scripts = $('script[type="application/ld+json"]').toArray()

  for (const el of scripts) {
    try {
      const json = JSON.parse($(el).html())
      const entries = Array.isArray(json) ? json : [json]
      for (const entry of entries) {
        const schema = entry['@type'] === 'Product' ? entry
          : entry['@graph']?.find(n => n['@type'] === 'Product')
        if (!schema) continue

        const offerPrice = schema.offers?.price ?? schema.offers?.[0]?.price
        if (offerPrice != null) {
          const pence = Math.round(parseFloat(offerPrice) * 100)
          if (!isNaN(pence) && pence > 0) return pence
        }
      }
    } catch { /* malformed JSON-LD — skip */ }
  }
  throw new Error('No Product JSON-LD with price found')
}

// Extracts price from embedded __NEXT_DATA__ script (Next.js pages)
export const extractPriceFromNextData = (html, pricePath) => {
  const $ = cheerio.load(html)
  const nextDataText = $('script#__NEXT_DATA__').html()
  if (!nextDataText) throw new Error('__NEXT_DATA__ not found')

  const nextData = JSON.parse(nextDataText)
  const price = pricePath(nextData)

  if (price == null) throw new Error('Price not found in __NEXT_DATA__ at given path')
  const pence = Math.round(parseFloat(price) * 100)
  if (isNaN(pence) || pence <= 0) throw new Error(`Invalid price in __NEXT_DATA__: ${price}`)
  return pence
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
