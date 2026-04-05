import { formatDate } from '../../utils/formatPrice'

// Shown when price data is stale — amber, never silent
export default function StaleIndicator({ recordedAt }) {
  return (
    <span
      className="text-xs font-semibold tracking-widest uppercase px-2 py-0.5 rounded"
      style={{ color: '#E8A045', border: '1px solid #E8A045' }}
    >
      ⚠ STALE · {formatDate(recordedAt)}
    </span>
  )
}
