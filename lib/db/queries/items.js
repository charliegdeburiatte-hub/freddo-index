import { supabaseAdmin } from '../client.js'

export const getDailyItems = async () => {
  const { data, error } = await supabaseAdmin
    .from('items')
    .select('slug, name, category, update_frequency, scraper_priority')
    .eq('is_active', true)
    .eq('update_frequency', 'daily')
  if (error) throw error
  return data ?? []
}

export const getWeeklyItems = async () => {
  const { data, error } = await supabaseAdmin
    .from('items')
    .select('slug, name, category, update_frequency, data_source')
    .eq('is_active', true)
    .eq('update_frequency', 'weekly')
  if (error) throw error
  return data ?? []
}

export const getQuarterlyItems = async () => {
  const { data, error } = await supabaseAdmin
    .from('items')
    .select('slug, name, category, update_frequency, data_source')
    .eq('is_active', true)
    .eq('update_frequency', 'quarterly')
  if (error) throw error
  return data ?? []
}

export const getAllItems = async () => {
  const { data, error } = await supabaseAdmin
    .from('items')
    .select('*')
    .eq('is_active', true)
    .order('category', { ascending: true })
  if (error) throw error
  return data ?? []
}
