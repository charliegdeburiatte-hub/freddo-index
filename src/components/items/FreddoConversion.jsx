import { formatFreddos } from '../../utils/formatPrice'

// The primary display element on any card — always the largest number shown.
// Receives pre-calculated values from parent; never calculates conversions itself.
export default function FreddoConversion({ freddos, unit, perValue }) {
  if (freddos === null || freddos === undefined) {
    return (
      <div className="my-4 text-center">
        <p className="text-2xl" style={{ color: '#555555' }}>—</p>
        <p className="text-sm mt-1" style={{ color: '#555555' }}>price data coming soon</p>
      </div>
    )
  }

  return (
    <div className="my-4 text-center">
      <p className="font-bold leading-none" style={{ fontSize: '3rem', color: '#F2F2F2' }}>
        {formatFreddos(freddos)}
      </p>
      <p className="text-base mt-1" style={{ color: '#A0A0A0' }}>
        Freddos {unit}
      </p>
      {perValue !== null && perValue !== undefined && perValue < 1 && (
        <p className="text-sm mt-2" style={{ color: '#A0A0A0' }}>
          Or: one Freddo buys {perValue < 0.01
            ? perValue.toFixed(4)
            : perValue.toFixed(2)} {unit?.replace('per ', '') ?? ''}
        </p>
      )}
    </div>
  )
}
