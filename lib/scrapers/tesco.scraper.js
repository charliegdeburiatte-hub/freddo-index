import { fetchWithRetry, extractPriceFromNextData, buildResult, buildUnavailable } from './base.scraper.js'

// Tesco product IDs (TPNB) — from tesco.com/groceries/en-GB/products/{TPNB}
// Why: Tesco uses Next.js with SSR — __NEXT_DATA__ contains full product data in initial HTML
//      Apollo GraphQL cache is keyed by type:id — price lives at Product:{tpnb}.price.actual
const PRODUCT_IDS = {
  'freddo':                   '254877191',
  'milk-pint':                '254208009',
  'eggs-12':                  '253310677',
  'bread-warburtons-800g':    '252262844',
  'crumpets-warburtons-9pk':  '303834484',
  'beans-heinz-400g':         '276051918',
  'beans-branston-400g':      '296534505',
  'marmite-250g':             '255340045',
  'bovril-250g':              '262880499',
  'nutella-400g':             '256539592',
  'lurpak-500g':              '296218099',
  'yorkshire-tea-80':         '254340207',
  'pg-tips-80':               '257688791',
  'cathedral-city-400g':      '275463036',
  'maldon-salt-250g':         '254813468',
  'heinz-tomato-soup-400g':   '273911339',
  'john-west-tuna-145g':      '253869979',
  'dairy-milk-200g':          '310524983',
  'fairy-433ml':              '300658041',
  'colgate-75ml':             '305067878',
  'irn-bru-330ml':            '254862826',
  'leek-loose':               '254797568',
  'potato-maris-piper':       '254797478',
}

// Navigates the Apollo state cache in __NEXT_DATA__ to find the product price
const findPriceInNextData = (tpnb) => (nextData) => {
  // Apollo SSR cache: keys like "Product:254877191" or "ProductVariant:254877191"
  const apolloState = nextData?.props?.pageProps?.apolloState ?? {}
  for (const [key, val] of Object.entries(apolloState)) {
    if (!key.startsWith('Product:')) continue
    // price.actual is the displayed shelf price in pounds
    const price = val?.price?.actual ?? val?.price?.value ?? val?.displayPrice?.value
    if (price != null) return price
  }

  // Fallback: pageProps.productData path (alternative Tesco page structure)
  const product = nextData?.props?.pageProps?.productData?.product
  return product?.price?.actual ?? product?.displayPrice?.value ?? null
}

export const scrape = async (itemSlug) => {
  const tpnb = PRODUCT_IDS[itemSlug]
  if (!tpnb) return buildUnavailable('tesco', itemSlug)

  try {
    const url = `https://www.tesco.com/groceries/en-GB/products/${tpnb}`
    const html = await fetchWithRetry(url)
    const pricePence = extractPriceFromNextData(html, findPriceInNextData(tpnb))
    return buildResult('tesco', itemSlug, pricePence)
  } catch (error) {
    console.error(`Tesco scrape failed for ${itemSlug}:`, error.message)
    return buildUnavailable('tesco', itemSlug)
  }
}
