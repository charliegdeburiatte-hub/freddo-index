import { useFreddoPrice } from '../../hooks/useFreddoPrice'
import { formatPence, formatDate } from '../../utils/formatPrice'
import SupermarketTable from './SupermarketTable'
import StaleIndicator from '../shared/StaleIndicator'

export default function FreddoPrice() {
  const { data, loading } = useFreddoPrice()

  return (
    <section className="panel max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#A0A0A0' }}>
          🐸 The Freddo Standard
        </p>
        {data?.nationalAverage?.is_stale && (
          <StaleIndicator recordedAt={data.nationalAverage.scraped_at} />
        )}
      </div>

      <p className="text-xs italic mb-4" style={{ color: '#555555' }}>
        The base unit of economic measurement since 1994. Not by choice.
      </p>

      {loading ? (
        <p className="text-4xl font-bold" style={{ color: '#555555' }}>—</p>
      ) : (
        <>
          <p className="font-bold leading-none" style={{ fontSize: '3.5rem', color: '#4CAF50' }}>
            {data?.nationalAverage
              ? formatPence(data.nationalAverage.price_pence)
              : '—'}
          </p>
          <p className="text-sm mt-1 mb-4" style={{ color: '#A0A0A0' }}>
            national average
            {data?.nationalAverage?.scraped_at && (
              <span style={{ color: '#555555' }}> · updated {formatDate(data.nationalAverage.scraped_at)}</span>
            )}
          </p>

          <SupermarketTable supermarkets={data?.supermarkets} />

          <p className="text-sm italic mt-6" style={{ color: '#555555' }}>
            Was 10p in 2000. A 330% increase.
            The Bank of England targets 2% annual inflation. Just saying.
          </p>
        </>
      )}
    </section>
  )
}
