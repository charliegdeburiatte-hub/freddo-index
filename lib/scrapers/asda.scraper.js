import { fetchWithRetry, extractPrice, buildResult, buildUnavailable } from './base.scraper.js'

const PRICE_SELECTOR = '[class*="ProductPrice"]'

const PRODUCT_URLS = {
  'freddo':                   'https://groceries.asda.com/product/chocolate-bars-bags/cadbury-freddo-milk-chocolate/910003498818',
  'milk-pint':                'https://groceries.asda.com/product/whole-milk/asda-british-whole-milk-1-pint/910000277897',
  'eggs-12':                  'https://groceries.asda.com/product/eggs/asda-free-range-large-eggs-12-pack/910000104097',
  'bread-warburtons-800g':    'https://groceries.asda.com/product/white-bread/warburtons-medium-white-toastie-800g/910000056041',
  'crumpets-warburtons-9pk':  'https://groceries.asda.com/product/crumpets-muffins/warburtons-crumpets-9-pack/910000097580',
  'beans-heinz-400g':         'https://groceries.asda.com/product/canned-beans/heinz-baked-beanz-400g/910000055879',
  'beans-branston-400g':      'https://groceries.asda.com/product/canned-beans/branston-baked-beans-400g/910000056453',
  'lurpak-500g':              'https://groceries.asda.com/product/butter/lurpak-slightly-salted-spreadable-500g/910000106034',
  'yorkshire-tea-80':         'https://groceries.asda.com/product/teabags/yorkshire-tea-80-tea-bags/910000056060',
  'pg-tips-80':               'https://groceries.asda.com/product/teabags/pg-tips-80-tea-bags/910000056052',
  'dairy-milk-200g':          'https://groceries.asda.com/product/chocolate-bars-bags/cadbury-dairy-milk-200g/910000082296',
  'marmite-250g':             'https://groceries.asda.com/product/spreads/marmite-250g/910000055985',
  'nutella-400g':             'https://groceries.asda.com/product/spreads/nutella-400g/910000056108',
  'fairy-433ml':              'https://groceries.asda.com/product/washing-up-liquid/fairy-original-washing-up-liquid-433ml/910000279395',
  'irn-bru-330ml':            'https://groceries.asda.com/product/fizzy-drinks/barr-irn-bru-330ml/910000055955',
}

export const scrape = async (itemSlug) => {
  const url = PRODUCT_URLS[itemSlug]
  if (!url) throw new Error(`No Asda URL configured for item: ${itemSlug}`)

  try {
    const html = await fetchWithRetry(url)
    const pricePence = extractPrice(html, PRICE_SELECTOR)
    return buildResult('asda', itemSlug, pricePence)
  } catch (error) {
    console.error(`Asda scrape failed for ${itemSlug}:`, error.message)
    return buildUnavailable('asda', itemSlug)
  }
}
