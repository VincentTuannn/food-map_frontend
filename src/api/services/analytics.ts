export type HeatmapPoint = {
  poi_id: string
  lat: number
  lng: number
  count: number
}

export type MerchantAnalytics = {
  total_poi: number
  total_views: number
  total_conversions: number
  heatmap: HeatmapPoint[]
}

export async function getMerchantAnalytics(): Promise<MerchantAnalytics> {
  // API trả về { success, data }
  const res = await apiFetch<{ success: boolean; data: MerchantAnalytics }>('/merchants/analytics/stats')
  return res.data
}
import { apiFetch } from '../http'

export type TrackEvent = {
  type: 'location_ping' | 'poi_open' | 'voucher_claim' | 'audio_play' | 'audio_complete'
  ts: number
  payload?: Record<string, string | number | boolean | null>
}

export async function track(events: TrackEvent[]) {
  return apiFetch<void>('/api/analytics/track', { method: 'POST', json: { events } })
}

