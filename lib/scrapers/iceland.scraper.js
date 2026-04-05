import { fetchWithRetry, extractPrice, buildResult, buildUnavailable } from './base.scraper.js'

const PRICE_SELECTOR = '[class*="product-detail-price"]'

const PRODUCT_URLS = {
  'freddo':                   'https://www.iceland.co.uk/p/cadbury-freddo-milk-chocolate/75849.html',
  'milk-pint':                'https://www.iceland.co.uk/p/iceland-british-whole-milk-1-pint/58261.html',
  'eggs-12':                  'https://www.iceland.co.uk/p/iceland-12-free-range-large-eggs/60421.html',
  'bread-warburtons-800g':    'https://www.iceland.co.uk/p/warburtons-medium-white-toastie-loaf-800g/54329.html',
  'beans-heinz-400g':         'https://www.iceland.co.uk/p/heinz-baked-beanz-400g/36029.html',
  'lurpak-500g':              'https://www.iceland.co.uk/p/lurpak-slightly-salted-spreadable-500g/67341.html',
  'yorkshire-tea-80':         'https://www.iceland.co.uk/p/yorkshire-tea-80-bags/52719.html',
  'pg-tips-80':               'https://www.iceland.co.uk/p/pg-tips-80-tea-bags/37561.html',
  'dairy-milk-200g':          'https://www.iceland.co.uk/p/cadbury-dairy-milk-200g/42359.html',
  'marmite-250g':             'https://www.iceland.co.uk/p/marmite-250g/43291.html',
  'nutella-400g':             'https://www.iceland.co.uk/p/nutella-400g/38457.html',
  'fairy-433ml':              'https://www.iceland.co.uk/p/fairy-original-washing-up-liquid-433ml/52341.html',
  'irn-bru-330ml':            'https://www.iceland.co.uk/p/irn-bru-330ml/23458.html',
}

export const scrape = async (itemSlug) => {
  const url = PRODUCT_URLS[itemSlug]
  if (!url) throw new Error(`No Iceland URL configured for item: ${itemSlug}`)

  try {
    const html = await fetchWithRetry(url)
    const pricePence = extractPrice(html, PRICE_SELECTOR)
    return buildResult('iceland', itemSlug, pricePence)
  } catch (error) {
    console.error(`Iceland scrape failed for ${itemSlug}:`, error.message)
    return buildUnavailable('iceland', itemSlug)
  }
}
