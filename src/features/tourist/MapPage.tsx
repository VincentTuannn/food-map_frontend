import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { distanceMeters } from '../../shared/lib/geo'
import { POIS } from '../../shared/mock/pois'
import { useAppStore } from '../../shared/store/appStore'
import { AppShell } from '../../shared/ui/AppShell'

function speak(text: string, lang: string) {
  if (!('speechSynthesis' in window)) return
  const u = new SpeechSynthesisUtterance(text)
  u.lang = lang
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(u)
}

export function MapPage() {
  const nav = useNavigate()
  const language = useAppStore((s) => s.language)
  const radiusMeters = useAppStore((s) => s.radiusMeters)
  const position = useAppStore((s) => s.position)
  const setPosition = useAppStore((s) => s.setPosition)
  const showToast = useAppStore((s) => s.showToast)

  const [ttsOn, setTtsOn] = useState(true)
  const lastTriggerRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (!('geolocation' in navigator)) return
    const w = navigator.geolocation.watchPosition(
      (p) => {
        setPosition({ lat: p.coords.latitude, lng: p.coords.longitude })
      },
      () => {
        // ignore
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10_000 },
    )
    return () => navigator.geolocation.clearWatch(w)
  }, [setPosition])

  const poisWithDistance = useMemo(() => {
    if (!position) return POIS.map((p) => ({ p, d: undefined as number | undefined }))
    return POIS.map((p) => ({ p, d: distanceMeters(position, { lat: p.lat, lng: p.lng }) })).sort(
      (a, b) => (a.d ?? Number.POSITIVE_INFINITY) - (b.d ?? Number.POSITIVE_INFINITY),
    )
  }, [position])

  useEffect(() => {
    if (!position) return
    const nearby = poisWithDistance.find((x) => x.d !== undefined && x.d <= radiusMeters)
    if (!nearby) return
    if (lastTriggerRef.current === nearby.p.id) return
    lastTriggerRef.current = nearby.p.id

    const msg = language === 'vi' ? nearby.p.short.vi : language === 'ja' ? nearby.p.short.ja : nearby.p.short.en
    showToast({ title: `Bạn đang gần: ${nearby.p.name}`, message: msg })

    if (ttsOn) {
      const speechLang = language === 'vi' ? 'vi-VN' : language === 'ja' ? 'ja-JP' : 'en-US'
      speak(`${nearby.p.name}. ${msg}`, speechLang)
    }
  }, [language, poisWithDistance, position, radiusMeters, showToast, ttsOn])

  return (
    <AppShell>
      <div className="card cardPad">
        <div className="rowBetween">
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>Bản đồ & POI lân cận</div>
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>
              Ở demo này mình dùng “map giả” + geolocation thật (nếu bạn bật GPS).
            </div>
          </div>
          <div className="row">
            <span className="pill">{position ? `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}` : 'No GPS'}</span>
            <button className={`btn ${ttsOn ? 'btnPrimary' : ''}`} onClick={() => setTtsOn((v) => !v)}>
              TTS {ttsOn ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        <div style={{ height: 12 }} />

        <div className="mapFake" aria-label="Map (mock)">
          <div className="mapDot" title="You" />

          {/* Fake marker positions for demo layout */}
          <button
            className="poiMarker"
            style={{ left: '16%', top: '24%' }}
            onClick={() => nav('/tourist/poi/pho-minh')}
          >
            Phở
          </button>
          <button
            className="poiMarker"
            style={{ left: '68%', top: '30%' }}
            onClick={() => nav('/tourist/poi/ca-phe-pho-co')}
          >
            Cà phê
          </button>
          <button
            className="poiMarker"
            style={{ left: '42%', top: '70%' }}
            onClick={() => nav('/tourist/poi/bun-cha-34')}
          >
            Bún chả
          </button>
        </div>

        <div style={{ height: 12 }} />

        <div className="card" style={{ borderRadius: 16, overflow: 'hidden' }}>
          <div className="cardPad">
            <div className="rowBetween">
              <div style={{ fontWeight: 800 }}>Danh sách gần bạn</div>
              <span className="pill">Trigger ≤ {radiusMeters}m</span>
            </div>

            <div style={{ height: 10 }} />

            <div style={{ display: 'grid', gap: 10 }}>
              {poisWithDistance.map(({ p, d }) => (
                <button
                  key={p.id}
                  className="btn"
                  style={{ textAlign: 'left' }}
                  onClick={() => nav(`/tourist/poi/${p.id}`)}
                >
                  <div className="rowBetween">
                    <div>
                      <div style={{ fontWeight: 800 }}>{p.name}</div>
                      <div style={{ color: 'var(--muted)', fontSize: 13 }}>
                        {language === 'vi' ? p.short.vi : language === 'ja' ? p.short.ja : p.short.en}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <span className="pill">⭐ {p.rating.toFixed(1)}</span>
                      <span className="pill">{d === undefined ? '— m' : `${Math.round(d)} m`}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

