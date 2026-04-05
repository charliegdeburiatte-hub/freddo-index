import { fetchWithRetry, extractPrice, buildResult, buildUnavailable } from './base.scraper.js'

// Why: Tesco uses data-auto-id attribute — more stable than class names
const PRICE_SELECTOR = '[data-auto-id="price-value"]'

const PRODUCT_URLS = {
  'freddo':                   'https://www.tesco.com/groceries/en-GB/products/254877191',
  'milk-pint':                'https://www.tesco.com/groceries/en-GB/products/254208009',
  'eggs-12':                  'https://www.tesco.com/groceries/en-GB/products/253310677',
  'bread-warburtons-800g':    'https://www.tesco.com/groceries/en-GB/products/252262844',
  'crumpets-warburtons-9pk':  'https://www.tesco.com/groceries/en-GB/products/303834484',
  'beans-heinz-400g':         'https://www.tesco.com/groceries/en-GB/products/276051918',
  'beans-branston-400g':      'https://www.tesco.com/groceries/en-GB/products/296534505',
  'marmite-250g':             'https://www.tesco.com/groceries/en-GB/products/255340045',
  'bovril-250g':              'https://www.tesco.com/groceries/en-GB/products/262880499',
  'nutella-400g':             'https://www.tesco.com/groceries/en-GB/products/256539592',
  'lurpak-500g':              'https://www.tesco.com/groceries/en-GB/products/296218099',
  'yorkshire-tea-80':         'https://www.tesco.com/groceries/en-GB/products/254340207',
  'pg-tips-80':               'https://www.tesco.com/groceries/en-GB/products/257688791',
  'cathedral-city-400g':      'https://www.tesco.com/groceries/en-GB/products/275463036',
  'maldon-salt-250g':         'https://www.tesco.com/groceries/en-GB/products/254813468',
  'heinz-tomato-soup-400g':   'https://www.tesco.com/groceries/en-GB/products/273911339',
  'john-west-tuna-145g':      'https://www.tesco.com/groceries/en-GB/products/253869979',
  'dairy-milk-200g':          'https://www.tesco.com/groceries/en-GB/products/310524983',
  'fairy-433ml':              'https://www.tesco.com/groceries/en-GB/products/300658041',
  'colgate-75ml':             'https://www.tesco.com/groceries/en-GB/products/305067878',
  'irn-bru-330ml':            'https://www.tesco.com/groceries/en-GB/products/254862826',
  'leek-loose':               'https://www.tesco.com/groceries/en-GB/products/254797568',
  'potato-maris-piper':       'https://www.tesco.com/groceries/en-GB/products/254797478',
}

export const scrape = async (itemSlug) => {
  const url = PRODUCT_URLS[itemSlug]
  if (!url) throw new Error(`No Tesco URL configured for item: ${itemSlug}`)

  try {
    const html = await fetchWithRetry(url)
    const pricePence = extractPrice(html, PRICE_SELECTOR)
    return buildResult('tesco', itemSlug, pricePence)
  } catch (error) {
    console.error(`Tesco scrape failed for ${itemSlug}:`, error.message)
    return buildUnavailable('tesco', itemSlug)
  }
}
