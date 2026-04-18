import { create } from 'zustand'
import type { AuthRole } from '../../api/services/identity'

export type Language = 'vi' | 'en' | 'ja' | 'zh' | 'ko'
export type ThemeMode = 'dark' | 'light'

export type GeoPoint = {
  lat: number
  lng: number
}

export type AppState = {
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

  radiusMeters: 10000,
  setRadiusMeters: (radiusMeters) => set({ radiusMeters }),

  position: undefined,
  setPosition: (position) => set({ position }),

  toast: undefined,
  showToast: (toast) => set({ toast }),
}))

