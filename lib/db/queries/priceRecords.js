import { supabaseAdmin } from '../client.js'

export const insertPriceRecord = async ({ itemSlug, supermarket, pricePence, isAvailable, isStale, source }) => {
  const { error } = await supabaseAdmin
    .from('price_records')
    .insert({
      item_slug:    itemSlug,
      supermarket:  supermarket,
      price_pence:  pricePence,
      is_available: isAvailable ?? true,
      is_stale:     isStale ?? false,
      source:       source ?? null,
    })
  if (error) throw error
}

export const getLastKnownPrice = async (itemSlug) => {
  const { data, error } = await supabaseAdmin
    .from('price_records')
    .select('price_pence, supermarket, recorded_at')
    .eq('item_slug', itemSlug)
    .eq('is_available', true)
    .eq('is_stale', false)
    .order('recorded_at', { ascending: false })
    .limit(1)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data ?? null
}

export const getLatestPriceForItem = async (itemSlug) => {
  const { data, error } = await supabaseAdmin
    .from('price_records')
    .select('price_pence, supermarket, is_stale, recorded_at')
    .eq('item_slug', itemSlug)
    .eq('is_available', true)
    .order('recorded_at', { ascending: false })
    .limit(1)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data ?? null
}
