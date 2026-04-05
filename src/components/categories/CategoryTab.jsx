import { useCategoryItems } from '../../hooks/useItemPrice'
import { useItemPrice } from '../../hooks/useItemPrice'
import ItemCard from '../items/ItemCard'
import ItemChart from '../items/ItemChart'
import { useFreddoPrice } from '../../hooks/useFreddoPrice'

// Renders a single item with its chart — used inside CategoryTab
function ItemWithChart({ meta, item, freddoPricePence }) {
  const { history } = useItemPrice(meta.slug)

  // If this item is one of a rival pair, don't render — will be rendered with its rival
  // Rivals are rendered together when is_rival_a = true
  if (meta.is_rival_a === false && meta.rival_slug) return null

  return (
    <div className="panel mb-6">
      <div className="grid md:grid-cols-2 gap-6 mb-4">
        <ItemCard meta={meta} item={item} />
        <div className="flex flex-col justify-center">
          <ItemChart history={history} freddoPricePence={freddoPricePence} />
        </div>
      </div>
    </div>
  )
}

export default function CategoryTab({ category }) {
  const { items, loading } = useCategoryItems(category)
  const { data: freddoData } = useFreddoPrice()
  const freddoPricePence = freddoData?.nationalAverage?.price_pence

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-base italic" style={{ color: '#555555' }}>Counting Freddos...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-base italic" style={{ color: '#555555' }}>
          No items in this category yet. The frogs are working on it.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-6">
      {items.map(item => (
        <ItemWithChart
          key={item.slug}
          meta={item}
          item={item.conversion}
          freddoPricePence={freddoPricePence}
        />
      ))}
    </div>
  )
}
