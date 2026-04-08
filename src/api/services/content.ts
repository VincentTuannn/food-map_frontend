import { apiFetch } from '../http'

export type ContentLanguage = string

export type TtsOptions = {
  voice?: string
  gender?: 'female' | 'male'
  speed?: number
  pitch?: number
  preferCache?: boolean
}

export type PoiContentResponse = {
  poiId?: string
  language?: ContentLanguage
  title?: string
  text?: string
  description?: string
  audioUrl?: string
  audio_url?: string
  data?: any
}

export type CachedPoiContent = {
  poiId: string
  language: ContentLanguage
  voice?: string
  gender?: 'female' | 'male'
  speed?: number
  pitch?: number
  description?: string
  audioUrl?: string
  cachedAt: string
}

const CACHE_PREFIX = 'poi-content:'
const inFlightRequests = new Map<string, Promise<PoiContentResponse>>()

const DEFAULT_VOICE_MAP: Record<string, { female: string; male: string }> = {
  'vi-VN': { female: 'Jacek', male: 'Peter' },
  'en-US': { female: 'Natalie', male: 'Ken' },
  'ja-JP': { female: 'Hina', male: 'Denki' },
  'ko-KR': { female: 'Gyeong', male: 'Hwan' },
  'zh-CN': { female: 'Jiao', male: 'Tao' },
  'fr-FR': { female: 'Adélie', male: 'Guillaume' },
  'de-DE': { female: 'Ruby', male: 'Matthias' },
  'es-ES': { female: 'Elvira', male: 'Javier' },
}

function normalizeLanguage(language: ContentLanguage) {
  const trimmed = language.trim()
  if (trimmed.includes('-')) return trimmed
  const lower = trimmed.toLowerCase()
  if (lower === 'vi') return 'vi-VN'
  if (lower === 'en') return 'en-US'
  if (lower === 'ja') return 'ja-JP'
  if (lower === 'ko') return 'ko-KR'
  if (lower === 'zh') return 'zh-CN'
  if (lower === 'fr') return 'fr-FR'
  if (lower === 'de') return 'de-DE'
  if (lower === 'es') return 'es-ES'
  return trimmed
}

function resolveTtsOptions(language: ContentLanguage, opts?: TtsOptions) {
  const locale = normalizeLanguage(language)
  const gender = opts?.gender ?? 'female'
  const voice = opts?.voice ?? DEFAULT_VOICE_MAP[locale]?.[gender]
  const speed = opts?.speed
  const pitch = opts?.pitch
  return { locale, gender, voice, speed, pitch }
}

function getCacheKey(poiId: string, language: ContentLanguage, opts?: TtsOptions) {
  const resolved = resolveTtsOptions(language, opts)
  const suffix = [
    resolved.locale,
    resolved.voice ?? 'default',
    resolved.gender ?? 'female',
    resolved.speed ?? '1',
    resolved.pitch ?? '0',
  ].join('|')
  return `${CACHE_PREFIX}${poiId}:${suffix}`
}

function extractContentFields(payload: any) {
  return {
    description: payload?.description ?? payload?.text,
    audioUrl: payload?.audio_url ?? payload?.audioUrl,
  }
}

export function getCachedPoiContent(poiId: string, language: ContentLanguage, opts?: TtsOptions): CachedPoiContent | null {
  try {
    const raw = localStorage.getItem(getCacheKey(poiId, language, opts))
    if (!raw) return null
    return JSON.parse(raw) as CachedPoiContent
  } catch {
    return null
  }
}

export function cachePoiContent(poiId: string, language: ContentLanguage, payload: any, opts?: TtsOptions) {
  try {
    const resolved = resolveTtsOptions(language, opts)
    const { description, audioUrl } = extractContentFields(payload)
    if (!description && !audioUrl) return
    const cached: CachedPoiContent = {
      poiId,
      language: resolved.locale,
      voice: resolved.voice,
      gender: resolved.gender,
      speed: resolved.speed,
      pitch: resolved.pitch,
      description,
      audioUrl,
      cachedAt: new Date().toISOString(),
    }
    localStorage.setItem(getCacheKey(poiId, language, opts), JSON.stringify(cached))
  } catch {
    // ignore cache failures
  }
}

export async function getPoiContent(poiId: string, language: ContentLanguage, opts?: TtsOptions) {
  const resolved = resolveTtsOptions(language, opts)
  const params = new URLSearchParams()
  params.set('lang', resolved.locale)
  if (resolved.voice) params.set('voice', resolved.voice)
  if (resolved.gender) params.set('gender', resolved.gender)
  if (resolved.speed !== undefined) params.set('speed', String(resolved.speed))
  if (resolved.pitch !== undefined) params.set('pitch', String(resolved.pitch))

  const cacheKey = getCacheKey(poiId, language, opts)
  if (opts?.preferCache) {
    const cached = getCachedPoiContent(poiId, language, opts)
    if (cached) {
      return {
        data: {
          poi_id: poiId,
          language_code: cached.language,
          description: cached.description,
          audio_url: cached.audioUrl,
        },
      } as PoiContentResponse
    }
  }
  const existing = inFlightRequests.get(cacheKey)
  if (existing) return existing

  const requestPromise = apiFetch<PoiContentResponse>(`/pois/${encodeURIComponent(poiId)}/content?${params.toString()}`)
  inFlightRequests.set(cacheKey, requestPromise)

  try {
    const res = await requestPromise
    cachePoiContent(poiId, language, res?.data ?? res, opts)
    return res
  } finally {
    inFlightRequests.delete(cacheKey)
  }
}
