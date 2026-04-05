// (ew)
import { fetchWithRetry, extractPrice, buildResult, buildUnavailable } from './base.scraper.js'

const PRICE_SELECTOR = '[class*="priceDisplay"]'

const PRODUCT_URLS = {
  'freddo':                   'https://groceries.morrisons.com/products/cadbury-freddo-milk-chocolate-18g',
  'milk-pint':                'https://groceries.morrisons.com/products/morrisons-british-whole-milk-568ml-1-pint',
  'eggs-12':                  'https://groceries.morrisons.com/products/morrisons-free-range-large-eggs-12',
  'bread-warburtons-800g':    'https://groceries.morrisons.com/products/warburtons-medium-white-toastie-800g',
  'crumpets-warburtons-9pk':  'https://groceries.morrisons.com/products/warburtons-crumpets-9-pack',
  'beans-heinz-400g':         'https://groceries.morrisons.com/products/heinz-baked-beanz-in-tomato-sauce-400g',
  'beans-branston-400g':      'https://groceries.morrisons.com/products/branston-baked-beans-in-tomato-sauce-400g',
  'lurpak-500g':              'https://groceries.morrisons.com/products/lurpak-slightly-salted-spreadable-butter-500g',
  'yorkshire-tea-80':         'https://groceries.morrisons.com/products/yorkshire-tea-80-teabags',
  'pg-tips-80':               'https://groceries.morrisons.com/products/pg-tips-original-80-tea-bags',
  'dairy-milk-200g':          'https://groceries.morrisons.com/products/cadbury-dairy-milk-200g',
  'marmite-250g':             'https://groceries.morrisons.com/products/marmite-yeast-extract-250g',
  'nutella-400g':             'https://groceries.morrisons.com/products/nutella-hazelnut-cocoa-spread-400g',
  'fairy-433ml':              'https://groceries.morrisons.com/products/fairy-original-green-washing-up-liquid-433ml',
  'irn-bru-330ml':            'https://groceries.morrisons.com/products/irn-bru-regular-330ml',
}

export const scrape = async (itemSlug) => {
  const url = PRODUCT_URLS[itemSlug]
  if (!url) throw new Error(`No Morrisons URL configured for item: ${itemSlug}`)

  try {
    const html = await fetchWithRetry(url)
    const pricePence = extractPrice(html, PRICE_SELECTOR)
    return buildResult('morrisons', itemSlug, pricePence)
  } catch (error) {
    console.error(`Morrisons scrape failed for ${itemSlug}:`, error.message)
    return buildUnavailable('morrisons', itemSlug)
  }
}
