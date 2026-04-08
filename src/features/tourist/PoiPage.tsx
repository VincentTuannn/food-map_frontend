import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { POIS } from '../../shared/mock/pois'
import { useAppStore } from '../../shared/store/appStore'
import { AppShell } from '../../shared/ui/AppShell'
import { useT } from '../../shared/i18n/useT'
import type { Poi } from '../../shared/domain/poi'
import { cachePoiContent, getCachedPoiContent, getPoiContent } from '../../api/services/content'
import type { ApiPoi } from '../../api/services/poi'
import { getPoiById } from '../../api/services/poi'

export function PoiDetails({ poi }: { poi: Poi }) {
  const language = useAppStore((s) => s.language)
  const showToast = useAppStore((s) => s.showToast)
  const t = useT()
  const [showReviewInput, setShowReviewInput] = useState(false)
  const [reviewStars, setReviewStars] = useState(5)
  const [reviewText, setReviewText] = useState('')

  const [poiContent, setPoiContent] = useState<any>(null)
  const [isLoadingContent, setIsLoadingContent] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('')
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const cached = getCachedPoiContent(poi.id, language)
    if (cached) {
      setPoiContent(cached)
    }
    setIsLoadingContent(true)
    getPoiContent(poi.id, language, { preferCache: true })
      .then(res => setPoiContent(res?.data || res))
      .catch(err => console.error("Failed to fetch POI content:", err))
      .finally(() => setIsLoadingContent(false))
  }, [poi.id, language])

  useEffect(() => {
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices()
      if (available.length > 0) {
        setVoices(available)
        if (!selectedVoiceURI) {
          setSelectedVoiceURI(available[0].voiceURI)
        }
      }
    }
    loadVoices()
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [selectedVoiceURI])

  const desc = poiContent?.description || poiContent?.text || (language === 'vi' ? poi.short.vi : language === 'ja' ? poi.short.ja : language === 'zh' ? poi.short.zh : language === 'ko' ? poi.short.ko : poi.short.en)
  const audioUrl = poiContent?.audio_url || poiContent?.audioUrl

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
    }

    if (audioUrl) {
      const audio = new Audio(audioUrl)
      audio.playbackRate = playbackRate
      audioRef.current = audio
      audio.play()
      return
    }

    if ('speechSynthesis' in window && desc) {
      const utterance = new SpeechSynthesisUtterance(desc)
      utterance.rate = playbackRate
      const matched = voices.find((v) => v.voiceURI === selectedVoiceURI)
      if (matched) utterance.voice = matched
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utterance)
    }
  }

  const saveOffline = async () => {
    try {
      const res = await getPoiContent(poi.id, language, { preferCache: true })
      const payload = res?.data || res
      cachePoiContent(poi.id, language, payload)
      setPoiContent(payload)
      showToast({ title: 'Đã lưu offline' })
    } catch {
      showToast({ title: 'Lưu thất bại', message: 'Không thể tải nội dung POI.' })
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {poi.imageUrl && (
        <img src={poi.imageUrl} alt={poi.name} style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 16 }} />
      )}
      <div className="card cardPad">
        <div className="rowBetween">
          <div style={{ flex: 1, paddingRight: 10 }}>
            <div style={{ fontSize: 18, fontWeight: 900 }}>{poi.name}</div>
            <div style={{ color: 'var(--muted)', fontSize: 13, minHeight: 20 }}>
               {isLoadingContent ? 'Loading...' : desc}
            </div>
            {!isLoadingContent && (
              <div className="row" style={{ marginTop: 8, flexWrap: 'wrap' }}>
                <button
                  className="btn btnGhost"
                  style={{ padding: '4px 8px', fontSize: 13, background: 'rgba(255,255,255,0.1)' }}
                  onClick={playAudio}
                >
                  🔊 Nghe
                </button>
                <button className="btn" style={{ padding: '4px 8px', fontSize: 13 }} onClick={saveOffline}>
                  💾 Lưu offline
                </button>
                <select
                  className="select"
                  style={{ width: 90, padding: '4px 8px', fontSize: 13 }}
                  value={playbackRate}
                  onChange={(e) => setPlaybackRate(Number(e.target.value))}
                >
                  <option value={0.8}>0.8x</option>
                  <option value={1}>1.0x</option>
                  <option value={1.2}>1.2x</option>
                  <option value={1.5}>1.5x</option>
                </select>
                {voices.length > 0 && !audioUrl && (
                  <select
                    className="select"
                    style={{ minWidth: 160, padding: '4px 8px', fontSize: 13 }}
                    value={selectedVoiceURI}
                    onChange={(e) => setSelectedVoiceURI(e.target.value)}
                  >
                    {voices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <span className="pill">⭐ {poi.rating.toFixed(1)}</span>
            <span className="pill">{'₫'.repeat(poi.priceLevel)}</span>
          </div>
        </div>

        <div className="hr" />

        <div className="grid2">
          <div className="card cardPad">
            <div style={{ fontWeight: 900, marginBottom: 8 }}>{t('tourist.poi.menuHighlights')}</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {poi.menuHighlights.map((x) => (
                <div key={x} className="pill" style={{ justifyContent: 'space-between' }}>
                  <span>{x}</span>
                  <span style={{ opacity: 0.85 }}>→</span>
                </div>
              ))}
            </div>
            <div style={{ height: 10 }} />
            <button
              className="btn"
              onClick={() => showToast({ title: t('tourist.poi.viewMenuDemoTitle'), message: t('tourist.poi.viewMenuDemoDesc') })}
            >
              {t('tourist.poi.viewMenu')}
            </button>
          </div>

          <div className="card cardPad">
            <div style={{ fontWeight: 900, marginBottom: 8 }}>{t('tourist.poi.voucherTitle')}</div>
            {poi.voucher ? (
              <>
                <div className="pill" style={{ justifyContent: 'space-between', width: '100%' }}>
                  <span>
                    <strong style={{ color: 'var(--text)' }}>{poi.voucher.code}</strong> · {poi.voucher.description}
                  </span>
                  <span style={{ opacity: 0.85 }}>⏳ {poi.voucher.expiresAt}</span>
                </div>
                <div style={{ height: 10 }} />
                <button
                  className="btn btnPrimary"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(poi.voucher!.code)
                      showToast({ title: t('tourist.poi.copySuccess'), message: poi.voucher!.code })
                    } catch {
                      showToast({ title: t('tourist.poi.copyFailed'), message: poi.voucher!.code })
                    }
                  }}
                >
                  {t('tourist.poi.copyVoucher')}
                </button>
              </>
            ) : (
              <div style={{ color: 'var(--muted)' }}>{t('tourist.poi.noVoucher')}</div>
            )}

            <div style={{ height: 10 }} />
            <button
              className="btn"
              onClick={() => showToast({ title: t('tourist.poi.navigateDemoTitle'), message: t('tourist.poi.navigateDemoDesc') })}
            >
              {t('tourist.poi.navigateTo')}
            </button>
          </div>
        </div>

        <div className="hr" />

        <div className="card cardPad">
          <div className="rowBetween">
            <div style={{ fontWeight: 900 }}>{t('tourist.poi.reviewsTitle')}</div>
            <button className="btn" onClick={() => setShowReviewInput(!showReviewInput)}>
              {t('tourist.poi.writeReview')}
            </button>
          </div>
          {showReviewInput && (
            <div className="card cardPad" style={{ background: 'var(--panel-2)', marginTop: 10 }}>
              <div className="row" style={{ marginBottom: 8, gap: 8 }}>
                <span style={{ fontWeight: 600 }}>🌟:</span>
                <select className="select" style={{ width: 80, padding: 6 }} value={reviewStars} onChange={e => setReviewStars(Number(e.target.value))}>
                  <option value={5}>5</option>
                  <option value={4}>4</option>
                  <option value={3}>3</option>
                  <option value={2}>2</option>
                  <option value={1}>1</option>
                </select>
              </div>
              <textarea 
                className="textarea" 
                placeholder="Nhập suy nghĩ của bạn..." 
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                style={{ marginBottom: 8, minHeight: 60 }}
              />
              <div className="rowBetween">
                <button className="btn" onClick={() => setShowReviewInput(false)}>Hủy</button>
                <button className="btn btnPrimary" onClick={() => {
                  showToast({ title: "Cảm ơn!", message: "Đánh giá của bạn đã được ghi nhận." });
                  setShowReviewInput(false);
                  setReviewText("");
                }}>Đăng bài</button>
              </div>
            </div>
          )}
          <div style={{ height: 10 }} />
          <div style={{ display: 'grid', gap: 10 }}>
            {poi.reviews.map((r, idx) => (
              <div key={idx} className="card cardPad" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="rowBetween">
                  <div style={{ fontWeight: 800 }}>{r.author}</div>
                  <span className="pill">⭐ {r.stars}/5</span>
                </div>
                <div style={{ color: 'var(--muted)', marginTop: 6 }}>{r.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function PoiPage() {
  const nav = useNavigate()
  const { poiId } = useParams()
  const t = useT()

  const [apiPoi, setApiPoi] = useState<ApiPoi | null>(null)
  const [isLoadingPoi, setIsLoadingPoi] = useState(false)

  useEffect(() => {
    if (!poiId) return
    setIsLoadingPoi(true)
    getPoiById(poiId)
      .then((res) => setApiPoi(res?.data ?? null))
      .catch(() => setApiPoi(null))
      .finally(() => setIsLoadingPoi(false))
  }, [poiId])

  const mockPoi = useMemo(() => POIS.find((p) => p.id === poiId), [poiId])

  const poi = useMemo(() => {
    if (!apiPoi && mockPoi) return mockPoi
    if (!apiPoi) return undefined

    const shortFromApi = apiPoi.short ?? apiPoi.descriptions ?? {}
    const fallbackShort = mockPoi?.short ?? { vi: '', en: '', ja: '', zh: '', ko: '' }

    const lat = apiPoi.lat ?? apiPoi.latitude ?? apiPoi.location?.coordinates?.[1] ?? mockPoi?.lat ?? 0
    const lng = apiPoi.lng ?? apiPoi.longitude ?? apiPoi.location?.coordinates?.[0] ?? mockPoi?.lng ?? 0
    const rating = apiPoi.average_rating ?? apiPoi.rating ?? mockPoi?.rating ?? 4.0
    const priceLevel = (apiPoi.price_level ?? mockPoi?.priceLevel ?? 1) as 1 | 2 | 3

    const rawVoucher = apiPoi.voucher ?? mockPoi?.voucher
    const voucher = rawVoucher && rawVoucher.code && rawVoucher.description && rawVoucher.expiresAt
      ? { code: rawVoucher.code, description: rawVoucher.description, expiresAt: rawVoucher.expiresAt }
      : undefined

    const normalizedReviews = (apiPoi.reviews ?? [])
      .filter((r) => r?.author && typeof r.stars === 'number' && r?.text)
      .map((r) => ({
        author: r.author as string,
        stars: r.stars as number,
        text: r.text as string,
      }))

    return {
      id: apiPoi.id ?? mockPoi?.id ?? poiId ?? 'unknown',
      name: apiPoi.name ?? mockPoi?.name ?? 'POI',
      category: mockPoi?.category ?? 'food',
      imageUrl: apiPoi.imageUrl ?? apiPoi.image_url ?? mockPoi?.imageUrl,
      lat,
      lng,
      rating: Number(rating),
      priceLevel,
      tags: apiPoi.tags ?? mockPoi?.tags ?? [],
      short: {
        vi: shortFromApi.vi ?? fallbackShort.vi,
        en: shortFromApi.en ?? fallbackShort.en,
        ja: shortFromApi.ja ?? fallbackShort.ja,
        zh: shortFromApi.zh ?? fallbackShort.zh,
        ko: shortFromApi.ko ?? fallbackShort.ko,
      },
      menuHighlights: apiPoi.menuHighlights ?? apiPoi.menu_highlights ?? mockPoi?.menuHighlights ?? [],
      voucher,
      reviews: normalizedReviews.length > 0 ? normalizedReviews : mockPoi?.reviews ?? [],
    }
  }, [apiPoi, mockPoi, poiId])

  if (!poi && isLoadingPoi) {
    return (
      <AppShell>
        <div className="card cardPad">Đang tải...</div>
      </AppShell>
    )
  }

  if (!poi) {
    return (
      <AppShell>
        <div className="card cardPad">
          <div style={{ fontWeight: 800 }}>{t('tourist.poi.notFound')}</div>
          <div style={{ color: 'var(--muted)', marginTop: 6 }}>ID: {poiId}</div>
          <div style={{ height: 12 }} />
          <button className="btn btnPrimary" onClick={() => nav('/tourist/map')}>
            {t('tourist.poi.backToMap')}
          </button>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <PoiDetails poi={poi} />
    </AppShell>
  )
}
