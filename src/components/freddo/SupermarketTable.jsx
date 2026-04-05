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

  const maxPrice = Math.max(...supermarkets.map(s => s.price_pence))

  return (
    <div className="mt-4 space-y-2">
      {supermarkets.map(s => (
        <div key={s.supermarket} className="flex items-center gap-3">
          <span className="text-sm w-28 shrink-0" style={{ color: '#A0A0A0' }}>
            {SUPERMARKET_LABELS[s.supermarket] ?? s.supermarket}
            {SUPERMARKET_ASIDE[s.supermarket] && (
              <span className="ml-1 text-xs" style={{ color: '#555555' }}>
                {SUPERMARKET_ASIDE[s.supermarket]}
              </span>
            )}
          </span>

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
    </div>
  )
}
