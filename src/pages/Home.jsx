import { Link } from 'react-router-dom'
import Nav from '../components/layout/Nav'
import Footer from '../components/layout/Footer'
import Hero from '../components/layout/Hero'
import FreddoPrice from '../components/freddo/FreddoPrice'
import { useHomeItems } from '../hooks/useItemPrice'
import ItemCard from '../components/items/ItemCard'

// Group home items by category for the curated section
const CATEGORY_ORDER = ['utilities', 'food', 'housing', 'society', 'big-and-stupid']

export default function Home() {
  const { items } = useHomeItems()

  // One item per category, in defined order
  const curated = CATEGORY_ORDER
    .map(cat => items.find(i => i.category === cat))
    .filter(Boolean)

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 space-y-12">
        <Hero />
        <FreddoPrice />

        {curated.length > 0 && (
          <section>
            <p className="text-xs font-semibold tracking-widest uppercase mb-6" style={{ color: '#A0A0A0' }}>
              Selected highlights
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {curated.map(item => (
                <ItemCard key={item.slug} meta={item} item={item} />
              ))}
            </div>
          </section>
        )}

        <div className="text-center py-8">
          <Link to="/index"
            className="inline-block px-8 py-3 text-sm font-semibold transition-colors duration-150"
            style={{ background: '#4CAF50', color: '#0F0F0F', borderRadius: '4px' }}>
            Full Index — Every Item →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
