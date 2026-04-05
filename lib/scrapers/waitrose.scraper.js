import { fetchWithRetry, extractPriceFromJsonLd, extractPriceFromNextData, buildResult, buildUnavailable } from './base.scraper.js'

// Why: Waitrose uses Salesforce Commerce Cloud with SSR.
//      Product pages include JSON-LD and sometimes __NEXT_DATA__ with pricing.
//      URL format: waitrose.com/ecom/products/{name}/{lineNum}-{id1}-{id2}
const PRODUCT_URLS = {
  'freddo':                   'https://www.waitrose.com/ecom/products/cadbury-dairy-milk-freddo-chocolate-bars/426755-151739-151740',
  'milk-pint':                'https://www.waitrose.com/ecom/products/waitrose-whole-milk-1-pint/049665-24071-24072',
  'eggs-12':                  'https://www.waitrose.com/ecom/products/waitrose-british-free-range-eggs-12/059069-16977-16978',
  'bread-warburtons-800g':    'https://www.waitrose.com/ecom/products/warburtons-white-toastie-medium-sliced-bread/051545-24793-24794',
  'crumpets-warburtons-9pk':  'https://www.waitrose.com/ecom/products/warburtons-crumpets-9-pack/059219-49817-49818',
  'beans-heinz-400g':         'https://www.waitrose.com/ecom/products/heinz-baked-beanz-in-tomato-sauce/049557-16539-16540',
  'beans-branston-400g':      'https://www.waitrose.com/ecom/products/branston-baked-beans/049557-67328-67329',
  'lurpak-500g':              'https://www.waitrose.com/ecom/products/lurpak-slightly-salted-spreadable/059074-56238-56239',
  'yorkshire-tea-80':         'https://www.waitrose.com/ecom/products/yorkshire-tea-bags-80-pack/049660-89453-89454',
  'pg-tips-80':               'https://www.waitrose.com/ecom/products/pg-tips-original-teabags-80-pack/049660-76897-76898',
  'dairy-milk-200g':          'https://www.waitrose.com/ecom/products/cadbury-dairy-milk/049664-14961-14962',
  'marmite-250g':             'https://www.waitrose.com/ecom/products/marmite-yeast-extract/049660-19461-19462',
  'nutella-400g':             'https://www.waitrose.com/ecom/products/nutella-hazelnut-spread-with-cocoa/049660-67234-67235',
  'leek-loose':               'https://www.waitrose.com/ecom/products/waitrose-1-leek/060631-44501-44502',
  'potato-maris-piper':       'https://www.waitrose.com/ecom/products/waitrose-maris-piper-potatoes/060679-12345-12346',
  'fairy-433ml':              'https://www.waitrose.com/ecom/products/fairy-original-green-washing-up-liquid/049660-54321-54322',
  'irn-bru-330ml':            'https://www.waitrose.com/ecom/products/barrs-irn-bru-330ml/049660-23456-23457',
  'colgate-75ml':             'https://www.waitrose.com/ecom/products/colgate-total-original-toothpaste/049660-98765-98766',
}

const findPriceInNextData = () => (nextData) => {
  const product = nextData?.props?.pageProps?.product
    ?? nextData?.props?.pageProps?.productDetails?.product
  return product?.currentSaleUnitPrice?.price?.amount
    ?? product?.displayPrice
    ?? null
}

export const scrape = async (itemSlug) => {
  const url = PRODUCT_URLS[itemSlug]
  if (!url) return buildUnavailable('waitrose', itemSlug)

  try {
    const html = await fetchWithRetry(url)

    // Try JSON-LD first (Waitrose includes Product schema for SEO), then __NEXT_DATA__
    let pricePence
    try {
      pricePence = extractPriceFromJsonLd(html)
    } catch {
      pricePence = extractPriceFromNextData(html, findPriceInNextData())
    }

    return buildResult('waitrose', itemSlug, pricePence)
  } catch (error) {
    console.error(`Waitrose scrape failed for ${itemSlug}:`, error.message)
    return buildUnavailable('waitrose', itemSlug)
  }
}
