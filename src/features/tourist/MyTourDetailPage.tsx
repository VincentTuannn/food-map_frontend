import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../../shared/ui/AppShell';
import { useAppStore } from '../../shared/store/appStore';
import {
  getMyTour,
  removePoiFromMyTour,
  updateMyTourPoiOrder,
} from '../../api/services/userTours';
import { getPoiContent, type TtsOptions } from '../../api/services/content';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PoiContent {
  description?: string;
  audioUrl?: string;
  audioDuration?: number; // seconds
}

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

// ─── Audio Player mini ────────────────────────────────────────────────────────

interface AudioPlayerProps {
  audioUrl: string;
  onClose: () => void;
  poiName: string;
}

function AudioPlayer({ audioUrl, onClose, poiName }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.play().then(() => setPlaying(true)).catch(() => {});
    const onTime = () => setProgress(el.currentTime);
    const onMeta = () => setDuration(el.duration);
    const onEnd  = () => setPlaying(false);
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('loadedmetadata', onMeta);
    el.addEventListener('ended', onEnd);
    return () => {
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('loadedmetadata', onMeta);
      el.removeEventListener('ended', onEnd);
      el.pause();
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) { el.pause(); setPlaying(false); }
    else { el.play(); setPlaying(true); }
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="fixed bottom-[88px] left-0 right-0 z-50 px-4 animate-in slide-in-from-bottom-4 duration-300">
      <div className="max-w-[800px] mx-auto bg-gray-900 text-white rounded-2xl p-4 shadow-2xl border border-white/10">
        <audio ref={audioRef} src={audioUrl} preload="auto" />
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-[#FF6B35] flex items-center justify-center shrink-0 hover:bg-[#F25A24] transition-colors"
          >
            {playing
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
            }
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold truncate opacity-70 mb-1">{poiName}</div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-[#FF6B35] rounded-full transition-all duration-200" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex justify-between text-[10px] opacity-50 mt-1">
              <span>{fmt(progress)}</span><span>{duration > 0 ? fmt(duration) : '--:--'}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Voucher Modal ────────────────────────────────────────────────────────────

interface VoucherModalProps {
  stop: ProcessedStop;
  onClose: () => void;
}

function VoucherModal({ stop, onClose }: VoucherModalProps) {
  const code = `FOODTOUR-${stop.id.slice(0, 6).toUpperCase()}`;
  const [copied, setCopied] = useState(false);

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
          <h3 className="text-[18px] font-extrabold text-gray-900">🎟 Voucher độc quyền</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="bg-gradient-to-r from-[#FF7A45] to-[#FF512F] rounded-2xl p-5 text-white text-center mb-4">
          <div className="text-[11px] font-bold uppercase tracking-widest opacity-80 mb-1">Dành riêng cho bạn</div>
          <div className="text-3xl font-extrabold mb-1">{stop.name}</div>
          <div className="text-[13px] opacity-90">Giảm 10% cho lần ghé thăm này</div>
        </div>

        {/* Mã voucher dạng dashed border */}
        <div className="relative border-2 border-dashed border-[#FF6B35]/40 rounded-xl p-4 mb-4 bg-orange-50/50">
          <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Mã giảm giá</div>
          <div className="flex items-center justify-between">
            <span className="text-[20px] font-mono font-extrabold text-gray-800 tracking-widest">{code}</span>
            <button
              onClick={copyCode}
              className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${copied ? 'bg-green-500 text-white' : 'bg-[#FF6B35] text-white hover:bg-[#F25A24]'}`}
            >
              {copied ? '✓ Đã chép' : 'Sao chép'}
            </button>
          </div>
        </div>

        <p className="text-[12px] text-gray-400 text-center">
          Voucher có hiệu lực khi bạn ở trong bán kính 100m của địa điểm.
          Hết hạn sau 24 giờ.
        </p>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function MyTourDetailPage() {
  const navigate = useNavigate();
  const { tourId } = useParams();
  const nav = useNavigate();
  const showToast = useAppStore((s) => s.showToast);
  const setActiveTourForMap = useAppStore((s) => s.setActiveTourForMap);
  const language = useAppStore((s) => s.language ?? 'vi');

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

  // Drag refs
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // ── Fetch tour ──────────────────────────────────────────────────────────────

  const loadTour = useCallback(() => {
    if (!tourId) return;
    setLoading(true);
    getMyTour(tourId)
      .then((res) => { if (res) setTour(res); })
      .catch(() => showToast({ title: 'Không tải được tour' }))
      .finally(() => setLoading(false));
  }, [tourId, showToast]);

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

  // ── Delete stop ─────────────────────────────────────────────────────────────

  const handleDeleteStop = (idx: number) => {
    const stop = localStops[idx];
    const poiId = stop.poi_id ?? stop.id;
    if (poiId) setDeletedStopIds(prev => [...prev, poiId]);
    setLocalStops(prev => prev.filter((_, i) => i !== idx));
    if (expandedStopIndex === idx) setExpandedStopIndex(null);
    setIsModified(true);
  };

  // ── Save tour ───────────────────────────────────────────────────────────────

  const handleSaveTour = async () => {
    if (!isModified || !tourId) return;
    setIsSaving(true);
    try {
      for (const poiId of deletedStopIds) {
        await removePoiFromMyTour(tourId, poiId);
      }
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
      showToast({ title: 'Đã cập nhật lộ trình thành công' });
      setDeletedStopIds([]);
      setIsModified(false);
      loadTour();
    } catch (err: any) {
      const status  = err?.status;
      const details = err?.details ?? err?.message;
      const msg = typeof details === 'string' ? details : JSON.stringify(details);
      showToast({ title: status ? `Thất bại (${status})` : 'Cập nhật thất bại', message: msg });
      loadTour();
    } finally {
      setIsSaving(false);
    }
  };

  // ── Share ───────────────────────────────────────────────────────────────────

  const handleShare = async () => {
    setIsSharing(true);
    const url = `${window.location.origin}/tourist/tour/${tourId}`;
    const result = await share({
      title: processedTour?.name ?? 'Food Map Tour',
      text: `Khám phá tour ẩm thực: ${processedTour?.name}`,
      url,
    });
    if (result === 'copied') showToast({ title: 'Đã sao chép link!' });
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

  const handleNavigateToStop = (stop: ProcessedStop) => {
    const lat = stop.Poi?.lat ?? stop.Poi?.latitude;
    const lng = stop.Poi?.lng ?? stop.Poi?.longitude;
    if (!lat || !lng) {
      showToast({ title: 'Chưa có tọa độ của địa điểm này' });
      return;
    }
    // Mở Google Maps nếu mobile, fallback sang map page
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
    if (isMobile) {
      window.open(`https://maps.google.com/maps?daddr=${lat},${lng}&dirflg=w`, '_blank');
    } else {
      nav(`/tourist/map?lat=${lat}&lng=${lng}&poiId=${stop.poi_id ?? stop.id}`);
    }
  };

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
    name: (tour.name as string) || 'Unknown Tour',
    description: (tour.description as string) || 'Hành trình khám phá những góc phố đậm chất Quận 4.',
    isPremium: tour.visibility === 'PRIVATE',
    visitedCount,
    duration: '~2.5 giờ',
    distance: '1.8 km',
    stops: localStops,
  } : null;

  // ── Overview tab ─────────────────────────────────────────────────────────────

  const renderOverviewTab = (data: typeof processedTour) => {
    if (!data) return null;
    const pct = data.stops.length ? Math.round((data.visitedCount / data.stops.length) * 100) : 0;
    const features = [
      { icon: '🎧', title: 'Audio Thuyết minh', sub: 'Nghe câu chuyện từng địa điểm' },
      { icon: '🗺️', title: 'Bản đồ offline', sub: 'Không cần kết nối mạng' },
      { icon: '🎟️', title: 'Voucher độc quyền', sub: 'Ưu đãi chỉ dành cho tour' },
      { icon: '🌐', title: 'Đa ngôn ngữ', sub: 'VN · EN · JP · CN · KR' },
    ];

    return (
      <div className="ts-fade-in pb-[90px]">
        {/* Hero */}
        <div className="rounded-[16px] p-5 text-white relative overflow-hidden mb-4 shadow-sm bg-gradient-to-r from-[#FF7A45] to-[#FF512F]">
          <div className="absolute top-4 right-4 w-14 h-14 bg-black/10 rounded-xl flex items-center justify-center text-3xl backdrop-blur-sm">🌆</div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/20 inline-block mb-3 border border-white/30">
            {data.isPremium ? '🔒 Tour riêng tư' : '✓ Tour miễn phí'}
          </span>
          <h2 className="text-[22px] font-bold mb-2 leading-tight pr-16">{data.name}</h2>
          <div className="flex items-center gap-4 text-[12px] opacity-90 font-medium mb-6">
            <span>📍 {data.stops.length} điểm</span>
            <span>⏱ {data.duration}</span>
            <span>🚶 {data.distance}</span>
          </div>
          <div>
            <div className="flex justify-between text-[11px] font-bold mb-1.5 uppercase tracking-wide">
              <span>Tiến độ</span><span>{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-black/20 overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>

        {/* Summary list with drag */}
        <div className="bg-white rounded-[16px] p-5 border border-black/5 shadow-sm mb-4">
          <div className="flex justify-between items-center mb-4">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Lịch trình tóm tắt</div>
            {isModified && <span className="text-[10px] text-[#FF6B35] font-bold bg-orange-50 px-2 py-1 rounded-lg">Chưa lưu</span>}
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
            {data.stops.length === 0 && <p className="text-center text-sm text-gray-400 py-2">Chưa có điểm đến nào.</p>}
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

  const renderStopsTab = (data: typeof processedTour) => {
    if (!data?.stops?.length) return <div className="text-gray-400 text-center py-10">Chưa có dữ liệu lộ trình.</div>;

    return (
      <div className="ts-fade-in pb-[90px]">
        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-5 px-1">
          Lộ trình chi tiết · {data.stops.length} điểm dừng
        </div>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute top-5 bottom-10 left-5 w-[2px] bg-gray-100 z-0" />

          {data.stops.map((stop, i) => {
            const isExpanded = expandedStopIndex === i;
            const isVisited  = stop.status === 'visited';
            const isCurrent  = stop.status === 'current';

            return (
              <div key={stop.id} className="flex gap-4 mb-3 relative z-10">
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
                  {/* Card top */}
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
                        <p className="text-[13px] text-gray-600 mb-4 leading-relaxed">
                          {stop.desc ?? 'Hương vị đặc trưng không thể nhầm lẫn. Không gian quán mang đậm nét văn hóa địa phương với những câu chuyện thú vị từ người bán.'}
                        </p>
                      )}

                      {/* ── 3 Action buttons ── */}
                      <div className="grid grid-cols-3 gap-2">
                        {/* Chỉ đường */}
                        <button
                          onClick={e => { e.stopPropagation(); handleNavigateToStop(stop); }}
                          className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-[#FF6B35] text-white hover:bg-[#F25A24] transition-all active:scale-95 shadow-sm shadow-[#FF6B35]/30"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                          </svg>
                          <span className="text-[11px] font-bold">Chỉ đường</span>
                        </button>

                        {/* Audio */}
                        <button
                          onClick={e => { e.stopPropagation(); handleListenStop(stop, i); }}
                          disabled={stop.contentLoading}
                          className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-violet-50 text-violet-600 hover:bg-violet-100 transition-all active:scale-95 border border-violet-100 disabled:opacity-50"
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
                          className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all active:scale-95 border border-amber-100"
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
    );
  };

  // ── Guards ───────────────────────────────────────────────────────────────────

  if (!tourId) return (
    <AppShell showBottomNav={false}>
      <div className="p-10 text-center text-gray-400">Không tìm thấy tour.</div>
    </AppShell>
  );

  if (loading && !processedTour) return (
    <AppShell showBottomNav={false}>
      <div className="p-10 text-center text-gray-400 animate-pulse">Đang tải dữ liệu trải nghiệm...</div>
    </AppShell>
  );

  const TABS = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'stops',    label: 'Lộ trình' },
    { id: 'ai',       label: '✨ AI Gợi ý' },
    { id: 'reviews',  label: 'Đánh giá' },
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
                  {processedTour?.name ?? 'Lộ Trình'}
                </h1>
                <p className="text-[12px] text-gray-400 font-medium">Khám phá ẩm thực đường phố Sài Gòn</p>
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
          {tab === 'overview' && renderOverviewTab(processedTour)}
          {tab === 'stops'    && renderStopsTab(processedTour)}
          {tab === 'ai'       && (
            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
              <div className="text-4xl mb-3">✨</div>
              <div className="font-bold text-gray-500">AI Tour Assistant đang bảo trì</div>
              <div className="text-[13px] mt-1">Sẽ sớm trở lại!</div>
            </div>
          )}
          {tab === 'reviews'  && (
            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
              <div className="text-4xl mb-3">⭐</div>
              <div className="font-bold text-gray-500">Chưa có đánh giá</div>
              <div className="text-[13px] mt-1">Hãy là người đầu tiên đánh giá tour này!</div>
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
              Lưu
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
              Chia sẻ
            </button>

            {/* Start */}
            <button
              onClick={handleStartTour}
              className="flex-1 py-3 px-4 rounded-xl bg-[#FF6B35] hover:bg-[#F25A24] text-white font-bold text-[14px] shadow-lg shadow-[#FF6B35]/25 flex justify-center items-center gap-2 transition-all active:scale-[0.98]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
              Bắt đầu Hành trình
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