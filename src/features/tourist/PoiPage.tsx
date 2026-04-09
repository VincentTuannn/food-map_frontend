import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../../shared/store/appStore'
import { AppShell } from '../../shared/ui/AppShell'
import { useT } from '../../shared/i18n/useT'
import type { Poi } from '../../shared/domain/poi'
import { cachePoiContent, getCachedPoiContent, getPoiContent } from '../../api/services/content'
import type { ApiPoi } from '../../api/services/poi'
import { getPoiById } from '../../api/services/poi'
import { getPromotionsByPoi, type Promotion } from '../../api/services/promotion'
import { claimVoucher } from '../../api/services/userVouchers'
import { createOrUpdateReview, getReviewsByPoi, type Review } from '../../api/services/reviews'

export function PoiDetails({ poi }: { poi: Poi }) {
  const language = useAppStore((s) => s.language)
  const showToast = useAppStore((s) => s.showToast)
  const t = useT()
  const [showReviewInput, setShowReviewInput] = useState(false)
  const [reviewStars, setReviewStars] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [isLoadingPromotions, setIsLoadingPromotions] = useState(false)
  const [isClaimingVoucher, setIsClaimingVoucher] = useState(false)

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

  useEffect(() => {
    setIsLoadingPromotions(true)
    getPromotionsByPoi(poi.id)
      .then((items) => setPromotions(items || []))
      .catch(() => showToast({ title: 'Khong tai duoc khuyen mai' }))
      .finally(() => setIsLoadingPromotions(false))
  }, [poi.id, showToast])

  useEffect(() => {
    setIsLoadingReviews(true)
    getReviewsByPoi(poi.id)
      .then((items) => setReviews(items || []))
      .catch(() => showToast({ title: 'Khong tai duoc danh gia' }))
      .finally(() => setIsLoadingReviews(false))
  }, [poi.id, showToast])

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
    <div className="stack">
      <div className="poiHero">
        {poi.imageUrl && <img className="poiHeroImage" src={poi.imageUrl} alt={poi.name} />}
        <div className="poiHeroContent">
          <div className="rowBetween">
            <div>
              <div className="heroTitle">{poi.name}</div>
              <div className="sectionSub">{isLoadingContent ? 'Loading...' : desc}</div>
            </div>
            <div className="poiMetaRow">
              <span className="tag">⭐ {poi.rating.toFixed(1)}</span>
              <span className="tag">{'₫'.repeat(poi.priceLevel)}</span>
            </div>
          </div>

          <div className="poiMetaRow">
            {(poi.tags || []).slice(0, 3).map((tag) => (
              <span key={tag} className="tag">{tag}</span>
            ))}
            <span className="badge">Tự động phát audio</span>
          </div>

          {!isLoadingContent && (
            <div className="poiActionBar">
              <button className="btn btnPrimary" onClick={playAudio}>
                🔊 Nghe
              </button>
              <button className="btn" onClick={saveOffline}>
                💾 Lưu offline
              </button>
              <select className="select" style={{ width: 90 }} value={playbackRate} onChange={(e) => setPlaybackRate(Number(e.target.value))}>
                <option value={0.8}>0.8x</option>
                <option value={1}>1.0x</option>
                <option value={1.2}>1.2x</option>
                <option value={1.5}>1.5x</option>
              </select>
              {voices.length > 0 && !audioUrl && (
                <select className="select" style={{ minWidth: 160 }} value={selectedVoiceURI} onChange={(e) => setSelectedVoiceURI(e.target.value)}>
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
      </div>

      <div className="panelGrid">
        <div className="card cardPad poiSection">
          <div className="sectionTitle">{t('tourist.poi.menuHighlights')}</div>
          <div className="chipRow">
            {poi.menuHighlights.map((x) => (
              <span key={x} className="tag">{x}</span>
            ))}
          </div>
          <button
            className="btn"
            onClick={() => showToast({ title: t('tourist.poi.viewMenuDemoTitle'), message: t('tourist.poi.viewMenuDemoDesc') })}
          >
            {t('tourist.poi.viewMenu')}
          </button>
        </div>

        <div className="card cardPad poiSection">
          <div className="sectionTitle">{t('tourist.poi.voucherTitle')}</div>
          {isLoadingPromotions && (
            <div className="muted">Dang tai khuyen mai...</div>
          )}
          {!isLoadingPromotions && promotions.length === 0 && (
            <div className="muted">Khong co khuyen mai nao.</div>
          )}
          {!isLoadingPromotions && promotions.length > 0 && (
            <div className="stack" style={{ gap: 8 }}>
              {promotions.map((promo) => (
                <div key={promo.id} className="card cardPad" style={{ background: 'var(--panel-2)' }}>
                  <div className="rowBetween">
                    <div>
                      <div style={{ fontWeight: 700 }}>{promo.title ?? 'Khuyen mai'}</div>
                      <div className="sectionSub">{promo.description ?? ''}</div>
                    </div>
                    {promo.expiresAt && <span className="tag">Het han {promo.expiresAt}</span>}
                  </div>
                  {promo.code && (
                    <div className="tag" style={{ marginTop: 8 }}>
                      <strong style={{ color: 'var(--text)' }}>{promo.code}</strong>
                    </div>
                  )}
                  <div className="row" style={{ marginTop: 10 }}>
                    <button
                      className="btn btnPrimary"
                      disabled={isClaimingVoucher}
                      onClick={async () => {
                        try {
                          setIsClaimingVoucher(true)
                          const res = await claimVoucher(poi.id, promo.id)
                          const code = (res as any)?.code ?? promo.code
                          if (code) {
                            await navigator.clipboard.writeText(code)
                            showToast({ title: 'Da nhan voucher', message: code })
                          } else {
                            showToast({ title: 'Da nhan voucher' })
                          }
                        } catch {
                          showToast({ title: 'Nhan voucher that bai' })
                        } finally {
                          setIsClaimingVoucher(false)
                        }
                      }}
                    >
                      {isClaimingVoucher ? 'Dang xu ly...' : 'Nhan voucher'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            className="btn"
            onClick={() => showToast({ title: t('tourist.poi.navigateDemoTitle'), message: t('tourist.poi.navigateDemoDesc') })}
          >
            {t('tourist.poi.navigateTo')}
          </button>
        </div>
      </div>

      <div className="card cardPad poiSection">
        <div className="rowBetween">
          <div className="sectionTitle">Trải nghiệm tại quán</div>
          <span className="tag">360°</span>
        </div>
        <div className="sectionSub">Menu điện tử, ảnh không gian và review thật.</div>
        <div className="poiActionBar">
          <button className="btn">📷 Xem ảnh 360</button>
          <button className="btn">🧾 Menu điện tử</button>
          <button className="btn">🧭 Chỉ đường</button>
        </div>
      </div>

      <div className="card cardPad poiSection">
        <div className="rowBetween">
          <div className="sectionTitle">{t('tourist.poi.reviewsTitle')}</div>
          <button className="btn" onClick={() => setShowReviewInput(!showReviewInput)}>
            {t('tourist.poi.writeReview')}
          </button>
        </div>
        {showReviewInput && (
          <div className="card cardPad" style={{ background: 'var(--panel-2)' }}>
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
              <button
                className="btn btnPrimary"
                onClick={async () => {
                  if (!reviewText.trim()) {
                    showToast({ title: 'Vui long nhap noi dung' })
                    return
                  }
                  try {
                    await createOrUpdateReview(poi.id, reviewStars, reviewText.trim())
                    const items = await getReviewsByPoi(poi.id)
                    setReviews(items || [])
                    showToast({ title: 'Da gui danh gia' })
                    setShowReviewInput(false)
                    setReviewText('')
                  } catch {
                    showToast({ title: 'Gui danh gia that bai' })
                  }
                }}
              >
                Dang bai
              </button>
            </div>
          </div>
        )}
        {isLoadingReviews && (
          <div className="muted">Dang tai danh gia...</div>
        )}
        {!isLoadingReviews && reviews.length === 0 && (
          <div className="muted">Chua co danh gia nao.</div>
        )}
        {!isLoadingReviews && reviews.length > 0 && (
          <div style={{ display: 'grid', gap: 10 }}>
            {reviews.map((r, idx) => (
              <div key={r.id ?? idx} className="card cardPad" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="rowBetween">
                  <div style={{ fontWeight: 800 }}>{r.author ?? 'Nguoi dung'}</div>
                  <span className="tag">⭐ {r.stars ?? 0}/5</span>
                </div>
                <div className="muted" style={{ marginTop: 6 }}>{r.text ?? ''}</div>
              </div>
            ))}
          </div>
        )}
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

  const poi = useMemo(() => {
    if (!apiPoi) return undefined

    const shortFromApi = apiPoi.short ?? apiPoi.descriptions ?? {}
    const fallbackShort = { vi: '', en: '', ja: '', zh: '', ko: '' }

    const lat = apiPoi.lat ?? apiPoi.latitude ?? apiPoi.location?.coordinates?.[1] ?? 0
    const lng = apiPoi.lng ?? apiPoi.longitude ?? apiPoi.location?.coordinates?.[0] ?? 0
    const rating = apiPoi.average_rating ?? apiPoi.rating ?? 0
    const priceLevel = (apiPoi.price_level ?? 1) as 1 | 2 | 3

    const rawVoucher = apiPoi.voucher
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
      id: apiPoi.id ?? poiId ?? 'unknown',
      name: apiPoi.name ?? 'POI',
      category: (apiPoi as any).category ?? 'food',
      imageUrl: apiPoi.imageUrl ?? apiPoi.image_url,
      lat,
      lng,
      rating: Number(rating),
      priceLevel,
      tags: apiPoi.tags ?? [],
      short: {
        vi: shortFromApi.vi ?? fallbackShort.vi,
        en: shortFromApi.en ?? fallbackShort.en,
        ja: shortFromApi.ja ?? fallbackShort.ja,
        zh: shortFromApi.zh ?? fallbackShort.zh,
        ko: shortFromApi.ko ?? fallbackShort.ko,
      },
      menuHighlights: apiPoi.menuHighlights ?? apiPoi.menu_highlights ?? [],
      voucher,
      reviews: normalizedReviews,
    }
  }, [apiPoi, poiId])

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
