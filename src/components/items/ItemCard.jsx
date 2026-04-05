import { Link } from 'react-router-dom'
import FreddoConversion from './FreddoConversion'
import SnideRemark from '../shared/SnideRemark'
import StaleIndicator from '../shared/StaleIndicator'
import { formatPence } from '../../utils/formatPrice'
import { toFreddos, perFreddo } from '../../utils/freddoConversion'

const STATUS = {
  daily:      { label: 'LIVE',      colour: '#4CAF50' },
  weekly:     { label: 'WEEKLY',    colour: '#A0A0A0' },
  monthly:    { label: 'MONTHLY',   colour: '#A0A0A0' },
  quarterly:  { label: 'QUARTERLY', colour: '#A0A0A0' },
  annually:   { label: 'ANNUAL',    colour: '#A0A0A0' },
  'per-event':{ label: 'MANUAL',    colour: '#A0A0A0' },
}

// item — row from freddo_conversions (may be null if no price yet)
// meta — row from items table (always present)
export default function ItemCard({ meta, item }) {
  const status = STATUS[meta?.update_frequency] ?? STATUS.manually
  const hasPrice = item?.price_pence != null

  const freddos = hasPrice && item.freddo_price_pence
    ? toFreddos(item.price_pence, item.freddo_price_pence)
    : null

  const per = hasPrice && item.freddo_price_pence
    ? perFreddo(item.price_pence, item.freddo_price_pence)
    : null

  return (
    <div className="panel flex flex-col h-full">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{meta?.emoji ?? item?.emoji}</span>
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#A0A0A0' }}>
            {meta?.name ?? item?.name}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {item?.is_stale && <StaleIndicator recordedAt={item.recorded_at} />}
          <span className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: status.colour }}>
            {status.label}
          </span>
        </div>
      </div>

      <FreddoConversion
        freddos={freddos}
        unit={meta?.unit ?? item?.unit}
        perValue={per}
      />

      {hasPrice && (
        <p className="text-xs text-center mb-2" style={{ color: '#555555' }}>
          {formatPence(item.price_pence)} {meta?.unit ?? item?.unit} today
        </p>
      )}

      <SnideRemark remark={meta?.snide_remark ?? item?.snide_remark} />

      <div className="mt-auto pt-4">
        <Link to={`/index?category=${meta?.category ?? item?.category}`}
          className="text-sm transition-colors duration-150 hover:text-[#4CAF50]"
          style={{ color: '#A0A0A0' }}>
          See full history →
        </Link>
      </div>
    </div>
  )
}
