import { fetchJSON, fetchWithRetry, extractPriceFromJsonLd, buildResult, buildUnavailable } from './base.scraper.js'

// Asda product IDs — from groceries.asda.com/product/{cat}/{slug}/{id}
// API: groceries.asda.com/api/items/view?itemid={id}&requestorigin=gi
// Response: data.items[0].price.price (string, e.g. "£0.35")
const PRODUCT_IDS = {
  'freddo':                   '910003498818',
  'milk-pint':                '910000277897',
  'eggs-12':                  '910000104097',
  'bread-warburtons-800g':    '910000056041',
  'crumpets-warburtons-9pk':  '910000097580',
  'beans-heinz-400g':         '910000055879',
  'beans-branston-400g':      '910000056453',
  'lurpak-500g':              '910000106034',
  'yorkshire-tea-80':         '910000056060',
  'pg-tips-80':               '910000056052',
  'dairy-milk-200g':          '910000082296',
  'marmite-250g':             '910000055985',
  'nutella-400g':             '910000056108',
  'fairy-433ml':              '910000279395',
  'irn-bru-330ml':            '910000055955',
}

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

const extractAsdaApiPrice = (data) => {
  // API response: data.items[0].price.price is a string like "£0.35"
  const priceStr = data?.data?.items?.[0]?.price?.price
    ?? data?.items?.[0]?.price?.price
  if (!priceStr) throw new Error('price field missing from Asda API response')
  const cleaned = String(priceStr).replace(/[^0-9.]/g, '')
  const pence = Math.round(parseFloat(cleaned) * 100)
  if (isNaN(pence) || pence <= 0) throw new Error(`Unparseable Asda price: ${priceStr}`)
  return pence
}

export const scrape = async (itemSlug) => {
  const productId = PRODUCT_IDS[itemSlug]
  if (!productId) return buildUnavailable('asda', itemSlug)

  // Try internal API first
  try {
    const apiUrl = `https://groceries.asda.com/api/items/view?itemid=${productId}&requestorigin=gi`
    const data = await fetchJSON(apiUrl, {
      headers: {
        'Referer': 'https://groceries.asda.com/',
        'Origin':  'https://groceries.asda.com',
      },
    })
    return buildResult('asda', itemSlug, extractAsdaApiPrice(data))
  } catch (apiErr) {
    console.warn(`Asda API failed for ${itemSlug} (${apiErr.message}) — trying JSON-LD fallback`)
  }

  // Fallback: fetch product page and extract JSON-LD
  try {
    const url = PRODUCT_URLS[itemSlug]
    const html = await fetchWithRetry(url)
    return buildResult('asda', itemSlug, extractPriceFromJsonLd(html))
  } catch (error) {
    console.error(`Asda scrape failed for ${itemSlug}:`, error.message)
    return buildUnavailable('asda', itemSlug)
  }
}
