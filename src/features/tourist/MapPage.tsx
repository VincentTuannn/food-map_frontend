import { useEffect, useMemo, useRef, useState } from "react";
import { distanceMeters } from "../../shared/lib/geo";
import { POIS as MockPOIS } from "../../shared/mock/pois";
import { getNearbyPois } from "../../api/services/location";
import { useAppStore } from "../../shared/store/appStore";
import { AppShell } from "../../shared/ui/AppShell";
import { useT } from "../../shared/i18n/useT";
import type {
  DirectionsProfile,
  DirectionsRoute,
} from "../../api/services/directions";
import { mockDirections } from "../../api/mocks/directions.mock";
import { PoiDetails } from "./PoiPage";
import { getCachedPoiContent, getPoiContent } from "../../api/services/content";

import Map, { Marker, Popup } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

function speak(text: string, lang: string, voiceURI?: string) {
  if (!("speechSynthesis" in window)) return;
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
  const language = useAppStore((s) => s.language);
  const theme = useAppStore((s) => s.theme);
  const radiusMeters = useAppStore((s) => s.radiusMeters);
  const position = useAppStore((s) => s.position);
  const setPosition = useAppStore((s) => s.setPosition);
  const showToast = useAppStore((s) => s.showToast);
  const t = useT();

  const [ttsOn, setTtsOn] = useState(true);
  const [profile, setProfile] = useState<DirectionsProfile>("walking");
  const [route, setRoute] = useState<DirectionsRoute | undefined>(undefined);
  const lastTriggerRef = useRef<string | undefined>(undefined);
  const [selectedPoi, setSelectedPoi] = useState<any>(null);

  const [showTtsSettings, setShowTtsSettings] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  const [viewingPoi, setViewingPoi] = useState<any>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedSpeechLocale, setSelectedSpeechLocale] = useState<string>("en-US");
  const [selectedMurfVoice, setSelectedMurfVoice] = useState<string>("");
  const [selectedMurfGender, setSelectedMurfGender] = useState<"female" | "male">("female");
  const [ttsRate, setTtsRate] = useState(1);
  const [isTtsLoading, setIsTtsLoading] = useState(false);

  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const seenTtsKeysRef = useRef<Set<string>>(new Set());

  const playTTS = async (poi: any, text: string, langArg: string, voiceURI?: string) => {
    try {
      setIsTtsLoading(true);
      const ttsOptions = {
        voice: selectedMurfVoice || undefined,
        gender: selectedMurfGender,
        speed: ttsRate,
      };
      const ttsKey = [
        poi.id,
        selectedSpeechLocale,
        ttsOptions.voice ?? "default",
        ttsOptions.gender,
        ttsOptions.speed,
      ].join("|");
      const preferCache = seenTtsKeysRef.current.has(ttsKey);

      const res = await getPoiContent(poi.id, selectedSpeechLocale, {
        ...ttsOptions,
        preferCache,
      });
      seenTtsKeysRef.current.add(ttsKey);

      // Attempt to extract the URL depending on how the backend ultimately builds the response payload
      const audioUrl = (res as any)?.data?.audio_url || (res as any)?.audio_url || res?.audioUrl || res?.data?.audioUrl;

      if (audioUrl) {
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
        }
        window.speechSynthesis.cancel(); // Also stop any ongoing web speech
        const audio = new Audio(audioUrl);
        audio.playbackRate = ttsRate;
        currentAudioRef.current = audio;
        await audio.play();
        return; // Success, skip fallback
      }
    } catch (err) {
      console.warn("Failed to fetch API TTS, running fallback Web Speech API", err);
    } finally {
      setIsTtsLoading(false);
    }
    
    // Fallback to Web Speech API when backend has no TTS URL
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(`${poi.name}. ${text}`);
      utterance.lang = selectedSpeechLocale || langArg;
      utterance.rate = ttsRate;
      const fallbackVoice = voices.find((x) => x.lang === (selectedSpeechLocale || langArg));
      if (fallbackVoice) utterance.voice = fallbackVoice;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      return;
    }
    speak(`${poi.name}. ${text}`, langArg, voiceURI);
  };

  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) setVoices(v);
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    const w = navigator.geolocation.watchPosition(
      (p) => {
        setPosition({ lat: p.coords.latitude, lng: p.coords.longitude });
      },
      () => {
        // ignore
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10_000 }
    );
    return () => navigator.geolocation.clearWatch(w);
  }, [setPosition]);

  const [apiPois, setApiPois] = useState<any[]>([]);

  useEffect(() => {
    if (!position) return;
    //Tạm thời test 50km
    // Fetch real POIs from backend, limiting radius to 50km for demo
    getNearbyPois({ lat: position.lat, lng: position.lng, radiusMeters: 50000, limit: 100 })
      .then((res) => setApiPois(res.items))
      .catch((e) => console.error(e));
  }, [position]);

  const poisWithDistance = useMemo(() => {
    if (!position) return [];
    
    // Khôi phục lại toàn bộ mock data cho người dùng dễ nhìn thấy điểm trên map
    const allPois = [...MockPOIS];
    
    // Kết hợp (merge) dữ liệu từ backend nếu có
    for (const p of apiPois) {
       const existingIndex = allPois.findIndex(m => m.id === p.id);
       if (existingIndex >= 0) {
           // Có trong mock -> đè tọa độ/tên từ backend lên
           allPois[existingIndex] = { ...allPois[existingIndex], ...p };
       } else {
           // Không có trong mock (chắc backend user tự tạo mới) -> mượn tạm ảnh/fields của Mock 0 để UI khỏi vỡ
           allPois.push({ ...MockPOIS[0], ...p, id: p.id }); 
       }
    }

    return allPois.map((p) => {
      return {
        p: p,
        d: distanceMeters(position, { lat: p.lat, lng: p.lng }),
      };
    }).sort((a, b) => (a.d ?? Number.POSITIVE_INFINITY) - (b.d ?? Number.POSITIVE_INFINITY));
  }, [position, apiPois]);

  const speechLang =
    language === "vi"
      ? "vi-VN"
      : language === "ja"
      ? "ja-JP"
      : language === "zh"
      ? "zh-CN"
      : language === "ko"
      ? "ko-KR"
      : "en-US";

  const murfLocale = selectedSpeechLocale || speechLang;
  const murfVoicesByLocale: Record<string, { female: string; male: string }> = {
    "vi-VN": { female: "Jacek", male: "Peter" },
    "en-US": { female: "Natalie", male: "Ken" },
    "ja-JP": { female: "Hina", male: "Denki" },
    "ko-KR": { female: "Gyeong", male: "Hwan" },
    "zh-CN": { female: "Jiao", male: "Tao" },
    "fr-FR": { female: "Adélie", male: "Guillaume" },
    "de-DE": { female: "Ruby", male: "Matthias" },
    "es-ES": { female: "Elvira", male: "Javier" },
  };
  const murfVoices = murfVoicesByLocale[murfLocale] ?? murfVoicesByLocale["en-US"];

  useEffect(() => {
    if (!selectedMurfVoice) {
      setSelectedMurfVoice(murfVoices[selectedMurfGender]);
    }
  }, [murfLocale, murfVoices, selectedMurfGender, selectedMurfVoice]);

  useEffect(() => {
    setSelectedSpeechLocale(speechLang);
  }, [speechLang]);

  const speechLocaleOptions = ["vi-VN", "en-US", "ja-JP", "ko-KR", "zh-CN"];

  useEffect(() => {
    if (!position) return;
    const nearby = poisWithDistance.find(
      (x) => x.d !== undefined && x.d <= radiusMeters
    );
    if (!nearby) return;
    if (lastTriggerRef.current === nearby.p.id) return;
    lastTriggerRef.current = nearby.p.id;

    const msg =
      language === "vi"
        ? nearby.p.short.vi
        : language === "ja"
        ? nearby.p.short.ja
        : language === "zh"
        ? nearby.p.short.zh
        : language === "ko"
        ? nearby.p.short.ko
        : nearby.p.short.en;
    showToast({
      title: `${t("tourist.map.nearByToast")}${nearby.p.name}`,
      message: msg,
    });

    if (ttsOn) {
      playTTS(nearby.p, msg, speechLang, selectedSpeechLocale);
    }
  }, [language, poisWithDistance, position, radiusMeters, showToast, ttsOn, speechLang, selectedSpeechLocale]);

  return (
    <AppShell>
      {/* 1. LAYER MAP (FIXED TO BACKGROUND) */}
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 }}>
        <Map
          initialViewState={{
            longitude: position ? position.lng : 106.6669,
            latitude: position ? position.lat : 10.7548,
            zoom: 16,
          }}
          mapStyle={theme === 'dark' ? "mapbox://styles/mapbox/navigation-night-v1" : "mapbox://styles/mapbox/streets-v12"}
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ height: "100%", width: "100%", zIndex: 1 }}
          onClick={() => {
            setSelectedPoi(null);
            setViewingPoi(null);
          }}
        >
          {position && <Marker longitude={position.lng} latitude={position.lat} color="#3b82f6" />}

          {poisWithDistance.map(({ p: poi }) => (
            <Marker
              key={poi.id}
              longitude={poi.lng}
              latitude={poi.lat}
              color="#ef4444"
              onClick={(e: any) => {
                e.originalEvent.stopPropagation();
                setSelectedPoi(poi);
              }}
            />
          ))}

          {selectedPoi && (
            <Popup
              longitude={selectedPoi.lng}
              latitude={selectedPoi.lat}
              anchor="bottom"
              onClose={() => setSelectedPoi(null)}
              closeOnClick={true}
              closeButton={false}
              maxWidth="260px"
              style={{ zIndex: 10 }}
            >
              <div style={{ padding: "4px", width: "100%" }}>
                {selectedPoi.imageUrl && (
                  <img
                    src={selectedPoi.imageUrl}
                    alt={selectedPoi.name}
                    style={{
                      width: "100%",
                      height: 120,
                      objectFit: "cover",
                      borderRadius: 8,
                      marginBottom: 8,
                    }}
                  />
                )}
                <h3 style={{ margin: "0 0 6px 0", fontSize: 16, fontWeight: 700 }}>
                  {selectedPoi.name}
                </h3>
                <div className="row" style={{ marginTop: 8 }}>
                  <button
                    className="btn btnPrimary"
                    style={{ flex: 1, padding: "8px", fontSize: 13 }}
                    onClick={() => setViewingPoi(selectedPoi)}
                  >
                    Xem chi tiết
                  </button>
                  <button
                    className="btn"
                    style={{ padding: "8px", fontSize: 13 }}
                    disabled={isTtsLoading}
                    onClick={() => {
                      const msg =
                        language === "vi"
                          ? selectedPoi.short.vi
                          : language === "ja"
                          ? selectedPoi.short.ja
                          : language === "zh"
                          ? selectedPoi.short.zh
                          : language === "ko"
                          ? selectedPoi.short.ko
                          : selectedPoi.short.en;
                      playTTS(selectedPoi, msg, speechLang, selectedSpeechLocale);
                    }}
                  >
                    {isTtsLoading ? <span className="spinner" aria-hidden="true" /> : "🔊"}
                    <span>{isTtsLoading ? "Đang tạo" : "Nghe"}</span>
                  </button>
                </div>
              </div>
            </Popup>
          )}
        </Map>
      </div>

      {/* 2. LAYER OVERLAY (FLOATING PANELS) */}
      <div
        style={{
          position: "fixed",
          top: 80, // Allow space for AppShell's TopBar
          left: 14,
          right: 14,
          bottom: 80, // Allow space for AppShell's BottomNav
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          zIndex: 10,
        }}
      >
        {/* TOP COMPACT CONTROLS */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          
          {/* LEFT: Directions Panel */}
          <div style={{ flex: 1, maxWidth: 320, pointerEvents: "auto" }}>
            {showDirections && (
              <div className="card cardPad" style={{ background: "var(--panel)", backdropFilter: "blur(16px)", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
                 <div className="rowBetween" style={{ marginBottom: 12 }}>
                   <div style={{ fontWeight: 800 }}>{t("tourist.map.directionsTitle")}</div>
                   <button className="btn btnGhost" style={{ padding: "4px 8px" }} onClick={() => setShowDirections(false)}>✕</button>
                 </div>
                 <div className="row">
                    <select className="select" value={profile} onChange={(e) => setProfile(e.target.value as DirectionsProfile)}>
                      <option value="walking">{t("tourist.map.walking")}</option>
                      <option value="driving">{t("tourist.map.driving")}</option>
                      <option value="cycling">{t("tourist.map.cycling")}</option>
                    </select>
                    <button
                      className="btn btnPrimary"
                      onClick={() => {
                        if (!position) {
                          showToast({ title: t("tourist.map.noGps") });
                          return;
                        }
                        const toList = poisWithDistance.map(x => x.p);
                        if (toList.length === 0) {
                          showToast({ title: "Không có POI nào gần đây" });
                          return;
                        }
                        const to = { lat: toList[0].lat, lng: toList[0].lng };
                        setRoute(mockDirections({ from: position, to, profile }));
                      }}
                    >
                      Tìm
                    </button>
                 </div>
                 {route && (
                   <div style={{ marginTop: 12 }}>
                     <div className="row" style={{ flexWrap: "wrap", marginBottom: 8 }}>
                       <span className="pill">~ {Math.round(route.distanceMeters)} m</span>
                       <span className="pill">~ {Math.round(route.durationSeconds / 60)} min</span>
                     </div>
                     <div style={{ display: "grid", gap: 8, maxHeight: "25vh", overflowY: "auto", paddingRight: 4 }}>
                       {route.steps.map((s, i) => (
                         <div key={i} className="pill" style={{ justifyContent: "space-between", borderRadius: 8 }}>
                           <span>{s.instruction}</span>
                           <span style={{color: 'var(--brand)', fontWeight: 600}}>{Math.round(s.distanceMeters)}m</span>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
              </div>
            )}
          </div>

          {/* RIGHT: Floating Action Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, pointerEvents: "auto", alignItems: "flex-end", marginLeft: 16 }}>
            <button
              onClick={() => setShowDirections(s => !s)}
              className="card"
              style={{ width: 44, height: 44, borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center", border: showDirections ? "2px solid var(--brand)" : "1px solid var(--border)", background: showDirections ? "var(--panel-2)" : "var(--panel)", color: "var(--text)", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", cursor: "pointer", fontSize: 18 }}
            >
              🗺️
            </button>
            <button
              onClick={() => setTtsOn((v) => !v)}
              className="card"
              style={{ width: 44, height: 44, borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center", border: ttsOn ? "2px solid var(--brand)" : "1px solid var(--border)", background: ttsOn ? "var(--brand)" : "var(--panel)", color: ttsOn ? "#fff" : "var(--text)", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", cursor: "pointer", fontSize: 18 }}
            >
              {isTtsLoading ? "⏳" : ttsOn ? "🔊" : "🔈"}
            </button>
            <button
              onClick={() => setShowTtsSettings((s) => !s)}
              className="card"
              style={{ width: 44, height: 44, borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center", border: showTtsSettings ? "2px solid var(--brand)" : "1px solid var(--border)", background: showTtsSettings ? "var(--panel-2)" : "var(--panel)", color: "var(--text)", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", cursor: "pointer", fontSize: 18 }}
            >
              ⚙️
            </button>

            {/* TTS Settings Dropdown */}
            {showTtsSettings && (
              <div className="card cardPad" style={{ width: 220, background: "var(--panel)", backdropFilter: "blur(16px)", marginTop: 4, textAlign: "left", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
                <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>Giọng đọc TTS</div>
                  <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 12 }}>Murf Voice</div>
                  <div className="row" style={{ gap: 8, alignItems: "center" }}>
                    <select
                      className="select"
                      value={selectedMurfGender}
                      onChange={(e) => {
                        const nextGender = e.target.value as "female" | "male";
                        setSelectedMurfGender(nextGender);
                        setSelectedMurfVoice(murfVoices[nextGender]);
                      }}
                      style={{ fontSize: 13, padding: "8px", width: 110 }}
                    >
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                    </select>
                    <select
                      className="select"
                      value={selectedMurfVoice}
                      onChange={(e) => setSelectedMurfVoice(e.target.value)}
                      style={{ fontSize: 13, padding: "8px", flex: 1 }}
                    >
                      <option value={murfVoices.female}>{murfVoices.female}</option>
                      <option value={murfVoices.male}>{murfVoices.male}</option>
                    </select>
                  </div>
                  <div style={{ height: 8 }} />
                  <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 12 }}>Web Speech (fallback)</div>
                  <select
                    className="select"
                    value={selectedSpeechLocale}
                    onChange={(e) => setSelectedSpeechLocale(e.target.value)}
                    style={{ fontSize: 13, padding: "8px" }}
                  >
                    {speechLocaleOptions.map((locale) => (
                      <option key={locale} value={locale}>{locale}</option>
                    ))}
                  </select>
                  <div style={{ height: 8 }} />
                  <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>Tốc độ đọc</div>
                  <select
                    className="select"
                    value={ttsRate}
                    onChange={(e) => setTtsRate(Number(e.target.value))}
                    style={{ fontSize: 13, padding: "8px" }}
                  >
                    <option value={0.8}>0.8x</option>
                    <option value={1}>1.0x</option>
                    <option value={1.2}>1.2x</option>
                    <option value={1.5}>1.5x</option>
                  </select>
              </div>
            )}
          </div>
        </div>

      </div>

      {viewingPoi && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div 
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={() => setViewingPoi(null)}
          />
          <div 
            style={{ 
              position: "relative",
              background: "var(--bg)", 
              borderTopLeftRadius: 24, 
              borderTopRightRadius: 24, 
              padding: "20px 20px calc(env(safe-area-inset-bottom) + 20px) 20px",
              maxHeight: "85vh",
              overflowY: "auto",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.3)",
              animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
            }}
          >
            <style>{`
              @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
            `}</style>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <div style={{ width: 40, height: 4, background: "var(--border)", borderRadius: 2 }} />
            </div>
            <PoiDetails poi={viewingPoi} />
          </div>
        </div>
      )}
    </AppShell>
  );
}
