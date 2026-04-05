# 🐸 The Freddo Index — Data Source Specification

## Overview
Every item in the basket has an exact data source documented here. Claude Code should never have to guess where a number comes from. If a source changes URL or format, update this document first before touching any code.

All prices are stored in pence (integers) in Supabase. Never store pounds. Never store floats for currency.

---

## The Freddo — The Anchor

### Source Strategy
Scraped daily from all eight supermarkets. National average calculated from all available prices. If a supermarket scraper fails, excluded from average that day.

| Supermarket | Product URL | Selector Strategy | Notes |
|---|---|---|---|
| Sainsbury's | `https://www.sainsburys.co.uk/gol-ui/product/cadbury-freddo-milk-chocolate-18g` | Price element in product page | Primary source |
| Tesco | `https://www.tesco.com/groceries/en-GB/products/254877191` | `.price-per-sellable-unit` | Secondary |
| Asda | `https://groceries.asda.com/product/chocolate-bars-bags/cadbury-freddo-milk-chocolate/910003498818` | Price element | Secondary |
| Morrisons | `https://groceries.morrisons.com/products/cadbury-freddo-milk-chocolate-18g` | Price element | (ew) |
| Waitrose | `https://www.waitrose.com/ecom/products/cadbury-freddo-milk-chocolate/035034-14987` | Price element | Respected |
| Co-op | `https://shop.coop.co.uk/products/cadbury-freddo-18g` | Price element | Villain |
| Iceland | `https://www.iceland.co.uk/p/cadbury-freddo-milk-chocolate/75849.html` | Price element | Solid |
| Ocado | `https://www.ocado.com/products/cadbury-freddo-milk-chocolate-18g/399278011` | Price element | Judgy |

**Product spec:** Cadbury Freddo Milk Chocolate 18g — single unit. Always single unit. Never multipack. Never sharing bag. One frog.

**Stored as:** `freddo_prices` table — one row per supermarket per scrape

**National average calculation:**
```javascript
const nationalAverage = Math.round(
  availablePrices.reduce((sum, p) => sum + p.pricePence, 0) / availablePrices.length
)
```

---

## Utilities

### ⛽ Petrol — Per Litre (pence)

**Source:** Department for Energy Security and Net Zero (DESNZ, formerly BEIS)
**URL:** `https://www.gov.uk/government/statistical-data-sets/oil-and-petroleum-products-weekly-statistics`
**Format:** CSV download — file changes weekly
**Field:** Unleaded petrol pump price (pence per litre)
**Update frequency:** Weekly — published every Monday
**Historical data:** Available from 1988
**Fetcher:** `beis.fetcher.js`

**Notes:**
- Download the CSV directly — do not scrape the HTML page
- Column header: `Unleaded petrol pence per litre`
- Also capture diesel for potential future addition
- Store weekly — one record per week not per day

---

### ⚡ Electricity — Average Monthly Bill (pence)

**Source:** Ofgem — Energy price cap unit rates
**URL:** `https://www.ofgem.gov.uk/check-if-energy-price-cap-affects-you`
**Format:** Published quarterly as HTML and press release
**Field:** Average annual electricity bill ÷ 12 for monthly figure
**Update frequency:** Quarterly — January, April, July, October
**Historical data:** Available from 2019 (price cap introduction)
**Fetcher:** `ofgem.fetcher.js`

**Notes:**
- Ofgem publishes the annual figure — divide by 12 for monthly
- Store as monthly bill in pence
- Flag in UI when a new quarter is approaching — price may be about to change
- Pre-2019 unit rates available from Ofgem historical publications

---

### 🔥 Gas — Average Monthly Bill (pence)

**Source:** Ofgem — same publication as electricity
**URL:** Same as electricity
**Format:** Same quarterly press release
**Field:** Average annual gas bill ÷ 12
**Update frequency:** Quarterly
**Historical data:** Available from 2019 (price cap), earlier data from Ofgem historical
**Fetcher:** `ofgem.fetcher.js` — same fetcher as electricity, separate field

---

### 💧 Water — Average Monthly Bill (pence)

**Source:** Water UK — annual water bill statistics
**URL:** `https://www.water.org.uk/news-item/water-and-sewerage-bills-2024-25/`
**Format:** Press release — published annually, usually April
**Field:** Average annual household water and sewerage bill ÷ 12
**Update frequency:** Annually — April
**Historical data:** Water UK publishes historical bill data going back to 2000
**Fetcher:** `ons.fetcher.js` — manual update annually or scrape press release

---

### 📱 Phone — Average Monthly Bill (pence)

**Source:** Ofcom — Communications Market Report
**URL:** `https://www.ofcom.org.uk/research-and-data/telecoms-research/data-updates/mobile-phones`
**Format:** Annual report PDF and dataset
**Field:** Average monthly mobile spend per user
**Update frequency:** Annually — published autumn
**Historical data:** Available from 2010
**Fetcher:** `ofcom.fetcher.js`

---

### 🌐 Broadband — Average Monthly Bill (pence)

**Source:** Ofcom — same Communications Market Report
**URL:** Same as phone
**Format:** Same annual report
**Field:** Average monthly residential broadband spend
**Update frequency:** Annually
**Historical data:** Available from 2010
**Fetcher:** `ofcom.fetcher.js` — same fetcher as phone, separate field

---

## Food & Staples

### Source Strategy
All food items scraped from the same eight supermarkets as Freddo. National average calculated the same way. Same redundancy chain applies. One scraper system — many products.

Each product has a `item_slug` in the database. The scraper fetches price by slug → URL mapping defined below.

---

### 🥛 Milk — Pint (pence)

**Product:** Own-brand whole milk, 1 pint (568ml)
**Supermarket products:**
- Sainsbury's: Sainsbury's British Whole Milk — 1 Pint
- Tesco: Tesco Whole Milk — 1 Pint
- Asda: ASDA British Whole Milk — 1 Pint
*(same pattern for all eight supermarkets)*

**Historical data:** ONS CPI food price index — milk category
**ONS URL:** `https://www.ons.gov.uk/economy/inflationandpriceindices/datasets/consumerpriceinflation`

---

### 🥚 Eggs — Dozen (pence)

**Product:** Own-brand large free range eggs, 12 pack
**Same supermarket scraping approach as milk**
**Historical data:** ONS CPI food price index — eggs category

**Notes:**
- Must be 12 pack — not 6, not 15
- Free range only — this is a values decision and we stand by it
- The 2023 egg shortage is visible in the data. The chart will show it.

---

### 🌾 Rice — Sainsbury's Basic Long Grain (per bag, converted to per grain)

**Product:** Sainsbury's Basics Long Grain White Rice 1kg
**Source:** Sainsbury's only — this is specifically Sainsbury's basic range
**URL:** Sainsbury's product page for basics long grain rice 1kg

**Conversion:**
```javascript
const RICE_GRAIN_WEIGHT_GRAMS = 0.025
const BAG_WEIGHT_GRAMS = 1000
const TOTAL_GRAINS_PER_BAG = BAG_WEIGHT_GRAMS / RICE_GRAIN_WEIGHT_GRAMS // 40,000
const PRICE_PER_GRAIN_PENCE = bagPricePence / TOTAL_GRAINS_PER_BAG
const GRAINS_PER_FREDDO = freddoPricePence / PRICE_PER_GRAIN_PENCE
```

**Display:** Show grains per Freddo — funnier than Freddos per grain
**Historical data:** ONS rice price index where available

---

### 🍞 Warburtons Toastie 800g

**Product:** Warburtons Toastie Medium Sliced White Bread 800g
**Source:** All eight supermarkets
**Historical data:** ONS bread price index

---

### 🫓 Warburtons Crumpets 9 Pack

**Product:** Warburtons Crumpets 9 Pack
**Source:** All eight supermarkets
**Notes:** 9 pack specifically. If a supermarket only stocks the 6 pack, note this in the UI with appropriate contempt.

---

### 🫘 Heinz Baked Beans 400g

**Product:** Heinz Baked Beans in Tomato Sauce 400g
**Source:** All eight supermarkets
**Display:** Rival chart alongside Branston — green line
**Historical data:** ONS canned goods index

---

### 🫘 Branston Baked Beans 400g

**Product:** Branston Baked Beans 400g
**Source:** All eight supermarkets
**Display:** Rival chart alongside Heinz — purple line
**Notes:** When Branston is cheaper, label with: *"Branston winning. We're as surprised as you are."*

---

### 🍯 Marmite 250g

**Product:** Marmite Yeast Extract 250g
**Source:** All eight supermarkets
**Display:** Rival chart alongside Bovril — green line

---

### 🐄 Bovril 250g

**Product:** Bovril Beef Extract 250g
**Source:** All eight supermarkets
**Display:** Rival chart alongside Marmite — purple line

---

### 🌰 Nutella 400g

**Product:** Nutella Hazelnut Spread with Cocoa 400g
**Source:** All eight supermarkets

---

### 🧈 Lurpak 500g

**Product:** Lurpak Slightly Salted Butter 500g
**Source:** All eight supermarkets
**Notes:**
- This item gets special treatment in the UI — The Lurpak Crisis header
- The 2022 price peak should be annotated on the chart
- Security tagging incident referenced in copy

---

### 🍵 Yorkshire Tea 80 Bags

**Product:** Yorkshire Tea 80 Bags
**Source:** All eight supermarkets
**Display:** Rival chart alongside PG Tips — green line

---

### 🍵 PG Tips 80 Bags

**Product:** PG Tips Original 80 Bags
**Source:** All eight supermarkets
**Display:** Rival chart alongside Yorkshire Tea — purple line

---

### 🧀 Cathedral City Mature Cheddar 400g

**Product:** Cathedral City Mature Cheddar 400g
**Source:** All eight supermarkets
**Historical data:** ONS cheese price index

---

### 🧂 Maldon Sea Salt 250g

**Product:** Maldon Sea Salt Flakes 250g
**Source:** All eight supermarkets

---

### 🍅 Heinz Tomato Soup 400g

**Product:** Heinz Classic Tomato Soup 400g
**Source:** All eight supermarkets

---

### 🐟 John West Tuna in Spring Water 145g

**Product:** John West Tuna Chunks in Spring Water 145g
**Source:** All eight supermarkets

---

### 🍫 Dairy Milk 200g

**Product:** Cadbury Dairy Milk Chocolate Bar 200g
**Source:** All eight supermarkets
**Notes:**
- This item has special header treatment — see copy & tone guide
- Mondelez acquisition year (2010) annotated on historical chart
- Recipe change noted in chart annotations

---

### 🧴 Fairy Original Washing Up Liquid 433ml

**Product:** Fairy Original Green Washing Up Liquid 433ml
**Source:** All eight supermarkets

---

### 🪥 Colgate Total Toothpaste 75ml

**Product:** Colgate Total Original Toothpaste 75ml
**Source:** All eight supermarkets

---

### 🍕 Domino's Large Margarita

**Product:** Large Margarita Pizza
**Sources:**
- Walk-in price: Scraped from Domino's website at full price
- App/online deal price: Scraped from Domino's website with active deal
**URL:** `https://www.dominos.co.uk/`
**Notes:**
- Both prices stored separately — `dominos_walkin` and `dominos_app` item slugs
- Display as two lines on same chart
- If prices are equal, note it — this is historically unusual

---

## Regional Basket

### 🥤 Irn-Bru 330ml Can

**Product:** Barr's Irn-Bru Original 330ml Can — single can
**Source:** All eight supermarkets
**Notes:** Single can specifically — not multipack, not 500ml bottle

---

### 🌿 One Loose Leek

**Product:** Single loose leek — not a bag, not a twin pack
**Source:** Supermarkets that sell loose leeks (Sainsbury's, Tesco, Asda, Morrisons, Waitrose)
**Historical data:** ONS vegetable price index — leeks
**Notes:**
- Not all supermarkets sell loose leeks — only include those that do
- If unavailable at a supermarket, exclude from average and note it

---

### 🥔 One Maris Piper Potato

**Product:** Single loose Maris Piper potato — approximately 200g
**Source:** Supermarkets selling loose potatoes
**Historical data:** ONS vegetable price index — potatoes
**Notes:**
- Price by weight — calculate cost of one 200g potato
- Not all supermarkets sell loose potatoes — exclude those that don't
- This is a serious data point tracked with full seriousness

---

## Housing

### 🏠 Average UK House Price

**Source:** HM Land Registry — UK House Price Index
**URL:** `https://www.gov.uk/government/collections/uk-house-price-index-reports`
**Format:** CSV download — monthly release
**Field:** Average house price — all property types, UK
**Update frequency:** Monthly — published with ~2 month lag
**Historical data:** Available from 1995
**Fetcher:** `landregistry.fetcher.js`

---

### 🏘️ Average UK Monthly Rent

**Source:** ONS — Private rental market summary statistics
**URL:** `https://www.ons.gov.uk/economy/inflationandpriceindices/bulletins/indexofprivatehousingrentalprices/`
**Format:** Monthly bulletin
**Field:** Median monthly private rent — UK
**Update frequency:** Monthly
**Historical data:** Available from 2015
**Fetcher:** `ons.fetcher.js`

---

### 🏘️ Average London Monthly Rent

**Source:** Same ONS publication as UK rent
**Field:** Median monthly private rent — London region
**Notes:** Displayed separately alongside UK average for context

---

## Rail of Doom

### Source Strategy
National Rail ticket prices — walk-up anytime fare, no railcard, no advance booking. Always the most expensive available option because that is the honest price for someone who needs to travel.

**Source:** National Rail — `https://www.nationalrail.co.uk/`
**Fetcher:** `nationalrail.fetcher.js`
**Update frequency:** Weekly check — rail prices change with timetable updates
**Historical data:** News archives, rail campaign data (RailUK Forums), ATOC historical data

| Route | Origin | Destination | Fare Type |
|---|---|---|---|
| London to Edinburgh | London Kings Cross | Edinburgh Waverley | Anytime Single |
| London to Manchester | London Euston | Manchester Piccadilly | Anytime Single |
| London to Bristol | London Paddington | Bristol Temple Meads | Anytime Single |
| London to Leeds | London Kings Cross | Leeds | Anytime Single |
| Liverpool to London | Liverpool Lime Street | London Euston | Anytime Single |
| Brighton to London | Brighton | London Victoria | Anytime Single |
| Cardiff to London | Cardiff Central | London Paddington | Anytime Single |
| Glasgow to London | Glasgow Central | London Euston | Anytime Single |
| Belfast to Dublin | Belfast Great Victoria St | Dublin Connolly | Anytime Single |
| Southern Rail | East Croydon | London Victoria | Anytime Single |

**Notes:**
- Belfast to Dublin uses Translink + Irish Rail — separate fetcher logic needed
- Southern Rail route chosen for maximum commuter misery and route reliability data

---

## Technology

### 🖥️ DDR4 RAM — Per GB (pence)

**Source:** Historical RAM price tracking
**Primary:** `https://www.memorybenchmark.net/` price history
**Secondary:** Archived PCPartPicker historical price data
**Product spec:** 8GB DDR4 3200MHz stick ÷ 8 for per-GB price
**Update frequency:** Monthly
**Historical data:** Available from 2014 (DDR4 introduction)

---

### 🖥️ DDR5 RAM — Per GB (pence)

**Source:** Same as DDR4
**Product spec:** 16GB DDR5 5600MHz stick ÷ 16 for per-GB price
**Update frequency:** Monthly
**Historical data:** Available from 2021 (DDR5 introduction)
**Notes:** Chart note when price starts rising — annotate with "AI demand increases" marker

---

### 📱 Samsung Galaxy S — Flagship (pence)

**Product:** Samsung Galaxy S series — top tier model, base storage, SIM free
**Source:** Samsung UK website + historical launch prices from news archives
**URL:** `https://www.samsung.com/uk/smartphones/galaxy-s/`
**Update frequency:** Per new release — typically annually
**Historical data:** Galaxy S1 (2010) through current — launch prices from news archives

---

### 🎮 New Release Video Game (pence)

**Product:** Standard edition, new release, major title — PS5 or Xbox Series X
**Source:** Amazon UK, Currys, GAME — price at launch
**Update frequency:** Per major new release — tracked as point-in-time data
**Historical data:** Average launch price per year going back to 2000
**Notes:**
- The £49.99 to £69.99 jump in 2023 is the key data event — annotate on chart
- Use average of major releases per year for historical chart

---

## Life & Society

### 💰 Average UK Salary (annual, pence)

**Source:** ONS — Annual Survey of Hours and Earnings (ASHE)
**URL:** `https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/bulletins/annualsurveyofhoursandearnings/`
**Format:** Annual bulletin + dataset
**Field:** Median annual gross earnings — all employees, UK
**Update frequency:** Annually — published November
**Historical data:** Available from 1997
**Fetcher:** `ons.fetcher.js`

---

### 🎓 University Tuition Fees (annual, pence)

**Source:** UK Government — Student finance policy history
**URL:** `https://www.gov.uk/student-finance`
**Historical milestones:**
- 1998: £1,000 introduced
- 2006: Raised to £3,000
- 2012: Raised to £9,000
- 2017: Raised to £9,250
**Update frequency:** Per policy change — not on a schedule
**Historical data:** Complete from 1996 (free) to present
**Notes:** This is policy data not scraped data — update manually when policy changes

---

### 📺 TV Licence (annual, pence)

**Source:** BBC / UK Government
**URL:** `https://www.tvlicensing.co.uk/faqs/FAQ32`
**Update frequency:** Annually — typically April
**Historical data:** Available from 1991
**Fetcher:** Manual update annually or scrape licence fee page

---

### 🚌 Average UK Bus Fare (pence)

**Source:** Department for Transport — Bus statistics
**URL:** `https://www.gov.uk/government/collections/bus-statistics`
**Format:** Annual statistical release
**Field:** Average bus fare per journey — England
**Update frequency:** Annually
**Historical data:** Available from 2010

---

### 🍺 Average UK Pint of Beer (pence)

**Source:** ONS CPI — Alcoholic beverages category
**Secondary:** CAMRA — Campaign for Real Ale annual pub report
**Update frequency:** Quarterly via ONS, annually via CAMRA
**Historical data:** ONS data available from 2000

---

### 🐾 Average UK Vet Bill (pence)

**Source:** Association of British Insurers — pet insurance statistics
**Secondary:** PDSA Animal Wellbeing Report
**URL:** `https://www.pdsa.org.uk/puppawreport`
**Update frequency:** Annually
**Historical data:** Limited — available from approximately 2015

---

### ⚰️ Average UK Funeral Cost (pence)

**Source:** SunLife — Cost of Dying Report
**URL:** `https://www.sunlife.co.uk/funeral-costs/`
**Update frequency:** Annually
**Historical data:** Available from 2004
**Notes:** Average basic funeral cost — not premium. We track the floor, not the ceiling.

---

### 👶 Average UK Monthly Childcare Cost (pence)

**Source:** Coram Family and Childcare — Childcare Survey
**URL:** `https://www.familyandchildcaretrust.org/childcare-survey`
**Update frequency:** Annually
**Field:** Average weekly cost of a full-time nursery place ÷ 7 × 365 ÷ 12 for monthly figure
**Historical data:** Available from 2010
**Notes:** This chart is described as the most devastating on the site. The data justifies this.

---

### 🚙 Average UK Car Insurance Premium (pence)

**Source:** Association of British Insurers — motor insurance premium tracker
**URL:** `https://www.abi.org.uk/data-and-resources/tools-and-calculators/motor-insurance-premium-tracker/`
**Update frequency:** Quarterly
**Historical data:** Available from 2013

---

### ⚽ Premier League Match Ticket (pence)

**Source:** BBC Sport / football.london annual price surveys
**Secondary:** Supporters Direct pricing data
**Update frequency:** Annually — pre-season
**Field:** Average cheapest available season ticket ÷ 19 home games for per-match cost
**Historical data:** Available from 2000 via sports journalism archives

---

### 🎬 Odeon Cinema Ticket (pence)

**Source:** Odeon UK — standard adult ticket, non-premium screen, non-IMAX
**URL:** `https://www.odeon.co.uk/`
**Update frequency:** Monthly check — cinema prices change periodically
**Historical data:** News archives and cinema industry reports from 2000

---

### 💊 NHS Prescription Charge (pence)

**Source:** NHS England — prescription charge history
**URL:** `https://www.nhsbsa.nhs.uk/help-nhs-prescription-costs`
**Update frequency:** Annually — typically April
**Historical data:** Complete from 1952 (introduction) to present
**Notes:**
- Free in Scotland (since 2011), Wales (since 2007), Northern Ireland (since 2010)
- England charge tracked — divergence from devolved nations annotated on chart

---

## Big & Stupid

### ✈️ Boeing 747 (pence)

**Source:** Boeing historical list prices — archived from Boeing press releases and aviation journalism
**Primary reference:** Boeing commercial airplane prices list (archived)
**Secondary:** Aviation Week, FlightGlobal historical pricing archives
**Update frequency:** Per new pricing announcement — infrequent
**Historical data:** 747 list price available from 1968 to final delivery 2023
**Notes:**
- 747 production ended 2023 — final delivery price used as current
- Chart shows full production life — a complete story
- Number in Freddos will be large. This is correct. Display it proudly.

---

### 🛳️ HMS Queen Elizabeth Class Aircraft Carrier (pence)

**Source:** UK Government — defence spending publications, National Audit Office reports
**URL:** `https://www.nao.org.uk/`
**Field:** Total programme cost — HMS Queen Elizabeth + HMS Prince of Wales combined ÷ 2 for per-ship cost
**Update frequency:** Per NAO report — infrequent
**Historical data:** Programme cost tracked from 2007 announcement to completion
**Notes:**
- Use total programme cost including overruns — honesty is the policy
- Per ship cost displayed — £3 billion approximately
- "Your taxes. In Freddos." is the display copy. Non-negotiable.

---

## Data Storage Rules

- All prices stored in **pence as integers** — never pounds, never floats
- Every record includes `recorded_at` timestamp
- Every record includes `source` field — which scraper or fetcher produced it
- Every record includes `is_stale` boolean — set to true if scraper failed and fallback used
- Historical data imported once during setup — subsequent updates append only
- Never overwrite historical records — append only, always

---

## Update Schedule Summary

| Frequency | Items |
|---|---|
| Daily | Freddo price, all supermarket food items |
| Weekly | Petrol (BEIS), rail ticket prices |
| Monthly | House prices, rent, cinema ticket |
| Quarterly | Electricity, gas, car insurance |
| Annually | Water, phone, broadband, salary, tuition, TV licence, bus fare, beer, vet, funeral, childcare, Premier League ticket |
| Per event | Samsung Galaxy, video games, Boeing 747, aircraft carrier, tuition fee policy changes |

---

## Status: Data Source Spec Draft — Pending Review
*Written during planning session. URLs should be verified before implementation begins. Sources may change.*
