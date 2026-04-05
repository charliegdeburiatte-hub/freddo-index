// Display as pence under £1, pounds above
export const formatPence = (pence) => {
  if (pence < 100) return `${pence}p`
  return `£${(pence / 100).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// Always pounds with commas — for large values like house prices
export const formatPounds = (pence) =>
  `£${(pence / 100).toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

// Format a Freddo count for display
// 0.31 → "0.31"   3.2 → "3.2"   450,000 → "450,000"   6,222,222 → "6.2m"
export const formatFreddos = (count) => {
  if (count >= 1_000_000_000) return `${(count / 1_000_000_000).toFixed(1)}bn`
  if (count >= 1_000_000)     return `${(count / 1_000_000).toFixed(1)}m`
  if (count >= 10_000)        return count.toLocaleString('en-GB', { maximumFractionDigits: 0 })
  if (count >= 100)           return count.toLocaleString('en-GB', { maximumFractionDigits: 0 })
  if (count >= 1)             return count.toLocaleString('en-GB', { maximumFractionDigits: 1 })
  return count.toLocaleString('en-GB', { maximumFractionDigits: 2 })
}

// Format a date for display
export const formatDate = (isoString) => {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}
