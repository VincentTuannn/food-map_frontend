import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../../shared/i18n/i18n'
import { AppShell } from '../../shared/ui/AppShell';
import { useAppStore } from '../../shared/store/appStore';
import {
  getMyTour,
  removePoiFromMyTour,
  updateMyTourPoiOrder,
  addPoiToMyTour,
} from '../../api/services/userTours';
import { getPoiContent, type TtsOptions } from '../../api/services/content';
import { apiFetch } from '../../api/http';
import AudioPlayer from './components/AudioPlayer';

// ─── Types ────────────────────────────────────────────────────────────────────


interface ProcessedStop {
  id: string;
  poi_id?: string;
  order_index: number;
  status: 'visited' | 'current' | 'upcoming';
  name: string;
  emoji: string;
  address: string;
  time: string;
  rating: string;
  // Từ API content
  desc?: string;
  audioUrl?: string;
  audioDuration?: number;
  contentLoaded: boolean;
  contentLoading: boolean;
  // Raw Poi data
  Poi?: any;
}


// ─── Helpers ──────────────────────────────────────────────────────────────────

const STOP_EMOJIS = ['🍜', '🥖', '☕', '🍚', '🍡', '🫓', '🍲', '🌃', '🦀', '🐚'];

function getEmoji(index: number): string {
  return STOP_EMOJIS[index % STOP_EMOJIS.length];
}

const STOP_TIMES = ['07:00', '08:00', '08:30', '11:00', '14:00', '15:30', '17:30', '20:00'];

async function share(data: { title: string; text: string; url: string }) {
  try {
    if (navigator.share) {
      await navigator.share(data);
    } else {
      await navigator.clipboard.writeText(data.url);
      return 'copied';
    }
  } catch {
    // user cancelled
  }
  return 'shared';
}

// AudioPlayer is now imported from ./components/AudioPlayer

// ─── Voucher Modal ────────────────────────────────────────────────────────────

interface VoucherModalProps {
  stop: ProcessedStop;
  onClose: () => void;
}

function VoucherModal({ stop, onClose }: VoucherModalProps) {
  const code = `FOODTOUR-${stop.id.slice(0, 6).toUpperCase()}`;
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6 shadow-2xl animate-in slide-in-from-bottom-4 duration-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[18px] font-extrabold text-gray-900">🎟 {t('tourDetail.voucher.title', 'Voucher độc quyền')}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            {/* ...existing code... */}
          </button>
        </div>

        <div className="bg-gradient-to-r from-[#FF7A45] to-[#FF512F] rounded-2xl p-5 text-white text-center mb-4">
          <div className="text-[11px] font-bold uppercase tracking-widest opacity-80 mb-1">{t('tourDetail.voucher.for_you', 'Dành riêng cho bạn')}</div>
          <div className="text-3xl font-extrabold mb-1">{/* ...existing code... */}</div>
          <div className="text-[13px] opacity-90">{t('tourDetail.voucher.discount', 'Giảm 10% cho lần ghé thăm này')}</div>
        </div>

        {/* ...existing code... */}
        <div className="relative border-2 border-dashed border-[#FF6B35]/40 rounded-xl p-4 mb-4 bg-orange-50/50">
          {/* ...existing code... */}
        </div>

        <p className="text-[12px] text-gray-400 text-center">
          {t('tourDetail.voucher.valid', 'Voucher có hiệu lực khi bạn ở trong bán kính 100m của địa điểm.')}
          <br />
          {t('tourDetail.voucher.expiry', 'Hết hạn sau 24 giờ.')}
        </p>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function MyTourDetailPage() {
  // Modal chọn POI
  const [showPoiModal, setShowPoiModal] = useState(false);
  const [poiList, setPoiList] = useState<any[]>([]);
  const [poiSearch, setPoiSearch] = useState('');
  const [poiLoading, setPoiLoading] = useState(false);

  // Animation state for smooth slide (for POI modal)
  const [modalOpen, setModalOpen] = useState(false);
  useEffect(() => {
    if (showPoiModal) {
      setTimeout(() => setModalOpen(true), 10);
    } else {
      setModalOpen(false);
    }
  }, [showPoiModal]);

  const navigate = useNavigate();
  const { tourId } = useParams();
  const nav = useNavigate();
  const showToast = useAppStore((s) => s.showToast);
  const setActiveTourForMap = useAppStore((s) => s.setActiveTourForMap);
  const language = useAppStore((s) => s.language ?? 'vi');
  const { t, } = useTranslation();

  const [tour, setTour] = useState<any | null>(null);
  const [tab, setTab] = useState<'overview' | 'stops' | 'ai' | 'reviews'>('overview');
  const [loading, setLoading] = useState(false);
  const [expandedStopIndex, setExpandedStopIndex] = useState<number | null>(null);

  // Edit state
  const [localStops, setLocalStops] = useState<ProcessedStop[]>([]);
  const [deletedStopIds, setDeletedStopIds] = useState<string[]>([]);
  const [isModified, setIsModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Audio player state
  const [audioPlayer, setAudioPlayer] = useState<{ url: string; name: string } | null>(null);
  // Voucher modal state
  const [voucherStop, setVoucherStop] = useState<ProcessedStop | null>(null);
  // Share loading
  const [isSharing, setIsSharing] = useState(false);

  // Drag refs for desktop
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  // Touch refs for mobile
  const touchStartY = useRef<number | null>(null);
  const touchStartIdx = useRef<number | null>(null);

  // ── Fetch tour ──────────────────────────────────────────────────────────────

  const loadTour = useCallback(() => {
    if (!tourId) return;
    setLoading(true);
    getMyTour(tourId)
      .then((res) => { if (res) setTour(res); })
      .catch(() => showToast({ title: t('tourDetail.toast.load_tour_error', 'Không tải được tour') }))
      .finally(() => setLoading(false));
  }, [tourId, showToast, t]);

  useEffect(() => { loadTour(); }, [loadTour]);

  // ── Format stops from tour data ─────────────────────────────────────────────

  useEffect(() => {
    if (!tour?.TourPois) return;
    const sorted = [...tour.TourPois].sort((a: any, b: any) => a.order_index - b.order_index);
    const formatted: ProcessedStop[] = sorted.map((p: any, i: number) => {
      const poi = p.Poi || {};
      return {
        id: p.id ?? `stop-${i}`,
        poi_id: p.poi_id ?? poi.id,
        order_index: p.order_index ?? i + 1,
        status: i === 0 ? 'visited' : i === 1 ? 'current' : 'upcoming',
        name: poi.name || `Điểm ${i + 1}`,
        emoji: getEmoji(i),
        address: poi.address || 'Vĩnh Khánh, Q.4',
        time: STOP_TIMES[i] ?? '15:00',
        rating: parseFloat(poi.average_rating) > 0 ? parseFloat(poi.average_rating).toFixed(1) : '4.5',
        // content sẽ load riêng
        desc: undefined,
        audioUrl: undefined,
        contentLoaded: false,
        contentLoading: false,
        Poi: poi,
      };
    });
    setLocalStops(formatted);
    setDeletedStopIds([]);
    setIsModified(false);
  }, [tour]);

  // ── Fetch POI content (description + audioUrl) khi expand stop ──────────────

  const loadStopContent = useCallback(async (index: number) => {
    const stop = localStops[index];
    console.log('Loading content for stop:', stop);
    if (!stop || stop.contentLoaded || stop.contentLoading) return;
    const poiId = stop.poi_id ?? stop.id;
    if (!poiId) return;

    // Mark loading
    setLocalStops(prev => prev.map((s, i) => i === index ? { ...s, contentLoading: true } : s));

    try {
      const ttsOpts: TtsOptions = { gender: 'female', preferCache: true };
      const res = await getPoiContent(poiId, language, ttsOpts);
      const data = (res as any)?.data ?? res;
      const description = data?.description ?? data?.text ?? undefined;
      const audioUrl    = data?.audio_url   ?? data?.audioUrl ?? undefined;

      setLocalStops(prev => prev.map((s, i) =>
        i === index
          ? { ...s, desc: description, audioUrl, contentLoaded: true, contentLoading: false }
          : s
      ));
    } catch {
      setLocalStops(prev => prev.map((s, i) =>
        i === index ? { ...s, contentLoaded: true, contentLoading: false } : s
      ));
    }
  }, [localStops, language]);

  // Khi expand stop → fetch content
  useEffect(() => {
    if (expandedStopIndex !== null) {
      loadStopContent(expandedStopIndex);
    }
  }, [expandedStopIndex]); // eslint-disable-line

  // ── Drag & drop ─────────────────────────────────────────────────────────────

  // Desktop drag sort
  const handleSort = () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const arr = [...localStops];
      const [dragged] = arr.splice(dragItem.current, 1);
      arr.splice(dragOverItem.current, 0, dragged);
      setLocalStops(arr);
      setIsModified(true);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  // Mobile touch sort
  const handleTouchStart = (idx: number, e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartIdx.current = idx;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null || touchStartIdx.current === null) return;
    const deltaY = e.touches[0].clientY - touchStartY.current;
    if (Math.abs(deltaY) > 40) {
      // Move up or down
      const direction = deltaY > 0 ? 1 : -1;
      const newIdx = touchStartIdx.current + direction;
      if (newIdx >= 0 && newIdx < localStops.length) {
        const arr = [...localStops];
        const [dragged] = arr.splice(touchStartIdx.current, 1);
        arr.splice(newIdx, 0, dragged);
        setLocalStops(arr);
        setIsModified(true);
        touchStartIdx.current = newIdx;
        touchStartY.current = e.touches[0].clientY;
      }
    }
  };
  const handleTouchEnd = () => {
    touchStartY.current = null;
    touchStartIdx.current = null;
  };

  // Mở modal chọn POI
  const handleAddPoi = async () => {
    setShowPoiModal(true);
    if (poiList.length === 0 && !poiLoading) {
      setPoiLoading(true);
      // Lấy radius từ cookie, nếu không có thì mặc định 50000
      const getRadiusFromCookie = () => {
        const match = document.cookie.match(/(?:^|; )radius=([^;]*)/);
        const val = match ? decodeURIComponent(match[1]) : '';
        const num = parseInt(val, 10);
        return !isNaN(num) && num > 0 ? num : 50000;
      };
      const radius = getRadiusFromCookie();
      // Lấy vị trí hiện tại của user
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          try {
            // apiFetch trả về data đã parse, không phải Response
            const data: any = await apiFetch(`/pois/nearby?lat=${lat}&lng=${lng}&radius=${radius}&limit=100`);
            if (data && Array.isArray(data.data)) {
              setPoiList(data.data);
              console.log('Nearby POIs list:', data.data);
            } else {
              setPoiList([]);
              console.warn('No POIs found in response:', data);
            }
          } catch (err) {
            setPoiList([]);
            console.error('Error fetching POIs:', err);
          } finally {
            setPoiLoading(false);
          }
        }, () => {
          fallbackFetchPois();
        });
      } else {
        fallbackFetchPois();
      }
    }
  };

  // Hàm fallback lấy POI với vị trí mặc định (Q.4)
  const fallbackFetchPois = async () => {
    // Lấy radius từ cookie, nếu không có thì mặc định 50000
    const getRadiusFromCookie = () => {
      const match = document.cookie.match(/(?:^|; )radius=([^;]*)/);
      const val = match ? decodeURIComponent(match[1]) : '';
      const num = parseInt(val, 10);
      return !isNaN(num) && num > 0 ? num : 50000;
    };
    const radius = getRadiusFromCookie();
    try {
      // apiFetch trả về data đã parse, không phải Response
      const data: any = await apiFetch(`/pois/nearby?lat=10.76485298975133&lng=106.59985033047423&radius=${radius}&limit=100`);
      setPoiList(Array.isArray(data?.data) ? data.data : []);
    } catch {
      setPoiList([]);
    } finally {
      setPoiLoading(false);
    }
  };

  // Thêm POI đã chọn vào localStops
  const handleSelectPoi = (poi: any) => {
    const newIdx = localStops.length;
    const newStop: ProcessedStop & { isNew?: boolean } = {
      id: poi.id,
      poi_id: poi.id,
      order_index: newIdx + 1,
      status: 'upcoming',
      name: poi.name,
      emoji: getEmoji(newIdx),
      address: poi.address || poi.short?.vi || '',
      time: STOP_TIMES[newIdx % STOP_TIMES.length] ?? '15:00',
      rating: poi.average_rating ? parseFloat(poi.average_rating).toFixed(1) : '4.5',
      desc: '',
      audioUrl: undefined,
      audioDuration: undefined,
      contentLoaded: false,
      contentLoading: false,
      Poi: poi,
      isNew: true, // Đánh dấu là POI mới
    };
    setLocalStops(prev => [...prev, newStop]);
    setIsModified(true);
    setExpandedStopIndex(newIdx);
    setShowPoiModal(false);
  };

  // ── Delete stop ─────────────────────────────────────────────────────────────

  const handleDeleteStop = (idx: number) => {
    const stop = localStops[idx];
    const poiId = stop.poi_id ?? stop.id;
    if (poiId) setDeletedStopIds(prev => [...prev, poiId]);
    setLocalStops(prev => prev.filter((_, i) => i !== idx));
    if (expandedStopIndex === idx) setExpandedStopIndex(null);
    setIsModified(true);
    showToast({ title: t('tourDetail.toast.stop_deleted', 'Đã xoá điểm dừng') });
  };

  // ── Save tour ───────────────────────────────────────────────────────────────

  const handleSaveTour = async () => {
    if (!isModified || !tourId) return;
    setIsSaving(true);
    try {
      // Xóa các POI đã bị xóa khỏi tour
      for (const poiId of deletedStopIds) {
        await removePoiFromMyTour(tourId, poiId);
      }

      // Thêm các POI mới vào tour trước khi update order
      for (let i = 0; i < localStops.length; i++) {
        const stop = localStops[i];
        // @ts-ignore
        if (stop.isNew) {
          await addPoiToMyTour(tourId, stop.poi_id ?? stop.id, i + 1);
        }
      }

      // Cập nhật lại thứ tự các POI còn lại
      if (localStops.length > 0) {
        const base = localStops.length + 1000;
        for (let i = 0; i < localStops.length; i++) {
          const orderId = localStops[i].poi_id ?? localStops[i].id;
          if (!orderId) continue;
          await updateMyTourPoiOrder(tourId, orderId, base + i + 1);
        }
        for (let i = 0; i < localStops.length; i++) {
          const orderId = localStops[i].poi_id ?? localStops[i].id;
          if (!orderId) continue;
          await updateMyTourPoiOrder(tourId, orderId, i + 1);
        }
      }
      showToast({ title: t('tourDetail.toast.save_success', 'Đã cập nhật lộ trình thành công') });
      setDeletedStopIds([]);
      setIsModified(false);
      // Luôn reload lại tour từ backend để đồng bộ UI
      await loadTour();
    } catch (err: any) {
      const status  = err?.status;
      const details = err?.details ?? err?.message;
      const msg = typeof details === 'string' ? details : JSON.stringify(details);
      showToast({ title: status ? t('tourDetail.toast.save_error_status', 'Thất bại') + ` (${status})` : t('tourDetail.toast.save_error', 'Cập nhật thất bại'), message: msg });
      await loadTour();
    } finally {
      setIsSaving(false);
    }
  };

  // ── Share ───────────────────────────────────────────────────────────────────

  const handleShare = async () => {
    setIsSharing(true);
    const url = `${window.location.origin}/tourist/tour/${tourId}`;
    const result = await share({
      title: processedTour?.name ?? t('tourDetail.share.title', 'Food Map Tour'),
      text: t('tourDetail.share.text', 'Khám phá tour ẩm thực: {{name}}', { name: processedTour?.name }),
      url,
    });
    if (result === 'copied') showToast({ title: t('tourDetail.toast.link_copied', 'Đã sao chép link!') });
    setIsSharing(false);
  };

  // ── Start tour → navigate to map with tour data ──────────────────────────────

  // const handleStartTour = () => {
  //   if (!processedTour) return;
  //   // Lưu tour data vào store để MapPage đọc
  //   setActiveTourForMap?.({
  //     id: processedTour.id,
  //     name: processedTour.name,
  //     stops: localStops.map((s, i) => ({
  //       id: s.poi_id ?? s.id,
  //       name: s.name,
  //       emoji: s.emoji,
  //       address: s.address,
  //       description: s.desc,
  //       audioUrl: s.audioUrl,
  //       audioDuration: s.audioDuration,
  //       status: s.status,
  //       order: i + 1,
  //       lat: s.Poi?.lat ?? s.Poi?.latitude,
  //       lng: s.Poi?.lng ?? s.Poi?.longitude,
  //     })),
  //   });
  //   nav('/tourist/map?mode=tour');
  // };

// Hàm xử lý Bắt đầu hành trình
  const handleStartTour = () => {
    if (!processedTour) return;
    // Chuẩn bị danh sách điểm dừng (listPoints) để truyền qua location.state
    const listPoints = localStops.map((s, i) => {
      // Ưu tiên lấy lat/lng từ Poi.location.coordinates nếu có
      let lat, lng;
      if (s.Poi?.location?.coordinates && Array.isArray(s.Poi.location.coordinates)) {
        // GeoJSON: [lng, lat]
        lng = s.Poi.location.coordinates[0];
        lat = s.Poi.location.coordinates[1];
      } else {
        lat = s.Poi?.lat ?? s.Poi?.latitude;
        lng = s.Poi?.lng ?? s.Poi?.longitude;
      }
      return {
        id: s.poi_id ?? s.id,
        name: s.name,
        emoji: s.emoji,
        address: s.address,
        description: s.desc,
        audioUrl: s.audioUrl,
        audioDuration: s.audioDuration,
        status: s.status,
        order: i + 1,
        lat,
        lng,
      };
    });
    console.log('Starting tour with points:', listPoints);
    // Lưu tour data vào store để MapPage đọc (nếu cần)
    setActiveTourForMap?.({
      id: processedTour.id,
      name: processedTour.name,
      stops: listPoints,
    });
    // Chuyển hướng sang trang Map và truyền state gồm listPoints và autoStartTour
    navigate('/tourist/map', {
      state: {
        autoStartTour: true,
        listPoints,
      },
    });
  };
  // ── Action handlers for stop buttons ────────────────────────────────────────


  const handleListenStop = async (stop: ProcessedStop, idx: number) => {
    // Đảm bảo content đã load
    if (!stop.contentLoaded) await loadStopContent(idx);
    const updated = localStops[idx];
    if (updated?.audioUrl) {
      setAudioPlayer({ url: updated.audioUrl, name: updated.name });
    } else {
      // Fallback Web Speech API
      if ('speechSynthesis' in window) {
        const text = updated?.desc ?? updated?.name ?? '';
        const u = new SpeechSynthesisUtterance(`${updated?.name}. ${text}`);
        u.lang = language === 'vi' ? 'vi-VN' : language;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
        showToast({ title: '🎧 Đang phát thuyết minh…' });
      } else {
        showToast({ title: 'Chưa có audio cho địa điểm này' });
      }
    }
  };

  const handleVoucherStop = (stop: ProcessedStop) => {
    setVoucherStop(stop);
  };

  // ── Processed tour ───────────────────────────────────────────────────────────

  const visitedCount = localStops.filter(s => s.status === 'visited').length;

  const processedTour = tour ? {
    id: tour.id as string,
    name: (tour.name as string) || t('tourDetail.unknown_tour', 'Unknown Tour'),
    description: (tour.description as string) || t('tourDetail.default_description', 'Hành trình khám phá những góc phố đậm chất Quận 4.'),
    isPremium: tour.visibility === 'PRIVATE',
    visitedCount,
    duration: t('tourDetail.default_duration', '~2.5 giờ'),
    distance: t('tourDetail.default_distance', '1.8 km'),
    stops: localStops,
  } : null;

  // ── Overview tab ─────────────────────────────────────────────────────────────

  // Fix: pass t as argument
  const renderOverviewTab = (data: typeof processedTour, t: any) => {
    if (!data) return null;
    const pct = data.stops.length ? Math.round((data.visitedCount / data.stops.length) * 100) : 0;
    const features = [
      { icon: '🎧', title: t('tourDetail.feature.audio', 'Audio Thuyết minh'), sub: t('tourDetail.feature.audio_sub', 'Nghe câu chuyện từng địa điểm') },
      { icon: '🗺️', title: t('tourDetail.feature.directions', 'Chỉ đường'), sub: t('tourDetail.feature.directions_sub', 'Dẫn đường đến từng địa điểm dễ dàng') },
      { icon: '🎟️', title: t('tourDetail.feature.voucher', 'Voucher độc quyền'), sub: t('tourDetail.feature.voucher_sub', 'Ưu đãi chỉ dành cho tour') },
      { icon: '🌐', title: t('tourDetail.feature.multilang', 'Đa ngôn ngữ'), sub: t('tourDetail.feature.multilang_sub', 'VN · EN · JP · CN · KR') },
    ];

    return (
      <div className="ts-fade-in pb-[90px]">
        {/* Hero */}
        <div className="rounded-[16px] p-5 text-white relative overflow-hidden mb-4 shadow-sm bg-gradient-to-r from-[#FF7A45] to-[#FF512F]">
          <div className="absolute top-4 right-4 w-14 h-14 bg-black/10 rounded-xl flex items-center justify-center text-3xl backdrop-blur-sm">🌆</div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/20 inline-block mb-3 border border-white/30">
            {data.isPremium ? t('tourDetail.premium', '🔒 Tour riêng tư') : t('tourDetail.free', '✓ Tour miễn phí')}
          </span>
          <h2 className="text-[22px] font-bold mb-2 leading-tight pr-16">{data.name}</h2>
          <div className="flex items-center gap-4 text-[12px] opacity-90 font-medium mb-6">
            <span>{t('tourDetail.stops_count', { count: data.stops.length, defaultValue: '📍 {{count}} điểm' })}</span>
            <span>⏱ {data.duration}</span>
            <span>🚶 {data.distance}</span>
          </div>
          <div>
            <div className="flex justify-between text-[11px] font-bold mb-1.5 uppercase tracking-wide">
              <span>{t('tourDetail.progress', 'Tiến độ')}</span><span>{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-black/20 overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>

        {/* Summary list with drag */}
        <div className="bg-white rounded-[16px] p-5 border border-black/5 shadow-sm mb-4">
          <div className="flex justify-between items-center mb-4">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{t('tourDetail.summary', 'Lịch trình tóm tắt')}</div>
            {isModified && <span className="text-[10px] text-[#FF6B35] font-bold bg-orange-50 px-2 py-1 rounded-lg">{t('tourDetail.unsaved', 'Chưa lưu')}</span>}
          </div>
          <div className="space-y-2">
            {data.stops.map((s, i) => (
              <div
                key={s.id}
                draggable
                onDragStart={() => (dragItem.current = i)}
                onDragEnter={() => (dragOverItem.current = i)}
                onDragEnd={handleSort}
                onDragOver={e => e.preventDefault()}
                className="flex items-center gap-3 bg-white border border-transparent hover:border-gray-100 hover:shadow-sm p-2 -mx-2 rounded-xl transition-all cursor-grab active:cursor-grabbing group"
              >
                {/* drag handle */}
                <div className="text-gray-300 opacity-40 group-hover:opacity-100 px-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 8h16M4 16h16"/></svg>
                </div>
                {/* status dot */}
                <div className={`w-6 h-6 rounded-full shrink-0 text-[11px] font-bold flex items-center justify-center
                  ${s.status === 'visited' ? 'bg-[#10B981] text-white' : s.status === 'current' ? 'bg-[#FF6B35] text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {s.status === 'visited' ? '✓' : i + 1}
                </div>
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-lg shrink-0">{s.emoji}</div>
                <div className="flex-1 overflow-hidden">
                  <span className={`block text-[13px] font-bold truncate ${s.status === 'current' ? 'text-[#FF6B35]' : 'text-gray-800'}`}>{s.name}</span>
                  <span className="text-[11px] text-gray-400">{s.time}</span>
                </div>
                {/* delete button */}
                <button
                  onClick={() => handleDeleteStop(i)}
                  className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            ))}
            {data.stops.length === 0 && <p className="text-center text-sm text-gray-400 py-2">{t('tourDetail.no_stops', 'Chưa có điểm đến nào.')}</p>}
          </div>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-2 gap-3">
          {features.map(f => (
            <div key={f.title} className="bg-white rounded-[12px] p-4 border border-black/5 shadow-sm flex items-start gap-3">
              <div className="text-[20px] bg-gray-50 w-10 h-10 rounded-full flex items-center justify-center shrink-0">{f.icon}</div>
              <div>
                <div className="text-[12px] font-bold text-gray-800 mb-0.5">{f.title}</div>
                <div className="text-[11px] text-gray-500">{f.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── Stops tab ────────────────────────────────────────────────────────────────

  // Fix: pass t as argument
  const renderStopsTab = (data: typeof processedTour, modalOpen: boolean, t: any) => {
    if (!data?.stops?.length) return <div className="text-gray-400 text-center py-10">{t('tourDetail.stops.empty', 'Chưa có dữ liệu lộ trình.')}</div>;

    // Responsive: detect mobile
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;

    return (
      <>
        <div className="ts-fade-in pb-[90px]">
          {/* ...existing stops list... */}
          <div className="flex justify-between items-center mb-3">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1">
              Lộ trình chi tiết · {data.stops.length} điểm dừng
            </div>
            <button
              className="ml-auto px-3 py-1.5 rounded-lg bg-[#FF6B35] text-white text-xs font-bold shadow hover:bg-[#F25A24] transition-colors"
              onClick={handleAddPoi}
            >+ Thêm điểm dừng</button>
          </div>
          <div className="relative">
            <div className="absolute top-5 bottom-10 left-5 w-[2px] bg-gray-100 z-0" />
            {data.stops.map((stop, i) => {
              const isExpanded = expandedStopIndex === i;
              const isVisited  = stop.status === 'visited';
              const isCurrent  = stop.status === 'current';
              return (
                <div key={stop.id} className="flex gap-4 mb-3 relative z-10"
                  draggable
                  onDragStart={() => { dragItem.current = i; }}
                  onDragEnter={() => { dragOverItem.current = i; }}
                  onDragEnd={handleSort}
                  onDragOver={e => e.preventDefault()}
                  onTouchStart={e => handleTouchStart(i, e)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {/* Step indicator */}
                  <div className="flex flex-col items-center shrink-0 pt-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold border-[3px] border-white shadow-sm transition-colors
                      ${isVisited ? 'bg-[#10B981] text-white' : isCurrent ? 'bg-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/30' : 'bg-gray-100 text-gray-400'}`}>
                      {isVisited ? '✓' : i + 1}
                    </div>
                  </div>
                  {/* Card */}
                  <div
                    className={`flex-1 bg-white rounded-[16px] overflow-hidden transition-all duration-300 cursor-pointer select-none
                      ${isCurrent ? 'border-[1.5px] border-[#FF6B35] shadow-md shadow-[#FF6B35]/10' : 'border border-black/5 shadow-sm hover:shadow-md'}
                      ${isExpanded ? 'ring-2 ring-orange-50' : ''}`}
                    onClick={() => setExpandedStopIndex(isExpanded ? null : i)}
                  >
                    {/* ...existing card content... */}
                    <div className="p-4 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-2xl shrink-0">{stop.emoji}</div>
                      <div className="flex-1 overflow-hidden">
                        <div className="text-[14px] font-bold text-gray-800 truncate">{stop.name}</div>
                        <div className="text-[12px] text-gray-400 truncate mt-0.5">📍 {stop.address}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-gray-400 font-medium">{stop.time}</span>
                        <svg
                          className={`w-4 h-4 text-gray-300 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      {/* Delete button - more visible */}
                      <button
                        className="ml-2 px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-bold shadow hover:bg-red-700 transition-colors"
                        onClick={e => { e.stopPropagation(); handleDeleteStop(i); }}
                        title="Xóa điểm dừng"
                      >Xóa</button>
                    </div>
                    {/* Expanded content */}
                    <div className={`transition-all duration-300 ease-in-out origin-top overflow-hidden ${isExpanded ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                        {/* Description */}
                        {stop.contentLoading ? (
                          <div className="flex items-center gap-2 mb-3 text-[13px] text-gray-400">
                            <div className="w-4 h-4 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin" />
                            Đang tải nội dung…
                          </div>
                        ) : (
                          <div className="ts-fade-in mb-2">
                            <div className="text-[13px] text-gray-700 whitespace-pre-line mb-2 min-h-[20px]">
                              {stop.desc || stop.Poi?.description || stop.Poi?.short?.vi || <span className="text-gray-400">Chưa có mô tả cho địa điểm này.</span>}
                            </div>
                          </div>
                        )}
                        {/* Modal chọn POI - UI/UX nâng cấp */}
                        {showPoiModal && (
                              isMobile ? (
                                // Mobile: Fullscreen bottom sheet, no backdrop
                                <div
                                  className={`fixed inset-0 z-50 flex flex-col bg-white animate-in ${modalOpen ? 'slide-in-from-bottom-4' : 'translate-y-full'} transition-transform duration-400`}
                                  style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '100vh', minHeight: '60vh', boxShadow: '0 -4px 32px rgba(0,0,0,0.10)' }}
                                  onClick={e => e.stopPropagation()}
                                >
                                  {/* Drag handle */}
                                  <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 mb-2" />
                                  {/* Header */}
                                  <div className="flex items-center justify-between p-4 pb-2 border-b border-gray-100">
                                    <div className="flex items-center gap-2">
                                      {/* ...icon and title... */}
                                    </div>
                                    <button
                                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                      onClick={() => setShowPoiModal(false)}
                                      aria-label="Đóng"
                                    >
                                      {/* ...close icon... */}
                                    </button>
                                  </div>
                                  {/* Search bar */}
                                  <div className="px-4 pt-2 pb-3">
                                    {/* ...search input... */}
                                  </div>
                                  {/* Danh sách POI */}
                                  <div className="flex-1 overflow-y-auto divide-y px-2 pb-2 min-h-0">
                                    {/* ...POI list... */}
                                  </div>
                                </div>
                              ) : (
                                // Desktop/laptop: Modal as before
                                <div
                                  className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm`}
                                  onClick={() => setShowPoiModal(false)}
                                >
                                  <div
                                    className={`bg-white rounded-3xl max-w-xl w-full mx-auto p-8 shadow-2xl relative transition-all duration-300 flex flex-col items-center ${modalOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                                    style={{ maxWidth: '36rem', maxHeight: '70vh', minHeight: '320px', justifyContent: 'center' }}
                                    onClick={e => e.stopPropagation()}
                                  >
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center gap-2">
                                        {/* ...icon and title... */}
                                      </div>
                                      <button
                                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                        onClick={() => setShowPoiModal(false)}
                                        aria-label="Đóng"
                                      >
                                        {/* ...close icon... */}
                                      </button>
                                    </div>
                                    {/* Search bar */}
                                    <div className="px-4 mb-3">
                                      {/* ...search input... */}
                                    </div>
                                    {/* Danh sách POI */}
                                    <div className="flex-1 overflow-y-auto divide-y w-full px-0" style={{ width: '100%' }}>
                                      {/* ...POI list... */}
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                       
                    
                        <div className="flex gap-2 mt-2">
                          {/* Directions */}
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              // Lấy lat/lng từ stop
                              let lat, lng;
                              if (stop.Poi?.location?.coordinates && Array.isArray(stop.Poi.location.coordinates)) {
                                lng = stop.Poi.location.coordinates[0];
                                lat = stop.Poi.location.coordinates[1];
                              } else {
                                lat = stop.Poi?.lat ?? stop.Poi?.latitude;
                                lng = stop.Poi?.lng ?? stop.Poi?.longitude;
                              }
                              if (lat && lng) {
                                window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,'_blank');
                              }
                            }}
                            className="flex flex-col items-center gap-1 py-2 px-4 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all active:scale-95 border border-blue-100 min-w-[90px]"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 2l4 4-4 4M2 12l4-4 4 4m8 8l-4-4 4-4" />
                              <circle cx="12" cy="12" r="10" />
                            </svg>
                            <span className="text-[11px] font-bold">Chỉ đường</span>
                          </button>
                          {/* Audio */}
                          <button
                            onClick={e => { e.stopPropagation(); handleListenStop(stop, i); }}
                            disabled={stop.contentLoading}
                            className="flex flex-col items-center gap-1 py-2 px-4 rounded-xl bg-violet-50 text-violet-600 hover:bg-violet-100 transition-all active:scale-95 border border-violet-100 disabled:opacity-50 min-w-[90px]"
                          >
                            {stop.contentLoading
                              ? <div className="w-[18px] h-[18px] border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
                                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
                                </svg>
                            }
                            <span className="text-[11px] font-bold">
                              {stop.audioDuration ? `~${Math.round(stop.audioDuration)}s` : 'Audio'}
                            </span>
                          </button>
                          {/* Voucher */}
                          <button
                            onClick={e => { e.stopPropagation(); handleVoucherStop(stop); }}
                            className="flex flex-col items-center gap-1 py-2 px-4 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all active:scale-95 border border-amber-100 min-w-[90px]"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                              <line x1="7" y1="7" x2="7.01" y2="7"/>
                            </svg>
                            <span className="text-[11px] font-bold">Voucher</span>
                          </button>
                        </div>
                        </div>
                      </div>
                    </div>
                  </div>
            );
          })}
          </div>
        </div>
        {/* Modal chọn POI - UI/UX nâng cấp */}
        {showPoiModal && (
          <div
            className={`fixed inset-0 z-50 flex ${isMobile ? 'items-end' : 'items-center'} justify-center bg-black/40 backdrop-blur-sm`}
            onClick={() => setShowPoiModal(false)}
          >
            <div
              className={
                isMobile
                  ? `w-full rounded-t-3xl bg-white shadow-2xl max-h-[80vh] flex flex-col transition-transform duration-400 ${modalOpen ? 'translate-y-0' : 'translate-y-full'}`
                  : `bg-white rounded-3xl max-w-xl w-full mx-auto p-8 shadow-2xl relative transition-all duration-300 flex flex-col items-center ${modalOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`
              }
              style={isMobile
                ? {padding: 0, maxHeight: '80vh'}
                : {maxWidth: '46rem', maxHeight: '70vh', minHeight: '320px', justifyContent: 'center'}
              }
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`flex items-center justify-between ${isMobile ? 'p-4 pb-2' : 'mb-3 w-full'}`} style={isMobile ? {borderBottom: '1px solid #f3f3f3'} : {}}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🧑‍✈️</span>
                  <h3 className="text-lg font-extrabold text-gray-900">Chọn điểm dừng mới</h3>
                </div>
                <button
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  onClick={() => setShowPoiModal(false)}
                  aria-label="Đóng"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
              {/* Search bar */}
              <div className={`px-4 ${isMobile ? 'pt-2 pb-3' : 'mb-3 w-full'}`}>
                <div className="relative">
                  <input
                    className="w-full border border-gray-200 rounded-full px-4 py-2 pl-10 text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all"
                    placeholder="Tìm kiếm tên địa điểm..."
                    value={poiSearch}
                    onChange={e => setPoiSearch(e.target.value)}
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </span>
                </div>
              </div>
              {/* POI list */}
              <div className={`flex-1 overflow-y-auto divide-y ${isMobile ? 'px-2 pb-2' : 'w-full'}`} style={isMobile ? {minHeight: 0} : {}}>
                {poiLoading ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <span className="inline-block w-10 h-10">
                      <svg className="animate-spin" viewBox="0 0 50 50">
                        <circle className="opacity-25" cx="25" cy="25" r="20" fill="none" stroke="#FF6B35" strokeWidth="6" />
                        <circle className="opacity-75" cx="25" cy="25" r="20" fill="none" stroke="#FF6B35" strokeWidth="6" strokeDasharray="31.4 188.4" strokeLinecap="round" />
                      </svg>
                    </span>
                  </div>
                ) : (
                  (poiList.filter(p => !poiSearch || (p.name && p.name.toLowerCase().includes(poiSearch.toLowerCase()))).length === 0 ?
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                      <div className="text-3xl mb-2">🤔</div>
                      <div>Không tìm thấy địa điểm phù hợp.</div>
                    </div> :
                    poiList.filter(p => !poiSearch || (p.name && p.name.toLowerCase().includes(poiSearch.toLowerCase())))
                      .map(poi => (
                        <button
                          key={poi.id}
                          className="w-full text-left px-3 py-3 hover:bg-orange-50 rounded-xl flex items-center gap-3 transition-all group"
                          onClick={() => handleSelectPoi(poi)}
                        >
                          <span className="text-2xl bg-orange-100 rounded-xl p-2 mr-2">{getEmoji(localStops.length)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-gray-900 truncate text-[15px]">{poi.name}</div>
                            <div className="text-xs text-gray-400 truncate">{poi.address || poi.short?.vi || ''}</div>
                          </div>
                          <span className="text-xs text-gray-400 ml-auto font-semibold bg-orange-50 px-2 py-1 rounded-full">{poi.category}</span>
                          <span className="ml-2 text-orange-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">+ Thêm</span>
                        </button>
                      ))
                  )
                )}
              </div>
              {/* Kéo để đóng trên mobile */}
              {isMobile && <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto my-3" />}
            </div>
          </div>
        )}
      </>
    );
  };

  // ── Guards ───────────────────────────────────────────────────────────────────

  if (!tourId) return (
    <AppShell showBottomNav={false}>
      <div className="p-10 text-center text-gray-400">{t('tourDetail.not_found', 'Không tìm thấy tour.')}</div>
    </AppShell>
  );

  if (loading && !processedTour) return (
    <AppShell showBottomNav={false}>
      <div className="p-10 text-center text-gray-400 animate-pulse">{t('tourDetail.loading', 'Đang tải dữ liệu trải nghiệm...')}</div>
    </AppShell>
  );

  const TABS = [
    { id: 'overview', label: t('tourDetail.tab.overview', 'Tổng quan') },
    { id: 'stops',    label: t('tourDetail.tab.stops', 'Lộ trình') },
    { id: 'ai',       label: t('tourDetail.tab.ai', '✨ AI Gợi ý') },
    { id: 'reviews',  label: t('tourDetail.tab.reviews', 'Đánh giá') },
  ];

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <AppShell showBottomNav={false}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');
        .tour-screen { font-family: 'Be Vietnam Pro', sans-serif; background-color: #F8F9FA; }
        .ts-fade-in  { animation: tsFadeIn 0.35s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes tsFadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="tour-screen min-h-screen flex flex-col pb-[80px]">

        {/* ── Sticky Header ── */}
        <div className="bg-white border-b border-black/5 pt-6 px-4 md:px-6 sticky top-0 z-30 shadow-sm">
          <div className="max-w-[800px] mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => nav(-1)}
                className="-ml-2 w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="text-[20px] md:text-[22px] font-extrabold text-gray-900 leading-tight truncate">
                  {processedTour?.name ?? t('tourDetail.title', 'Lộ Trình')}
                </h1>
                <p className="text-[12px] text-gray-400 font-medium">{t('tourDetail.subtitle', 'Khám phá ẩm thực đường phố Sài Gòn')}</p>
              </div>
            </div>

            <div className="flex overflow-x-auto hide-scrollbar gap-6">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id as any)}
                  className={`py-3 px-1 text-[13px] font-bold whitespace-nowrap border-b-[2.5px] transition-colors
                    ${tab === t.id ? 'text-[#FF6B35] border-[#FF6B35]' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 p-4 md:p-6 max-w-[800px] mx-auto w-full">
          {tab === 'overview' && renderOverviewTab(processedTour, t)}
          {tab === 'stops'    && renderStopsTab(processedTour, modalOpen, t)}
          {tab === 'ai'       && (
            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
              <div className="text-4xl mb-3">✨</div>
              <div className="font-bold text-gray-500">{t('tourDetail.ai_maintenance', 'AI Tour Assistant đang bảo trì')}</div>
              <div className="text-[13px] mt-1">{t('tourDetail.ai_soon', 'Sẽ sớm trở lại!')}</div>
            </div>
          )}
          {tab === 'reviews'  && (
            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
              <div className="text-4xl mb-3">⭐</div>
              <div className="font-bold text-gray-500">{t('tourDetail.no_reviews', 'Chưa có đánh giá')}</div>
              <div className="text-[13px] mt-1">{t('tourDetail.first_review', 'Hãy là người đầu tiên đánh giá tour này!')}</div>
            </div>
          )}
        </div>

        {/* ── Sticky Footer ── */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-black/5 p-3 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="max-w-[800px] mx-auto flex items-center gap-2.5">
            {/* Save */}
            <button
              disabled={!isModified || isSaving}
              onClick={handleSaveTour}
              className={`px-5 py-3 rounded-xl border font-bold text-[13px] flex items-center gap-2 transition-all shrink-0
                ${isModified
                  ? 'border-[#FF6B35] text-[#FF6B35] bg-orange-50 hover:bg-orange-100 active:scale-95'
                  : 'border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed'}`}
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                </svg>
              )}
              {t('tourDetail.save', 'Lưu')}
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-[13px] flex items-center gap-2 hover:bg-gray-50 transition-all active:scale-95 shrink-0"
            >
              {isSharing
                ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
              }
              {t('tourDetail.share', 'Chia sẻ')}
            </button>

            {/* Start */}
            <button
              onClick={handleStartTour}
              className="flex-1 py-3 px-4 rounded-xl bg-[#FF6B35] hover:bg-[#F25A24] text-white font-bold text-[14px] shadow-lg shadow-[#FF6B35]/25 flex justify-center items-center gap-2 transition-all active:scale-[0.98]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
              {t('tourDetail.start', 'Bắt đầu Hành trình')}
            </button>
          </div>
        </div>
      </div>

      {/* ── Audio Player ── */}
      {audioPlayer && (
        <AudioPlayer
          audioUrl={audioPlayer.url}
          poiName={audioPlayer.name}
          onClose={() => setAudioPlayer(null)}
        />
      )}

      {/* ── Voucher Modal ── */}
      {voucherStop && (
        <VoucherModal stop={voucherStop} onClose={() => setVoucherStop(null)} />
      )}
    </AppShell>
  );
}