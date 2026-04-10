import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Returns:
//   national: { male: { years, sourceYear }, female: { years, sourceYear } } | null
//   extremes: {
//     male:   { highest: { region, years }, lowest: { region, years } },
//     female: { highest: { region, years }, lowest: { region, years } },
//   } | null
//
// Why fold the LA extremes here in JS rather than two SQL roundtrips: the LA
// dataset is ~300 rows max per release, fetch once and reduce client-side.
export const useLifeExpectancy = () => {
  const [national, setNational] = useState(null)
  const [extremes, setExtremes] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: rows, error: rowsErr } = await supabase
          .from('life_expectancy_records')
          .select('region, region_kind, sex, years, source_year, recorded_at')
          .in('sex', ['male', 'female'])
          .order('recorded_at', { ascending: false })

        if (rowsErr) throw rowsErr

        setNational(pickLatestNational(rows ?? []))
        setExtremes(pickExtremes(rows ?? []))
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [])

  return { national, extremes, loading, error }
}

const pickLatestNational = (rows) => {
  const nat = rows.filter(r => r.region_kind === 'national')
  if (nat.length === 0) return null
  const out = {}
  for (const r of nat) {
    if (!out[r.sex]) out[r.sex] = { years: Number(r.years), sourceYear: r.source_year }
  }
  return { male: out.male ?? null, female: out.female ?? null }
}

const pickExtremes = (rows) => {
  const las = rows.filter(r => r.region_kind === 'local-authority')
  if (las.length === 0) return null
  return { male: extremesFor(las, 'male'), female: extremesFor(las, 'female') }
}

const extremesFor = (rows, sex) => {
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
