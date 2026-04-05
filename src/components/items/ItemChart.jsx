import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine
} from 'recharts'
import { formatPence, formatDate } from '../../utils/formatPrice'
import { toFreddos } from '../../utils/freddoConversion'

const CustomTooltip = ({ active, payload, label, freddoPricePence }) => {
  if (!active || !payload?.length) return null
  const pence = payload[0]?.value
  return (
    <div className="panel-compact text-xs" style={{ minWidth: 140 }}>
      <p style={{ color: '#A0A0A0' }}>{label}</p>
      <p style={{ color: '#F2F2F2' }}>{formatPence(pence)}</p>
      {freddoPricePence && (
        <p style={{ color: '#4CAF50' }}>
          {toFreddos(pence, freddoPricePence).toFixed(1)} Freddos
        </p>
      )}
    </div>
  )
}

// history — array of { price_pence, recorded_at }
// rivalHistory — optional second series for rival items
// freddoPricePence — current national average, used for Freddo tooltip conversion
export default function ItemChart({ history, rivalHistory, freddoPricePence, rivalName }) {
  if (!history || history.length === 0) {
    return (
      <p className="text-sm italic py-8 text-center" style={{ color: '#555555' }}>
        Historical data for this item starts when the first scrape runs.
        The frogs weren't tracking it before that.
      </p>
    )
  }

  // Aggregate to one point per month to keep charts readable
  const monthlyData = Object.values(
    history.reduce((acc, row) => {
      const month = row.recorded_at.slice(0, 7)
      if (!acc[month]) acc[month] = { month, prices: [] }
      acc[month].prices.push(row.price_pence)
      return acc
    }, {})
  ).map(({ month, prices }) => ({
    month,
    price: Math.round(prices.reduce((s, p) => s + p, 0) / prices.length),
  }))

  const rivalMonthly = rivalHistory ? Object.values(
    rivalHistory.reduce((acc, row) => {
      const month = row.recorded_at.slice(0, 7)
      if (!acc[month]) acc[month] = { month, prices: [] }
      acc[month].prices.push(row.price_pence)
      return acc
    }, {})
  ).map(({ month, prices }) => ({
    month,
    rivalPrice: Math.round(prices.reduce((s, p) => s + p, 0) / prices.length),
  })) : []

  const merged = monthlyData.map(d => ({
    ...d,
    ...rivalMonthly.find(r => r.month === d.month),
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={merged} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
        <CartesianGrid stroke="rgba(76,175,80,0.08)" />
        <XAxis dataKey="month" tick={{ fill: '#555555', fontSize: 11, fontFamily: 'Rufina, serif' }} />
        <YAxis tickFormatter={v => formatPence(v)} tick={{ fill: '#555555', fontSize: 11, fontFamily: 'Rufina, serif' }} width={56} />
        <Tooltip content={<CustomTooltip freddoPricePence={freddoPricePence} />} />
        <Line type="monotone" dataKey="price" stroke="#4CAF50" dot={false} strokeWidth={2} />
        {rivalHistory && (
          <Line type="monotone" dataKey="rivalPrice" stroke="#4A1C6E" dot={false} strokeWidth={2}
            name={rivalName} />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
