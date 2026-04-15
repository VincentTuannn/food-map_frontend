import React, { useEffect, useState, useRef, useMemo } from "react";
import MapView, { Marker, Popup, Source, Layer } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { 
  Search, MapPin, Navigation, Info, Headphones, Crosshair, 
  Map as MapIcon, SlidersHorizontal, X, Clock, Route as RouteIcon 
} from "lucide-react";
import { useAppStore } from "../../shared/store/appStore";
import { getNearbyPois } from "../../api/services/location";
import { getCachedPoiContent, getPoiContent } from "../../api/services/content";
import BottomNav from "../../shared/ui/BottomNav";

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

function TabButton({ active, tabName, onClick, children }: { active?: boolean; tabName: string; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      className={`px-5 py-3 rounded-t-2xl font-bold text-sm sm:text-base transition-all duration-300 focus:outline-none ${
        active
          ? 'bg-white/80 backdrop-blur-md shadow-sm text-emerald-700 border-b-2 border-emerald-500'
          : 'bg-transparent text-gray-400 hover:text-emerald-500 hover:bg-white/40 border-b-2 border-transparent'
      }`}
      style={{ minWidth: 110 }}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function MapPage() {
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
  
  // Sidebar/BottomSheet state
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'list' | 'directions'>('list');
  
  // Routing state
  const [routeData, setRouteData] = useState<any>(null);
  const [isRouting, setIsRouting] = useState(false);

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

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const populateVoices = () => setVoices(window.speechSynthesis.getVoices());
      populateVoices();
      window.speechSynthesis.onvoiceschanged = populateVoices;
    }
  }, []);

  // --- Real POI Data ---
  const [apiPois, setApiPois] = useState<any[]>([]);
  useEffect(() => {
    if (!position) return;
    getNearbyPois({ lat: position.lat, lng: position.lng, radiusMeters: 5000, limit: 30 })
      .then((res) => setApiPois(res.items || []))
      .catch(() => showToast({ title: "Không tải được điểm gần đây" }));
  }, [position, showToast]);

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
      showToast({ title: "Chưa xác định được vị trí của bạn!" });
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
        setSidebarTab('directions');
        setShowSidebar(true);
      } else {
        showToast({ title: "Không tìm thấy tuyến đường phù hợp" });
      }
    } catch (error) {
      showToast({ title: "Lỗi khi tải dữ liệu chỉ đường" });
    } finally {
      setIsRouting(false);
    }
  };

  const centerToUser = () => setPosition({ lat: 10.7769, lng: 106.6951 });

  return (
    // FIX Ở ĐÂY: Dùng fixed, inset-0 và h-[100dvh] để chốt chặt khung hình, chống scroll trên mobile
    <div className="fixed inset-0 w-full h-[100dvh] overflow-hidden bg-[#f0fdf4] font-sans text-gray-800">
      {/* --- LỚP BẢN ĐỒ CHÍNH --- */}
      <div className="absolute inset-0 z-0">
        {/* Overlay mờ khi mở Sidebar */}
        {showSidebar && (
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300" onClick={() => setShowSidebar(false)} />
        )}

        {/* Sidebar / BottomSheet */}
        <div
          className={`fixed z-50 transition-transform duration-500 ease-in-out shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/40 bg-white/80 backdrop-blur-2xl
            ${!isMobile 
              ? `top-4 left-4 bottom-24 w-[380px] rounded-3xl ${showSidebar ? 'translate-x-0' : '-translate-x-[120%]'}` 
              : `left-0 bottom-0 w-full h-[65vh] rounded-t-3xl ${showSidebar ? 'translate-y-0' : 'translate-y-full'}`
            }`}
          style={{ pointerEvents: showSidebar ? 'auto' : 'none' }}
        >
          <div className="flex items-center gap-2 px-4 pt-4 pb-0 border-b border-white/50">
            <TabButton active={sidebarTab === 'list'} tabName="list" onClick={() => setSidebarTab('list')}>Điểm đến</TabButton>
            <TabButton active={sidebarTab === 'directions'} tabName="directions" onClick={() => setSidebarTab('directions')}>Hành trình</TabButton>
            <button className="ml-auto p-2 mb-2 bg-white/50 rounded-full hover:bg-white text-gray-500 transition-all shadow-sm" onClick={() => setShowSidebar(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="p-4 overflow-y-auto h-[calc(100%-70px)] custom-scrollbar">
            {/* Nội dung danh sách điểm */}
            {sidebarTab === 'list' && (
              <div className="animate-in fade-in duration-300">
                <h3 className="text-lg font-extrabold mb-4 text-emerald-800 flex items-center gap-2">
                  <MapPin size={20}/> Khám phá quanh đây
                </h3>
                {filteredPois.length === 0 && <div className="text-gray-500 italic">Không tìm thấy địa điểm phù hợp.</div>}
                <ul className="space-y-3">
                  {filteredPois.map((poi) => (
                    <li key={poi.id} className="flex gap-4 p-3 bg-white/60 hover:bg-white rounded-2xl shadow-sm border border-white/60 transition-all cursor-pointer hover:shadow-md hover:-translate-y-0.5 group" onClick={() => { setSelectedPoi(poi); setShowSidebar(false); centerToUser(); }}>
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
              </div>
            )}

            {/* Nội dung Hành trình */}
            {sidebarTab === 'directions' && (
              <div className="animate-in fade-in duration-300">
                <h3 className="text-lg font-extrabold mb-4 text-emerald-800 flex items-center gap-2">
                  <RouteIcon size={20}/> Hướng dẫn di chuyển
                </h3>
                {!routeData ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center text-gray-500 bg-white/40 rounded-2xl border border-dashed border-gray-300">
                    <RouteIcon size={32} className="mb-2 text-gray-300"/>
                    <p>Chưa có hành trình.<br/>Hãy chọn một địa điểm và bấm "Chỉ đường".</p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between p-4 mb-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl shadow-md">
                      <div>
                        <div className="text-xs font-medium opacity-80 uppercase tracking-wide">Đến</div>
                        <div className="text-lg font-bold line-clamp-1">{routeData.destinationName}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black">{Math.round(routeData.duration / 60)} phút</div>
                        <div className="text-sm font-medium opacity-90">{(routeData.distance / 1000).toFixed(1)} km</div>
                      </div>
                    </div>
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                      {routeData.legs[0].steps.map((step: any, idx: number) => (
                        <div key={idx} className="relative flex items-start gap-4 z-10">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm border-2 border-emerald-500 text-emerald-600 font-bold text-xs shrink-0 mt-1">
                            {idx + 1}
                          </div>
                          <div className="flex-1 bg-white/70 p-3 rounded-xl shadow-sm border border-white/50">
                            <p className="text-gray-800 font-medium text-sm">{step.maneuver.instruction}</p>
                            {step.distance > 0 && <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">{Math.round(step.distance)}m</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* MapView */}
        <div className="w-full h-full">
          <MapView
            initialViewState={{ longitude: position?.lng ?? 106.6951, latitude: position?.lat ?? 10.7769, zoom: 15.5, pitch: 45 }}
            mapStyle={`mapbox://styles/mapbox/${mapStyle}-v12`}
            mapboxAccessToken={MAPBOX_TOKEN}
            style={{ width: "100%", height: "100%" }}
            onClick={() => { setSelectedPoi(null); setFullDetailsPoi(null); }}
            attributionControl={false}
          >
            {/* Vẽ đường đi (Route) */}
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

            {/* Vị trí người dùng */}
            <Marker longitude={position?.lng ?? 106.6951} latitude={position?.lat ?? 10.7769}>
              <div className="relative flex items-center justify-center w-14 h-14">
                <div className="absolute w-10 h-10 bg-blue-500 rounded-full opacity-30 animate-ping" />
                <div className="relative w-6 h-6 bg-blue-600 border-4 border-white rounded-full shadow-xl" />
              </div>
            </Marker>

            {/* POI Markers */}
            {filteredPois.map((poi) => (
              <Marker
                key={poi.id}
                longitude={poi.lng ?? poi.longitude}
                latitude={poi.lat ?? poi.latitude}
                anchor="bottom"
                onClick={(e) => { e.originalEvent.stopPropagation(); setSelectedPoi(poi); }}
              >
                <div className={`relative flex flex-col items-center justify-center transition-all duration-300 origin-bottom ${selectedPoi?.id === poi.id ? 'scale-125 z-10' : 'hover:scale-110 cursor-pointer'}`}>
                  <div className={`flex items-center justify-center w-11 h-11 bg-white/90 backdrop-blur-sm rounded-full shadow-[0_5px_15px_rgba(0,0,0,0.15)] border-2 text-xl ${selectedPoi?.id === poi.id ? 'border-emerald-600 ring-4 ring-emerald-500/30' : 'border-emerald-400'}`}>
                    {poi.category === 'food' ? '🍜' : poi.category === 'drink' ? '☕' : '📸'}
                  </div>
                  <div className="w-2.5 h-2.5 mt-1 bg-emerald-700/80 rounded-full shadow-sm" />
                </div>
              </Marker>
            ))}

            {/* Popup POI */}
            {selectedPoi && (
              <Popup
                longitude={selectedPoi.lng ?? selectedPoi.longitude}
                latitude={selectedPoi.lat ?? selectedPoi.latitude}
                anchor="bottom"
                offset={35}
                onClose={() => setSelectedPoi(null)}
                closeOnClick={false}
                closeButton={false}
                className="z-40 custom-glass-popup"
                maxWidth="none"
              >
                <div className="flex flex-col w-[320px] md:w-[400px] bg-white/85 backdrop-blur-xl rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/60 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  
                  {/* Ảnh cover */}
                  <div className="relative w-full h-40 bg-gray-200">
                    {selectedPoi.imageUrl ? (
                      <img src={selectedPoi.imageUrl} alt={selectedPoi.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-emerald-800 bg-emerald-100"><MapPin size={36} /></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <button onClick={() => setSelectedPoi(null)} className="absolute top-3 right-3 p-1.5 bg-black/30 hover:bg-black/50 backdrop-blur text-white rounded-full transition-colors"><X size={16}/></button>
                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="text-xl md:text-2xl font-extrabold text-white leading-tight drop-shadow-lg line-clamp-2">{selectedPoi.name}</h3>
                    </div>
                  </div>

                  {/* Body Text */}
                  <div className="p-5">
                    <p className="text-sm text-gray-600 mb-4 font-medium line-clamp-3 leading-relaxed">
                      {selectedPoi.short?.[language] || selectedPoi.description || "Một địa điểm tuyệt vời để khám phá trên hành trình của bạn."}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 text-xs font-semibold text-gray-600 mb-5">
                      {selectedPoi.category && <span className="bg-emerald-100/80 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200">{selectedPoi.category === 'food' ? 'Ẩm thực' : selectedPoi.category === 'drink' ? 'Cà phê' : 'Tham quan'}</span>}
                      {selectedPoi.rating && <span className="bg-yellow-100/80 text-yellow-800 px-3 py-1.5 rounded-xl border border-yellow-200 flex items-center gap-1">★ {selectedPoi.rating}</span>}
                    </div>

                    {/* 3 Nút Actions */}
                    <div className="grid grid-cols-3 gap-3">
                      <button 
                        onClick={() => setFullDetailsPoi(selectedPoi)}
                        className="group flex flex-col items-center justify-center py-2.5 px-1 bg-white/50 hover:bg-white border border-gray-100 hover:border-blue-200 text-gray-500 hover:text-blue-600 rounded-2xl shadow-sm transition-all duration-300"
                      >
                        <div className="mb-1 text-blue-500 group-hover:scale-110 transition-transform"><Info size={22} /></div>
                        <span className="text-[12px] font-bold tracking-wide">Chi tiết</span>
                      </button>
                      
                      <button 
                        onClick={() => handleGetDirections(selectedPoi)}
                        disabled={isRouting}
                        className="group flex flex-col items-center justify-center py-2.5 px-1 bg-emerald-50/50 hover:bg-emerald-500 border border-emerald-100 text-emerald-600 hover:text-white rounded-2xl shadow-sm transition-all duration-300"
                      >
                        <div className="mb-1 group-hover:scale-110 transition-transform">
                           {isRouting ? <div className="w-[22px] h-[22px] border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" /> : <Navigation size={22} />}
                        </div>
                        <span className="text-[12px] font-bold tracking-wide">{isRouting ? 'Đang vẽ...' : 'Chỉ đường'}</span>
                      </button>
                      
                      <button 
                        disabled={isTtsLoading}
                        onClick={() => handleListen(selectedPoi)}
                        className="group flex flex-col items-center justify-center py-2.5 px-1 bg-white/50 hover:bg-white border border-gray-100 hover:border-violet-200 text-gray-500 hover:text-violet-600 rounded-2xl shadow-sm transition-all duration-300"
                      >
                        <div className="mb-1 text-violet-500 group-hover:scale-110 transition-transform flex items-center justify-center">
                          {isTtsLoading ? <div className="w-[22px] h-[22px] border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /> : <Headphones size={22} />}
                        </div>
                        <span className="text-[12px] font-bold tracking-wide">{isTtsLoading ? "Đang tải" : "Thuyết minh"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </Popup>
            )}
          </MapView>
        </div>
      </div>

      {/* --- LỚP OVERLAY TÌM KIẾM & FLOATING BUTTONS --- */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-4 sm:p-6">
        
        {/* Top: Thanh tìm kiếm & Filter */}
        <div className="flex flex-col gap-3 w-full max-w-xl mx-auto sm:mt-2 pointer-events-auto">
          <div className="flex items-center px-5 py-3.5 bg-white/80 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-full transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/40">
            <Search className="text-emerald-700 mr-3" size={22} />
            <input
              type="text"
              placeholder="Khám phá điểm đến, ẩm thực..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400 font-medium text-base sm:text-lg"
            />
            <button
              className={`p-2 rounded-full transition-colors ${showSidebar ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>

          <div className="flex gap-2.5 overflow-x-auto custom-scrollbar pb-1 px-1">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'food', label: 'Ăn uống', icon: '🍜' },
              { id: 'drink', label: 'Cà phê', icon: '☕' },
              { id: 'sight', label: 'Tham quan', icon: '📸' }
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryFilter(c.id as any)}
                className={`flex items-center whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                  categoryFilter === c.id
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-emerald-500 border border-emerald-500'
                    : 'bg-white/80 backdrop-blur-md text-gray-600 hover:bg-white border border-white/60 shadow-sm'
                }`}
              >
                {c.icon && <span className="mr-1.5 text-base">{c.icon}</span>}
                {c.label}
              </button>
                        ))}
          </div>
        </div> {/* <-- thêm dấu đóng div này để kết thúc khối filter chips */}

        {/* Bottom Floating Actions */}
        <div className={`flex justify-between items-end transition-all duration-300 pointer-events-auto ${isMobile && showSidebar ? 'mb-2' : 'mb-20 sm:mb-24'}`}>
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