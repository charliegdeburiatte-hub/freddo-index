import { useState, useEffect } from 'react'

const MESSAGES = [
  'Counting Freddos...',
  'Consulting the Royal Charter...',
  'Asking the frog...',
  'Blaming Mondelez...',
  'Checking if Southern Rail is delayed (it is)...',
  'Converting aircraft carriers to chocolate...',
  "Loading complete. Any mistakes are the frogs' fault. They don't have thumbs. 🐸",
]

export default function LoadingScreen({ onDone }) {
  const [msgIndex, setMsgIndex] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (msgIndex >= MESSAGES.length - 1) {
      const t = setTimeout(() => {
        setFading(true)
        setTimeout(onDone, 400)
      }, 1200)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setMsgIndex(i => i + 1), 900)
    return () => clearTimeout(t)
  }, [msgIndex, onDone])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-400"
      style={{ background: '#0F0F0F', opacity: fading ? 0 : 1 }}>

      {/* Frog riding the line */}
      <div className="mb-8 relative w-64 h-24">
        <svg viewBox="0 0 256 96" className="w-full h-full">
          <polyline
            points={`0,80 ${(msgIndex / (MESSAGES.length - 1)) * 256},${80 - (msgIndex / (MESSAGES.length - 1)) * 60}`}
            fill="none" stroke="#4CAF50" strokeWidth="2" />
          <text
            x={(msgIndex / (MESSAGES.length - 1)) * 256}
            y={80 - (msgIndex / (MESSAGES.length - 1)) * 60 - 8}
            textAnchor="middle" fontSize="24">
            🐸
          </text>
        </svg>
      </div>

      <h1 className="text-3xl font-bold mb-1" style={{ color: '#4CAF50' }}>The Freddo Index</h1>
      <p className="text-base italic mb-8" style={{ color: '#A0A0A0' }}>By Royal Appointment</p>

      <p key={msgIndex} className="text-base animate-pulse" style={{ color: '#A0A0A0', maxWidth: '320px', textAlign: 'center' }}>
        {MESSAGES[msgIndex]}
      </p>
    </div>
  )
}
