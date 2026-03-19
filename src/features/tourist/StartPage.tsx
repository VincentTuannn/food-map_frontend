import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore, type Language } from '../../shared/store/appStore'
import { AppShell } from '../../shared/ui/AppShell'
import { useT } from '../../shared/i18n/useT'

const LANGS: Array<{ id: Language; label: string; sub: string }> = [
  { id: 'vi', label: 'Tiếng Việt', sub: 'Thuyết minh tiếng Việt' },
  { id: 'en', label: 'English', sub: 'English narration' },
  { id: 'ja', label: '日本語', sub: '日本語ナレーション' },
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
      showToast({ title: 'Thiết bị không hỗ trợ GPS', message: 'Hãy thử trên mobile Chrome/Safari.' })
      return
    }

    // trigger permission prompt
    navigator.geolocation.getCurrentPosition(
      () => {
        showToast({ title: 'Đã bật GPS', message: 'Chuyển sang bản đồ…' })
        nav('/tourist/map')
      },
      () => {
        showToast({ title: 'Chưa cấp quyền vị trí', message: 'Vui lòng bật Location để dùng bản đồ.' })
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
          <span className="pill">PWA · Mobile-first</span>
        </div>

        <div className="hr" />

        <div className="grid2">
          <div>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>{t('tourist.start.tourCode')}</div>
            <input
              className="input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="VD: HN-OLDQUARTER"
            />
            <div style={{ marginTop: 10 }} className="row">
              <button
                className="btn btnPrimary"
                onClick={() => {
                  setTourCode(code.trim() || undefined)
                  showToast({ title: 'Đã lưu tour', message: 'Bạn có thể mở Map để xem POI.' })
                }}
              >
                {t('tourist.start.saveTour')}
              </button>
              <button
                className="btn"
                onClick={() => showToast({ title: 'Quét QR (TODO)', message: 'Tích hợp camera sau (getUserMedia).' })}
              >
                {t('tourist.start.scanQr')}
              </button>
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>{t('tourist.start.lang')}</div>
            <div className="grid2">
              {LANGS.map((l) => (
                <button
                  key={l.id}
                  className={`btn ${language === l.id ? 'btnPrimary' : ''}`}
                  onClick={() => setLanguage(l.id)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                    <span>{l.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>{l.sub}</span>
                  </div>
                </button>
              ))}
            </div>
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
                  showToast({ title: `Đã set bán kính ${radius}m` })
                }}
              >
                {t('tourist.start.apply')}
              </button>
            </div>
            <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 6 }}>
              (Trong thực tế admin cấu hình; ở demo cho bạn chỉnh nhanh.)
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
              Hệ thống sẽ tự phát “audio/text” khi bạn vào vùng POI.
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

