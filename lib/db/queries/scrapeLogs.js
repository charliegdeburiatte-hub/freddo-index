import { supabaseAdmin } from '../client.js'

export const insertScrapeLog = async ({ scraper, itemSlug, status, errorMessage, itemsUpdated }) => {
  const { error } = await supabaseAdmin
    .from('scrape_logs')
    .insert({
      scraper,
      item_slug:     itemSlug ?? null,
      status,
      error_message: errorMessage ?? null,
      items_updated: itemsUpdated ?? null,
    })
  if (error) {
    // Why: log failure silently — scrape log failure must never crash the cron job
    console.error('Failed to write scrape log:', error.message)
  }
}
