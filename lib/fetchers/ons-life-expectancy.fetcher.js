import { insertLifeExpectancyRecord } from '../db/queries/lifeExpectancy.js'
import { insertScrapeLog } from '../db/queries/scrapeLogs.js'

// ONS UK Life Expectancy at Birth — annual reference release
// National figures:  https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/lifeexpectancies/datasets/nationallifetablesunitedkingdomreferencetables
// Local-authority:   https://www.ons.gov.uk/peoplepopulationandcommunity/healthandsocialcare/healthandlifeexpectancies/datasets/lifeexpectancyatbirthandatage65bylocalareasuk
//
// Why manual: ONS publishes this as Excel reference tables, not an API. Cadence is
//             annual (one release per year, usually January) — not worth scraping. Same
//             pattern as fetchMedianSalary in ons.fetcher.js: pre-filled values inline,
//             user verifies against the live ONS pages, runs the fetcher once.
//
// **VERIFY ALL VALUES BELOW BEFORE RUNNING.** Each row has a // VERIFY: hint pointing
// at the table I sourced it from. The exact figures shift release-to-release; the
// LAs that come out top/bottom can also shift (Hart vs Westminster vs Kensington at
// the top; Blackpool vs Glasgow City at the bottom).

const SOURCE_NATIONAL = 'ONS National Life Tables UK 2021-2023'
const SOURCE_LA       = 'ONS Life Expectancy at Birth, Local Areas UK 2021-2023'
const SOURCE_YEAR     = 2023  // The end year of the rolling 3-year reference period

export const SEED_2021_2023 = [
  // -- National (UK) --
  { region: 'UK', regionKind: 'national', sex: 'male',   years: 78.62, sourceYear: SOURCE_YEAR, source: SOURCE_NATIONAL }, // VERIFY: ONS NLT UK 2021-2023, "Period expectation of life at exact age 0"
  { region: 'UK', regionKind: 'national', sex: 'female', years: 82.57, sourceYear: SOURCE_YEAR, source: SOURCE_NATIONAL }, // VERIFY: ONS NLT UK 2021-2023, female

  // -- Local authorities, top end (longest life) --
  { region: 'Hart',                  regionKind: 'local-authority', sex: 'male',   years: 83.40, sourceYear: SOURCE_YEAR, source: SOURCE_LA }, // VERIFY: typically tops the male LE table
  { region: 'Kensington and Chelsea', regionKind: 'local-authority', sex: 'female', years: 86.50, sourceYear: SOURCE_YEAR, source: SOURCE_LA }, // VERIFY: typically tops the female LE table

  // -- Local authorities, bottom end (shortest life) --
  { region: 'Blackpool',             regionKind: 'local-authority', sex: 'male',   years: 73.40, sourceYear: SOURCE_YEAR, source: SOURCE_LA }, // VERIFY: typically bottom of male LE table
  { region: 'Blackpool',             regionKind: 'local-authority', sex: 'female', years: 78.90, sourceYear: SOURCE_YEAR, source: SOURCE_LA }, // VERIFY: bottom or near-bottom of female LE table
]

export const fetchLifeExpectancy = async (rows = SEED_2021_2023) => {
  let inserted = 0
  let failed   = 0

  for (const row of rows) {
    try {
      await insertLifeExpectancyRecord(row)
      inserted++
    } catch (error) {
      console.error(`Life expectancy insert failed for ${row.region}/${row.sex}:`, error.message)
      failed++
      await insertScrapeLog({
        scraper:      'ons-life-expectancy',
        itemSlug:     `${row.region_kind ?? row.regionKind}/${row.region}/${row.sex}`,
        status:       'failed',
        errorMessage: error.message,
      })
    }
  }

  await insertScrapeLog({
    scraper:      'ons-life-expectancy',
    status:       failed === 0 ? 'success' : 'partial',
    itemsUpdated: inserted,
    errorMessage: failed === 0 ? null : `${failed} of ${rows.length} rows failed`,
  })

  return { inserted, failed }
}
