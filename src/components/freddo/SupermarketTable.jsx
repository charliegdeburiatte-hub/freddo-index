import { formatPence } from '../../utils/formatPrice'
import { SUPERMARKET_LABELS, SUPERMARKET_ASIDE } from '../../utils/categories'
import StaleIndicator from '../shared/StaleIndicator'

export default function SupermarketTable({ supermarkets }) {
  if (!supermarkets || supermarkets.length === 0) {
    return (
      <p className="text-sm italic mt-2" style={{ color: '#555555' }}>
        Scrapers running for the first time. Check back shortly.
      </p>
    )
  }

  const available = supermarkets.filter(s => s.is_available && s.price_pence > 0)
  const unavailable = supermarkets.filter(s => !s.is_available || s.price_pence === 0)
  const maxPrice = available.length > 0 ? Math.max(...available.map(s => s.price_pence)) : 1

  return (
    <div className="mt-4 space-y-2">
      {available.map(s => (
        <div key={s.supermarket} className="flex items-center gap-3">
          <div className="text-sm shrink-0" style={{ color: '#A0A0A0', minWidth: '7.5rem' }}>
            {SUPERMARKET_LABELS[s.supermarket] ?? s.supermarket}
            {SUPERMARKET_ASIDE[s.supermarket] && (
              <span className="ml-1 text-xs" style={{ color: '#555555' }}>
                {SUPERMARKET_ASIDE[s.supermarket]}
              </span>
            )}
          </div>

          <div className="flex-1 h-2 rounded-none" style={{ background: 'rgba(76,175,80,0.12)' }}>
            <div
              className="h-2 transition-all duration-500"
              style={{ width: `${(s.price_pence / maxPrice) * 100}%`, background: '#4CAF50' }} />
          </div>

          <span className="text-sm w-10 text-right shrink-0" style={{ color: '#F2F2F2' }}>
            {formatPence(s.price_pence)}
          </span>

          {s.is_stale && <StaleIndicator recordedAt={s.scraped_at} />}
        </div>
      ))}

      {unavailable.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 pt-3" style={{ borderTop: '1px solid rgba(76,175,80,0.15)' }}>
          {unavailable.map(s => (
            <span key={s.supermarket} className="text-xs italic" style={{ color: '#555555' }}>
              {SUPERMARKET_LABELS[s.supermarket] ?? s.supermarket} — no single Freddo
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
