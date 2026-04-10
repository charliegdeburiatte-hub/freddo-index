import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Returns the current national average Freddo price and all supermarket prices
export const useFreddoPrice = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: avg, error: avgErr } = await supabase
          .from('freddo_prices')
          .select('price_pence, scraped_at, is_stale')
          .eq('supermarket', 'national_average')
          .order('scraped_at', { ascending: false })
          .limit(1)
          .single()

        if (avgErr && avgErr.code !== 'PGRST116') throw avgErr

        // Fetch latest row per supermarket (no time cutoff — is_stale flag handles staleness visually)
        const { data: allRows, error: superErr } = await supabase
          .from('freddo_prices')
          .select('supermarket, price_pence, is_available, is_stale, scraped_at')
          .neq('supermarket', 'national_average')
          .order('scraped_at', { ascending: false })

        // Keep only the most recent row per supermarket
        const seen = new Set()
        const supermarkets = (allRows || []).filter(r => {
          if (seen.has(r.supermarket)) return false
          seen.add(r.supermarket)
          return true
        }).sort((a, b) => a.price_pence - b.price_pence)

        if (superErr) throw superErr

        setData({ nationalAverage: avg || null, supermarkets: supermarkets || [] })
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [])

  return { data, loading, error }
}
