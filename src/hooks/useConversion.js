import { useMemo } from 'react'
import { toFreddos, perFreddo } from '../utils/freddoConversion'
import { useFreddoPrice } from './useFreddoPrice'

// Returns freddo conversion values for a given price in pence
// Always uses the national average — never a single supermarket price
export const useConversion = (pricePence) => {
  const { data: freddoData } = useFreddoPrice()

  return useMemo(() => {
    if (!freddoData?.nationalAverage || !pricePence) return null
    const freddoPricePence = freddoData.nationalAverage.price_pence
    return {
      freddos:         toFreddos(pricePence, freddoPricePence),
      per:             perFreddo(pricePence, freddoPricePence),
      freddoPricePence,
    }
  }, [pricePence, freddoData])
}
