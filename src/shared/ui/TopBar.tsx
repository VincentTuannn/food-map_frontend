import { useLocation, useNavigate } from 'react-router-dom'
import { useAppStore, type Language } from '../store/appStore'
import { useT } from '../i18n/useT'

const LANGS: Array<{ id: Language; label: string }> = [
  { id: 'vi', label: 'Tiếng Việt' },
  { id: 'en', label: 'English' },
  { id: 'ja', label: '日本語' },
  { id: 'zh', label: '中文' },
  { id: 'ko', label: '한국어' },
]

export function TopBar() {
  const nav = useNavigate()
  const location = useLocation()
  const { language, setLanguage, userToken, setUserToken, radiusMeters, theme, setTheme } = useAppStore()
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
              {area} · Radius: {radiusMeters}m
            </div>
          </div>
        </div>
        <div className="row">
          <select
            className="select"
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            style={{ marginRight: 8, padding: '4px 8px', fontSize: 13, height: 32 }}
          >
            {LANGS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
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
          {userToken && (
            <button className="btn btnGhost" onClick={() => setUserToken(undefined)} style={{ color: '#ef4444' }}>
              Đăng xuất
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

