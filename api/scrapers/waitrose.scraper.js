import { fetchWithRetry, extractPrice, buildResult, buildUnavailable } from './base.scraper.js'

const PRICE_SELECTOR = '[class*="productPrice"]'

const PRODUCT_URLS = {
  'freddo':                   'https://www.waitrose.com/ecom/products/cadbury-freddo-milk-chocolate/035034-14987',
  'milk-pint':                'https://www.waitrose.com/ecom/products/waitrose-whole-milk-1-pint/049665-24071',
  'eggs-12':                  'https://www.waitrose.com/ecom/products/waitrose-british-free-range-eggs-12/059069-16977',
  'bread-warburtons-800g':    'https://www.waitrose.com/ecom/products/warburtons-white-toastie-medium-sliced-bread/051545-24793',
  'crumpets-warburtons-9pk':  'https://www.waitrose.com/ecom/products/warburtons-crumpets-9-pack/059219-49817',
  'beans-heinz-400g':         'https://www.waitrose.com/ecom/products/heinz-baked-beanz-in-tomato-sauce/049557-16539',
  'beans-branston-400g':      'https://www.waitrose.com/ecom/products/branston-baked-beans/049557-67328',
  'lurpak-500g':              'https://www.waitrose.com/ecom/products/lurpak-slightly-salted-spreadable/059074-56238',
  'yorkshire-tea-80':         'https://www.waitrose.com/ecom/products/yorkshire-tea-bags-80-pack/049660-89453',
  'pg-tips-80':               'https://www.waitrose.com/ecom/products/pg-tips-original-teabags-80-pack/049660-76897',
  'dairy-milk-200g':          'https://www.waitrose.com/ecom/products/cadbury-dairy-milk/049664-14961',
  'marmite-250g':             'https://www.waitrose.com/ecom/products/marmite-yeast-extract/049660-19461',
  'nutella-400g':             'https://www.waitrose.com/ecom/products/nutella-hazelnut-spread-with-cocoa/049660-67234',
  'lurpak-500g':              'https://www.waitrose.com/ecom/products/lurpak-slightly-salted-spreadable/059074-56238',
  'leek-loose':               'https://www.waitrose.com/ecom/products/waitrose-1-leek/060631-44501',
  'potato-maris-piper':       'https://www.waitrose.com/ecom/products/waitrose-maris-piper-potatoes/060679-12345',
}

export const scrape = async (itemSlug) => {
  const url = PRODUCT_URLS[itemSlug]
  if (!url) throw new Error(`No Waitrose URL configured for item: ${itemSlug}`)

  try {
    const html = await fetchWithRetry(url)
    const pricePence = extractPrice(html, PRICE_SELECTOR)
    return buildResult('waitrose', itemSlug, pricePence)
  } catch (error) {
    console.error(`Waitrose scrape failed for ${itemSlug}:`, error.message)
    return buildUnavailable('waitrose', itemSlug)
  }
}
