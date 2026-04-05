# 🐸 The Freddo Index — Database Schema Specification

## Overview
The Freddo Index uses Supabase (PostgreSQL) as its database. This document defines every table, every column, every relationship, and every index. No SQL should be written anywhere in the codebase that contradicts this schema. All queries live in `api/db/queries/`.

All prices are stored in **pence as integers**. Never pounds. Never floats. Ever.

---

## Tables

### 1. `items`
The master catalogue of everything tracked by the Freddo Index. One row per tracked item. This is the source of truth for what exists — scrapers and fetchers read from this table to know what to fetch.

```sql
CREATE TABLE items (
  id                  uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                text          NOT NULL UNIQUE,
  name                text          NOT NULL,
  emoji               text          NOT NULL,
  category            text          NOT NULL,
  unit                text          NOT NULL,
  description         text,
  snide_remark        text,
  data_source         text          NOT NULL,
  update_frequency    text          NOT NULL,
  scraper_priority    text[]        DEFAULT '{}',
  is_active           boolean       NOT NULL DEFAULT true,
  is_rival_a          boolean       NOT NULL DEFAULT false,
  rival_slug          text,
  display_on_home     boolean       NOT NULL DEFAULT false,
  created_at          timestamptz   NOT NULL DEFAULT now()
);
```

**Column notes:**
- `slug` — URL-safe identifier e.g. `freddo`, `petrol-litre`, `lurpak-500g`
- `category` — matches tab names: `utilities`, `food`, `regional`, `housing`, `rail`, `technology`, `society`, `big-and-stupid`
- `unit` — display unit e.g. `per litre`, `per unit`, `per month`, `per year`
- `snide_remark` — the item's permanent snide remark from the copy & tone guide
- `update_frequency` — `daily`, `weekly`, `monthly`, `quarterly`, `annually`, `per-event`
- `scraper_priority` — ordered array of supermarket slugs e.g. `['sainsburys', 'tesco', 'asda']`. Empty array for government-fetched items.
- `is_rival_a` — true if this item is one half of a rival pair (Heinz vs Branston etc)
- `rival_slug` — slug of the rival item for dual-line chart pairing
- `display_on_home` — true if this item appears on Page 1 curated highlights

**Category values (enforced):**
```sql
ALTER TABLE items ADD CONSTRAINT items_category_check
  CHECK (category IN ('utilities', 'food', 'regional', 'housing', 'rail', 'technology', 'society', 'big-and-stupid'));
```

**Update frequency values (enforced):**
```sql
ALTER TABLE items ADD CONSTRAINT items_update_frequency_check
  CHECK (update_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annually', 'per-event'));
```

---

### 2. `freddo_prices`
Stores individual supermarket Freddo prices and the calculated national average. Separate from `price_records` because the Freddo is the anchor — it gets queried constantly and benefits from its own table.

```sql
CREATE TABLE freddo_prices (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  supermarket     text          NOT NULL,
  price_pence     integer       NOT NULL,
  is_available    boolean       NOT NULL DEFAULT true,
  is_stale        boolean       NOT NULL DEFAULT false,
  scraped_at      timestamptz   NOT NULL DEFAULT now()
);
```

**Supermarket values:**
- `sainsburys`, `tesco`, `asda`, `morrisons`, `waitrose`, `coop`, `iceland`, `ocado`
- `national_average` — the calculated average, inserted after all supermarket scrapes complete

**Indexes:**
```sql
CREATE INDEX freddo_prices_supermarket_idx ON freddo_prices (supermarket);
CREATE INDEX freddo_prices_scraped_at_idx ON freddo_prices (scraped_at DESC);
```

**Common query — today's national average:**
```sql
SELECT price_pence, scraped_at
FROM freddo_prices
WHERE supermarket = 'national_average'
ORDER BY scraped_at DESC
LIMIT 1;
```

**Common query — all supermarket prices for today:**
```sql
SELECT supermarket, price_pence, is_available, is_stale, scraped_at
FROM freddo_prices
WHERE supermarket != 'national_average'
  AND scraped_at >= NOW() - INTERVAL '25 hours'
ORDER BY price_pence ASC;
```

---

### 3. `price_records`
Stores historical price data for every item except Freddo (which has its own table). Every successful scrape or fetch appends a new row. Never updates existing rows — append only.

```sql
CREATE TABLE price_records (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  item_slug       text          NOT NULL REFERENCES items(slug),
  supermarket     text          NOT NULL,
  price_pence     integer,
  is_available    boolean       NOT NULL DEFAULT true,
  is_stale        boolean       NOT NULL DEFAULT false,
  source          text,
  recorded_at     timestamptz   NOT NULL DEFAULT now()
);
```

**Column notes:**
- `item_slug` — foreign key to `items.slug`
- `supermarket` — supermarket name for scraped items, source identifier for fetched items e.g. `beis`, `ofgem`, `ons`, `land_registry`, `manual`
- `price_pence` — nullable for when item is unavailable at a supermarket
- `source` — human readable source note for manual entries e.g. `'UK Government announcement April 2024'`
- `is_stale` — true when this is a fallback to last known good price

**Indexes:**
```sql
CREATE INDEX price_records_item_slug_idx ON price_records (item_slug);
CREATE INDEX price_records_recorded_at_idx ON price_records (recorded_at DESC);
CREATE INDEX price_records_item_slug_recorded_at_idx ON price_records (item_slug, recorded_at DESC);
```

**Common query — latest price for one item:**
```sql
SELECT price_pence, supermarket, is_stale, recorded_at
FROM price_records
WHERE item_slug = 'petrol-litre'
  AND is_available = true
ORDER BY recorded_at DESC
LIMIT 1;
```

**Common query — average price across supermarkets for a food item today:**
```sql
SELECT ROUND(AVG(price_pence)) as average_price_pence
FROM price_records
WHERE item_slug = 'lurpak-500g'
  AND is_stale = false
  AND is_available = true
  AND recorded_at >= NOW() - INTERVAL '25 hours';
```

**Common query — historical data for chart:**
```sql
SELECT
  DATE_TRUNC('month', recorded_at) as month,
  ROUND(AVG(price_pence)) as avg_price_pence
FROM price_records
WHERE item_slug = 'house-price-uk'
  AND is_stale = false
  AND is_available = true
GROUP BY DATE_TRUNC('month', recorded_at)
ORDER BY month ASC;
```

---

### 4. `scrape_logs`
Every scrape and fetch attempt is logged here — success or failure. The diagnostic table. Check this first when something seems wrong.

```sql
CREATE TABLE scrape_logs (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  scraper         text          NOT NULL,
  item_slug       text,
  status          text          NOT NULL,
  error_message   text,
  items_updated   integer,
  ran_at          timestamptz   NOT NULL DEFAULT now()
);
```

**Status values (enforced):**
```sql
ALTER TABLE scrape_logs ADD CONSTRAINT scrape_logs_status_check
  CHECK (status IN ('success', 'failed', 'partial'));
```

**Column notes:**
- `scraper` — which scraper or fetcher ran e.g. `sainsburys`, `beis`, `daily-cron`
- `item_slug` — which item was being scraped, null for cron-level logs
- `error_message` — populated on failure, null on success. Specific enough to diagnose.
- `items_updated` — for cron-level logs, how many items were successfully updated

**Indexes:**
```sql
CREATE INDEX scrape_logs_scraper_idx ON scrape_logs (scraper);
CREATE INDEX scrape_logs_ran_at_idx ON scrape_logs (ran_at DESC);
CREATE INDEX scrape_logs_status_idx ON scrape_logs (status);
```

**Common query — recent failures:**
```sql
SELECT scraper, item_slug, error_message, ran_at
FROM scrape_logs
WHERE status = 'failed'
ORDER BY ran_at DESC
LIMIT 20;
```

**Common query — has a scraper been consistently failing:**
```sql
SELECT scraper, item_slug, COUNT(*) as failure_count
FROM scrape_logs
WHERE status = 'failed'
  AND ran_at >= NOW() - INTERVAL '7 days'
GROUP BY scraper, item_slug
ORDER BY failure_count DESC;
```

---

### 5. `freddo_conversions` (View — not a table)
A computed view that joins current prices with the current Freddo national average. The frontend reads from this view — it never calculates conversions itself.

```sql
CREATE VIEW freddo_conversions AS
SELECT
  i.slug,
  i.name,
  i.emoji,
  i.category,
  i.unit,
  i.snide_remark,
  i.update_frequency,
  i.display_on_home,
  i.is_rival_a,
  i.rival_slug,
  pr.price_pence,
  pr.is_stale,
  pr.recorded_at,
  fa.price_pence AS freddo_price_pence,
  -- How many Freddos does this item cost
  ROUND(pr.price_pence::numeric / fa.price_pence::numeric, 2) AS freddo_cost,
  -- How many of this item does one Freddo buy
  ROUND(fa.price_pence::numeric / pr.price_pence::numeric, 4) AS per_freddo
FROM items i
-- Latest price for each item
JOIN LATERAL (
  SELECT price_pence, is_stale, recorded_at
  FROM price_records
  WHERE item_slug = i.slug
    AND is_available = true
  ORDER BY recorded_at DESC
  LIMIT 1
) pr ON true
-- Current national average Freddo price
JOIN LATERAL (
  SELECT price_pence
  FROM freddo_prices
  WHERE supermarket = 'national_average'
  ORDER BY scraped_at DESC
  LIMIT 1
) fa ON true
WHERE i.is_active = true;
```

**Common query — all home page items:**
```sql
SELECT * FROM freddo_conversions
WHERE display_on_home = true
ORDER BY category, name;
```

**Common query — all items in a category:**
```sql
SELECT * FROM freddo_conversions
WHERE category = 'food'
ORDER BY name;
```

---

## Relationships Summary

```
items
  └── price_records (item_slug → items.slug)

freddo_prices (standalone — no FK, queried separately)

scrape_logs (no FK — logs survive even if item is deleted)

freddo_conversions (view — joins items + price_records + freddo_prices)
```

---

## Row Level Security (RLS)

Supabase uses Row Level Security. Configure as follows:

### Public reads (frontend)
The frontend reads using the `anon` key. Allow public SELECT on:
- `items` — read only
- `freddo_prices` — read only
- `price_records` — read only
- `scrape_logs` — read only (no sensitive data)
- `freddo_conversions` — view, inherits from above

```sql
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON items FOR SELECT USING (true);

ALTER TABLE freddo_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON freddo_prices FOR SELECT USING (true);

ALTER TABLE price_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON price_records FOR SELECT USING (true);

ALTER TABLE scrape_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON scrape_logs FOR SELECT USING (true);
```

### Scraper writes (server only)
Scrapers and fetchers use the `service_role` key via environment variable. This key bypasses RLS. Never expose it to the frontend. Never commit it to the repository.

All INSERT operations use the service role key via `api/db/client.js`.

---

## Supabase Client

```javascript
// api/db/client.js
import { createClient } from '@supabase/supabase-js'

// Why: two clients — one for public reads, one for scraper writes
// Never use the service key in the frontend

export const supabasePublic = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)
```

Frontend imports `supabasePublic` only.
Scrapers and fetchers import `supabaseAdmin` only.
Never cross these. Ever.

---

## Initial Data Seed

On first setup, seed the `items` table with the full basket. Example rows:

```sql
INSERT INTO items (slug, name, emoji, category, unit, snide_remark, data_source, update_frequency, scraper_priority, display_on_home) VALUES
('freddo', 'Freddo', '🐸', 'anchor', 'per unit', 'Was 10p in 2000. A 330% increase. The Bank of England targets 2% annually. Just saying.', 'supermarket-scrape', 'daily', ARRAY['sainsburys','tesco','asda','morrisons','waitrose','coop','iceland','ocado'], true),
('petrol-litre', 'Petrol', '⛽', 'utilities', 'per litre', 'At least the line goes both directions. Occasionally.', 'beis', 'weekly', ARRAY[]::text[], true),
('electricity-monthly', 'Electricity', '⚡', 'utilities', 'average monthly bill', 'The 2022 spike is still visible. It will always be visible.', 'ofgem', 'quarterly', ARRAY[]::text[], true),
('gas-monthly', 'Gas', '🔥', 'utilities', 'average monthly bill', 'Russia invaded Ukraine. Your boiler noticed.', 'ofgem', 'quarterly', ARRAY[]::text[], false),
('lurpak-500g', 'Lurpak', '🧈', 'food', '500g', 'In 2022 Lurpak was being security tagged in supermarkets. The chart shows why. We are not okay.', 'supermarket-scrape', 'daily', ARRAY['sainsburys','tesco','asda','morrisons','waitrose','coop','iceland','ocado'], true),
('house-price-uk', 'Average UK House Price', '🏠', 'housing', 'average price', 'Good luck out there.', 'land-registry', 'monthly', ARRAY[]::text[], true),
('salary-uk-annual', 'Average UK Salary', '💰', 'society', 'per year', 'Wages went up. Freddos went up more. House prices went up a lot more. The Freddo does not lie. It never lies.', 'ons', 'annually', ARRAY[]::text[], true),
('tuition-fees-annual', 'University Tuition Fees', '🎓', 'society', 'per year', '1996: free. 1998: £1,000. 2006: £3,000. 2012: £9,250. Each step is a policy decision. Each step is on the chart. In Freddos.', 'manual', 'per-event', ARRAY[]::text[], true),
('boeing-747', 'Boeing 747', '✈️', 'big-and-stupid', 'per aircraft', 'If you are reading this you cannot afford one. Neither can we. The data is real. The Freddos are theoretical. The sadness is genuine.', 'manual', 'per-event', ARRAY[]::text[], true),
('hms-queen-elizabeth', 'HMS Queen Elizabeth Class Aircraft Carrier', '🛳️', 'big-and-stupid', 'per ship', 'Your taxes. In Freddos. You are welcome. God save the King.', 'manual', 'per-event', ARRAY[]::text[], false);
-- ... remaining items follow same pattern
```

---

## Schema Rules

- **Append only** — never UPDATE or DELETE price records or Freddo prices. History is sacred.
- **Pence only** — all monetary values stored as integer pence. The conversion to pounds happens in the frontend only.
- **Slugs are stable** — once an item has a slug, it never changes. URLs and queries depend on it.
- **Soft delete items** — never DELETE from `items`. Set `is_active = false` to hide an item.
- **Service key server-side only** — the admin client never touches the frontend.
- **All queries in `api/db/queries/`** — never write SQL inline in scrapers, fetchers, or cron files.

---

## Status: Database Schema Spec — Pending Review
*Written during planning session. To be applied in Supabase before any scraper code is written.*
