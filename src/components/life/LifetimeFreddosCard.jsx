import { useFreddoPrice } from '../../hooks/useFreddoPrice'
import { useItemPrice } from '../../hooks/useItemPrice'
import { useLifeExpectancy } from '../../hooks/useLifeExpectancy'
import { lifetimeFreddos } from '../../utils/freddoConversion'
import { formatFreddos } from '../../utils/formatPrice'

// "A British life is worth N Freddos" — male and female side by side.
// Why both shown: the ~3.5 year gap is part of the story, not a footnote.
export default function LifetimeFreddosCard() {
  const { data: freddoData }   = useFreddoPrice()
  const { current: salary }    = useItemPrice('salary-uk-annual')
  const { national }           = useLifeExpectancy()

  const freddoPricePence = freddoData?.nationalAverage?.price_pence ?? null
  const annualWagePence  = salary?.price_pence ?? null

  const ready = freddoPricePence && annualWagePence && national?.male && national?.female
  const maleFreddos   = ready ? lifetimeFreddos(national.male.years,   annualWagePence, freddoPricePence) : null
  const femaleFreddos = ready ? lifetimeFreddos(national.female.years, annualWagePence, freddoPricePence) : null

  return (
    <div className="panel">
      <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#A0A0A0' }}>
        A British Life — In Freddos
      </p>

      <div className="grid grid-cols-2 gap-6">
        <LifeColumn label="Men"   freddos={maleFreddos}   years={national?.male?.years} />
        <LifeColumn label="Women" freddos={femaleFreddos} years={national?.female?.years} />
      </div>

      <p className="italic text-sm mt-4" style={{ color: '#A0A0A0' }}>
        Median wage × life expectancy ÷ national average Freddo. Every Freddo you'll ever earn.
        Every Freddo you'll ever spend. The whole thing. In Freddos. The maths is simple. The result is not.
      </p>
    </div>
  )
}

function LifeColumn({ label, freddos, years }) {
  return (
    <div className="text-center">
      <p className="text-xs uppercase tracking-wider mb-2" style={{ color: '#A0A0A0' }}>{label}</p>
      {freddos === null
        ? <p className="text-2xl" style={{ color: '#555555' }}>—</p>
        : <p className="font-bold leading-none" style={{ fontSize: '2.5rem', color: '#F2F2F2' }}>
            {formatFreddos(freddos)}
          </p>
      }
      <p className="text-sm mt-1" style={{ color: '#A0A0A0' }}>
        {years ? `${years.toFixed(1)} years` : 'awaiting data'}
      </p>
    </div>
  )
}
