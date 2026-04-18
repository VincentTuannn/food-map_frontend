/**
 * SidebarPanel.tsx
 *
 * Sidebar thống nhất thay thế:
 *   1. Popup POI (khi click marker) → hiển thị trong sidebar luôn
 *   2. Tour stops list (expandable)
 *   3. Step-by-step directions (Google Maps style)
 *
 * Cách dùng trong MapPage:
 *   - Bỏ hoàn toàn <Popup> trong MapView
 *   - Khi click marker → setSelectedPoi(poi) + setShowSidebar(true) + setSidebarMode('poi')
 *   - Import <SidebarPanel> và truyền props
 */

import { useState, useEffect } from 'react'
import {
  MapPin, Headphones, Navigation, X, Star,
  Utensils, Coffee, Camera, Ticket, Clock, ArrowUp,
  CornerUpRight, CornerUpLeft, RotateCw, Route as RouteIcon,
  ChevronDown, ChevronLeft, Trash2, AlertCircle,
  Ticket as VoucherIcon, Share2, Phone, Globe, Heart,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { createOrUpdateReview } from '../../../api/services/reviews';

import { apiFetch } from '../../../api/http';
import { getPoiContent } from '../../../api/services/content';
import { getReviewsByPoi } from '../../../api/services/reviews';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface PoiContent {
  id: string;
  poi_id: string;
  language_code: string;
  audio_url?: string;
  description?: string;
}

export interface SidebarPoi {
  id?: string
  name: string
  address?: string
  description?: string
  short?: Record<string, string>
  category?: 'food' | 'drink' | 'sight' | string
  rating?: number | string
  imageUrl?: string
  lat?: number
  lng?: number
  audioDuration?: number
  audioUrl?: string
  phone?: string
  website?: string
  hours?: string
  priceRange?: string
  PoiContents?: PoiContent[]
}

export interface TourStop extends SidebarPoi {
  order?: number
  status?: 'visited' | 'current' | 'upcoming'
}

interface RouteStep {
  maneuver: { instruction: string; type?: string; modifier?: string }
  distance: number
  duration?: number
}

export interface RouteData {
  destinationName?: string
  duration: number
  distance: number
  legs: { steps: RouteStep[] }[]
}

export type SidebarMode = 'poi' | 'tour' | 'directions' | 'empty'

export interface SidebarPanelProps {
  mode: SidebarMode
  // POI mode
  selectedPoi?: SidebarPoi | null
  language?: string
  // Tour mode
  tourPoints?: TourStop[]
  // Directions mode
  routeData?: RouteData | null
  // Callbacks
  isTtsLoading?: boolean
  isRouting?: boolean
  onClose?: () => void
  onListen?: (poi: SidebarPoi) => void
  onGetDirections?: (poi: SidebarPoi) => void
  onEndTour?: () => void
  onVoucher?: (poi: SidebarPoi) => void
  onShare?: (poi: SidebarPoi) => void
  t?: (key: string, fallback: string) => string
  centerToUser: () => void
  // Responsive
  isMobile?: boolean
  // Empty state POI list
  filteredPois?: SidebarPoi[]
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getCategoryMeta(cat?: string) {
  switch (cat) {
    case 'food':  return { icon: <Utensils size={11} />, label: 'Ẩm thực',  bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', dot: '#F97316' }
    case 'drink': return { icon: <Coffee size={11} />,   label: 'Cà phê',   bg: 'bg-amber-100',  text: 'text-amber-700',  border: 'border-amber-200',  dot: '#F59E0B' }
    case 'sight': return { icon: <Camera size={11} />,   label: 'Tham quan',bg: 'bg-sky-100',    text: 'text-sky-700',    border: 'border-sky-200',    dot: '#0EA5E9' }
    default:      return { icon: <Ticket size={11} />,   label: 'Địa điểm', bg: 'bg-gray-100',   text: 'text-gray-600',   border: 'border-gray-200',   dot: '#9CA3AF' }
  }
}

function ManeuverIcon({ type, modifier, size = 15 }: { type?: string; modifier?: string; size?: number }) {
  if (type === 'arrive')  return <MapPin size={size} />
  if (type === 'depart')  return <Navigation size={size} />
  if (type === 'turn') {
    if (modifier?.includes('left'))  return <CornerUpLeft size={size} />
    if (modifier?.includes('right')) return <CornerUpRight size={size} />
    if (modifier?.includes('uturn')) return <RotateCw size={size} />
  }
  return <ArrowUp size={size} />
}

function fmtDist(m: number) {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`
}
function fmtTime(s: number) {
  const m = Math.round(s / 60)
  return m < 60 ? `${m} phút` : `${Math.floor(m / 60)}g ${m % 60}p`
}

// Animated counter
function CountUp({ to, decimals = 0 }: { to: number; decimals?: number }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let cur = 0
    const step = to / 28
    const id = setInterval(() => {
      cur = Math.min(cur + step, to)
      setVal(cur)
      if (cur >= to) clearInterval(id)
    }, 18)
    return () => clearInterval(id)
  }, [to])
  return <>{decimals > 0 ? val.toFixed(decimals) : Math.round(val)}</>
}

// ─── POI Hero Image ─────────────────────────────────────────────────────────────

function PoiHeroImage({ poi, onClose }: { poi: SidebarPoi; onClose?: () => void }) {
  const [imgError, setImgError] = useState(false)
  const catMeta = getCategoryMeta(poi.category)

  return (
    <div className="relative w-full h-[180px] shrink-0 overflow-hidden rounded-t-2xl">
      {poi.imageUrl && !imgError ? (
        <img
          src={poi.imageUrl}
          alt={poi.name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${catMeta.dot}22, ${catMeta.dot}44)` }}
        >
          <div className="flex flex-col items-center gap-2 opacity-60">
            <MapPin size={40} style={{ color: catMeta.dot }} />
            <span className="text-[12px] font-bold" style={{ color: catMeta.dot }}>{catMeta.label}</span>
          </div>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white rounded-full transition-all active:scale-90"
        >
          <X size={15} />
        </button>
      )}

      {/* Category badge top-left */}
      <div className="absolute top-3 left-3">
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm border ${catMeta.bg} ${catMeta.text} ${catMeta.border}`}>
          {catMeta.icon} {catMeta.label}
        </span>
      </div>

      {/* Name at bottom */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-6">
        <h3 className="text-[20px] font-extrabold text-white leading-tight drop-shadow-lg line-clamp-2">
          {poi.name}
        </h3>
        {poi.address && (
          <p className="text-[11px] text-white/70 mt-0.5 flex items-center gap-1 line-clamp-1">
            <MapPin size={9} className="shrink-0" /> {poi.address}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── POI Detail Panel (thay thế Popup) ─────────────────────────────────────────


function POIDetailPanel({
  poi, language = 'vi', isTtsLoading = false, isRouting = false,
  onClose, onListen, onGetDirections, onVoucher, onShare,
}: {
  poi: SidebarPoi
  language?: string
  isTtsLoading?: boolean
  isRouting?: boolean
  onClose?: () => void
  onListen?: (poi: SidebarPoi) => void
  onGetDirections?: (poi: SidebarPoi) => void
  onVoucher?: (poi: SidebarPoi) => void
  onShare?: (poi: SidebarPoi) => void
}) {
  const [liked, setLiked] = useState(false);
  const [poiData, setPoiData] = useState<SidebarPoi | null>(poi);
  const [description, setDescription] = useState<string | undefined>(poi.short?.[language] ?? poi.description);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  // Review submission state
  const [reviewText, setReviewText] = useState('');
  const [reviewStars, setReviewStars] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // i18n
  const { t } = useTranslation();

  // Thông tin đầy đủ POI, ưu tiên lấy từ PoiContents đúng ngôn ngữ
  useEffect(() => {
    let isMounted = true;
    async function fetchPoiAndContent() {
      try {
        // Fetch POI details
        const poiRes = await apiFetch(`/pois/${poi.id}`);
        if (isMounted && poiRes && typeof poiRes === 'object' && 'data' in poiRes && poiRes.data) {
          // Cast to SidebarPoi to help TS
          const fullPoi = { ...poi, ...poiRes.data } as SidebarPoi;
          setPoiData(fullPoi);
          // Lấy description đúng ngôn ngữ từ PoiContents nếu có
          const langNorm = (language ?? '').toLowerCase();
          let desc = undefined;
          if (Array.isArray(fullPoi.PoiContents)) {
            // Tìm đúng language_code
            const found = fullPoi.PoiContents.find((c) => (c.language_code || '').toLowerCase().startsWith(langNorm));
            if (found && found.description) desc = found.description;
          }
          setDescription(desc ?? poi.short?.[language] ?? poi.description);
        } else {
          setPoiData(poi);
          setDescription(poi.short?.[language] ?? poi.description);
        }
      } catch {
        // fallback to initial props
        if (isMounted) {
          setPoiData(poi);
          setDescription(poi.short?.[language] ?? poi.description);
        }
      }
    }
    fetchPoiAndContent();
    return () => { isMounted = false; };
  }, [poi.id, language]);

  // Fetch reviews for POI
  useEffect(() => {
    let isMounted = true;
    async function fetchReviews() {
      setIsLoadingReviews(true);
      try {
        const items = await getReviewsByPoi(poi.id!);
        if (isMounted) setReviews(items || []);
      } catch {
        if (isMounted) setReviews([]);
      } finally {
        if (isMounted) setIsLoadingReviews(false);
      }
    }
    if (poi.id) fetchReviews();
    return () => { isMounted = false; };
  }, [poi.id]);

  // Submit review handler
  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await createOrUpdateReview({
        poi_id: poi.id!,
        rating: reviewStars,
        comment: reviewText,
      });
      setReviewText('');
      setReviewStars(5);
      // Refresh reviews
      const items = await getReviewsByPoi(poi.id!);
      setReviews(items || []);
    } catch (err) {
      setSubmitError(t('tourist.poi.writeReviewError', 'Gửi đánh giá thất bại.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col h-full" style={{ animation: 'sidebarSlideIn 0.3s cubic-bezier(0.22,1,0.36,1) both' }}>
      {/* Hero */}
      <PoiHeroImage poi={poiData || poi} onClose={onClose} />

      {/* Scrollable body */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        {/* Quick stats strip */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
          {poiData?.rating && (
            <div className="flex items-center gap-1">
              <Star size={13} className="text-amber-400 fill-amber-400" />
              <span className="text-[13px] font-extrabold text-gray-800">{poiData.rating}</span>
            </div>
          )}
          {poiData?.hours && (
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
              <Clock size={11} />
              <span>{poiData.hours}</span>
            </div>
          )}
          {poiData?.priceRange && (
            <div className="text-[11px] text-gray-500 font-medium">{poiData.priceRange}</div>
          )}
          <button
            onClick={() => setLiked(l => !l)}
            className="ml-auto flex items-center justify-center w-8 h-8 rounded-full transition-all active:scale-90"
            style={{ background: liked ? '#FFF1F0' : '#F5F5F5' }}
          >
            <Heart
              size={15}
              className={`transition-all duration-200 ${liked ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-400'}`}
            />
          </button>
        </div>

        {/* Description */}
        {description && (
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-[13px] text-gray-600 leading-relaxed">{description}</p>
          </div>
        )}

        {/* Info rows */}
        {(poiData?.address || poiData?.phone || poiData?.website) && (
          <div className="px-4 py-3 border-b border-gray-100 space-y-2.5">
            {poiData?.address && (
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={13} className="text-gray-500" />
                </div>
                <span className="text-[12px] text-gray-700 leading-relaxed flex-1">{poiData.address}</span>
              </div>
            )}
            {poiData?.phone && (
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <Phone size={13} className="text-gray-500" />
                </div>
                <a href={`tel:${poiData.phone}`} className="text-[12px] text-blue-600 font-medium hover:underline">{poiData.phone}</a>
              </div>
            )}
            {poiData?.website && (
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <Globe size={13} className="text-gray-500" />
                </div>
                <a href={poiData.website} target="_blank" rel="noopener noreferrer" className="text-[12px] text-blue-600 font-medium hover:underline truncate">{poiData.website}</a>
              </div>
            )}
          </div>
        )}

        {/* Reviews section */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="font-bold text-[15px] mb-2 flex items-center gap-2">
            <Star size={15} className="text-amber-400" />
            {t('tourist.poi.reviewsTitle', 'Đánh giá')}
          </div>
          {isLoadingReviews && (
            <div className="text-gray-400 text-[13px] italic">{t('tourist.poi.loadingReviews', 'Đang tải đánh giá...')}</div>
          )}
          {!isLoadingReviews && reviews.length === 0 && (
            <div className="text-gray-400 text-[13px] italic">{t('tourist.poi.noReviews', 'Chưa có đánh giá nào.')}</div>
          )}
          {!isLoadingReviews && reviews.length > 0 && (
            <div className="flex flex-col gap-2">
              {reviews.map((r, idx) => (
                <div key={r.id ?? idx} className="bg-white/80 rounded-xl p-3 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-800 text-[13px]">{r.author ?? t('tourist.poi.user', 'Người dùng')}</span>
                    <span className="flex items-center gap-1 text-amber-500 text-[12px] font-bold">
                      <Star size={13} className="inline-block" /> {r.stars ?? r.rating ?? 0}/5
                    </span>
                  </div>
                  <div className="text-gray-600 text-[13px]">{r.text ?? r.comment ?? ''}</div>
                  {r.createdAt || r.created_at ? (
                    <div className="text-gray-400 text-[11px] mt-1">{new Date(r.createdAt || r.created_at).toLocaleString()}</div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
          {/* Review submission form */}
          <form className="mt-3 flex flex-col gap-2" onSubmit={handleSubmitReview}>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold">{t('tourist.poi.writeReview', 'Viết đánh giá')}:</span>
              {[1,2,3,4,5].map(star => (
                <button
                  type="button"
                  key={star}
                  className={`p-0 m-0 bg-transparent border-none focus:outline-none ${reviewStars >= star ? 'text-amber-400' : 'text-gray-300'}`}
                  onClick={() => setReviewStars(star)}
                  aria-label={t('tourist.poi.star', 'Sao') + ' ' + star}
                >
                  <Star size={18} fill={reviewStars >= star ? '#FBBF24' : 'none'} />
                </button>
              ))}
            </div>
            <textarea
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] resize-none focus:ring-2 focus:ring-amber-400"
              rows={2}
              maxLength={300}
              placeholder={t('tourist.poi.writeReviewPlaceholder', 'Chia sẻ cảm nhận của bạn...')}
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              required
              disabled={isSubmitting}
            />
            {submitError && <div className="text-red-500 text-[12px]">{submitError}</div>}
            <button
              type="submit"
              className="self-end px-4 py-1.5 rounded-lg bg-amber-500 text-white font-bold text-[13px] mt-1 disabled:opacity-60"
              disabled={isSubmitting || !reviewText.trim()}
            >
              {isSubmitting ? t('tourist.poi.sending', 'Đang gửi...') : t('tourist.poi.submitReview', 'Gửi đánh giá')}
            </button>
          </form>
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div className="shrink-0 p-3 bg-white border-t border-gray-100 rounded-b-2xl overflow-hidden">
        {/* Primary: Directions + Listen */}
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => onGetDirections?.(poiData || poi)}
            disabled={isRouting}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-[13px] transition-all active:scale-95 shadow-md disabled:opacity-60"
            style={{
              background: 'linear-gradient(135deg, #FF7A45, #FF512F)',
              color: '#fff',
              boxShadow: '0 4px 14px rgba(255,107,53,0.35)',
            }}
          >
            {isRouting
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Navigation size={16} />
            }
            {isRouting ? t('tourist.map.drawing', 'Đang vẽ…') : t('tourist.map.navigateTo', 'Chỉ đường')}
          </button>

          <button
            onClick={() => onListen?.(poiData || poi)}
            disabled={isTtsLoading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-[13px] transition-all active:scale-95 border disabled:opacity-60"
            style={{
              background: 'linear-gradient(135deg, #7C3AED22, #6D28D922)',
              color: '#6D28D9',
              borderColor: '#DDD6FE',
            }}
          >
            {isTtsLoading
              ? <div className="w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
              : <Headphones size={16} />
            }
            {isTtsLoading ? t('tourist.map.loading', 'Đang tải…') : t('tourist.map.listen', 'Thuyết minh')}
          </button>
        </div>

        {/* Secondary: Voucher + Share */}
        <div className="flex gap-2">
          <button
            onClick={() => onVoucher?.(poiData || poi)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold text-[12px] transition-all active:scale-95 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
          >
            <VoucherIcon size={13} />
            {t('tourist.poi.voucherTitle', 'Nhận Voucher')}
          </button>
          <button
            onClick={() => onShare?.(poiData || poi)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold text-[12px] transition-all active:scale-95 bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
          >
            <Share2 size={13} />
            {t('tourist.poi.share', 'Chia sẻ')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tour Stop Card ─────────────────────────────────────────────────────────────

function TourStopCard({
  poi, index, isExpanded, isVisible, onToggle, onListen, isTtsLoading,
}: {
  poi: TourStop; index: number; total: number
  isExpanded: boolean; isVisible: boolean
  onToggle: () => void
  onListen: (poi: TourStop) => void
  isTtsLoading: boolean
}) {
  const catMeta = getCategoryMeta(poi.category)
  const isVisited = poi.status === 'visited'
  const isCurrent = poi.status === 'current'

  return (
    <div
      className="relative z-10 mb-2.5"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(14px)',
        transition: `opacity 0.38s ease ${index * 55}ms, transform 0.38s ease ${index * 55}ms`,
      }}
    >
      {/* Header row */}
      <div
        onClick={onToggle}
        className={[
          'flex items-center gap-3 px-3 py-3 rounded-2xl cursor-pointer select-none group',
          'border transition-all duration-250',
          isExpanded
            ? 'rounded-b-none bg-white border-[#FF6B35]/25 shadow-lg'
            : isVisited
            ? 'bg-emerald-50/50 border-emerald-100 hover:border-emerald-200'
            : 'bg-white/80 border-white/60 hover:bg-white hover:border-gray-100 hover:shadow-sm',
        ].join(' ')}
      >
        {/* Dot */}
        <div className={[
          'flex items-center justify-center w-9 h-9 rounded-full shrink-0',
          'border-[2.5px] font-extrabold text-[13px] transition-all duration-250 shadow-sm',
          isVisited
            ? 'bg-emerald-500 border-emerald-400 text-white'
            : isCurrent
            ? 'bg-[#FF6B35] border-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/30'
            : isExpanded
            ? 'bg-[#FF6B35]/10 border-[#FF6B35]/40 text-[#FF6B35]'
            : 'bg-white border-gray-200 text-gray-400 group-hover:border-[#FF6B35]/40 group-hover:text-[#FF6B35]',
        ].join(' ')}>
          {isVisited ? '✓' : index + 1}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className={`font-bold text-[13px] leading-snug truncate transition-colors duration-200
            ${isCurrent ? 'text-[#FF6B35]' : isVisited ? 'text-gray-400 line-through' : isExpanded ? 'text-[#FF6B35]' : 'text-gray-800 group-hover:text-[#FF6B35]'}`}>
            {poi.name}
          </div>
          {poi.address && (
            <div className="text-[10px] text-gray-400 truncate mt-0.5">{poi.address}</div>
          )}
          {poi.audioDuration && !isVisited && (
            <div className="flex items-center gap-1 text-[10px] text-violet-500 font-semibold mt-0.5">
              <Headphones size={8} /> ~{poi.audioDuration}s
            </div>
          )}
        </div>

        <ChevronDown
          size={16}
          className={`shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#FF6B35]' : 'text-gray-300 group-hover:text-[#FF6B35]/50'}`}
        />
      </div>

      {/* Expanded body */}
      <div
        className="overflow-hidden rounded-b-2xl border border-t-0 bg-white"
        style={{
          borderColor: isExpanded ? 'rgba(255,107,53,0.2)' : 'transparent',
          maxHeight: isExpanded ? 360 : 0,
          opacity: isExpanded ? 1 : 0,
          transition: 'max-height 0.4s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease',
        }}
      >
        <div className="px-4 pt-3 pb-4">

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${catMeta.bg} ${catMeta.text} ${catMeta.border}`}>
              {catMeta.icon} {catMeta.label}
            </span>
            {poi.rating && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                <Star size={8} fill="currentColor" /> {poi.rating}
              </span>
            )}
          </div>

          {/* Description */}
          {poi.description && (
            <p className="text-[12px] text-gray-600 leading-relaxed mb-3 pl-3 border-l-2 border-[#FF6B35]/25">
              {poi.description}
            </p>
          )}

          {/* Buttons */}
          <button
            onClick={() => onListen(poi)}
            disabled={isTtsLoading || isVisited}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-[12px] transition-all active:scale-95 disabled:opacity-50"
            style={{
              background: isVisited ? '#F3F4F6' : 'linear-gradient(135deg, #7C3AED, #6D28D9)',
              color: isVisited ? '#9CA3AF' : '#fff',
              boxShadow: isVisited ? 'none' : '0 3px 10px rgba(109,40,217,0.3)',
            }}
          >
            {isTtsLoading
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Headphones size={14} />
            }
            {isVisited ? 'Đã ghé thăm' : 'Nghe thuyết minh'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Direction Step Card (Google Maps style) ────────────────────────────────────

function DirectionStep({
  step, idx, total, isActive, isVisible, onClick,
}: {
  step: RouteStep; idx: number; total: number
  isActive: boolean; isVisible: boolean; onClick: () => void
}) {
  const isLast  = idx === total - 1
  const isFirst = idx === 0
  const accent  = isLast ? '#10B981' : isFirst ? '#3B82F6' : '#FF6B35'
  const { type, modifier } = step.maneuver

  return (
    <div
      onClick={onClick}
      className="flex items-start gap-3 mb-2.5 cursor-pointer group z-10 relative"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateX(0)' : 'translateX(-10px)',
        transition: `opacity 0.32s ease ${idx * 40}ms, transform 0.32s ease ${idx * 40}ms`,
      }}
    >
      {/* Icon */}
      <div
        className="flex items-center justify-center w-9 h-9 rounded-full shrink-0 mt-0.5 border-[2.5px] border-white shadow-md transition-all duration-250"
        style={{
          background: isActive ? accent : `${accent}18`,
          color: isActive ? '#fff' : accent,
          boxShadow: isActive ? `0 4px 14px ${accent}40` : undefined,
          transform: isActive ? 'scale(1.08)' : undefined,
        }}
      >
        <ManeuverIcon type={type} modifier={modifier} size={14} />
      </div>

      {/* Card */}
      <div
        className="flex-1 p-3 rounded-2xl border transition-all duration-250 group-hover:shadow-sm"
        style={{
          background: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
          borderColor: isActive ? `${accent}35` : 'rgba(255,255,255,0.6)',
          boxShadow: isActive ? `0 4px 16px ${accent}12` : undefined,
        }}
      >
        <p className={`font-semibold text-[12.5px] leading-snug ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>
          {step.maneuver.instruction}
        </p>
        <div className="flex items-center gap-3 mt-1.5">
          {step.distance > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-bold" style={{ color: accent }}>
              <ArrowUp size={8} /> {fmtDist(step.distance)}
            </span>
          )}
          {step.duration != null && step.duration > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
              <Clock size={8} /> {fmtTime(step.duration)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── MAIN SIDEBAR PANEL ─────────────────────────────────────────────────────────

export function SidebarPanel({
  mode, selectedPoi, language = 'vi',
  tourPoints = [], routeData,
  isTtsLoading = false, isRouting = false,
  onClose, onListen, onGetDirections, onEndTour, onVoucher, onShare,
  t = (_k, fb) => fb,
  isMobile = false,
  filteredPois = [],
}: SidebarPanelProps) {

  const [expandedStop,   setExpandedStop]   = useState<number>(0)
  const [activeStep,     setActiveStep]     = useState<number>(0)
  const [stopsVisible,   setStopsVisible]   = useState(false)
  const [stepsVisible,   setStepsVisible]   = useState(false)
const [emptyTab, setEmptyTab] = useState<'nearby'|'directions'>('nearby');
  useEffect(() => {
    const id = setTimeout(() => { setStopsVisible(true); setStepsVisible(true) }, 60)
    return () => clearTimeout(id)
  }, [mode, selectedPoi?.id])

  useEffect(() => { setActiveStep(0) }, [routeData])

  const steps = routeData?.legs?.[0]?.steps ?? []

  // ── POI detail mode ──────────────────────────────────────────────────────────
  if (mode === 'poi' && selectedPoi) {
    return (
      <div className="relative flex flex-col h-full" style={{ animation: 'sidebarSlideIn 0.3s ease both' }}>
        {/* Responsive top bar/close */}
        {isMobile ? (
          <div className="w-full h-2.5 flex items-center justify-center mb-1">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mt-2 mb-1" />
          </div>
        ) : (
          <button
            className="absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center bg-white/80 hover:bg-white text-gray-500 rounded-full shadow-sm transition-all"
            onClick={onClose}
            aria-label="Đóng sidebar"
          >
            <X size={22} />
          </button>
        )}
        <div className="flex-1 min-h-0 flex flex-col">
          <POIDetailPanel
            poi={selectedPoi}
            language={language}
            isTtsLoading={isTtsLoading}
            isRouting={isRouting}
            onClose={onClose}
            onListen={onListen}
            onGetDirections={onGetDirections}
            onVoucher={onVoucher}
            onShare={onShare}
          />
        </div>
      </div>
    )
  }

  // ── Tour stops mode ──────────────────────────────────────────────────────────
  if (mode === 'tour' && tourPoints.length > 0) {
    return (
      <div className="relative flex flex-col h-full" style={{ animation: 'sidebarSlideIn 0.3s ease both' }}>
        {/* Responsive top bar/close */}
        {isMobile ? (
          <div className="w-full h-2.5 flex items-center justify-center mb-1">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mt-2 mb-1" />
          </div>
        ) : (
          <button
            className="absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center bg-white/80 hover:bg-white text-gray-500 rounded-full shadow-sm transition-all"
            onClick={onClose}
            aria-label="Đóng sidebar"
          >
            <X size={22} />
          </button>
        )}

        {/* Header */}
        <div className="shrink-0 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#FF7A45,#FF512F)' }}>
            <RouteIcon size={15} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-extrabold text-[14px] text-gray-900 leading-none">
              {t('tourist.map.tourRoute', 'Lộ trình hành trình')}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">{tourPoints.length} điểm dừng</div>
          </div>
        </div>

        {/* Stops list */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-3 pt-3 pb-2 relative">
          {/* Timeline line */}
          <div
            className="absolute left-[27px] top-6 w-[2px] rounded-full z-0 pointer-events-none"
            style={{
              height: 'calc(100% - 48px)',
              background: 'linear-gradient(to bottom, #FF6B35 0%, #a78bfa 50%, #10B981 100%)',
              opacity: 0.18,
            }}
          />
          {tourPoints.map((poi, idx) => (
            <TourStopCard
              key={poi.id ?? idx}
              poi={poi} index={idx} total={tourPoints.length}
              isExpanded={expandedStop === idx}
              isVisible={stopsVisible}
              onToggle={() => setExpandedStop(expandedStop === idx ? -1 : idx)}
              onListen={p => onListen?.(p)}
              isTtsLoading={isTtsLoading}
            />
          ))}
        </div>

        {/* End tour */}
        <div className="shrink-0 p-3 border-t border-gray-100">
          <button
            onClick={onEndTour}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white font-extrabold text-[14px] transition-all active:scale-[0.98] shadow-lg"
          >
            <Trash2 size={15} />
            {t('tourist.map.endTour', 'Kết thúc Hành trình')}
          </button>
        </div>
      </div>
    )
  }

  // ── Directions mode ──────────────────────────────────────────────────────────
  if (mode === 'directions' && routeData && steps.length > 0) {
    return (
      <div className="relative flex flex-col h-full" style={{ animation: 'sidebarSlideIn 0.3s ease both' }}>
        {/* Responsive top bar/close */}
        {isMobile ? (
          <div className="w-full h-2.5 flex items-center justify-center mb-1">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mt-2 mb-1" />
          </div>
        ) : (
          <button
            className="absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center bg-white/80 hover:bg-white text-gray-500 rounded-full shadow-sm transition-all"
            onClick={onClose}
            aria-label="Đóng sidebar"
          >
            <X size={22} />
          </button>
        )}

        {/* Summary card */}
        <div
          className="shrink-0 mx-3 mt-3 mb-3 rounded-2xl overflow-hidden shadow-xl"
          style={{ background: 'linear-gradient(135deg, #FF7A45 0%, #FF512F 55%, #1a1a2e 100%)' }}
        >
          {/* Back + destination */}
          <div className="flex items-center gap-2 px-3 pt-3 pb-0">
            {onClose && (
              <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-all active:scale-90">
                <ChevronLeft size={15} />
              </button>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Đến</div>
              <div className="text-[15px] font-extrabold text-white line-clamp-1">{routeData.destinationName}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[22px] font-black text-white leading-none">
                <CountUp to={Math.round(routeData.duration / 60)} /> phút
              </div>
              <div className="text-[11px] text-white/70"><CountUp to={parseFloat((routeData.distance / 1000).toFixed(1))} decimals={1} /> km</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="px-3 pt-2 pb-3">
            <div className="flex justify-between text-[10px] text-white/50 font-semibold mb-1">
              <span>Đi bộ</span>
              <span>Bước {activeStep + 1}/{steps.length}</span>
            </div>
            <div className="h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-3 pb-2 relative">
          {/* Timeline */}
          <div
            className="absolute left-[27px] top-4 w-[2px] rounded-full z-0 pointer-events-none"
            style={{
              height: 'calc(100% - 32px)',
              background: 'linear-gradient(to bottom, #3B82F6, #FF6B35 50%, #10B981)',
              opacity: 0.18,
            }}
          />
          {steps.map((step, idx) => (
            <DirectionStep
              key={idx} step={step} idx={idx} total={steps.length}
              isActive={activeStep === idx}
              isVisible={stepsVisible}
              onClick={() => setActiveStep(idx)}
            />
          ))}
        </div>

        {/* Prev / Next */}
        <div className="shrink-0 p-3 border-t border-gray-100 flex gap-2">
          <button
            onClick={() => setActiveStep(s => Math.max(0, s - 1))}
            disabled={activeStep === 0}
            className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-bold text-[13px] transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            ‹ Trước
          </button>
          <button
            onClick={() => setActiveStep(s => Math.min(steps.length - 1, s + 1))}
            disabled={activeStep === steps.length - 1}
            className="flex-1 py-3 rounded-2xl font-bold text-[13px] text-white transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
            style={{ background: 'linear-gradient(135deg,#FF7A45,#FF512F)', boxShadow: '0 4px 12px rgba(255,107,53,0.3)' }}
          >
            Tiếp ›
          </button>
        </div>
      </div>
    )
  }

  // ── Empty state with tabs ───────────────────────────────────────────────────
  return (
    <div className="relative flex flex-col h-full" style={{ animation: 'sidebarSlideIn 0.3s ease both' }}>
        {/* Responsive top bar/close */}
        {isMobile ? (
          <div className="w-full h-2.5 flex items-center justify-center mb-1">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mt-2 mb-1" />
          </div>
        ) : (
          <button
            className="absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center bg-white/80 hover:bg-white text-gray-500 rounded-full shadow-sm transition-all"
            onClick={onClose}
            aria-label="Đóng sidebar"
          >
            <X size={22} />
          </button>
        )}

      {/* Tabs */}
      <div className="shrink-0 px-5 py-3">
        <div className="flex bg-gray-200/60 p-1 rounded-xl relative shadow-inner">
          {/* Cục highlight trượt */}
          <div 
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-transform duration-300 ease-out"
            style={{ transform: emptyTab === 'nearby' ? 'translateX(0)' : 'translateX(100%)' }}
          />
          <button
            className={`flex-1 py-2.5 rounded-lg font-bold text-[13px] transition-colors z-10 flex items-center justify-center gap-2 ${emptyTab === 'nearby' ? 'text-emerald-700' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setEmptyTab('nearby')}
          >
            <MapPin size={16} /> Gần tôi
          </button>
          <button
            className={`flex-1 py-2.5 rounded-lg font-bold text-[13px] transition-colors z-10 flex items-center justify-center gap-2 ${emptyTab === 'directions' ? 'text-emerald-700' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setEmptyTab('directions')}
          >
            <Navigation size={16} /> Chỉ đường
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 custom-scrollbar">
        {emptyTab === 'nearby' && (
          <>
            <h3 className="text-lg font-extrabold mb-4 text-emerald-800 flex items-center gap-2 mt-2">
              <MapPin size={20}/> Địa điểm gần bạn
            </h3>
            {(!Array.isArray(filteredPois) || filteredPois.length === 0) ? (
              <div className="text-gray-500 italic text-center mt-8 flex flex-col items-center gap-2">
                <AlertCircle size={32} className="text-gray-300 mx-auto" />
                Không tìm thấy địa điểm phù hợp quanh bạn.
              </div>
            ) : (
              <ul className="space-y-3 animate-in fade-in duration-300">
                {filteredPois.map((poi) => (
                  <li key={poi.id} className="flex gap-4 p-3 bg-white/80 hover:bg-white rounded-2xl shadow-sm border border-white/60 transition-all cursor-pointer hover:shadow-md hover:-translate-y-0.5 group" >
                    <div className="flex items-center justify-center w-12 h-12 bg-emerald-50 rounded-full text-2xl group-hover:scale-110 transition-transform">
                      {poi.category === 'food' ? '🍜' : poi.category === 'drink' ? '☕' : '📸'}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-800 line-clamp-1">{poi.name}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">{poi.short?.[language] || poi.description || 'Chưa có mô tả'}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        {emptyTab === 'directions' && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 mt-12">
            <Navigation size={36} className="text-emerald-400 mb-2" />
            <p className="text-[15px] font-bold text-gray-600">Chưa có địa điểm chỉ đường</p>
            <p className="text-[13px] text-gray-400 leading-relaxed max-w-xs mx-auto">
              Hãy chọn một địa điểm trên bản đồ hoặc bắt đầu một tour để xem lộ trình chỉ đường tại đây.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── CSS (inject vào global hoặc <style>) ───────────────────────────────────────
// Thêm vào file CSS global hoặc trong component cha:

export const SIDEBAR_CSS = `
  @keyframes sidebarSlideIn {
    from { opacity: 0; transform: translateX(-8px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255,107,53,0.25);
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
`