import { create } from 'zustand'

export type Language = 'vi' | 'en' | 'ja' | 'zh' | 'ko'
export type ThemeMode = 'dark' | 'light'

export type GeoPoint = {
  lat: number
  lng: number
}

export type AppState = {
  language: Language
  setLanguage: (lang: Language) => void

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

function loadPrefs(): { language?: Language; theme?: ThemeMode } {
  try {
    const raw = localStorage.getItem('food-map:prefs')
    if (!raw) return {}
    const j = JSON.parse(raw) as { language?: Language; theme?: ThemeMode }
    return j ?? {}
  } catch {
    return {}
  }
}

function savePrefs(prefs: { language: Language; theme: ThemeMode }) {
  try {
    localStorage.setItem('food-map:prefs', JSON.stringify(prefs))
  } catch {
    // ignore
  }
}

export const useAppStore = create<AppState>((set) => ({
  language: loadPrefs().language ?? 'vi',
  setLanguage: (language) =>
    set((s) => {
      savePrefs({ language, theme: s.theme })
      return { language }
    }),

  theme: loadPrefs().theme ?? 'dark',
  setTheme: (theme) =>
    set((s) => {
      savePrefs({ language: s.language, theme })
      return { theme }
    }),

  tourCode: undefined,
  setTourCode: (tourCode) => set({ tourCode }),

  radiusMeters: 80,
  setRadiusMeters: (radiusMeters) => set({ radiusMeters }),

  position: undefined,
  setPosition: (position) => set({ position }),

  toast: undefined,
  showToast: (toast) => set({ toast }),
}))

