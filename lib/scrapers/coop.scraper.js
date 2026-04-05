import { fetchWithRetry, extractPriceFromJsonLd, extractPrice, buildResult, buildUnavailable } from './base.scraper.js'

// Why: Co-op shop uses Shopify, which server-renders product pages with JSON-LD
//      Shopify pages reliably include Product schema — use that before CSS selectors
const PRODUCT_URLS = {
  'freddo':                   'https://shop.coop.co.uk/products/cadbury-freddo-18g',
  'milk-pint':                'https://shop.coop.co.uk/products/co-op-british-whole-milk-568ml',
  'eggs-12':                  'https://shop.coop.co.uk/products/co-op-free-range-12-medium-eggs',
  'bread-warburtons-800g':    'https://shop.coop.co.uk/products/warburtons-toastie-white-medium-sliced-800g',
  'beans-heinz-400g':         'https://shop.coop.co.uk/products/heinz-baked-beanz-400g',
  'beans-branston-400g':      'https://shop.coop.co.uk/products/branston-baked-beans-400g',
  'lurpak-500g':              'https://shop.coop.co.uk/products/lurpak-slightly-salted-spreadable-500g',
  'yorkshire-tea-80':         'https://shop.coop.co.uk/products/yorkshire-tea-80-bags',
  'pg-tips-80':               'https://shop.coop.co.uk/products/pg-tips-80-tea-bags',
  'dairy-milk-200g':          'https://shop.coop.co.uk/products/cadbury-dairy-milk-200g',
  'marmite-250g':             'https://shop.coop.co.uk/products/marmite-250g',
  'nutella-400g':             'https://shop.coop.co.uk/products/nutella-400g',
  'fairy-433ml':              'https://shop.coop.co.uk/products/fairy-original-washing-up-liquid-433ml',
  'irn-bru-330ml':            'https://shop.coop.co.uk/products/irn-bru-330ml',
}

// Why: Shopify renders price in a predictable element hierarchy
const PRICE_SELECTOR = '.price__current .money, [class*="price__sale"] .money, .product__price .money'

export const scrape = async (itemSlug) => {
  const url = PRODUCT_URLS[itemSlug]
  if (!url) return buildUnavailable('coop', itemSlug)

  try {
    const html = await fetchWithRetry(url)

    // Try JSON-LD first (Shopify reliably embeds Product schema)
    let pricePence
    try {
      pricePence = extractPriceFromJsonLd(html)
    } catch {
      pricePence = extractPrice(html, PRICE_SELECTOR)
    }

    return buildResult('coop', itemSlug, pricePence)
  } catch (error) {
    console.error(`Co-op scrape failed for ${itemSlug}:`, error.message)
    return buildUnavailable('coop', itemSlug)
  }
}
