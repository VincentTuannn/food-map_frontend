import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore, type Language } from '../../shared/store/appStore'
import { AppShell } from '../../shared/ui/AppShell'
import { useT } from '../../shared/i18n/useT'

const LANGS: Array<{ id: Language; label: string; sub: string }> = [
  { id: 'vi', label: 'Tiếng Việt', sub: 'Thuyết minh tiếng Việt' },
  { id: 'en', label: 'English', sub: 'English narration' },
  { id: 'ja', label: '日本語', sub: '日本語ナレーション' },
  { id: 'zh', label: '中文', sub: '中文语音讲解' },
  { id: 'ko', label: '한국어', sub: '한국어 오디오 가이드' },
]

export function StartPage() {
  const nav = useNavigate()
  const language = useAppStore((s) => s.language)
  const setLanguage = useAppStore((s) => s.setLanguage)
  const setTourCode = useAppStore((s) => s.setTourCode)
  const showToast = useAppStore((s) => s.showToast)
  const t = useT()

  const [code, setCode] = useState('HN-OLDQUARTER')
  const [radius, setRadius] = useState(80)
  const setRadiusMeters = useAppStore((s) => s.setRadiusMeters)

  const canGeo = useMemo(() => 'geolocation' in navigator, [])

  async function requestLocation() {
    if (!canGeo) {
      showToast({ title: t('tourist.start.noGpsTitle'), message: t('tourist.start.noGpsDesc') })
      return
    }

    // trigger permission prompt
    navigator.geolocation.getCurrentPosition(
      () => {
        showToast({ title: t('tourist.start.gpsOkTitle'), message: t('tourist.start.gpsOkDesc') })
        nav('/tourist/map')
      },
      () => {
        showToast({ title: t('tourist.start.gpsDeniedTitle'), message: t('tourist.start.gpsDeniedDesc') })
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  }

  return (
    <AppShell>
      <div className="card cardPad">
        <div className="rowBetween">
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{t('tourist.start.title')}</div>
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>
              {t('tourist.start.subtitle')}
            </div>
          </div>
          <span className="pill">{t('tourist.start.pwaPill')}</span>
        </div>

        <div className="hr" />

        <div className="grid2">
          <div>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>{t('tourist.start.tourCode')}</div>
            <input
              className="input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={`${t('tourist.start.example')} HN-OLDQUARTER`}
            />
            <div style={{ marginTop: 10 }} className="row">
              <button
                className="btn btnPrimary"
                onClick={() => {
                  setTourCode(code.trim() || undefined)
                  showToast({ title: t('tourist.start.tourSavedTitle'), message: t('tourist.start.tourSavedDesc') })
                }}
              >
                {t('tourist.start.saveTour')}
              </button>
              <button
                className="btn"
                onClick={() => showToast({ title: t('tourist.start.qrDemoTitle'), message: t('tourist.start.qrDemoDesc') })}
              >
                {t('tourist.start.scanQr')}
              </button>
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>{t('tourist.start.lang')}</div>
            <select
              className="select"
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
            >
              {LANGS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label} - {l.sub}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="hr" />

        <div className="grid2">
          <div>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>{t('tourist.start.radius')}</div>
            <div className="row">
              <input
                className="input"
                type="number"
                min={20}
                max={300}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
              />
              <button
                className="btn"
                onClick={() => {
                  setRadiusMeters(radius)
                  showToast({ title: t('tourist.start.radiusSet', { radius }) })
                }}
              >
                {t('tourist.start.apply')}
              </button>
            </div>
            <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 6 }}>
              {t('tourist.start.radiusDesc')}
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>{t('tourist.start.gps')}</div>
            <div className="row">
              <button className="btn btnPrimary" onClick={requestLocation}>
                {t('tourist.start.requestLocation')}
              </button>
              <button className="btn" onClick={() => nav('/tourist/map')}>
                {t('tourist.start.openMap')}
              </button>
            </div>
            <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 6 }}>
              {t('tourist.start.gpsDesc')}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

