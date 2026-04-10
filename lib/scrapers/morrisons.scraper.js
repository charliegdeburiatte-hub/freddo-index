import { buildResult, buildUnavailable } from './base.scraper.js'

// Morrisons internal product API — retailerProductId from their webproductpagews service
// Why: the product page HTML loads data client-side (Redux/CSR), so __INITIAL_STATE__ is empty.
//      The BOP (Best Online Price) endpoint returns price directly by product ID without auth.
// Endpoint: GET /api/webproductpagews/v5/products/bop?retailerProductId={id}
// Response:  product.price.amount (string in GBP, e.g. "0.25")
const API_BASE = 'https://groceries.morrisons.com/api/webproductpagews/v5/products/bop'

// retailerProductIds verified against Morrisons product catalogue
const PRODUCT_IDS = {
  'bread-warburtons-800g':    '102369685',  // Warburtons White Toastie Bread 800g
  'crumpets-warburtons-9pk':  '104619182',  // Warburtons 9 Crumpets
  'eggs-12':                  '105830001',  // Morrisons Large Free Range Eggs 12 Pack
  'beans-heinz-400g':         '100369219',  // Heinz Tinned Baked Beans 415g
  'beans-branston-400g':      '100369067',  // Branston Baked Beans (single)
  'yorkshire-tea-80':         '100153485',  // Yorkshire Tea Bags 80s
  'pg-tips-80':               '113426585',  // PG Tips Original 80 Tea Bags
  'marmite-250g':             '100107737',  // Marmite Yeast Extract 250g
  'heinz-tomato-soup-400g':   '100392857',  // Heinz Cream of Tomato Soup 400g
  'maldon-salt-250g':         '100398811',  // Maldon Sea Salt
  'colgate-75ml':             '114782979',  // Colgate Total Original Toothpaste 75ml
}

export const scrape = async (itemSlug) => {
  const productId = PRODUCT_IDS[itemSlug]
  if (!productId) return buildUnavailable('morrisons', itemSlug)

  try {
    const response = await fetch(`${API_BASE}?retailerProductId=${productId}`, {
      headers: {
        'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept':          'application/json',
        'Accept-Language': 'en-GB,en;q=0.9',
        'Referer':         'https://groceries.morrisons.com/',
      },
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const data = await response.json()
    const priceStr = data?.product?.price?.amount
    if (!priceStr) throw new Error('price.amount missing from BOP response')

    const pricePence = Math.round(parseFloat(priceStr) * 100)
    if (isNaN(pricePence) || pricePence <= 0) throw new Error(`Unparseable price: ${priceStr}`)

    return buildResult('morrisons', itemSlug, pricePence)
  } catch (error) {
    console.error(`Morrisons scrape failed for ${itemSlug}:`, error.message)
    return buildUnavailable('morrisons', itemSlug)
  }
}
