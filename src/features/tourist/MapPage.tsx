import { useEffect, useState, useRef, useMemo } from "react";
import { useLocation } from 'react-router-dom';
import { Headphones, MapPin } from 'lucide-react';
import MapView, { Marker, Source, Layer } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { 
  Search, Navigation, Crosshair, 
  Map as MapIcon, SlidersHorizontal, X, Clock
} from "lucide-react";
import { useAppStore } from "../../shared/store/appStore";
import { getNearbyPois } from "../../api/services/location";
import { getCachedPoiContent, getPoiContent } from "../../api/services/content";
import BottomNav from "../../shared/ui/BottomNav";
import { useTranslation } from 'react-i18next'
import { SidebarPanel, type SidebarMode } from './components/SidebarPanel';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "YOUR_TOKEN_HERE";

// --- TTS fallback (Web Speech API) ---
function speak(text: string, lang: string, voiceURI?: string) {
  if (!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  if (voiceURI) {
    const voices = window.speechSynthesis.getVoices();
    const v = voices.find((x) => x.voiceURI === voiceURI);
    if (v) u.voice = v;
  }
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}
export function MapPage() {
  const { t } = useTranslation()
  const location = useLocation();
  const state = location.state as any;
  console.log("MapPage received state:", state);
  // Zustand state
  const position = useAppStore((s) => s.position);
  const setPosition = useAppStore((s) => s.setPosition);
  const showToast = useAppStore((s) => s.showToast);
  const language = useAppStore((s) => s.language);

  // UI state
  const [selectedPoi, setSelectedPoi] = useState<any>(null);
  const [fullDetailsPoi, setFullDetailsPoi] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'food' | 'drink' | 'sight'>('all');
  const [isTtsLoading, setIsTtsLoading] = useState(false);
  const [mapStyle, setMapStyle] = useState<"streets" | "outdoors">("outdoors");
  
  // Sidebar unified state
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('empty');
  
  // Routing state
  const [routeData, setRouteData] = useState<any>(null);
  const [isRouting, setIsRouting] = useState(false);

  // const [expandedStopIndex, setExpandedStopIndex] = useState<number>(-1);

  // Responsive state
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // TTS state/refs
  const [selectedMurfVoice] = useState<string | undefined>(undefined);
  const [selectedMurfGender] = useState<'female' | 'male'>('female');
  const [ttsRate] = useState(1);
  const [selectedSpeechLocale] = useState<string | undefined>(undefined);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const seenTtsKeysRef = useRef<Set<string>>(new Set());
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  // const [expandedPoiIndex, setExpandedPoiIndex] = useState<number | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const populateVoices = () => setVoices(window.speechSynthesis.getVoices());
      populateVoices();
      window.speechSynthesis.onvoiceschanged = populateVoices;
    }
  }, []);

  // --- HÀM VẼ ĐƯỜNG TOUR KẾT NỐI NHIỀU ĐIỂM ---
  const handleGetTourRoute = async (points: any[]) => {
    setIsRouting(true);
    try {
      let coordinatesString = '';
      
      // Tùy chọn: Nếu muốn tính luôn đường từ vị trí User hiện tại đến điểm đầu tiên của Tour
      // if (position) coordinatesString += `${position.lng},${position.lat};`;
      
      // Nối tọa độ các điểm: {lng},{lat};{lng},{lat}
      coordinatesString += points.map(p => `${p.lng},${p.lat}`).join(';');

      // Đảm bảo MAPBOX_TOKEN đã được khai báo/import trong file của bạn
      const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${coordinatesString}?steps=true&geometries=geojson&language=${language || 'vi'}&access_token=${MAPBOX_TOKEN}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        setRouteData(data.routes[0]);
      } else {
        showToast({ title: t('tourist.map.noRoute', 'Không tìm thấy tuyến đường cho hành trình này') });
      }
    } catch (error) {
      console.error("Route fetch error:", error);
      showToast({ title: t('tourist.map.routeError', 'Lỗi khi tải dữ liệu lộ trình') });
    } finally {
      setIsRouting(false);
    }
  };

  const [tourPoints, setTourPoints] = useState<any[]>([]);
  
  // --- XỬ LÝ NHẬN TOUR TỪ location.state HOẶC sessionStorage ---
  useEffect(() => {
    let points = null;
    
    // 1. Nhận từ MyTourDetail chuyển sang
    if (state?.autoStartTour && state?.listPoints && state.listPoints.length > 0) {
      points = state.listPoints;
      
      setSidebarMode('tour'); // Chuyển Sidebar qua hiển thị danh sách Tour Stop
      setShowSidebar(true);
      
      // Ghi đè history để user F5 không bị kích hoạt lại logic
      window.history.replaceState({}, document.title);
      sessionStorage.setItem('activeTourRoute', JSON.stringify(points));
    } 
    // 2. Khôi phục từ Session (trường hợp user ấn F5 trang)
    else {
      const saved = sessionStorage.getItem('activeTourRoute');
      if (saved) {
        points = JSON.parse(saved);
        setSidebarMode('tour');
        setShowSidebar(true);
      }
    }

    // 3. Nếu lấy được danh sách điểm -> Cập nhật UI & Load lộ trình
    if (Array.isArray(points) && points.length > 0) {
      setTourPoints(points);
      handleGetTourRoute(points);
    }
  }, [state, language]); 
  // Để language vào dep array để nếu user đổi ngôn ngữ, đường đi sẽ update Instruction text

  // --- XÓA HÀNH TRÌNH ---
  const handleEndTour = () => {
    setTourPoints([]);
    setRouteData(null); // Xoá line vẽ đường đi
    sessionStorage.removeItem('activeTourRoute');
    setSidebarMode('empty');
    setShowSidebar(false);
  };
  // --- Real POI Data ---
  const [apiPois, setApiPois] = useState<any[]>([]);
  // Only fetch nearby POIs when position is set by user (not on initial load)
  const [userSetPosition, setUserSetPosition] = useState(false);
  useEffect(() => {
    if (!position || !userSetPosition) return;
    getNearbyPois({ lat: position.lat, lng: position.lng, radiusMeters: 5000, limit: 30 })
      .then((res) => setApiPois(res.items || []))
      .catch(() => showToast({ title: "Không tải được điểm gần đây" }));
  }, [position, userSetPosition, showToast]);

  const filteredPois = useMemo(() => {
    return apiPois.filter(p => {
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [apiPois, searchQuery, categoryFilter]);

  // --- TTS Logic ---
  const playTTS = async (poi: any, text: string, langArg: string, voiceURI?: string) => {
    try {
      setIsTtsLoading(true);
      const ttsOptions = { voice: selectedMurfVoice, gender: selectedMurfGender, speed: ttsRate };
      const locale = selectedSpeechLocale || langArg || 'vi-VN';
      const ttsKey = [poi.id, locale, ttsOptions.voice ?? "default", ttsOptions.gender, ttsOptions.speed].join("|");
      const preferCache = seenTtsKeysRef.current.has(ttsKey);

      const cached = getCachedPoiContent?.(poi.id, locale, ttsOptions);
      if (cached?.audioUrl) {
        if (currentAudioRef.current) currentAudioRef.current.pause();
        window.speechSynthesis.cancel();
        const audio = new Audio(cached.audioUrl);
        audio.playbackRate = ttsRate;
        currentAudioRef.current = audio;
        await audio.play();
        return;
      }

      const res = await getPoiContent?.(poi.id, locale, { ...ttsOptions, preferCache });
      seenTtsKeysRef.current.add(ttsKey);

      const audioUrl = (res as any)?.data?.audio_url || (res as any)?.audio_url || res?.audioUrl || res?.data?.audioUrl;
      if (audioUrl) {
        if (currentAudioRef.current) currentAudioRef.current.pause();
        window.speechSynthesis.cancel();
        const audio = new Audio(audioUrl);
        audio.playbackRate = ttsRate;
        currentAudioRef.current = audio;
        await audio.play();
        return;
      }
    } catch (err) {
      console.warn("Failed API TTS, running fallback", err);
    } finally {
      setIsTtsLoading(false);
    }

    if (currentAudioRef.current) currentAudioRef.current.pause();
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(`${poi.name}. ${text}`);
      utterance.lang = selectedSpeechLocale || langArg || 'vi-VN';
      utterance.rate = ttsRate;
      const fallbackVoice = voices.find((x) => x.lang === (selectedSpeechLocale || langArg || 'vi-VN'));
      if (fallbackVoice) utterance.voice = fallbackVoice;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      return;
    }
    speak(`${poi.name}. ${text}`, selectedSpeechLocale || langArg || 'vi-VN', voiceURI);
  };

  const handleListen = (poi: any) => {
    const description = poi.short?.[language] || poi.description || poi.name;
    playTTS(poi, description, language);
  };

  // --- Chức năng Chỉ đường ---
  const handleGetDirections = async (destPoi: any) => {
    if (!position) {
      showToast({ title: t('tourist.map.noGps', 'Chưa xác định được vị trí của bạn!') });
      return;
    }
    setSelectedPoi(null);
    setIsRouting(true);
    try {
      const destLng = destPoi.lng ?? destPoi.longitude;
      const destLat = destPoi.lat ?? destPoi.latitude;
      const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${position.lng},${position.lat};${destLng},${destLat}?steps=true&geometries=geojson&language=vi&access_token=${MAPBOX_TOKEN}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        setRouteData({
          ...data.routes[0],
          destinationName: destPoi.name
        });
        setTourPoints([]); // Xóa lộ trình tour khi chỉ đường đơn
        setSidebarMode('directions');
        setShowSidebar(true);
      } else {
        showToast({ title: t('tourist.map.noRoute', 'Không tìm thấy tuyến đường phù hợp') });
      }
    } catch (error) {
      showToast({ title: t('tourist.map.routeError', 'Lỗi khi tải dữ liệu chỉ đường') });
    } finally {
      setIsRouting(false);
    }
  };

  const centerToUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          // Fallback to default if permission denied or error
          setPosition({ lat: 10.7769, lng: 106.6951 });
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setPosition({ lat: 10.7769, lng: 106.6951 });
    }
  };


  // Double click logic
  const [lastClick, setLastClick] = useState<{lng: number, lat: number} | null>(null);
  const [lastClickTime, setLastClickTime] = useState<number>(0);

  // Map click handler
  const handleMapClick = (e: any) => {
    setSelectedPoi(null);
    setFullDetailsPoi(null);
    // Mapbox event: e.lngLat
    const lng = e.lngLat?.lng;
    const lat = e.lngLat?.lat;
    if (typeof lng !== 'number' || typeof lat !== 'number') return;
    const now = Date.now();
    if (
      lastClick &&
      Math.abs(lastClick.lng - lng) < 0.0001 &&
      Math.abs(lastClick.lat - lat) < 0.0001 &&
      now - lastClickTime < 600
    ) {
      // Double click detected on same spot
      setPosition({ lat, lng });
      setUserSetPosition(true);
      showToast({ title: 'Đã chọn vị trí này làm vị trí của bạn!' });
    }
    setLastClick({ lng, lat });
    setLastClickTime(now);
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] overflow-hidden bg-[#f0fdf4] font-sans text-gray-800">
      <div className="absolute inset-0 z-0">
        {showSidebar && (
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300" onClick={() => setShowSidebar(false)} />
        )}

        <div
          className={`fixed z-50 transition-transform duration-500 ease-in-out shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/40 bg-white/80 backdrop-blur-2xl
            ${!isMobile 
              ? `top-4 left-4 bottom-24 w-[380px] rounded-3xl ${showSidebar ? 'translate-x-0' : '-translate-x-[120%]'}` 
              : `left-0 bottom-0 w-full h-[65vh] rounded-t-3xl ${showSidebar ? 'translate-y-0' : 'translate-y-full'}`
            }`}
          style={{ pointerEvents: showSidebar ? 'auto' : 'none' }}
        >
          <SidebarPanel
            mode={sidebarMode}
            selectedPoi={selectedPoi}
            language={language}
            tourPoints={tourPoints}
            routeData={routeData}
            isTtsLoading={isTtsLoading}
            isRouting={isRouting}
            onClose={() => { setShowSidebar(false); setSidebarMode('empty'); setSelectedPoi(null); }}
            onListen={handleListen}
            onGetDirections={handleGetDirections}
            onEndTour={handleEndTour}
            t={t}
            filteredPois={filteredPois}
            centerToUser={centerToUser}
            isMobile={isMobile}
          />
        </div>

        <div className="w-full h-full">
          <MapView
            initialViewState={{ longitude: position?.lng ?? 106.6951, latitude: position?.lat ?? 10.7769, zoom: 15.5, pitch: 45 }}
            mapStyle={`mapbox://styles/mapbox/${mapStyle}-v12`}
            mapboxAccessToken={MAPBOX_TOKEN}
            style={{ width: "100%", height: "100%" }}
            onClick={handleMapClick}
            attributionControl={false}
          >
            {routeData && (
              <Source id="route" type="geojson" data={routeData.geometry}>
                <Layer
                  id="route-line"
                  type="line"
                  source="route"
                  layout={{ 'line-join': 'round', 'line-cap': 'round' }}
                  paint={{ 'line-color': '#10b981', 'line-width': 6, 'line-opacity': 0.8 }}
                />
              </Source>
            )}

            <Marker longitude={position?.lng ?? 106.6951} latitude={position?.lat ?? 10.7769}>
              <div className="relative flex items-center justify-center w-14 h-14">
                <div className="absolute w-10 h-10 bg-blue-500 rounded-full opacity-30 animate-ping" />
                <div className="relative w-6 h-6 bg-blue-600 border-4 border-white rounded-full shadow-xl" />
              </div>
            </Marker>

            {filteredPois.map((poi) => (
              <Marker
                key={poi.id}
                longitude={poi.lng ?? poi.longitude}
                latitude={poi.lat ?? poi.latitude}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setSelectedPoi(poi);
                  setSidebarMode('poi');
                  setShowSidebar(true);
                }}
              >
                <div className={`relative flex flex-col items-center justify-center transition-all duration-300 origin-bottom ${selectedPoi?.id === poi.id ? 'scale-125 z-10' : 'hover:scale-110 cursor-pointer'}`}>
                  <div className={`flex items-center justify-center w-11 h-11 bg-white/90 backdrop-blur-sm rounded-full shadow-[0_5px_15px_rgba(0,0,0,0.15)] border-2 text-xl ${selectedPoi?.id === poi.id ? 'border-emerald-600 ring-4 ring-emerald-500/30' : 'border-emerald-400'}`}>
                    {poi.category === 'food' ? '🍜' : poi.category === 'drink' ? '☕' : '📸'}
                  </div>
                  <div className="w-2.5 h-2.5 mt-1 bg-emerald-700/80 rounded-full shadow-sm" />
                </div>
              </Marker>
            ))}

          </MapView>
        </div>
      </div>

      {/* --- LỚP OVERLAY TÌM KIẾM & FLOATING BUTTONS --- */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-4 sm:p-6">
        
        {/* Top: Thanh tìm kiếm & Filter */}
        <div className="flex flex-col gap-2 w-full max-w-lg mx-auto sm:mt-2 pointer-events-auto">
          <div className="flex items-center px-3 py-2 bg-white/90 backdrop-blur border border-gray-200 shadow focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-400 rounded-2xl transition-all">
            <Search className="text-emerald-700 mr-2" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm địa điểm, ẩm thực..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400 font-medium text-[15px] sm:text-base"
              style={{ minWidth: 0 }}
            />
            <button
              className={`p-2 rounded-md transition-colors ml-2 ${showSidebar ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
              onClick={() => setShowSidebar(!showSidebar)}
              type="button"
            >
              <SlidersHorizontal size={16} />
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-0.5 px-0.5">
            {[ 
              { id: 'all', label: 'Tất cả' },
              { id: 'food', label: 'Ăn uống', icon: '🍜' },
              { id: 'drink', label: 'Cà phê', icon: '☕' },
              { id: 'sight', label: 'Tham quan', icon: '📸' }
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryFilter(c.id as any)}
                className={`flex items-center whitespace-nowrap px-3 py-1.5 rounded-3xl text-[14px] font-semibold transition-all duration-200 border ${
                  categoryFilter === c.id
                    ? 'bg-emerald-600 text-white shadow ring-1 ring-emerald-500 border-emerald-500'
                    : 'bg-white/90 backdrop-blur text-gray-600 hover:bg-gray-100 border-gray-200 shadow-sm'
                }`}
                type="button"
              >
                {c.icon && <span className="mr-1 text-[15px]">{c.icon}</span>}
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Floating Actions */}
        {!showSidebar && (
          <div className={`flex justify-between items-end transition-all duration-300 ${isMobile && showSidebar ? 'mb-2' : 'mb-20 sm:mb-24'}`} style={{ pointerEvents: 'auto' }}>
          <button 
            onClick={() => setMapStyle(s => s === 'outdoors' ? 'streets' : 'outdoors')}
            className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-white/80 backdrop-blur-xl rounded-full shadow-lg border border-white/60 text-emerald-700 hover:bg-white hover:scale-105 transition-all"
          >
            <MapIcon size={24} />
          </button>
          <button 
            onClick={centerToUser}
            className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-white/80 backdrop-blur-xl rounded-full shadow-lg border border-white/60 text-blue-600 hover:bg-white hover:scale-105 transition-all"
          >
            <Crosshair size={24} />
          </button>
        </div>
        )}
      </div>

      {/* --- MODAL CHI TIẾT MỞ RỘNG (BOTTOM DRAWER) --- */}
      <div 
        className={`fixed inset-0 z-[60] flex items-end sm:items-center justify-center transition-all duration-500 ${fullDetailsPoi ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Lớp nền đen mờ */}
        <div 
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
          onClick={() => setFullDetailsPoi(null)}
        />
        
        {/* Nội dung bảng chi tiết */}
        <div 
          className={`relative w-full sm:w-[500px] md:w-[600px] h-[85vh] sm:h-[80vh] bg-white/90 backdrop-blur-2xl rounded-t-3xl sm:rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.3)] border border-white/50 flex flex-col transform transition-transform duration-500 ease-out overflow-hidden ${fullDetailsPoi ? 'translate-y-0 scale-100' : 'translate-y-full sm:translate-y-10 sm:scale-95'}`}
        >
          {fullDetailsPoi && (
            <>
              {/* Nút đóng */}
              <button onClick={() => setFullDetailsPoi(null)} className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white rounded-full transition-all">
                <X size={24}/>
              </button>
              
              {/* Ảnh bìa lớn */}
              <div className="relative w-full h-56 sm:h-64 shrink-0">
                <img src={fullDetailsPoi.imageUrl || "https://via.placeholder.com/600x400?text=No+Image"} alt={fullDetailsPoi.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute bottom-4 left-6 right-6">
                  <div className="flex gap-2 mb-2">
                    {fullDetailsPoi.category && <span className="bg-emerald-500 text-white px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">{fullDetailsPoi.category}</span>}
                  </div>
                  <h2 className="text-3xl font-black text-white leading-tight drop-shadow-md">{fullDetailsPoi.name}</h2>
                </div>
              </div>

              {/* Nội dung chi tiết cuộn được */}
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gradient-to-b from-white/50 to-transparent">
                
                {/* Simulated Address/Time Info */}
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200/50">
                   <div className="flex items-center gap-1.5"><Clock size={16} className="text-emerald-600"/> 07:00 - 22:00</div>
                   <div className="flex items-center gap-1.5"><MapPin size={16} className="text-emerald-600"/> {fullDetailsPoi.address || "Tọa độ: " + (fullDetailsPoi.lat || "N/A")}</div>
                </div>

                {/* Giả lập các trường từ bảng poi_content */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-emerald-500 rounded-full inline-block"></span>
                      Giới thiệu tổng quan
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-base text-justify">
                      {fullDetailsPoi.description || fullDetailsPoi.short?.[language] || "Đây là thông tin mô tả chi tiết được lấy từ database. Ứng dụng sẽ hiển thị toàn bộ nội dung lịch sử, văn hóa, hoặc các món ăn nổi bật của địa điểm này tại đây."}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-blue-500 rounded-full inline-block"></span>
                      Ý nghĩa lịch sử & Văn hóa
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-base text-justify italic">
                      "Nội dung này được trích xuất từ bảng <b>poi_content</b>, mô tả chiều sâu văn hóa của địa điểm nhằm mang lại trải nghiệm Tour Guide chân thực nhất cho du khách..."
                    </p>
                  </div>
                </div>
              </div>

              {/* Nút hành động nổi ở Bottom Drawer */}
              <div className="p-4 bg-white/90 backdrop-blur-md border-t border-gray-100 flex gap-3 shrink-0">
                <button 
                  onClick={() => { setFullDetailsPoi(null); handleGetDirections(fullDetailsPoi); }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                >
                  <Navigation size={20}/> Bắt đầu chỉ đường
                </button>
                <button 
                  onClick={() => handleListen(fullDetailsPoi)}
                  className="px-6 bg-violet-100 hover:bg-violet-200 text-violet-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Headphones size={20}/> Nghe
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* BottomNav */}
      {!(isMobile && showSidebar) && (
        <div className="fixed bottom-0 left-0 w-full z-40 pointer-events-auto">
          <BottomNav />
        </div>
      )}

      {/* CSS Tuỳ chỉnh */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.4); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-glass-popup .mapboxgl-popup-content {
          background: transparent !important;
          padding: 0 !important;
          box-shadow: none !important;
        }
        .custom-glass-popup .mapboxgl-popup-tip {
          border-top-color: rgba(255, 255, 255, 0.85) !important;
          backdrop-filter: blur(16px);
        }
      `}</style>
    </div>
  );
}