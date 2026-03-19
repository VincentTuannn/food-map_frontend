import { useLocation, useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'
import { useT } from '../i18n/useT'

export function TopBar() {
  const nav = useNavigate()
  const location = useLocation()
  const { language, radiusMeters, theme, setTheme } = useAppStore()
  const t = useT()

  const canGoBack = location.pathname !== '/tourist/start'
  const area = location.pathname.startsWith('/admin')
    ? 'Admin'
    : location.pathname.startsWith('/merchant')
      ? 'Merchant'
      : 'Tourist'

  return (
    <header className="topBar">
      <div className="topBarInner">
        <div className="row" style={{ gap: 8 }}>
          {canGoBack ? (
            <button className="btn btnGhost" onClick={() => nav(-1)} aria-label="Back">
              ←
            </button>
          ) : (
            <span className="pill">{t('top.qrToMap')}</span>
          )}
          <div className="brand">
            <div className="brandTitle">{t('app.name')}</div>
            <div className="brandSub">
              {area} · Lang: {language.toUpperCase()} · Radius: {radiusMeters}m
            </div>
          </div>
        </div>
        <div className="row">
          <button
            className="btn btnGhost"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
          <button className="btn btnGhost" onClick={() => nav('/tourist/premium')}>
            {t('top.premium')}
          </button>
        </div>
      </div>
    </header>
  )
}

