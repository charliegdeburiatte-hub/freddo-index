-- ============================================================
-- The Freddo Index — Database Schema
-- Run this once in the Supabase SQL editor to set up all tables,
-- indexes, constraints, the freddo_conversions view, and RLS.
-- ============================================================


-- ============================================================
-- 1. ITEMS — master catalogue of everything tracked
-- ============================================================

CREATE TABLE items (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              text        NOT NULL UNIQUE,
  name              text        NOT NULL,
  emoji             text        NOT NULL,
  category          text        NOT NULL,
  unit              text        NOT NULL,
  description       text,
  snide_remark      text,
  data_source       text        NOT NULL,
  update_frequency  text        NOT NULL,
  scraper_priority  text[]      DEFAULT '{}',
  is_active         boolean     NOT NULL DEFAULT true,
  is_rival_a        boolean     NOT NULL DEFAULT false,
  rival_slug        text,
  display_on_home   boolean     NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE items ADD CONSTRAINT items_category_check
  CHECK (category IN ('anchor', 'utilities', 'food', 'regional', 'housing', 'rail', 'technology', 'society', 'big-and-stupid'));

ALTER TABLE items ADD CONSTRAINT items_update_frequency_check
  CHECK (update_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annually', 'per-event'));


-- ============================================================
-- 2. FREDDO_PRICES — supermarket + national average prices
-- ============================================================

CREATE TABLE freddo_prices (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  supermarket  text        NOT NULL,
  price_pence  integer     NOT NULL,
  is_available boolean     NOT NULL DEFAULT true,
  is_stale     boolean     NOT NULL DEFAULT false,
  scraped_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX freddo_prices_supermarket_idx ON freddo_prices (supermarket);
CREATE INDEX freddo_prices_scraped_at_idx  ON freddo_prices (scraped_at DESC);


-- ============================================================
-- 3. PRICE_RECORDS — all item price history (append only)
-- ============================================================

CREATE TABLE price_records (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  item_slug    text        NOT NULL REFERENCES items(slug),
  supermarket  text        NOT NULL,
  price_pence  integer,
  is_available boolean     NOT NULL DEFAULT true,
  is_stale     boolean     NOT NULL DEFAULT false,
  source       text,
  recorded_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX price_records_item_slug_idx             ON price_records (item_slug);
CREATE INDEX price_records_recorded_at_idx           ON price_records (recorded_at DESC);
CREATE INDEX price_records_item_slug_recorded_at_idx ON price_records (item_slug, recorded_at DESC);


-- ============================================================
-- 4. SCRAPE_LOGS — every scrape attempt, success or failure
-- ============================================================

CREATE TABLE scrape_logs (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  scraper       text        NOT NULL,
  item_slug     text,
  status        text        NOT NULL,
  error_message text,
  items_updated integer,
  ran_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE scrape_logs ADD CONSTRAINT scrape_logs_status_check
  CHECK (status IN ('success', 'failed', 'partial'));

CREATE INDEX scrape_logs_scraper_idx ON scrape_logs (scraper);
CREATE INDEX scrape_logs_ran_at_idx  ON scrape_logs (ran_at DESC);
CREATE INDEX scrape_logs_status_idx  ON scrape_logs (status);


-- ============================================================
-- 5. FREDDO_CONVERSIONS — computed view (not a table)
-- ============================================================

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
  fa.price_pence                                                      AS freddo_price_pence,
  ROUND(pr.price_pence::numeric / fa.price_pence::numeric, 2)         AS freddo_cost,
  ROUND(fa.price_pence::numeric / pr.price_pence::numeric, 4)         AS per_freddo
FROM items i
JOIN LATERAL (
  SELECT price_pence, is_stale, recorded_at
  FROM price_records
  WHERE item_slug = i.slug
    AND is_available = true
  ORDER BY recorded_at DESC
  LIMIT 1
) pr ON true
JOIN LATERAL (
  SELECT price_pence
  FROM freddo_prices
  WHERE supermarket = 'national_average'
  ORDER BY scraped_at DESC
  LIMIT 1
) fa ON true
WHERE i.is_active = true;


-- ============================================================
-- 6. ROW LEVEL SECURITY — public reads, server-only writes
-- ============================================================

ALTER TABLE items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE freddo_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrape_logs   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON items         FOR SELECT USING (true);
CREATE POLICY "Public read" ON freddo_prices FOR SELECT USING (true);
CREATE POLICY "Public read" ON price_records FOR SELECT USING (true);
CREATE POLICY "Public read" ON scrape_logs   FOR SELECT USING (true);


-- ============================================================
-- 7. SEED — initial items catalogue
-- ============================================================

INSERT INTO items (slug, name, emoji, category, unit, snide_remark, data_source, update_frequency, scraper_priority, display_on_home) VALUES
('freddo',                    'Freddo',                                '🐸', 'anchor',        'per unit',          'Was 10p in 2000. A 330% increase. The Bank of England targets 2% annually. Just saying.',                                                                          'supermarket-scrape', 'daily',     ARRAY['sainsburys','tesco','asda','morrisons','waitrose','coop','iceland','ocado'], true),
('petrol-litre',              'Petrol',                                '⛽', 'utilities',     'per litre',         'At least the line goes both directions. Occasionally.',                                                                                                          'beis',               'weekly',    ARRAY[]::text[], true),
('electricity-monthly',       'Electricity',                           '⚡', 'utilities',     'avg monthly bill',  'The 2022 spike is still visible. It will always be visible.',                                                                                                   'ofgem',              'quarterly', ARRAY[]::text[], true),
('gas-monthly',               'Gas',                                   '🔥', 'utilities',     'avg monthly bill',  'Russia invaded Ukraine. Your boiler noticed.',                                                                                                                  'ofgem',              'quarterly', ARRAY[]::text[], false),
('water-monthly',             'Water',                                 '💧', 'utilities',     'avg monthly bill',  'You are paying for rain. British rain. There is plenty of it.',                                                                                                 'water-uk',           'annually',  ARRAY[]::text[], false),
('phone-monthly',             'Average Mobile Bill',                   '📱', 'utilities',     'per month',         'Data got cheaper. The bill didn''t. Funny how that works.',                                                                                                     'ofcom',              'annually',  ARRAY[]::text[], false),
('broadband-monthly',         'Average Broadband Bill',                '🌐', 'utilities',     'per month',         'Faster every year. More expensive every year. You''re welcome.',                                                                                                'ofcom',              'annually',  ARRAY[]::text[], false),
('milk-pint',                 'Pint of Milk',                          '🥛', 'food',          'per pint',          'A pint of milk. The most British unit of measurement applied to the most British product.',                                                                     'supermarket-scrape', 'daily',     ARRAY['sainsburys','tesco','asda','morrisons','waitrose','coop','iceland','ocado'], false),
('eggs-12',                   'Eggs (dozen)',                          '🥚', 'food',          'per dozen',         'The 2023 egg shortage was real. The chart remembers.',                                                                                                          'supermarket-scrape', 'daily',     ARRAY['sainsburys','tesco','asda','morrisons','waitrose','coop','iceland','ocado'], false),
('rice-1kg',                  'Sainsbury''s Basic Long Grain Rice',    '🌾', 'food',          'per bag (1kg)',      'We did the maths so you don''t have to. You''re welcome.',                                                                                                      'supermarket-scrape', 'daily',     ARRAY['sainsburys'], false),
('bread-warburtons-800g',     'Warburtons Toastie 800g',               '🍞', 'food',          'per loaf',          'The definitive British loaf. Not up for debate.',                                                                                                               'supermarket-scrape', 'daily',     ARRAY['sainsburys','tesco','asda','morrisons','waitrose','coop','iceland','ocado'], false),
('crumpets-warburtons-9pk',   'Warburtons Crumpets 9 Pack',            '🫓', 'food',          'per pack',          'The 6 pack exists. We don''t track it. Standards.',                                                                                                             'supermarket-scrape', 'daily',     ARRAY['sainsburys','tesco','asda','morrisons','waitrose','coop','iceland','ocado'], false),
('beans-heinz-400g',          'Heinz Baked Beans 400g',                '🫘', 'food',          'per tin',           'The original. The standard. The one your nan buys.',                                                                                                            'supermarket-scrape', 'daily',     ARRAY['sainsburys','tesco','asda','morrisons','waitrose','coop','iceland','ocado'], false),
('beans-branston-400g',       'Branston Baked Beans 400g',             '🫘', 'food',          'per tin',           'The challenger. Surprisingly good. Don''t tell Heinz.',                                                                                                         'supermarket-scrape', 'daily',     ARRAY['sainsburys','tesco','asda','morrisons','waitrose','coop','iceland','ocado'], false),
('marmite-250g',              'Marmite 250g',                          '🍯', 'food',          'per jar',           'Love it or hate it. The price is universally despised.',                                                                                                        'supermarket-scrape', 'daily',     ARRAY['sainsburys','tesco','asda','morrisons','waitrose','coop','iceland','ocado'], false),
('bovril-250g',               'Bovril 250g',                           '🐄', 'food',          'per jar',           'Beef in a jar. Inexplicably British. Perfectly correct.',                                                                                                       'supermarket-scrape', 'daily',     ARRAY['sainsburys','tesco','asda','morrisons','waitrose','coop','iceland','ocado'], false),
('nutella-400g',              'Nutella 400g',                          '🌰', 'food',          'per jar',           'Not British. Wildly popular. The data doesn''t judge.',                                                                                                         'supermarket-scrape', 'daily',     ARRAY['sainsburys','tesco','asda','morrisons','waitrose','coop','iceland','ocado'], false),
('lurpak-500g',               'Lurpak 500g',                           '🧈', 'food',          '500g',              'In 2022 Lurpak was being security tagged in supermarkets. The chart shows why. We are not okay.',                                                                'supermarket-scrape', 'daily',     ARRAY['sainsburys','tesco','asda','morrisons','waitrose','coop','iceland','ocado'], true),
('yorkshire-tea-80',          'Yorkshire Tea 80 Bags',                 '🍵', 'food',          'per box',           'The correct tea. From Yorkshire. As it should be.',                                                                                                             'supermarket-scrape', 'daily',     ARRAY['sainsburys','tesco','asda','morrisons','waitrose','coop','iceland','ocado'], false),
('pg-tips-80',                'PG Tips 80 Bags',                       '🍵', 'food',          'per box',           'A worthy opponent. The monkey ads are missed.',                                                                                                                 'supermarket-scrape', 'daily',     ARRAY['sainsburys','tesco','asda','morrisons','waitrose','coop','iceland','ocado'], false),
('cathedral-city-400g',       'Cathedral City Mature Cheddar 400g',    '🧀', 'food',          '400g',              'The supermarket cheddar by which all others are judged. Non negotiable.',                                                                                        'supermarket-scrape', 'daily',     ARRAY['sainsburys','tesco','asda','morrisons','waitrose','coop','iceland','ocado'], false),
('maldon-salt-250g',          'Maldon Sea Salt 250g',                  '🧂', 'food',          '250g',              'Technically a luxury. Practically essential. The flakes know what they are.',                                                                                   'supermarket-scrape', 'daily',     ARRAY['sainsburys','tesco','asda','morrisons','waitrose','coop','iceland','ocado'], false),
('heinz-tomato-soup-400g',    'Heinz Tomato Soup 400g',                '🍅', 'food',          'per tin',           'Illness food. Comfort food. The same thing, really.',                                                                                                           'supermarket-scrape', 'daily',     ARRAY['sainsburys','tesco','asda','morrisons','waitrose','coop','iceland','ocado'], false),
('john-west-tuna-145g',       'John West Tuna 145g',                   '🐟', 'food',          'per tin',           'A tin of tuna. In Freddos. This is what we''ve come to.',                                                                                                       'supermarket-scrape', 'daily',     ARRAY['sainsburys','tesco','asda','morrisons','waitrose','coop','iceland','ocado'], false),
('dairy-milk-200g',           'Dairy Milk 200g',                       '🍫', 'food',          '200g',              'Cadbury''s was founded in Birmingham in 1824. Mondelez acquired it in 2010. The recipe changed. It melts differently now.',                                     'supermarket-scrape', 'daily',     ARRAY['sainsburys','tesco','asda','morrisons','waitrose','coop','iceland','ocado'], false),
('fairy-433ml',               'Fairy Washing Up Liquid 433ml',         '🧴', 'food',          '433ml',             'Lasts forever. Costs more every year. A metaphor for everything.',                                                                                               'supermarket-scrape', 'daily',     ARRAY['sainsburys','tesco','asda','morrisons','waitrose','coop','iceland','ocado'], false),
('colgate-75ml',              'Colgate Total Toothpaste 75ml',         '🪥', 'food',          '75ml',              'You have to buy it. They know you have to buy it. The price knows it too.',                                                                                      'supermarket-scrape', 'daily',     ARRAY['sainsburys','tesco','asda','morrisons','waitrose','coop','iceland','ocado'], false),
('dominos-margarita-walkin',  'Domino''s Large Margarita (walk-in)',   '🍕', 'food',          'per pizza',         'They are the same pizza. Financially they are not the same pizza. Order on the app. Always order on the app.',                                                   'scrape',             'daily',     ARRAY[]::text[], false),
('dominos-margarita-app',     'Domino''s Large Margarita (app)',       '🍕', 'food',          'per pizza',         'They are the same pizza. Financially they are not the same pizza. Order on the app. Always order on the app.',                                                   'scrape',             'daily',     ARRAY[]::text[], false),
('irn-bru-330ml',             'Irn-Bru 330ml',                         '🥤', 'regional',      'per can',           'Made in Scotland from girders. Priced in Freddos. Consumed with pride.',                                                                                         'supermarket-scrape', 'daily',     ARRAY['sainsburys','tesco','asda','morrisons','waitrose','coop','iceland','ocado'], false),
('leek-loose',                'One Loose Leek',                        '🌿', 'regional',      'per leek',          'A single leek. Loose. Not a bag. Dignity maintained.',                                                                                                          'supermarket-scrape', 'daily',     ARRAY['sainsburys','tesco','asda','morrisons','waitrose'], false),
('potato-maris-piper',        'One Maris Piper Potato',                '🥔', 'regional',      'per potato (~200g)', 'One potato. A single Maris Piper. Tracked over 30 years. The economics of one potato. This is serious data.',                                                   'supermarket-scrape', 'daily',     ARRAY['sainsburys','tesco','asda','morrisons','waitrose'], false),
('house-price-uk',            'Average UK House Price',                '🏠', 'housing',       'average price',     'Good luck out there.',                                                                                                                                          'land-registry',      'monthly',   ARRAY[]::text[], true),
('rent-uk-monthly',           'Average UK Monthly Rent',               '🏘️', 'housing',       'per month',         'You''ll never own the Freddos.',                                                                                                                                'ons',                'monthly',   ARRAY[]::text[], false),
('rent-london-monthly',       'Average London Monthly Rent',           '🏘️', 'housing',       'per month',         'London rent, separately displayed. Because it deserves its own category of despair.',                                                                           'ons',                'monthly',   ARRAY[]::text[], false),
('rail-london-edinburgh',     'London to Edinburgh',                   '🚂', 'rail',          'anytime single',    'The classic. The benchmark. The journey that broke a thousand budgets.',                                                                                          'national-rail',      'weekly',    ARRAY[]::text[], false),
('rail-london-manchester',    'London to Manchester',                  '🚂', 'rail',          'anytime single',    'Walk-up fare. No advance. Criminal. It''s 200 miles. Just saying.',                                                                                              'national-rail',      'weekly',    ARRAY[]::text[], false),
('rail-london-bristol',       'London to Bristol',                     '🚂', 'rail',          'anytime single',    'Walk-up fare. No advance. Because sometimes you need to go somewhere.',                                                                                           'national-rail',      'weekly',    ARRAY[]::text[], false),
('rail-london-leeds',         'London to Leeds',                       '🚂', 'rail',          'anytime single',    'Walk-up fare. No advance. Because sometimes you need to go somewhere.',                                                                                           'national-rail',      'weekly',    ARRAY[]::text[], false),
('rail-liverpool-london',     'Liverpool to London',                   '🚂', 'rail',          'anytime single',    'Walk-up fare. No advance. Because sometimes you need to go somewhere.',                                                                                           'national-rail',      'weekly',    ARRAY[]::text[], false),
('rail-brighton-london',      'Brighton to London',                    '🚂', 'rail',          'anytime single',    'The commuter route. Every weekday morning. In Freddos. Every single weekday morning.',                                                                           'national-rail',      'weekly',    ARRAY[]::text[], false),
('rail-cardiff-london',       'Cardiff to London',                     '🚂', 'rail',          'anytime single',    'For the Welsh — alongside their leek.',                                                                                                                         'national-rail',      'weekly',    ARRAY[]::text[], false),
('rail-glasgow-london',       'Glasgow to London',                     '🚂', 'rail',          'anytime single',    'For the Scots — alongside their Irn-Bru.',                                                                                                                      'national-rail',      'weekly',    ARRAY[]::text[], false),
('rail-belfast-dublin',       'Belfast to Dublin',                     '🚂', 'rail',          'anytime single',    'For the Northern Irish — alongside their potato.',                                                                                                              'national-rail',      'weekly',    ARRAY[]::text[], false),
('rail-southern-any',         'Any Southern Rail Route',               '🚂', 'rail',          'anytime single',    'Route: any Southern Rail service. Status: delayed. This is not a joke.',                                                                                         'national-rail',      'weekly',    ARRAY[]::text[], false),
('ram-ddr4-per-gb',           'DDR4 RAM per GB',                       '🖥️', 'technology',    'per GB',            'Gets cheaper every year. Something on this site does.',                                                                                                         'manual',             'monthly',   ARRAY[]::text[], false),
('ram-ddr5-per-gb',           'DDR5 RAM per GB',                       '🖥️', 'technology',    'per GB',            'DDR5 is going up. AI needs memory. Your wallet noticed. You''re welcome, large language models.',                                                               'manual',             'monthly',   ARRAY[]::text[], false),
('samsung-galaxy-s',          'Samsung Galaxy S Flagship',             '📱', 'technology',    'per handset',       'Each generation. Each price. The specs improve. So does the number of Freddos required.',                                                                         'manual',             'per-event', ARRAY[]::text[], false),
('video-game-new-release',    'New Release Video Game',                '🎮', 'technology',    'per game',          '£49.99 for years. Then one day: £69.99. No warning. No explanation. The chart remembers the before times.',                                                       'manual',             'per-event', ARRAY[]::text[], false),
('tuition-fees-annual',       'University Tuition Fees',               '🎓', 'society',       'per year',          '1996: free. 1998: £1,000. 2006: £3,000. 2012: £9,250. Each step is a policy decision. Each step is on the chart. In Freddos.',                                  'manual',             'per-event', ARRAY[]::text[], true),
('tv-licence-annual',         'TV Licence',                            '📺', 'society',       'per year',          'The BBC is, per Freddo, one of the better value items on this site. We''re as surprised as you are.',                                                             'manual',             'annually',  ARRAY[]::text[], false),
('bus-fare-avg',              'Average UK Bus Fare',                   '🚌', 'society',       'per journey',       'The bus. If it comes. In Freddos.',                                                                                                                             'manual',             'annually',  ARRAY[]::text[], false),
('beer-pint-avg',             'Average UK Pint of Beer',               '🍺', 'society',       'per pint',          'Getting less affordable. The pub understands your pain. The pub is also struggling.',                                                                            'ons',                'annually',  ARRAY[]::text[], true),
('salary-uk-annual',          'Average UK Salary',                     '💰', 'society',       'per year',          'Wages went up. Freddos went up more. House prices went up a lot more. The Freddo does not lie. It never lies.',                                                  'ons',                'annually',  ARRAY[]::text[], true),
('nhs-prescription',          'NHS Prescription Charge',               '💊', 'society',       'per item',          'Free in Scotland and Wales. England: currently paying. The chart tracks the divergence.',                                                                         'manual',             'annually',  ARRAY[]::text[], false),
('vet-bill-avg',              'Average UK Vet Bill',                   '🐾', 'society',       'average claim',     'You love your pet. Your vet knows you love your pet. The invoice reflects this.',                                                                                 'manual',             'annually',  ARRAY[]::text[], false),
('funeral-avg',               'Average UK Funeral Cost',               '⚰️', 'society',       'basic funeral',     'We tracked it. It goes up. Even this. Even this.',                                                                                                              'manual',             'annually',  ARRAY[]::text[], false),
('childcare-monthly',         'Average UK Monthly Childcare',          '👶', 'society',       'per month',         'Monthly childcare cost. In Freddos. Per month. Every month. Until they''re old enough for school. The chart is not okay. Neither are we.',                        'manual',             'annually',  ARRAY[]::text[], false),
('car-insurance-avg',         'Average Car Insurance Premium',         '🚙', 'society',       'per year',          'Required by law. Priced accordingly.',                                                                                                                          'abi',                'quarterly', ARRAY[]::text[], false),
('premier-league-ticket',     'Premier League Match Ticket',           '⚽', 'society',       'per match',         'The working class sport. That forgot the working class. In Freddos.',                                                                                            'manual',             'annually',  ARRAY[]::text[], false),
('odeon-ticket',              'Odeon Cinema Ticket',                   '🎬', 'society',       'per ticket',        'A night out. In Freddos. Plus popcorn. You don''t want to know the popcorn conversion.',                                                                         'scrape',             'monthly',   ARRAY[]::text[], false),
('new-car-avg',               'Average New Car Price',                 '🚗', 'society',       'average price',     'The price of an average new car. In Freddos. We are not okay.',                                                                                                 'manual',             'annually',  ARRAY[]::text[], false),
('boeing-747',                'Boeing 747',                            '✈️', 'big-and-stupid', 'per aircraft',     'If you are reading this you cannot afford one. Neither can we. The data is real. The Freddos are theoretical. The sadness is genuine.',                           'manual',             'per-event', ARRAY[]::text[], true),
('hms-queen-elizabeth',       'HMS Queen Elizabeth Class Aircraft Carrier', '🛳️', 'big-and-stupid', 'per ship',    'Your taxes. In Freddos. You are welcome. God save the King.',                                                                                                   'manual',             'per-event', ARRAY[]::text[], false);


-- Set rival pairs
UPDATE items SET is_rival_a = true,  rival_slug = 'beans-branston-400g'   WHERE slug = 'beans-heinz-400g';
UPDATE items SET is_rival_a = false, rival_slug = 'beans-heinz-400g'      WHERE slug = 'beans-branston-400g';
UPDATE items SET is_rival_a = true,  rival_slug = 'bovril-250g'           WHERE slug = 'marmite-250g';
UPDATE items SET is_rival_a = false, rival_slug = 'marmite-250g'          WHERE slug = 'bovril-250g';
UPDATE items SET is_rival_a = true,  rival_slug = 'pg-tips-80'            WHERE slug = 'yorkshire-tea-80';
UPDATE items SET is_rival_a = false, rival_slug = 'yorkshire-tea-80'      WHERE slug = 'pg-tips-80';
UPDATE items SET is_rival_a = true,  rival_slug = 'dominos-margarita-app' WHERE slug = 'dominos-margarita-walkin';
UPDATE items SET is_rival_a = false, rival_slug = 'dominos-margarita-walkin' WHERE slug = 'dominos-margarita-app';
