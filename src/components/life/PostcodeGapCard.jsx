import { useFreddoPrice } from '../../hooks/useFreddoPrice'
import { useItemPrice } from '../../hooks/useItemPrice'
import { useLifeExpectancy } from '../../hooks/useLifeExpectancy'
import { lifetimeFreddos, lifetimeFreddosGap } from '../../utils/freddoConversion'
import { formatFreddos } from '../../utils/formatPrice'

// Best-LA vs worst-LA, in Freddos. Defaults to male figures because the male
// gap is wider and the joke is bleaker. Female figures are reported underneath.
export default function PostcodeGapCard() {
  const { data: freddoData } = useFreddoPrice()
  const { current: salary }  = useItemPrice('salary-uk-annual')
  const { extremes }         = useLifeExpectancy()

  const freddoPricePence = freddoData?.nationalAverage?.price_pence ?? null
  const annualWagePence  = salary?.price_pence ?? null

  const male   = extremes?.male
  const ready  = freddoPricePence && annualWagePence && male?.highest && male?.lowest

  const highestFreddos = ready ? lifetimeFreddos(male.highest.years, annualWagePence, freddoPricePence) : null
  const lowestFreddos  = ready ? lifetimeFreddos(male.lowest.years,  annualWagePence, freddoPricePence) : null
  const gap            = ready ? lifetimeFreddosGap(male.highest.years, male.lowest.years, annualWagePence, freddoPricePence) : null

  return (
    <div className="panel">
      <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#A0A0A0' }}>
        The Postcode Gap — In Freddos
      </p>

      <div className="text-center mb-4">
        {gap === null
          ? <p className="text-2xl" style={{ color: '#555555' }}>—</p>
          : <p className="font-bold leading-none" style={{ fontSize: '3rem', color: '#F2F2F2' }}>
              {formatFreddos(gap)}
            </p>
        }
        <p className="text-sm mt-1" style={{ color: '#A0A0A0' }}>
          Freddos of life, lost or won at birth
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <Row label={male?.highest?.region ?? 'Top'}   freddos={highestFreddos} years={male?.highest?.years} positive />
        <Row label={male?.lowest?.region  ?? 'Bottom'} freddos={lowestFreddos}  years={male?.lowest?.years} />
      </div>

      <p className="italic text-sm mt-4" style={{ color: '#A0A0A0' }}>
        Male life expectancy at birth, longest LA vs shortest LA. The Freddos don't care
        where you're born. The years do. The chart remembers.
      </p>
    </div>
  )
}

function Row({ label, freddos, years, positive }) {
  return (
    <div className="text-center">
      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: positive ? '#4CAF50' : '#A0A0A0' }}>
        {label}
      </p>
      <p className="font-bold leading-none" style={{ fontSize: '1.5rem', color: '#F2F2F2' }}>
        {freddos === null ? '—' : formatFreddos(freddos)}
      </p>
      <p className="text-xs mt-1" style={{ color: '#A0A0A0' }}>
        {years ? `${years.toFixed(1)} years` : 'awaiting data'}
      </p>
    </div>
  )
}
