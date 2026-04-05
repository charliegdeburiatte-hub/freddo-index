import { fetchWithRetry, extractPriceFromNextData, extractPriceFromJsonLd, buildResult, buildUnavailable } from './base.scraper.js'

// Ocado product URLs — from ocado.com/products/{ocado-slug}/{id}
// Why: Ocado uses Next.js with SSR — price usually present in __NEXT_DATA__ or JSON-LD
const PRODUCT_URLS = {
  'freddo':                   'https://www.ocado.com/products/cadbury-freddo-milk-chocolate-18g/399278011',
  'milk-pint':                'https://www.ocado.com/products/ocado-whole-milk-1-pint/286946011',
  'eggs-12':                  'https://www.ocado.com/products/ocado-british-free-range-large-eggs-12/291534011',
  'bread-warburtons-800g':    'https://www.ocado.com/products/warburtons-medium-toastie-white-800g/56743011',
  'crumpets-warburtons-9pk':  'https://www.ocado.com/products/warburtons-crumpets-9-pack/56741011',
  'beans-heinz-400g':         'https://www.ocado.com/products/heinz-baked-beanz-in-tomato-sauce-400g/64011011',
  'beans-branston-400g':      'https://www.ocado.com/products/branston-baked-beans-in-tomato-sauce-400g/307493011',
  'lurpak-500g':              'https://www.ocado.com/products/lurpak-slightly-salted-spreadable-500g/271897011',
  'yorkshire-tea-80':         'https://www.ocado.com/products/yorkshire-tea-bags-80/58743011',
  'pg-tips-80':               'https://www.ocado.com/products/pg-tips-original-80-tea-bags/58579011',
  'dairy-milk-200g':          'https://www.ocado.com/products/cadbury-dairy-milk-200g/410634011',
  'marmite-250g':             'https://www.ocado.com/products/marmite-250g/56983011',
  'nutella-400g':             'https://www.ocado.com/products/nutella-400g/56989011',
  'fairy-433ml':              'https://www.ocado.com/products/fairy-original-green-washing-up-liquid-433ml/56951011',
  'irn-bru-330ml':            'https://www.ocado.com/products/irn-bru-original-330ml/97743011',
}

const findPriceInNextData = () => (nextData) => {
  // Ocado page props — varies by page version
  const product = nextData?.props?.pageProps?.product
    ?? nextData?.props?.pageProps?.productDetails
  return product?.price ?? product?.pricePerUnit ?? null
}

export const scrape = async (itemSlug) => {
  const url = PRODUCT_URLS[itemSlug]
  if (!url) return buildUnavailable('ocado', itemSlug)

  try {
    const html = await fetchWithRetry(url)

    // Try __NEXT_DATA__ first, then JSON-LD
    let pricePence
    try {
      pricePence = extractPriceFromNextData(html, findPriceInNextData())
    } catch {
      pricePence = extractPriceFromJsonLd(html)
    }

    return buildResult('ocado', itemSlug, pricePence)
  } catch (error) {
    console.error(`Ocado scrape failed for ${itemSlug}:`, error.message)
    return buildUnavailable('ocado', itemSlug)
  }
}
