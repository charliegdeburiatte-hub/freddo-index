import { buildResult, buildUnavailable } from './base.scraper.js'

// Iceland uses Algolia for their product catalogue — keys are embedded in their client JS.
// Why: the Iceland storefront is a Salesforce PWA Kit (Mobify) SPA — prices are loaded
//      client-side and not present in server-rendered HTML. Algolia is the public search
//      layer and exposes product records directly, keyed by objectID.
// Index:    r1_iceuk_production__products__default
// Endpoint: GET https://{appId}-dsn.algolia.net/1/indexes/{index}/{objectID}
// Why GET:  a POST /query with `filters: id:<n>` returns 0 hits — Iceland's index does not
//           expose `id` as a filterable attribute. The direct getObject endpoint works and
//           is cheaper (single record fetch, no search pipeline).
// Response: { price: { GBP: number } | null, in_stock: boolean, name: string }
//           price is null / in_stock is false for items Iceland does not currently stock.
const ALGOLIA_APP_ID  = 'FAWURXX413'
const ALGOLIA_API_KEY = 'dd51afec328646fc6b538411032deeb0'
const ALGOLIA_INDEX   = 'r1_iceuk_production__products__default'
const ALGOLIA_BASE    = `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${ALGOLIA_INDEX}`

// Algolia product IDs for tracked items — verified against Iceland's product catalogue
const PRODUCT_IDS = {
  'milk-pint':              '23447',   // Iceland British Whole Milk 1 Pint 568ml
  'eggs-12':                '64257',   // Iceland 12 Large Free Range British Eggs
  'bread-warburtons-800g':  '7057',    // Warburtons Medium Toastie Soft & Sliced White Loaf 800g
  'yorkshire-tea-80':       '7838',    // Yorkshire Tea 80 Tea Bags 250g
  'pg-tips-80':             '100922',  // PG Tips 80 Original Tea Bags 232g
  'marmite-250g':           '6256',    // Marmite Classic Yeast Extract Spread 250g
  'nutella-400g':           '4526',    // Nutella Chocolate & Hazelnut Spread 400g
  'fairy-433ml':            '68576',   // Fairy Original Washing Up Liquid Green 433ml
  'dairy-milk-200g':        '66253',   // Cadbury Dairy Milk 200g
  'irn-bru-330ml':          '77653',   // Irn Bru 330ml
  'heinz-tomato-soup-400g': '34723',   // Heinz Cream of Tomato Soup 400g
  'john-west-tuna-145g':    '71978',   // John West Tuna Chunks in Spring Water 145g
  'bovril-250g':            '1739',    // Bovril Beef Extract 250g
  'colgate-75ml':           '86723',   // Colgate Total Original Toothpaste 75ml
}

export const scrape = async (itemSlug) => {
  const productId = PRODUCT_IDS[itemSlug]
  if (!productId) return buildUnavailable('iceland', itemSlug)

  try {
    const response = await fetch(`${ALGOLIA_BASE}/${productId}`, {
      headers: {
        'X-Algolia-Application-Id': ALGOLIA_APP_ID,
        'X-Algolia-API-Key':        ALGOLIA_API_KEY,
        'Referer':                  'https://www.iceland.co.uk/',
        'Origin':                   'https://www.iceland.co.uk',
      },
    })

    // Why: 404 means the objectID is no longer in Iceland's catalogue — treat as unavailable
    //      rather than throwing, so the redundancy chain falls through cleanly.
    if (response.status === 404) return buildUnavailable('iceland', itemSlug)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const record = await response.json()

    // Why: Iceland returns price:null / in_stock:false when they don't currently stock the
    //      item. That's a legitimate "unavailable" — the redundancy chain will use another
    //      supermarket. Only throw for genuinely malformed responses.
    const priceGBP = record?.price?.GBP
    if (priceGBP == null || !record.in_stock) return buildUnavailable('iceland', itemSlug)

    const pricePence = Math.round(priceGBP * 100)
    if (isNaN(pricePence) || pricePence <= 0) throw new Error(`Invalid price: ${priceGBP}`)

    return buildResult('iceland', itemSlug, pricePence)
  } catch (error) {
    console.error(`Iceland scrape failed for ${itemSlug}:`, error.message)
    return buildUnavailable('iceland', itemSlug)
  }
}
