import { useEffect, useState } from 'react'
import { API_URL, getHealth } from '../api.js'
import './Header.css'

const NAV = [{ id: 'authors', label: 'Authors' }]

export default function Header({ current }) {
  const [apiStatus, setApiStatus] = useState('checking')

  useEffect(() => {
    let cancelled = false
    getHealth()
      .then((h) => !cancelled && setApiStatus(h?.status === 'ok' ? 'ok' : 'down'))
      .catch(() => !cancelled && setApiStatus('down'))
    return () => {
      cancelled = true
    }
  }, [])

  const host = API_URL.replace(/^https?:\/\//, '')
  const statusText = { checking: 'Checking API…', ok: `API · ${host}`, down: `API offline · ${host}` }

  return (
    <header className="site-header">
      <a href="/" className="brand">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 19.5V5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z" />
          <path d="M8 7h8" />
        </svg>
        <span>Goodbooks Library</span>
      </a>
      <nav aria-label="Main" className="main-nav">
        {NAV.map((item) => (
          <a key={item.id} href="/" aria-current={item.id === current ? 'page' : undefined}>
            {item.label}
          </a>
        ))}
      </nav>
      <span className={`api-pill api-pill--${apiStatus}`} role="status">
        <span className="api-dot" aria-hidden="true" />
        {statusText[apiStatus]}
      </span>
    </header>
  )
}
