import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../shared/store/appStore'
import { AppShell } from '../../shared/ui/AppShell'
import { useT } from '../../shared/i18n/useT'
import QRCode from 'react-qr-code'
import { getTourPois, getTours, type Tour, type TourPoi } from '../../api/services/tours'

export function StartPage() {
  const nav = useNavigate()
  const setTourCode = useAppStore((s) => s.setTourCode)
  const showToast = useAppStore((s) => s.showToast)
  const t = useT()

  const [code, setCode] = useState('')
  const [radius, setRadius] = useState(80)
  const [showQr, setShowQr] = useState(false)
  const setRadiusMeters = useAppStore((s) => s.setRadiusMeters)
  const [tours, setTours] = useState<Tour[]>([])
  const [selectedTourId, setSelectedTourId] = useState<string>('')
  const [tourPois, setTourPois] = useState<TourPoi[]>([])
  const [isLoadingTours, setIsLoadingTours] = useState(false)
  const [isLoadingTourPois, setIsLoadingTourPois] = useState(false)

  const canGeo = useMemo(() => 'geolocation' in navigator, [])

  useEffect(() => {
    setIsLoadingTours(true)
    getTours()
      .then((items) => {
        setTours(items || [])
        if (items?.length) {
          const first = items[0]
          const nextId = first.id
          setSelectedTourId(nextId)
          setCode(first.code ?? first.id)
        }
      })
      .catch(() => showToast({ title: 'Khong tai duoc danh sach tour' }))
      .finally(() => setIsLoadingTours(false))
  }, [showToast])

  useEffect(() => {
    if (!selectedTourId) {
      setTourPois([])
      return
    }
    setIsLoadingTourPois(true)
    getTourPois(selectedTourId)
      .then((items) => setTourPois(items || []))
      .catch(() => showToast({ title: 'Khong tai duoc POI trong tour' }))
      .finally(() => setIsLoadingTourPois(false))
  }, [selectedTourId, showToast])

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
      <div className="stack">
        <section className="hero">
          <div className="heroTitle">{t('tourist.start.title')}</div>
          <div className="heroSub">{t('tourist.start.subtitle') || 'Đi một vòng, nghe một câu chuyện, khám phá một hương vị.'}</div>
          <div className="heroActions">
            <button className="btn btnPrimary" onClick={requestLocation}>
              {t('tourist.start.requestLocation')}
            </button>
            <button className="btn" onClick={() => nav('/tourist/map')}>
              {t('tourist.start.openMap')}
            </button>
            <span className="badge">{t('tourist.start.pwaPill')}</span>
          </div>
        </section>

        <div className="panelGrid">
          <div className="card cardPad">
            <div className="sectionTitle">{t('tourist.start.tourCode')}</div>
            <div className="sectionSub">Chọn tour va tao ma QR cho nhom.</div>
            <div style={{ height: 10 }} />
            <select
              className="select"
              value={selectedTourId}
              onChange={(e) => {
                const nextId = e.target.value
                setSelectedTourId(nextId)
                const matched = tours.find((item) => item.id === nextId)
                if (matched) setCode(matched.code ?? matched.id)
              }}
            >
              <option value="">Chon tour</option>
              {tours.map((tour) => (
                <option key={tour.id} value={tour.id}>
                  {tour.name ?? tour.code ?? tour.id}
                </option>
              ))}
            </select>
            {isLoadingTours && (
              <div className="sectionSub" style={{ marginTop: 8 }}>Dang tai tour...</div>
            )}
            <input
              className="input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t('tourist.start.example')}
              style={{ marginTop: 10 }}
            />
            <div className="row" style={{ marginTop: 10, flexWrap: 'wrap' }}>
              <button
                className="btn btnPrimary"
                onClick={() => {
                  setTourCode(code.trim() || undefined)
                  showToast({ title: t('tourist.start.tourSavedTitle'), message: t('tourist.start.tourSavedDesc') })}
                }
              >
                {t('tourist.start.saveTour')}
              </button>
              <button className="btn" onClick={() => setShowQr((s) => !s)}>
                {showQr ? 'Ẩn mã QR' : 'Tạo mã QR'}
              </button>
            </div>
            {showQr && code.trim() && (
              <div style={{ marginTop: 14, background: '#fff', padding: 16, borderRadius: 14, display: 'inline-block' }}>
                <QRCode value={code.trim()} size={160} />
              </div>
            )}
            <div style={{ height: 12 }} />
            <div className="sectionSub" style={{ marginBottom: 8 }}>POI trong tour</div>
            {isLoadingTourPois && (
              <div className="sectionSub">Dang tai danh sach POI...</div>
            )}
            {!isLoadingTourPois && tourPois.length === 0 && (
              <div className="sectionSub">Chua co POI nao cho tour nay.</div>
            )}
            {!isLoadingTourPois && tourPois.length > 0 && (
              <div className="card cardPad" style={{ background: 'var(--panel-2)' }}>
                <div className="stack" style={{ gap: 8 }}>
                  {tourPois.map((poi) => (
                    <div key={poi.id} className="rowBetween">
                      <div style={{ fontWeight: 600 }}>{poi.name ?? poi.id}</div>
                      <span className="tag">#{poi.order ?? '-'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="card cardPad">
            <div className="sectionTitle">{t('tourist.start.radius')}</div>
            <div className="sectionSub">Điều chỉnh phạm vi tự động phát audio.</div>
            <div style={{ height: 10 }} />
            <div className="row" style={{ flexWrap: 'wrap' }}>
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
            <div className="sectionSub" style={{ marginTop: 6 }}>
              {t('tourist.start.radiusDesc')}
            </div>
            <div style={{ height: 12 }} />
            <div className="panelCard">
              <div className="panelIcon">📍</div>
              <div className="panelText">
                <div style={{ fontWeight: 700 }}>{t('tourist.start.gps')}</div>
                <div className="sectionSub">{t('tourist.start.gpsDesc')}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="panelGrid">
          <div className="panelCard">
            <div className="panelIcon">🗺️</div>
            <div className="panelText">
              <div style={{ fontWeight: 700 }}>Bản đồ thông minh</div>
              <div className="sectionSub">Tự động gợi ý POI, theo vị trí thực.</div>
            </div>
          </div>
          <div className="panelCard">
            <div className="panelIcon">🎧</div>
            <div className="panelText">
              <div style={{ fontWeight: 700 }}>Audio đa ngôn ngữ</div>
              <div className="sectionSub">Giọng đọc AI tự nhiên, phù hợp từng ngữ cảnh.</div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

