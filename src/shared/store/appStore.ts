import { create } from 'zustand'

export type Language = 'vi' | 'en' | 'ja'

export type GeoPoint = {
  lat: number
  lng: number
}

export type AppState = {
  language: Language
  setLanguage: (lang: Language) => void

  tourCode?: string
  setTourCode: (code?: string) => void

  radiusMeters: number
  setRadiusMeters: (m: number) => void

  position?: GeoPoint
  setPosition: (p?: GeoPoint) => void

  toast?: { title: string; message?: string }
  showToast: (t?: { title: string; message?: string }) => void
}

export const useAppStore = create<AppState>((set) => ({
  language: 'vi',
  setLanguage: (language) => set({ language }),

  tourCode: undefined,
  setTourCode: (tourCode) => set({ tourCode }),

  radiusMeters: 80,
  setRadiusMeters: (radiusMeters) => set({ radiusMeters }),

  position: undefined,
  setPosition: (position) => set({ position }),

  toast: undefined,
  showToast: (toast) => set({ toast }),
}))

