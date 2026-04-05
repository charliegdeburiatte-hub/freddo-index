import { fetchJSON, buildResult, buildUnavailable } from './base.scraper.js'

// Sainsbury's internal REST API — no auth required
// Why: more reliable than CSS selectors on a JS-rendered React frontend
const API_BASE = 'https://www.sainsburys.co.uk/groceries-api/gol-services/product/v1/product'
const STORE_ID = '0694705' // representative London store for pricing

// SEO slugs = last path segment of sainsburys.co.uk/gol-ui/product/{slug}
const PRODUCT_SLUGS = {
  'freddo':                   'cadbury-freddo-milk-chocolate-18g',
  'milk-pint':                'sainsburys-british-whole-milk-1-pint',
  'eggs-12':                  'sainsburys-british-free-range-large-eggs-x12',
  'bread-warburtons-800g':    'warburtons-medium-toastie-white-800g',
  'crumpets-warburtons-9pk':  'warburtons-crumpets-9-pack',
  'beans-heinz-400g':         'heinz-baked-beanz-in-tomato-sauce-400g',
  'beans-branston-400g':      'branston-baked-beans-400g',
  'marmite-250g':             'marmite-yeast-extract-250g',
  'bovril-250g':              'bovril-beef-extract-250g',
  'nutella-400g':             'nutella-hazelnut-cocoa-spread-400g',
  'lurpak-500g':              'lurpak-slightly-salted-spreadable-500g',
  'yorkshire-tea-80':         'yorkshire-tea-80-tea-bags',
  'pg-tips-80':               'pg-tips-original-80-tea-bags',
  'cathedral-city-400g':      'cathedral-city-mature-cheddar-400g',
  'maldon-salt-250g':         'maldon-sea-salt-flakes-250g',
  'heinz-tomato-soup-400g':   'heinz-classic-tomato-soup-400g',
  'john-west-tuna-145g':      'john-west-tuna-chunks-in-spring-water-145g',
  'dairy-milk-200g':          'cadbury-dairy-milk-200g',
  'fairy-433ml':              'fairy-original-washing-up-liquid-433ml',
  'colgate-75ml':             'colgate-total-original-toothpaste-75ml',
  'irn-bru-330ml':            'barrs-irn-bru-330ml',
  'leek-loose':               'sainsburys-leek',
  'potato-maris-piper':       'sainsburys-maris-piper-potatoes-loose',
}

export const scrape = async (itemSlug) => {
  const seoSlug = PRODUCT_SLUGS[itemSlug]
  if (!seoSlug) return buildUnavailable('sainsburys', itemSlug)

  try {
    const url = `${API_BASE}?filter[product_seo_url]=${seoSlug}&store_id=${STORE_ID}`
    const data = await fetchJSON(url, {
      headers: {
        'Accept': 'application/json',
        'Referer': 'https://www.sainsburys.co.uk/',
      },
    })

    // Why: retail_price.price comes back in pounds (e.g. 0.30) — convert to integer pence
    const pricePounds = data?.data?.[0]?.retail_price?.price
    if (pricePounds == null) throw new Error('retail_price.price missing from API response')

    return buildResult('sainsburys', itemSlug, Math.round(pricePounds * 100))
  } catch (error) {
    console.error(`Sainsbury's scrape failed for ${itemSlug}:`, error.message)
    return buildUnavailable('sainsburys', itemSlug)
  }
}
