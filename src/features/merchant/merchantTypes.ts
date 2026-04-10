import type { MerchantPoi, MerchantPromotion } from '../../api/services/merchant'

export interface PoiContent {
  language_code: string
  description: string
  audio_url?: string
}

export interface Poi extends MerchantPoi {
  id: string
  name: string
  status: string
  average_rating: number
  trigger_radius: number
  created_at: string
  lat?: number
  lng?: number
  latitude?: number
  longitude?: number
}

export interface Promotion extends MerchantPromotion {
  id: string
  poi_id: string
  title: string
  discount_type: 'PERCENTAGE' | 'FIXED'
  discount_value: number
  max_usage: number
  start_time: string
  end_time: string
}

export type ListResponse<T> = { data?: T }
