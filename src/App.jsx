import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoadingScreen from './components/layout/LoadingScreen'
import Home from './pages/Home'
import Index from './pages/Index'
import Disclaimer from './pages/Disclaimer'

export default function App() {
  const [loading, setLoading] = useState(true)

  return (
    <BrowserRouter>
      {loading && <LoadingScreen onDone={() => setLoading(false)} />}
      <div style={{ visibility: loading ? 'hidden' : 'visible' }}>
        <Routes>
          <Route path="/"            element={<Home />} />
          <Route path="/index"       element={<Index />} />
          <Route path="/disclaimer"  element={<Disclaimer />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
