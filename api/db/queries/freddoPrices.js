import { supabaseAdmin } from '../client.js'

export const getLatestFreddoPrices = async () => {
  const cutoff = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString()
  const { data, error } = await supabaseAdmin
    .from('freddo_prices')
    .select('supermarket, price_pence, is_available, is_stale, scraped_at')
    .neq('supermarket', 'national_average')
    .gte('scraped_at', cutoff)
  if (error) throw error
  return data ?? []
}

export const getLatestNationalAverage = async () => {
  const { data, error } = await supabaseAdmin
    .from('freddo_prices')
    .select('price_pence, scraped_at, is_stale')
    .eq('supermarket', 'national_average')
    .order('scraped_at', { ascending: false })
    .limit(1)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data ?? null
}

export const insertFreddoPrice = async ({ supermarket, pricePence, isAvailable, isStale }) => {
  const { error } = await supabaseAdmin
    .from('freddo_prices')
    .insert({ supermarket, price_pence: pricePence, is_available: isAvailable, is_stale: isStale ?? false })
  if (error) throw error
}
