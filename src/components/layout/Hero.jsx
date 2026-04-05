import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useHomeItems } from '../../hooks/useItemPrice'
import { formatFreddos } from '../../utils/formatPrice'

export default function Hero() {
  const { items, loading } = useHomeItems()
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  const rotate = useCallback(() => {
    if (items.length < 2) return
    setVisible(false)
    setTimeout(() => {
      setIndex(i => (i + 1) % items.length)
      setVisible(true)
    }, 400)
  }, [items.length])

  useEffect(() => {
    const t = setInterval(rotate, 5000)
    return () => clearInterval(t)
  }, [rotate])

  const item = items[index]

  return (
    <section className="panel w-full text-center py-12 px-6 relative overflow-hidden">
      <div
        className="transition-opacity duration-400"
        style={{ opacity: visible ? 1 : 0 }}
        onMouseEnter={() => clearInterval()}
      >
        {loading || !item ? (
          <>
            <p className="text-6xl mb-6">🐸</p>
            <p className="text-2xl font-bold mb-2" style={{ color: '#F2F2F2' }}>
              The Freddo Index
            </p>
            <p className="text-base italic" style={{ color: '#555555' }}>
              Counting Freddos...
            </p>
          </>
        ) : (
          <>
            <p className="text-5xl mb-4">{item.emoji}</p>
            <p className="text-lg mb-2" style={{ color: '#A0A0A0' }}>
              {item.name} today costs
            </p>
            <p className="font-bold leading-none mb-3"
              style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', color: '#F2F2F2' }}>
              {formatFreddos(item.freddo_cost)} Freddos
            </p>
            <p className="text-sm italic mb-8" style={{ color: '#555555' }}>
              {item.snide_remark}
            </p>
          </>
        )}
      </div>

      {items.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {items.map((_, i) => (
            <button key={i} onClick={() => { setVisible(false); setTimeout(() => { setIndex(i); setVisible(true) }, 400) }}
              className="w-2 h-2 rounded-full transition-all duration-150"
              style={{ background: i === index ? '#4CAF50' : 'rgba(76,175,80,0.3)' }}
              aria-label={`Show item ${i + 1}`} />
          ))}
          <Link to="/index" className="ml-6 text-sm" style={{ color: '#A0A0A0' }}>
            See all items →
          </Link>
        </div>
      )}
    </section>
  )
}
