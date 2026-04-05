import * as cheerio from 'cheerio'
import { fetchWithRetry, extractPriceFromJsonLd, buildResult, buildUnavailable } from './base.scraper.js'

// Why: Morrisons product pages embed window.__INITIAL_STATE__ in a script tag.
//      This is server-rendered Redux state containing full product data including price.
const PRODUCT_SLUGS = {
  'freddo':                   'cadbury-freddo-milk-chocolate-18g',
  'milk-pint':                'morrisons-british-whole-milk-568ml-1-pint',
  'eggs-12':                  'morrisons-free-range-large-eggs-12',
  'bread-warburtons-800g':    'warburtons-medium-white-toastie-800g',
  'crumpets-warburtons-9pk':  'warburtons-crumpets-9-pack',
  'beans-heinz-400g':         'heinz-baked-beanz-in-tomato-sauce-400g',
  'beans-branston-400g':      'branston-baked-beans-in-tomato-sauce-400g',
  'lurpak-500g':              'lurpak-slightly-salted-spreadable-butter-500g',
  'yorkshire-tea-80':         'yorkshire-tea-80-teabags',
  'pg-tips-80':               'pg-tips-original-80-tea-bags',
  'dairy-milk-200g':          'cadbury-dairy-milk-200g',
  'marmite-250g':             'marmite-yeast-extract-250g',
  'nutella-400g':             'nutella-hazelnut-cocoa-spread-400g',
  'fairy-433ml':              'fairy-original-green-washing-up-liquid-433ml',
  'irn-bru-330ml':            'irn-bru-regular-330ml',
}

const extractPriceFromInitialState = (html) => {
  const $ = cheerio.load(html)

  // Why: window.__INITIAL_STATE__ is a Redux store state — look for product price inside it
  let initialState = null
  $('script').each((_, el) => {
    const text = $(el).html() ?? ''
    const match = text.match(/window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});?\s*<\/script>/)
      ?? text.match(/window\.__INITIAL_STATE__\s*=\s*({[\s\S]+})/)
    if (match) {
      try { initialState = JSON.parse(match[1]) } catch { /* skip malformed */ }
    }
  })

  if (!initialState) throw new Error('window.__INITIAL_STATE__ not found')

  // Navigate common Morrisons Redux state paths for product price
  const product = initialState?.product?.product
    ?? initialState?.productDetail?.product
    ?? initialState?.products?.currentProduct

  const price = product?.price?.current?.value
    ?? product?.price?.currentPrice
    ?? product?.currentSaleUnitPrice?.price?.amount

  if (price == null) throw new Error('Price not found in __INITIAL_STATE__')
  return Math.round(parseFloat(price) * 100)
}

export const scrape = async (itemSlug) => {
  const slug = PRODUCT_SLUGS[itemSlug]
  if (!slug) return buildUnavailable('morrisons', itemSlug)

  try {
    const url = `https://groceries.morrisons.com/products/${slug}`
    const html = await fetchWithRetry(url)

    // Try Redux state first, then JSON-LD as fallback
    let pricePence
    try {
      pricePence = extractPriceFromInitialState(html)
    } catch {
      pricePence = extractPriceFromJsonLd(html)
    }

    return buildResult('morrisons', itemSlug, pricePence)
  } catch (error) {
    console.error(`Morrisons scrape failed for ${itemSlug}:`, error.message)
    return buildUnavailable('morrisons', itemSlug)
  }
}
