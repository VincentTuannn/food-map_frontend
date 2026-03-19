import { apiFetch } from '../http'

export type NearbyPoiRequest = {
  lat: number
  lng: number
  radiusMeters: number
  limit?: number
  category?: string
  query?: string
}

export type NearbyPoiResponse = {
  items: Array<{
    id: string
    name: string
    lat: number
    lng: number
    rating?: number
    category?: string
    distanceMeters?: number
  }>
}

export async function getNearbyPois(req: NearbyPoiRequest) {
  const params = new URLSearchParams()
  params.set('lat', String(req.lat))
  params.set('lng', String(req.lng))
  params.set('radiusMeters', String(req.radiusMeters))
  if (req.limit) params.set('limit', String(req.limit))
  if (req.category) params.set('category', req.category)
  if (req.query) params.set('query', req.query)

  return apiFetch<NearbyPoiResponse>(`/api/location/pois/nearby?${params.toString()}`)
}

