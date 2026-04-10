export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string | undefined

export const LANGS = [
  { code: 'vi', label: '🇻🇳 VI' },
  { code: 'en', label: '🇬🇧 EN' },
  { code: 'zh', label: '🇨🇳 ZH' },
  { code: 'ja', label: '🇯🇵 JA' },
  { code: 'ko', label: '🇰🇷 KO' },
  { code: 'fr', label: '🇫🇷 FR' },
]

export const SECTIONS = [
  { id: 'overview', icon: '◈', label: 'Tổng quan' },
  { id: 'pois', icon: '📍', label: 'Địa điểm (POI)' },
  { id: 'content', icon: '🎙', label: 'Nội dung & TTS' },
  { id: 'promotions', icon: '🎟', label: 'Khuyến mãi' },
  { id: 'analytics', icon: '📊', label: 'Phân tích' },
  { id: 'finance', icon: '💳', label: 'Tài chính' },
  { id: 'profile', icon: '👤', label: 'Hồ sơ' },
]
