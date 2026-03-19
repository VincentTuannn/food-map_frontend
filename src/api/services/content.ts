import { apiFetch } from '../http'

export type ContentLanguage = 'vi' | 'en' | 'ja'

export type PoiContentResponse = {
  poiId: string
  language: ContentLanguage
  title: string
  text: string
  audioUrl?: string
}

export async function getPoiContent(poiId: string, language: ContentLanguage) {
  return apiFetch<PoiContentResponse>(`/api/content/pois/${encodeURIComponent(poiId)}?lang=${language}`)
}

