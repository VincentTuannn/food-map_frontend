import { apiFetch } from '../http'

export type ContentLanguage = string

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

export async function getPoiContent(poiId: string, language: ContentLanguage) {
  return apiFetch<PoiContentResponse>(`/pois/${encodeURIComponent(poiId)}/content?lang=${language}`)
}
