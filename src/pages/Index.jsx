import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Nav from '../components/layout/Nav'
import Footer from '../components/layout/Footer'
import CategoryTab from '../components/categories/CategoryTab'
import { CATEGORIES } from '../utils/categories'

export default function Index() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get('category') ?? CATEGORIES[0].slug
  )

  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat) setActiveCategory(cat)
  }, [searchParams])

  const handleTabClick = (slug) => {
    setActiveCategory(slug)
    setSearchParams({ category: slug })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      {/* Sticky tab bar */}
      <div className="sticky top-[57px] z-40 w-full overflow-x-auto"
        style={{ background: 'rgba(15,15,15,0.96)', borderBottom: '1px solid rgba(76,175,80,0.3)' }}>
        <div className="flex min-w-max px-4">
          {CATEGORIES.map(({ slug, label, emoji }) => (
            <button key={slug}
              onClick={() => handleTabClick(slug)}
              className="px-4 py-3 text-sm whitespace-nowrap transition-colors duration-150 border-b-2"
              style={{
                color: activeCategory === slug ? '#4CAF50' : '#A0A0A0',
                borderBottomColor: activeCategory === slug ? '#4CAF50' : 'transparent',
              }}>
              {emoji} {label}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6">
        <div className="mb-4">
          <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#A0A0A0' }}>
            {CATEGORIES.find(c => c.slug === activeCategory)?.emoji}{' '}
            {CATEGORIES.find(c => c.slug === activeCategory)?.label}
          </p>
        </div>
        <CategoryTab category={activeCategory} />
      </main>

      <Footer />
    </div>
  )
}
