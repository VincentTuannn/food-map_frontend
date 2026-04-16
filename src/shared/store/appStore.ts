import { create } from 'zustand'
import type { AuthRole } from '../../api/services/identity'

export type Language = 'vi' | 'en' | 'ja' | 'zh' | 'ko'
export type ThemeMode = 'dark' | 'light'

export type GeoPoint = {
  lat: number
  lng: number
}

export interface ActiveTourForMap {
  id: string;
  name: string;
  stops: TourStopI[];
}

interface TourStopI {
  id: string;
  name: string;
  emoji: string;
  address: string;
  description?: string;
  audioUrl?: string;
  audioDuration?: number;
  status: "visited" | "current" | "upcoming";
  order: number;
  lat?: number;
  lng?: number;
}
 
interface ActiveTourI {
  id: string;
  name: string;
  stops: TourStopI[];
}
 
// Chỉ định nghĩa phần bổ sung — merge vào store thực tế của bạn
interface TourMapSlice {
  activeTourForMap: ActiveTourI | null;
  setActiveTourForMap: (tour: ActiveTourI) => void;
  clearActiveTourForMap: () => void;
}
 
// Export để dùng type-check
export type { TourStopI as TourStopType, ActiveTourI as ActiveTourType };

export type AppState = {
    // --- Tour Map Slice ---
    activeTourForMap: ActiveTourI | null;
    setActiveTourForMap: (tour: ActiveTourI | null) => void;
    clearActiveTourForMap: () => void;
  language: Language
  setLanguage: (lang: Language) => void

  userToken?: string
  setUserToken: (t?: string) => void

  userRole?: AuthRole
  setUserRole: (role?: AuthRole) => void


  theme: ThemeMode
  setTheme: (t: ThemeMode) => void

  tourCode?: string
  setTourCode: (code?: string) => void

  radiusMeters: number
  setRadiusMeters: (m: number) => void

  position?: GeoPoint
  setPosition: (p?: GeoPoint) => void

  toast?: { title: string; message?: string }
  showToast: (t?: { title: string; message?: string }) => void
}

function loadPrefs(): { language?: Language; theme?: ThemeMode; userToken?: string; userRole?: AuthRole } {
  try {
    const raw = localStorage.getItem('food-map:prefs')
    if (!raw) return {}
    const j = JSON.parse(raw) as { language?: Language; theme?: ThemeMode; userToken?: string; userRole?: AuthRole }
    return j ?? {}
  } catch {
    return {}
  }
}

function savePrefs(prefs: { language: Language; theme: ThemeMode; userToken?: string; userRole?: AuthRole }) {
  try {
    localStorage.setItem('food-map:prefs', JSON.stringify(prefs))
  } catch {
    // ignore
  }
}

export const useAppStore = create<AppState>((set) => ({
    activeTourForMap: null,
    setActiveTourForMap: (tour) => set({ activeTourForMap: tour }),
    clearActiveTourForMap: () => set({ activeTourForMap: null }),
  language: loadPrefs().language ?? 'vi',
  setLanguage: (language) =>
    set((s) => {
      savePrefs({ language, theme: s.theme, userToken: s.userToken })
      return { language }
    }),

  theme: loadPrefs().theme ?? 'dark',
  setTheme: (theme) =>
    set((s) => {
      savePrefs({ language: s.language, theme, userToken: s.userToken })
      return { theme }
    }),

  userToken: loadPrefs().userToken,
  setUserToken: (userToken) =>
    set((s) => {
      savePrefs({ language: s.language, theme: s.theme, userToken, userRole: s.userRole })
      return { userToken }
    }),

  userRole: loadPrefs().userRole,
  setUserRole: (userRole) =>
    set((s) => {
      savePrefs({ language: s.language, theme: s.theme, userToken: s.userToken, userRole })
      return { userRole }
    }),

  tourCode: undefined,
  setTourCode: (tourCode) => set({ tourCode }),
    // set mặt định radius là 50km 
  radiusMeters: 50000,
  setRadiusMeters: (radiusMeters) => set({ radiusMeters }),

  position: undefined,
  setPosition: (position) => set({ position }),

  toast: undefined,
  showToast: (toast) => set({ toast }),

}))

