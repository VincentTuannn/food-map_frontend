import { apiFetch } from '../http'

export type DirectionsProfile = 'driving' | 'walking' | 'cycling'

export type DirectionsRequest = {
  from: { lat: number; lng: number }
  to: { lat: number; lng: number }
  profile: DirectionsProfile
}

export type DirectionsRoute = {
  distanceMeters: number
  durationSeconds: number
  steps: Array<{ instruction: string; distanceMeters: number }>
  geometryPolyline6?: string
}

type ApiResponse = { route: DirectionsRoute }

export async function getDirections(req: DirectionsRequest) {
  // Backend team can wrap Mapbox Directions API behind this endpoint.
  // Keep the contract stable for clean merges.
  const qs = new URLSearchParams()
  qs.set('from', `${req.from.lng},${req.from.lat}`)
  qs.set('to', `${req.to.lng},${req.to.lat}`)
  qs.set('profile', req.profile)

  return apiFetch<ApiResponse>(`/api/location/directions?${qs.toString()}`)
}

