import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const LINKS = [
  { to: '/',           label: 'Home' },
  { to: '/index',      label: 'Full Index' },
  { to: '/disclaimer', label: 'Disclaimer' },
]

export default function Nav() {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="w-full sticky top-0 z-50 panel-compact flex items-center justify-between px-6 py-3"
      style={{ background: 'rgba(15,15,15,0.96)', borderBottom: '1px solid #4CAF50', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
      <Link to="/" className="flex flex-col leading-tight">
        <span className="font-bold text-lg" style={{ color: '#4CAF50' }}>🐸 The Freddo Index</span>
        <span className="text-xs italic" style={{ color: '#555555' }}>By Royal Appointment</span>
      </Link>

      {/* Desktop */}
      <div className="hidden md:flex gap-6">
        {LINKS.map(({ to, label }) => (
          <Link key={to} to={to}
            className="text-sm transition-colors duration-150"
            style={{ color: pathname === to ? '#4CAF50' : '#A0A0A0' }}>
            {label}
          </Link>
        ))}
      </div>

      {/* Mobile hamburger */}
      <button className="md:hidden text-xl" style={{ color: '#A0A0A0' }}
        onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
        {menuOpen ? '✕' : '☰'}
      </button>

      {menuOpen && (
        <div className="absolute top-full left-0 w-full flex flex-col py-2"
          style={{ background: 'rgba(15,15,15,0.98)', borderBottom: '1px solid #4CAF50' }}>
          {LINKS.map(({ to, label }) => (
            <Link key={to} to={to}
              onClick={() => setMenuOpen(false)}
              className="px-6 py-3 text-sm"
              style={{ color: pathname === to ? '#4CAF50' : '#A0A0A0' }}>
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
