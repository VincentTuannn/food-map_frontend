import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
import { getCachedPoiContent, getPoiContent } from "../../api/services/content";
import { getPoiById, type ApiPoi } from "../../api/services/poi";
import { getMyTour, type UserTourPoi } from "../../api/services/userTours";
import { getTourPois, type TourPoi } from "../../api/services/tours";
import type { Poi } from "../../shared/domain/poi";
import { logTrackingEvent } from "../../api/services/trackingLogs";
import { DirectionsPanel } from "./components/DirectionsPanel";
import { DirectionsTopbar } from "./components/DirectionsTopbar";
import { FloatingActions } from "./components/FloatingActions";
import { PoiDetailsModal } from "./components/PoiDetailsModal";
import { PoiListSheet } from "./components/PoiListSheet";

import MapView, { Layer, Marker, Popup, Source } from "react-map-gl";
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
  const location = useLocation();
  const nav = useNavigate();

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
  const [tourPois, setTourPois] = useState<Array<TourPoi & UserTourPoi & { poiId?: string }>>([]);
  const [isTourLoading, setIsTourLoading] = useState(false);
  const [tourQuery, setTourQuery] = useState("");
  const [tourOnly, setTourOnly] = useState(false);
  const [tourMeta, setTourMeta] = useState<{ id: string; scope: "mine" | "saved"; name?: string } | null>(null);
  const [multiLegs, setMultiLegs] = useState<DirectionsRoute[]>([]);
  const [multiLegIndex, setMultiLegIndex] = useState(0);
  const [multiRouteLabel, setMultiRouteLabel] = useState<string | null>(null);
  const [selectedStopIds, setSelectedStopIds] = useState<Set<string>>(new Set());
  const [showAddStop, setShowAddStop] = useState(false);
  const [isMultiRouting, setIsMultiRouting] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  const [routeTargetLabel, setRouteTargetLabel] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [isTopbarCollapsed, setIsTopbarCollapsed] = useState(false);
  const [showAllSteps, setShowAllSteps] = useState(false);
  const [dirTab, setDirTab] = useState<"overview" | "steps">("overview");
  const autoNavRef = useRef(false);
  const tourPoiNameRef = useRef<Set<string>>(new Set());
  const [hideBottomNav, setHideBottomNav] = useState(false);
  const bottomNavTouchedRef = useRef(false);

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
    logTrackingEvent({ event: "poi_open", poiId: poi.id }).catch(() => undefined);
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

  const normalizeTourPoi = (poi: TourPoi | UserTourPoi) => {
    const rawPoi = (poi as any).poi;
    const poiId = (poi as UserTourPoi).poi_id ?? rawPoi?.id ?? (poi as TourPoi).id;
    const order = (poi as UserTourPoi).order_index ?? (poi as TourPoi).order;
    return {
      ...poi,
      poiId,
      order,
      id: poiId ?? (poi as UserTourPoi).id ?? (poi as TourPoi).id,
      name: (poi as UserTourPoi).name ?? rawPoi?.name ?? (poi as TourPoi).name,
      lat: (poi as UserTourPoi).lat ?? (poi as TourPoi).lat,
      lng: (poi as UserTourPoi).lng ?? (poi as TourPoi).lng,
    };
  };

  const resolveTourPoiCoords = async (poi: { id: string; poiId?: string; lat?: number; lng?: number; name?: string }) => {
    if (poi.lat && poi.lng && poi.name) return poi;
    const lookupId = poi.poiId ?? poi.id;
    const res = await getPoiById(lookupId);
    const apiPoi = res?.data;
    if (!apiPoi) return poi;
    const lat = apiPoi.lat ?? apiPoi.latitude ?? apiPoi.location?.coordinates?.[1] ?? 0;
    const lng = apiPoi.lng ?? apiPoi.longitude ?? apiPoi.location?.coordinates?.[0] ?? 0;
    return {
      ...poi,
      name: apiPoi.name ?? poi.name,
      lat: poi.lat ?? lat,
      lng: poi.lng ?? lng,
    };
  };

  const handleDirections = async (poi: any) => {
    if (!position) {
      showToast({ title: t("tourist.map.noGps") });
      return;
    }
    if (!poi?.lat || !poi?.lng) return;

    try {
      const res = await getDirections({
        from: { lat: position.lat, lng: position.lng },
        to: { lat: poi.lat, lng: poi.lng },
        profile,
      });
      setRoute(res.route);
      setMultiLegs([]);
      setMultiLegIndex(0);
      setMultiRouteLabel(null);
      setRouteTargetLabel(poi.name ?? poi.id ?? "Điểm đến");
      setShowDirections(true);
      setDirTab("overview");
      if (isMobile) setSheetExpanded(true);
      logTrackingEvent({ event: "route_request", poiId: poi.id, meta: { profile } }).catch(() => undefined);
    } catch {
      showToast({ title: "Không tìm thấy đường đi" });
    }
  };

  const tourPoiKey = (poi: { poiId?: string; id?: string }) => poi.poiId ?? poi.id ?? "";

  const resolveTourPoiList = async (list: Array<TourPoi & UserTourPoi & { poiId?: string }>) => {
    const resolved: Array<{ id: string; name?: string; lat?: number; lng?: number }> = [];
    for (const poi of list) {
      const key = tourPoiKey(poi);
      if (!key) continue;
      const next = await resolveTourPoiCoords(poi);
      if (typeof next.lat === "number" && typeof next.lng === "number") {
        resolved.push({ id: key, name: next.name, lat: next.lat, lng: next.lng });
      }
    }
    return resolved;
  };

  const startMultiRoute = async (
    list: Array<TourPoi & UserTourPoi & { poiId?: string }>,
    label: string,
  ) => {
    if (!position) {
      showToast({ title: t("tourist.map.noGps") });
      return;
    }
    setIsMultiRouting(true);
    try {
      const resolved = await resolveTourPoiList(list);
      if (resolved.length === 0) {
        showToast({ title: "Không tìm thấy tọa độ POI" });
        return;
      }
      if (resolved.length === 1) {
        handleDirections(resolved[0]);
        return;
      }

      const legs: DirectionsRoute[] = [];
      let from = { lat: position.lat, lng: position.lng };
      for (const poi of resolved) {
        const res = await getDirections({ from, to: { lat: poi.lat!, lng: poi.lng! }, profile });
        legs.push(res.route);
        from = { lat: poi.lat!, lng: poi.lng! };
      }

      setMultiLegs(legs);
      setMultiLegIndex(0);
      setMultiRouteLabel(label);
      setRoute(legs[0]);
      setRouteTargetLabel(label);
      setShowDirections(true);
      setDirTab("overview");
      if (isMobile) setSheetExpanded(true);
    } catch {
      showToast({ title: "Không thể tạo lộ trình nhiều điểm" });
    } finally {
      setIsMultiRouting(false);
    }
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
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!showDirections) {
      setIsTopbarCollapsed(false);
    }
  }, [showDirections]);

  useEffect(() => {
    setShowAllSteps(false);
  }, [route?.geometry]);

  useEffect(() => {
    if (!showDirections) {
      setDirTab("overview");
    }
  }, [showDirections]);

  useEffect(() => {
    if (!showDirections) {
      setSelectedStopIds(new Set());
    }
  }, [showDirections]);

  useEffect(() => {
    if (showDirections) {
      if (!bottomNavTouchedRef.current) setHideBottomNav(true);
    } else {
      setHideBottomNav(false);
      bottomNavTouchedRef.current = false;
    }
  }, [showDirections]);

  useEffect(() => {
    if (tourPois.length === 0) return;
    tourPois.forEach((poi) => {
      const key = tourPoiKey(poi);
      if (!key || (poi.name && poi.name.trim()) || tourPoiNameRef.current.has(key)) return;
      tourPoiNameRef.current.add(key);
      getPoiById(key)
        .then((res) => {
          const apiPoi = res?.data;
          if (!apiPoi?.name) return;
          setTourPois((prev) =>
            prev.map((item) => (tourPoiKey(item) === key ? { ...item, name: apiPoi.name } : item))
          );
        })
        .catch(() => undefined);
    });
  }, [tourPois]);

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
      .catch(() => showToast({ title: "Không tải được POI" }))
      .finally(() => {
        inFlightNearbyRef.current = null;
      });

    inFlightNearbyRef.current = req.then(() => undefined);
  }, [position, radiusMeters, showToast]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tourId = params.get("tourId");
    const tourScope = (params.get("tourScope") ?? "saved") as "mine" | "saved";
    const tourName = params.get("tourName") ?? undefined;

    if (!tourId) {
      setTourMeta(null);
      setTourPois([]);
      return;
    }

    setTourMeta({ id: tourId, scope: tourScope, name: tourName });
    setIsTourLoading(true);

    const loader = tourScope === "mine"
      ? getMyTour(tourId).then((tour) => (tour?.TourPois ?? []) as UserTourPoi[])
      : getTourPois(tourId);

    loader
      .then((items) => {
        const normalized = (items ?? []).map((item) => normalizeTourPoi(item));
        normalized.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setTourPois(normalized);
        setSelectedStopIds(new Set());
      })
      .catch(() => setTourPois([]))
      .finally(() => setIsTourLoading(false));
  }, [location.search]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shouldAutoNav = params.get("nav") === "true";
    if (!shouldAutoNav || autoNavRef.current || !position || tourPois.length === 0) return;
    autoNavRef.current = true;
    startMultiRoute(tourPois, tourMeta?.name ?? "Toàn bộ tour");
  }, [location.search, position, tourPois, tourMeta]);

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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const toId = params.get('to');
    if (!toId || !position) return;
    const targetNearby = poisWithDistance.find((x) => x.p?.id === toId)?.p;
    const targetTour = tourPois.find((p) => p.id === toId || p.poiId === toId);
    if (targetNearby) {
      handleDirections(targetNearby);
    } else if (targetTour) {
      resolveTourPoiCoords(targetTour).then((resolved) => {
        if (resolved.lat && resolved.lng) handleDirections(resolved);
      });
    } else {
      return;
    }
    nav('/tourist/map', { replace: true });
  }, [location.search, poisWithDistance, position, nav, tourPois]);

  const filteredPois = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return poisWithDistance.filter(({ p }) => {
      const category = (p.category ?? 'food') as string;
      if (categoryFilter !== 'all' && category !== categoryFilter) return false;
      if (!q) return true;
      return (p.name ?? '').toLowerCase().includes(q);
    });
  }, [poisWithDistance, searchQuery, categoryFilter]);

  const filteredTourPois = useMemo(() => {
    const q = tourQuery.trim().toLowerCase();
    return tourPois.filter((poi) => {
      if (!q) return true;
      const name = (poi.name ?? "").toLowerCase();
      return name.includes(q) || (poi.poiId ?? poi.id).toLowerCase().includes(q);
    });
  }, [tourPois, tourQuery]);

  const addStopCandidates = useMemo(() => {
    const q = tourQuery.trim().toLowerCase();
    if (tourPois.length > 0) {
      return filteredTourPois.map((poi) => ({
        id: tourPoiKey(poi),
        name: poi.name ?? "",
        lat: poi.lat,
        lng: poi.lng,
      }));
    }
    return filteredPois
      .filter(({ p }) => (!q ? true : (p.name ?? "").toLowerCase().includes(q)))
      .map(({ p }) => ({
        id: p.id,
        name: p.name ?? "",
        lat: p.lat,
        lng: p.lng,
      }));
  }, [tourPois.length, filteredTourPois, filteredPois, tourQuery]);

  const selectedStops = useMemo(() => {
    if (selectedStopIds.size === 0) return [];
    return addStopCandidates.filter((poi) => selectedStopIds.has(poi.id));
  }, [addStopCandidates, selectedStopIds]);

  const tourMarkerPois = useMemo(() => {
    return filteredTourPois
      .filter((poi) => typeof poi.lat === 'number' && typeof poi.lng === 'number')
      .map((poi) => ({
        p: {
          id: poi.poiId ?? poi.id,
          name: poi.name,
          lat: poi.lat,
          lng: poi.lng,
        },
        d: undefined,
      }));
  }, [filteredTourPois]);

  const showDirectionsOverlay = Boolean(showDirections && (route || isRouting));

  const toggleBottomNav = () => {
    bottomNavTouchedRef.current = true;
    setHideBottomNav((v) => !v);
  };



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

  const routeGeoJson = useMemo(() => {
    if (!route?.geometry || route.geometry.length === 0) return null;
    return {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: route.geometry,
      },
      properties: {},
    } as const;
  }, [route]);

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

    logTrackingEvent({ event: "poi_nearby", poiId: nearby.p.id, meta: { distance: nearby.d } }).catch(
      () => undefined,
    );

    if (ttsOn) {
      playTTS(nearby.p, msg, speechLang, selectedSpeechLocale);
    }
  }, [language, filteredPois, position, radiusMeters, showToast, ttsOn, speechLang, selectedSpeechLocale]);

  return (
    <AppShell showBottomNav={!hideBottomNav}>
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
          {routeGeoJson && (
            <Source id="route" type="geojson" data={routeGeoJson}>
              <Layer
                id="route-line"
                type="line"
                paint={{
                  "line-color": theme === 'dark' ? "#fb7185" : "#f43f5e",
                  "line-width": 5,
                  "line-opacity": 0.9,
                }}
              />
            </Source>
          )}
          {position && <Marker longitude={position.lng} latitude={position.lat} color="#3b82f6" />}

          {(tourOnly && tourMarkerPois.length ? tourMarkerPois : filteredPois).map(({ p: poi }) => (
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
              <div className="poiPopup">
                {(selectedPoi.imageUrl || selectedPoi.image_url) && (
                  <div className="poiPopupMedia">
                    <img
                      src={selectedPoi.imageUrl || selectedPoi.image_url}
                      alt={selectedPoi.name}
                    />
                  </div>
                )}
                <div className="poiPopupBody">
                  <div className="poiPopupTitle">{selectedPoi.name}</div>
                  <div className="poiPopupSub">Nhấn để xem chi tiết hoặc dẫn đường nhanh.</div>
                  <div className="poiPopupActions">
                    <button className="btn btnPrimary" onClick={() => openPoiDetails(selectedPoi)}>
                      Xem chi tiết
                    </button>
                    <button className="btn" onClick={() => handleDirections(selectedPoi)}>
                      Chỉ đường
                    </button>
                    <button
                      className="btn"
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
              aria-label="Mở tìm kiếm"
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
            {showDirectionsOverlay && (
              <DirectionsPanel
                show={showDirectionsOverlay ? true : false}
                isMobile={isMobile}
                route={route}
                isRouting={isRouting}
                dirTab={dirTab}
                setDirTab={setDirTab}
                sheetExpanded={sheetExpanded}
                setSheetExpanded={setSheetExpanded}
                profile={profile}
                setProfile={setProfile}
                tourMeta={tourMeta}
                tourPois={tourPois}
                filteredTourPois={filteredTourPois}
                addStopCandidates={addStopCandidates}
                tourQuery={tourQuery}
                setTourQuery={setTourQuery}
                showAddStop={showAddStop}
                setShowAddStop={setShowAddStop}
                selectedStopIds={selectedStopIds}
                setSelectedStopIds={setSelectedStopIds}
                selectedStops={selectedStops}
                isMultiRouting={isMultiRouting}
                startMultiRoute={startMultiRoute}
                showAllSteps={showAllSteps}
                setShowAllSteps={setShowAllSteps}
                hideBottomNav={hideBottomNav}
                toggleBottomNav={toggleBottomNav}
                setShowDirections={setShowDirections}
                showToast={showToast}
              />
            )}

          </div>

          <FloatingActions
            showDirections={showDirections}
            onToggleDirections={() => setShowDirections((s) => !s)}
            showPoiList={showPoiList}
            onTogglePoiList={() => setShowPoiList((s) => !s)}
            ttsOn={ttsOn}
            onToggleTts={() => setTtsOn((v) => !v)}
            isTtsLoading={isTtsLoading}
            showTtsSettings={showTtsSettings}
            onToggleTtsSettings={() => setShowTtsSettings((s) => !s)}
            selectedMurfGender={selectedMurfGender}
            onChangeMurfGender={(nextGender) => {
              setSelectedMurfGender(nextGender);
              setSelectedMurfVoice(murfVoices[nextGender]);
            }}
            selectedMurfVoice={selectedMurfVoice}
            onChangeMurfVoice={setSelectedMurfVoice}
            murfVoices={murfVoices}
            selectedSpeechLocale={selectedSpeechLocale}
            onChangeSpeechLocale={setSelectedSpeechLocale}
            speechLocaleOptions={speechLocaleOptions}
            ttsRate={ttsRate}
            onChangeTtsRate={setTtsRate}
          />
        </div>

      </div>

      <DirectionsTopbar
        show={Boolean(isMobile && showDirectionsOverlay)}
        isTopbarCollapsed={isTopbarCollapsed}
        setIsTopbarCollapsed={setIsTopbarCollapsed}
        position={position ?? null}
        routeTargetLabel={routeTargetLabel}
      />

      {showPoiList && (
        <PoiListSheet
          items={filteredPois}
          onClose={() => setShowPoiList(false)}
          onOpenPoi={openPoiDetails}
        />
      )}

      <PoiDetailsModal
        open={Boolean(viewingPoiId)}
        poi={viewingPoi}
        loading={isViewingPoiLoading}
        onClose={() => {
          setViewingPoi(null);
          setViewingPoiId(null);
          setIsViewingPoiLoading(false);
        }}
      />
    </AppShell>
  );
}
