import { supabaseAdmin } from '../client.js'

// Append a single life expectancy row.
// Why: this table is append-only, like price_records — historical releases stay in the
//      table so we can show life-expectancy-over-time charts later.
export const insertLifeExpectancyRecord = async ({ region, regionKind, sex, years, sourceYear, source }) => {
  const { error } = await supabaseAdmin
    .from('life_expectancy_records')
    .insert({
      region,
      region_kind: regionKind,
      sex,
      years,
      source_year: sourceYear,
      source,
    })
  if (error) throw error
}

// Returns the latest national male and female rows.
// Used by the LifetimeFreddosCard headline component.
export const getLatestNationalLifeExpectancy = async () => {
  const { data, error } = await supabaseAdmin
    .from('life_expectancy_records')
    .select('sex, years, source_year, recorded_at')
    .eq('region_kind', 'national')
    .in('sex', ['male', 'female'])
    .order('recorded_at', { ascending: false })

  if (error) throw error
  return pickLatestPerSex(data ?? [])
}

// Returns the highest- and lowest-LE local authorities for each sex.
// Drives the PostcodeGapCard.
// Why: we don't know which LA is top/bottom in advance, so we pull all latest LA rows
//      for the most recent source release and pick the extremes in JS. The dataset is
//      ~300 rows max — trivial to sort client-side.
export const getLifeExpectancyExtremes = async () => {
  const { data, error } = await supabaseAdmin
    .from('life_expectancy_records')
    .select('region, sex, years, source_year, recorded_at')
    .eq('region_kind', 'local-authority')
    .in('sex', ['male', 'female'])
    .order('recorded_at', { ascending: false })

  if (error) throw error
  const rows = data ?? []
  return {
    male:   extremesFor(rows, 'male'),
    female: extremesFor(rows, 'female'),
  }
}

// --- helpers (kept private to this module) ----------------------------------

const pickLatestPerSex = (rows) => {
  const out = {}
  for (const row of rows) {
    if (!out[row.sex]) out[row.sex] = { years: Number(row.years), sourceYear: row.source_year }
  }
  return { male: out.male ?? null, female: out.female ?? null }
}

const extremesFor = (rows, sex) => {
  // Take only rows from the most recent source_year for this sex
  const sexRows = rows.filter(r => r.sex === sex)
  if (sexRows.length === 0) return { highest: null, lowest: null }
  const latestYear = Math.max(...sexRows.map(r => r.source_year))
  const latest = sexRows
    .filter(r => r.source_year === latestYear)
    .map(r => ({ region: r.region, years: Number(r.years) }))

  const highest = latest.reduce((a, b) => (b.years > a.years ? b : a))
  const lowest  = latest.reduce((a, b) => (b.years < a.years ? b : a))
  return { highest, lowest }
}
