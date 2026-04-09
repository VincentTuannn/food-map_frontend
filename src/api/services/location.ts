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

export async function getNearbyPois(req: NearbyPoiRequest): Promise<NearbyPoiResponse> {
  const params = new URLSearchParams()
  params.set('lat', String(req.lat))
  params.set('lng', String(req.lng))
  params.set('radius', String(req.radiusMeters))
  if (req.limit) params.set('limit', String(req.limit))

  const res = await apiFetch<any>(`/pois/nearby?${params.toString()}`, {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache' },
  })

  return {
    items: (res?.data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      lat: p.lat ?? p.latitude ?? p.location?.coordinates?.[1] ?? 0,
      lng: p.lng ?? p.longitude ?? p.location?.coordinates?.[0] ?? 0,
      rating: p.average_rating ?? p.rating ? Number(p.average_rating ?? p.rating) : undefined,
      category: 'food',
      distanceMeters: p.distance ? Number(p.distance) : undefined,
    }))
  }
}

