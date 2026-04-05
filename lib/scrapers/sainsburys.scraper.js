import { fetchWithRetry, extractPrice, buildResult, buildUnavailable } from './base.scraper.js'

// Why: selector confirmed against Sainsbury's product pages at time of writing
// If scrape_logs shows consistent failures, inspect this first
const PRICE_SELECTOR = '[data-testid="pd-retail-price"]'

const PRODUCT_URLS = {
  'freddo':                   'https://www.sainsburys.co.uk/gol-ui/product/cadbury-freddo-milk-chocolate-18g',
  'milk-pint':                'https://www.sainsburys.co.uk/gol-ui/product/sainsburys-british-whole-milk-1-pint',
  'eggs-12':                  'https://www.sainsburys.co.uk/gol-ui/product/sainsburys-british-free-range-large-eggs-x12',
  'rice-1kg':                 'https://www.sainsburys.co.uk/gol-ui/product/sainsburys-basics-long-grain-white-rice-1kg',
  'bread-warburtons-800g':    'https://www.sainsburys.co.uk/gol-ui/product/warburtons-medium-toastie-white-800g',
  'crumpets-warburtons-9pk':  'https://www.sainsburys.co.uk/gol-ui/product/warburtons-crumpets-9-pack',
  'beans-heinz-400g':         'https://www.sainsburys.co.uk/gol-ui/product/heinz-baked-beanz-in-tomato-sauce-400g',
  'beans-branston-400g':      'https://www.sainsburys.co.uk/gol-ui/product/branston-baked-beans-400g',
  'marmite-250g':             'https://www.sainsburys.co.uk/gol-ui/product/marmite-yeast-extract-250g',
  'bovril-250g':              'https://www.sainsburys.co.uk/gol-ui/product/bovril-beef-extract-250g',
  'nutella-400g':             'https://www.sainsburys.co.uk/gol-ui/product/nutella-hazelnut-cocoa-spread-400g',
  'lurpak-500g':              'https://www.sainsburys.co.uk/gol-ui/product/lurpak-slightly-salted-spreadable-500g',
  'yorkshire-tea-80':         'https://www.sainsburys.co.uk/gol-ui/product/yorkshire-tea-80-tea-bags',
  'pg-tips-80':               'https://www.sainsburys.co.uk/gol-ui/product/pg-tips-original-80-tea-bags',
  'cathedral-city-400g':      'https://www.sainsburys.co.uk/gol-ui/product/cathedral-city-mature-cheddar-400g',
  'maldon-salt-250g':         'https://www.sainsburys.co.uk/gol-ui/product/maldon-sea-salt-flakes-250g',
  'heinz-tomato-soup-400g':   'https://www.sainsburys.co.uk/gol-ui/product/heinz-classic-tomato-soup-400g',
  'john-west-tuna-145g':      'https://www.sainsburys.co.uk/gol-ui/product/john-west-tuna-chunks-in-spring-water-145g',
  'dairy-milk-200g':          'https://www.sainsburys.co.uk/gol-ui/product/cadbury-dairy-milk-200g',
  'fairy-433ml':              'https://www.sainsburys.co.uk/gol-ui/product/fairy-original-washing-up-liquid-433ml',
  'colgate-75ml':             'https://www.sainsburys.co.uk/gol-ui/product/colgate-total-original-toothpaste-75ml',
  'irn-bru-330ml':            'https://www.sainsburys.co.uk/gol-ui/product/barrs-irn-bru-330ml',
  'leek-loose':               'https://www.sainsburys.co.uk/gol-ui/product/sainsburys-leek',
  'potato-maris-piper':       'https://www.sainsburys.co.uk/gol-ui/product/sainsburys-maris-piper-potatoes-loose',
}

export const scrape = async (itemSlug) => {
  const url = PRODUCT_URLS[itemSlug]
  if (!url) throw new Error(`No Sainsbury's URL configured for item: ${itemSlug}`)

  try {
    const html = await fetchWithRetry(url)
    const pricePence = extractPrice(html, PRICE_SELECTOR)
    return buildResult('sainsburys', itemSlug, pricePence)
  } catch (error) {
    console.error(`Sainsbury's scrape failed for ${itemSlug}:`, error.message)
    return buildUnavailable('sainsburys', itemSlug)
  }
}
