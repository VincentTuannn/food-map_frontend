import { useEffect, useMemo, useRef, useState } from "react";
import { distanceMeters } from "../../shared/lib/geo";
import { getNearbyPois } from "../../api/services/location";
import { useAppStore } from "../../shared/store/appStore";
import { AppShell } from "../../shared/ui/AppShell";
import { useT } from "../../shared/i18n/useT";
import type {
  DirectionsProfile,
  DirectionsRoute,
} from "../../api/services/directions";
import { getDirections } from "../../api/services/directions";
import { PoiDetails } from "./PoiPage";
import { getCachedPoiContent, getPoiContent } from "../../api/services/content";
import { getPoiById, type ApiPoi } from "../../api/services/poi";
import type { Poi } from "../../shared/domain/poi";

import MapView, { Marker, Popup } from "react-map-gl";
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
  const [viewingPoi, setViewingPoi] = useState<Poi | null>(null);
  const [viewingPoiId, setViewingPoiId] = useState<string | null>(null);
  const [isViewingPoiLoading, setIsViewingPoiLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'food' | 'drink' | 'sight'>('all');
  const [showPoiList, setShowPoiList] = useState(true);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
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

      const cached = getCachedPoiContent(poi.id, selectedSpeechLocale, ttsOptions);
      if (cached?.audioUrl) {
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
        }
        window.speechSynthesis.cancel();
        const audio = new Audio(cached.audioUrl);
        audio.playbackRate = ttsRate;
        currentAudioRef.current = audio;
        await audio.play();
        return;
      }

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

  const normalizePoiFromApi = (apiPoi: ApiPoi, poiId: string): Poi => {
    const shortFromApi = apiPoi.short ?? apiPoi.descriptions ?? {};
    const lat = apiPoi.lat ?? apiPoi.latitude ?? apiPoi.location?.coordinates?.[1] ?? 0;
    const lng = apiPoi.lng ?? apiPoi.longitude ?? apiPoi.location?.coordinates?.[0] ?? 0;
    const rating = apiPoi.average_rating ?? apiPoi.rating ?? 0;
    const priceLevel = (apiPoi.price_level ?? 1) as 1 | 2 | 3;
    const rawVoucher = apiPoi.voucher;
    const voucher =
      rawVoucher && rawVoucher.code && rawVoucher.description && rawVoucher.expiresAt
        ? { code: rawVoucher.code, description: rawVoucher.description, expiresAt: rawVoucher.expiresAt }
        : undefined;
    const normalizedReviews = (apiPoi.reviews ?? [])
      .filter((r) => r?.author && typeof r.stars === "number" && r?.text)
      .map((r) => ({
        author: r.author as string,
        stars: r.stars as number,
        text: r.text as string,
      }));

    return {
      id: apiPoi.id ?? poiId,
      name: apiPoi.name ?? "POI",
      category: (apiPoi as any).category ?? "food",
      imageUrl: apiPoi.imageUrl ?? apiPoi.image_url,
      lat,
      lng,
      rating: Number(rating),
      priceLevel,
      tags: apiPoi.tags ?? [],
      short: {
        vi: shortFromApi.vi ?? "",
        en: shortFromApi.en ?? "",
        ja: shortFromApi.ja ?? "",
        zh: shortFromApi.zh ?? "",
        ko: shortFromApi.ko ?? "",
      },
      menuHighlights: apiPoi.menuHighlights ?? apiPoi.menu_highlights ?? [],
      voucher,
      reviews: normalizedReviews,
    };
  };

  const getPoiShortText = (poi: any) => {
    const short = poi?.short ?? {};
    return language === "vi"
      ? short.vi ?? poi?.name ?? ""
      : language === "ja"
        ? short.ja ?? poi?.name ?? ""
        : language === "zh"
          ? short.zh ?? poi?.name ?? ""
          : language === "ko"
            ? short.ko ?? poi?.name ?? ""
            : short.en ?? poi?.name ?? "";
  };

  const openPoiDetails = (poi: any) => {
    if (!poi?.id) return;
    setViewingPoi(null);
    setViewingPoiId(poi.id);
    setIsViewingPoiLoading(true);
    getPoiById(poi.id)
      .then((res) => {
        if (res?.data) {
          setViewingPoi(normalizePoiFromApi(res.data, poi.id));
        } else {
          setViewingPoi(null);
        }
      })
      .catch(() => setViewingPoi(null))
      .finally(() => setIsViewingPoiLoading(false));
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
  const nearbyCacheRef = useRef<Map<string, { ts: number; items: any[] }>>(new Map());
  const lastNearbyFetchRef = useRef<{ ts: number; lat: number; lng: number; radius: number } | null>(null);
  const inFlightNearbyRef = useRef<Promise<void> | null>(null);
  const lastNearbyKeyRef = useRef<string | null>(null);
  const NEARBY_MIN_INTERVAL_MS = 12000;
  const NEARBY_MIN_MOVE_METERS = 40;
  const NEARBY_CACHE_TTL_MS = 45000;

  useEffect(() => {
    if (!position) return;

    const roundedLat = Number(position.lat.toFixed(4));
    const roundedLng = Number(position.lng.toFixed(4));
    const cacheKey = `${roundedLat}:${roundedLng}:${radiusMeters}`;
    const now = Date.now();

    const cached = nearbyCacheRef.current.get(cacheKey);
    if (cached && now - cached.ts < NEARBY_CACHE_TTL_MS) {
      setApiPois(cached.items);
      return;
    }

    const lastFetch = lastNearbyFetchRef.current;
    if (lastFetch) {
      const moved = distanceMeters(
        { lat: lastFetch.lat, lng: lastFetch.lng },
        { lat: position.lat, lng: position.lng }
      );
      const tooSoon = now - lastFetch.ts < NEARBY_MIN_INTERVAL_MS;
      const sameRadius = lastFetch.radius === radiusMeters;
      if (tooSoon && moved < NEARBY_MIN_MOVE_METERS && sameRadius) {
        return;
      }
    }

    if (inFlightNearbyRef.current && lastNearbyKeyRef.current === cacheKey) {
      return;
    }

    lastNearbyKeyRef.current = cacheKey;
    lastNearbyFetchRef.current = { ts: now, lat: position.lat, lng: position.lng, radius: radiusMeters };

    const req = getNearbyPois({ lat: position.lat, lng: position.lng, radiusMeters, limit: 100 })
      .then((res) => {
        nearbyCacheRef.current.set(cacheKey, { ts: Date.now(), items: res.items });
        setApiPois(res.items);
      })
      .catch(() => showToast({ title: "Khong tai duoc POI" }))
      .finally(() => {
        inFlightNearbyRef.current = null;
      });

    inFlightNearbyRef.current = req.then(() => undefined);
  }, [position, radiusMeters, showToast]);

  const poisWithDistance = useMemo(() => {
    if (!position) return [];
    return apiPois
      .map((p) => {
        const lat = p.lat ?? p.latitude ?? p.location?.coordinates?.[1] ?? 0;
        const lng = p.lng ?? p.longitude ?? p.location?.coordinates?.[0] ?? 0;
        const d = p.distanceMeters ?? p.distance ?? distanceMeters(position, { lat, lng });
        return {
          p: { ...p, lat, lng },
          d,
        };
      })
      .sort((a, b) => (a.d ?? Number.POSITIVE_INFINITY) - (b.d ?? Number.POSITIVE_INFINITY));
  }, [position, apiPois]);

  const filteredPois = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return poisWithDistance.filter(({ p }) => {
      const category = (p.category ?? 'food') as string;
      if (categoryFilter !== 'all' && category !== categoryFilter) return false;
      if (!q) return true;
      return (p.name ?? '').toLowerCase().includes(q);
    });
  }, [poisWithDistance, searchQuery, categoryFilter]);

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
    const nearby = filteredPois.find(
      (x) => x.d !== undefined && x.d <= radiusMeters
    );
    if (!nearby) return;
    if (lastTriggerRef.current === nearby.p.id) return;
    lastTriggerRef.current = nearby.p.id;

    const msg = getPoiShortText(nearby.p);
    showToast({
      title: `${t("tourist.map.nearByToast")}${nearby.p.name}`,
      message: msg,
    });

    if (ttsOn) {
      playTTS(nearby.p, msg, speechLang, selectedSpeechLocale);
    }
  }, [language, filteredPois, position, radiusMeters, showToast, ttsOn, speechLang, selectedSpeechLocale]);

  return (
    <AppShell>
      {/* 1. LAYER MAP (FIXED TO BACKGROUND) */}
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 }}>
        <MapView
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
            setViewingPoiId(null);
            setIsViewingPoiLoading(false);
          }}
        >
          {position && <Marker longitude={position.lng} latitude={position.lat} color="#3b82f6" />}

          {filteredPois.map(({ p: poi }) => (
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
                {(selectedPoi.imageUrl || selectedPoi.image_url) && (
                  <img
                    src={selectedPoi.imageUrl || selectedPoi.image_url}
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
                    onClick={() => openPoiDetails(selectedPoi)}
                  >
                    Xem chi tiết
                  </button>
                  <button
                    className="btn"
                    style={{ padding: "8px", fontSize: 13 }}
                    disabled={isTtsLoading}
                    onClick={() => {
                      const msg = getPoiShortText(selectedPoi);
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
        </MapView>
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
          
          {/* LEFT: Search + Directions Panel */}
          <div style={{ flex: 1, maxWidth: 320, pointerEvents: "auto" }}>
            <button
              className={`mobileSearchToggle ${showSearchPanel ? "mobileSearchToggleOpen" : ""}`}
              onClick={() => setShowSearchPanel((s) => !s)}
              aria-label="Mo tim kiem"
              aria-expanded={showSearchPanel}
            >
              🔍
            </button>
            <div
              className={`card cardPad searchPanel ${showSearchPanel ? "searchPanelOpen" : ""}`}
              style={{ marginBottom: 12 }}
            >
              <div className="searchBar">
                <span>🔍</span>
                <input
                  className="searchInput"
                  placeholder="Tìm quán, món ăn, điểm nổi bật..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div style={{ height: 10 }} />
              <div className="chipRow">
                {['all', 'food', 'drink', 'sight'].map((c) => (
                  <button
                    key={c}
                    className={`chip ${categoryFilter === c ? 'chipActive' : ''}`}
                    onClick={() => setCategoryFilter(c as typeof categoryFilter)}
                  >
                    {c === 'all' ? 'Tất cả' : c === 'food' ? 'Ăn uống' : c === 'drink' ? 'Trà/cafe' : 'Điểm đến'}
                  </button>
                ))}
              </div>
            </div>
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
                        const toList = filteredPois.map(x => x.p);
                        if (toList.length === 0) {
                          showToast({ title: "Không có POI nào gần đây" });
                          return;
                        }
                        const to = { lat: toList[0].lat, lng: toList[0].lng };
                        getDirections({ from: position, to, profile })
                          .then((res) => setRoute(res.route))
                          .catch(() => showToast({ title: "Khong tim thay duong di" }));
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
              onClick={() => setShowPoiList((s) => !s)}
              className="card"
              style={{ width: 44, height: 44, borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center", border: showPoiList ? "2px solid var(--brand)" : "1px solid var(--border)", background: showPoiList ? "var(--panel-2)" : "var(--panel)", color: "var(--text)", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", cursor: "pointer", fontSize: 18 }}
            >
              📋
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

      {showPoiList && (
        <div style={{ position: 'fixed', left: 14, right: 14, bottom: 86, zIndex: 12, pointerEvents: 'auto' }}>
          <div className="poiSheet">
            <div className="poiSheetHeader">
              <div>
                <div className="sectionTitle">Gần bạn</div>
                <div className="sectionSub">{filteredPois.length} địa điểm</div>
              </div>
              <button className="btn btnGhost" onClick={() => setShowPoiList(false)}>
                Ẩn
              </button>
            </div>
            <div className="poiSheetList">
              {filteredPois.map(({ p, d }) => (
                <div key={p.id} className="poiSheetItem">
                  {p.imageUrl || p.image_url ? (
                    <img className="poiThumb" src={p.imageUrl || p.image_url} alt={p.name} />
                  ) : (
                    <div className="poiThumb" aria-hidden="true" />
                  )}
                  <div>
                    <div className="poiTitle">{p.name}</div>
                    <div className="poiSub">
                      ⭐ {p.rating?.toFixed?.(1) ?? '-'}
                      {p.tags?.[0] ? ` · ${p.tags[0]}` : ''}
                    </div>
                    <div className="poiDistance">Cách bạn ~{Math.round(d ?? 0)}m</div>
                  </div>
                  <button className="btn btnPrimary" onClick={() => openPoiDetails(p)}>
                    Xem
                  </button>
                </div>
              ))}
              {filteredPois.length === 0 && (
                <div className="muted" style={{ padding: 12 }}>Không có kết quả phù hợp.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {viewingPoiId && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div 
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={() => {
              setViewingPoi(null);
              setViewingPoiId(null);
              setIsViewingPoiLoading(false);
            }}
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
            {isViewingPoiLoading && (
              <div className="card cardPad">Dang tai...</div>
            )}
            {!isViewingPoiLoading && viewingPoi && (
              <PoiDetails poi={viewingPoi} />
            )}
            {!isViewingPoiLoading && !viewingPoi && (
              <div className="card cardPad">Khong tim thay POI.</div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
