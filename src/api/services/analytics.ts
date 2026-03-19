import { apiFetch } from '../http'

export type TrackEvent = {
  type: 'location_ping' | 'poi_open' | 'voucher_claim' | 'audio_play' | 'audio_complete'
  ts: number
  payload?: Record<string, string | number | boolean | null>
}

export async function track(events: TrackEvent[]) {
  return apiFetch<void>('/api/analytics/track', { method: 'POST', json: { events } })
}

