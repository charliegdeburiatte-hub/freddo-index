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

        const cutoff = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString()
        const { data: supermarkets, error: superErr } = await supabase
          .from('freddo_prices')
          .select('supermarket, price_pence, is_available, is_stale, scraped_at')
          .neq('supermarket', 'national_average')
          .gte('scraped_at', cutoff)
          .order('price_pence', { ascending: true })

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
