import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { distanceMeters } from '../../shared/lib/geo'
import { POIS } from '../../shared/mock/pois'
import { useAppStore } from '../../shared/store/appStore'
import { AppShell } from '../../shared/ui/AppShell'
import { useT } from '../../shared/i18n/useT'
import type { DirectionsProfile, DirectionsRoute } from '../../api/services/directions'
import { mockDirections } from '../../api/mocks/directions.mock'

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
  const t = useT()

  const [ttsOn, setTtsOn] = useState(true)
  const [profile, setProfile] = useState<DirectionsProfile>('walking')
  const [route, setRoute] = useState<DirectionsRoute | undefined>(undefined)
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
    showToast({ title: `${t('tourist.map.nearByToast')}${nearby.p.name}`, message: msg })

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
            <div style={{ fontSize: 18, fontWeight: 800 }}>{t('tourist.map.title')}</div>
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>
              {t('tourist.map.subtitle')}
            </div>
          </div>
          <div className="row">
            <span className="pill">
              {position ? `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}` : t('tourist.map.noGps')}
            </span>
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

        <div className="card cardPad" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="rowBetween">
            <div style={{ fontWeight: 800 }}>{t('tourist.map.directionsTitle')}</div>
            <div className="row">
              <select className="select" value={profile} onChange={(e) => setProfile(e.target.value as DirectionsProfile)}>
                <option value="walking">{t('tourist.map.walking')}</option>
                <option value="driving">{t('tourist.map.driving')}</option>
                <option value="cycling">{t('tourist.map.cycling')}</option>
              </select>
              <button
                className="btn"
                onClick={() => {
                  if (!position) {
                    showToast({ title: t('tourist.map.noGps') })
                    return
                  }
                  // For now we mock directions. Later swap to getDirections() from src/api/services/directions.ts
                  const to = { lat: POIS[0].lat, lng: POIS[0].lng }
                  setRoute(mockDirections({ from: position, to, profile }))
                }}
              >
                {t('tourist.map.mockRoute')}
              </button>
            </div>
          </div>
          {route ? (
            <>
              <div style={{ height: 10 }} />
              <div className="row" style={{ flexWrap: 'wrap' }}>
                <span className="pill">~ {Math.round(route.distanceMeters)} m</span>
                <span className="pill">~ {Math.round(route.durationSeconds / 60)} min</span>
              </div>
              <div style={{ height: 10 }} />
              <div style={{ display: 'grid', gap: 8 }}>
                {route.steps.map((s, i) => (
                  <div key={i} className="pill" style={{ justifyContent: 'space-between' }}>
                    <span>{s.instruction}</span>
                    <span>{Math.round(s.distanceMeters)}m</span>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>

        <div style={{ height: 12 }} />

        <div className="card" style={{ borderRadius: 16, overflow: 'hidden' }}>
          <div className="cardPad">
            <div className="rowBetween">
              <div style={{ fontWeight: 800 }}>{t('tourist.map.nearbyList')}</div>
              <span className="pill">{t('tourist.map.triggerUnder', { radius: radiusMeters })}</span>
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

