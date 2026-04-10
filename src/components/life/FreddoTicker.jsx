import { useEffect, useRef, useState } from 'react'
import { useFreddoPrice } from '../../hooks/useFreddoPrice'
import { useItemPrice } from '../../hooks/useItemPrice'
import { freddosAccrued } from '../../utils/freddoConversion'
import { formatFreddos } from '../../utils/formatPrice'

// Counts up: Freddos accrued (at median wage, calendar time) since the page opened.
// Why calendar time: a lifetime in Freddos is calendar time — the universe doesn't
//                    pay overtime, but it never stops the clock either.
export default function FreddoTicker() {
  const { data: freddoData } = useFreddoPrice()
  const { current: salary }  = useItemPrice('salary-uk-annual')

  const freddoPricePence = freddoData?.nationalAverage?.price_pence ?? null
  const annualWagePence  = salary?.price_pence ?? null
  const ready = freddoPricePence && annualWagePence

  const startedAt = useRef(Date.now())
  const [accrued, setAccrued] = useState(0)

  useEffect(() => {
    if (!ready) return
    const tick = () => {
      const elapsedMinutes = (Date.now() - startedAt.current) / 60000
      setAccrued(freddosAccrued(elapsedMinutes, annualWagePence, freddoPricePence))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [ready, annualWagePence, freddoPricePence])

  return (
    <div className="panel">
      <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#A0A0A0' }}>
        The Ticker
      </p>

      <div className="text-center my-4">
        {!ready
          ? <p className="text-2xl" style={{ color: '#555555' }}>—</p>
          : <p className="font-bold leading-none tabular-nums" style={{ fontSize: '3rem', color: '#F2F2F2' }}>
              {accrued < 0.01 ? accrued.toFixed(4) : formatFreddos(accrued)}
            </p>
        }
        <p className="text-sm mt-1" style={{ color: '#A0A0A0' }}>
          Freddos accrued since you opened this tab
        </p>
      </div>

      <p className="italic text-sm" style={{ color: '#A0A0A0' }}>
        At median wage. Per calendar minute. Including while you sleep. The universe does not
        stop accruing your Freddos. Your boss does not pay you for them either.
      </p>
    </div>
  )
}
