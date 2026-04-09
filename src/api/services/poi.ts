import { apiFetch } from '../http'

export type ApiPoi = {
  id?: string
  name?: string
  category?: 'food' | 'drink' | 'sight' | string
  merchant_id?: string
  location?: { coordinates?: [number, number] }
  lat?: number
  lng?: number
  latitude?: number
  longitude?: number
  trigger_radius?: number
  average_rating?: number
  rating?: number
  price_level?: number
  tags?: string[]
  status?: string
  created_at?: string
  image_url?: string
  imageUrl?: string
  short?: Record<string, string>
  descriptions?: Record<string, string>
  menu_highlights?: string[]
  menuHighlights?: string[]
  reviews?: Array<{ author?: string; stars?: number; text?: string }>
  voucher?: { code?: string; description?: string; expiresAt?: string }
}

export type ApiPoiResponse = {
  success?: boolean
  data?: ApiPoi
}

export async function getPoiById(poiId: string) {
  return apiFetch<ApiPoiResponse>(`/pois/${encodeURIComponent(poiId)}`)
}
