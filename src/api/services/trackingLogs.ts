import { apiFetch } from '../http'

type JsonValue = string | number | boolean | null
type TrackingPayload = {
  event?: string
  event_type?: string
  poiId?: string
  tourId?: string
  promotionId?: string
  meta?: Record<string, JsonValue>
}

type TrackingJson = {
  event_type: string
  poiId?: string
  tourId?: string
  promotionId?: string
  meta?: Record<string, JsonValue>
}

function compactTracking(payload: TrackingJson) {
  const result: TrackingJson = { event_type: payload.event_type }
  if (payload.poiId !== undefined) result.poiId = payload.poiId
  if (payload.tourId !== undefined) result.tourId = payload.tourId
  if (payload.promotionId !== undefined) result.promotionId = payload.promotionId
  if (payload.meta !== undefined) result.meta = payload.meta
  return result
}

export async function logTrackingEvent(payload: TrackingPayload) {
  const event_type = payload.event_type ?? payload.event
  if (!event_type) return
  return apiFetch('/tracking-logs', {
    method: 'POST',
    json: compactTracking({
      event_type,
      poiId: payload.poiId,
      tourId: payload.tourId,
      promotionId: payload.promotionId,
      meta: payload.meta,
    }),
  })
}

export async function logTrackingBatch(events: TrackingPayload[]) {
  const normalized = events
    .map((payload) => ({
      event_type: payload.event_type ?? payload.event,
      poiId: payload.poiId,
      tourId: payload.tourId,
      promotionId: payload.promotionId,
      meta: payload.meta,
    }))
    .filter((payload) => Boolean(payload.event_type))
    .map((payload) => compactTracking(payload as TrackingJson))
  return apiFetch('/tracking-logs/batch', {
    method: 'POST',
    json: { events: normalized },
  })
}
