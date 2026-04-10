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
  geometry?: Array<[number, number]>
}
type MapboxStep = { distance: number; maneuver: { instruction: string } }
type MapboxRoute = {
  distance: number
  duration: number
  geometry: string
  legs: Array<{ steps: MapboxStep[] }>
}
type MapboxDirectionsResponse = { routes?: MapboxRoute[] }

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string | undefined

function decodePolyline(polyline: string, precision = 6): Array<[number, number]> {
  let index = 0
  let lat = 0
  let lng = 0
  const coordinates: Array<[number, number]> = []
  const factor = Math.pow(10, precision)

  while (index < polyline.length) {
    let result = 0
    let shift = 0
    let byte = 0

    do {
      byte = polyline.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)

    const deltaLat = (result & 1) ? ~(result >> 1) : result >> 1
    lat += deltaLat

    result = 0
    shift = 0

    do {
      byte = polyline.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)

    const deltaLng = (result & 1) ? ~(result >> 1) : result >> 1
    lng += deltaLng

    coordinates.push([lng / factor, lat / factor])
  }

  return coordinates
}

export async function getDirections(req: DirectionsRequest) {
  if (!MAPBOX_TOKEN) {
    throw new Error('Missing VITE_MAPBOX_ACCESS_TOKEN')
  }

  const profile = req.profile === 'driving' ? 'driving' : req.profile === 'cycling' ? 'cycling' : 'walking'
  const coords = `${req.from.lng},${req.from.lat};${req.to.lng},${req.to.lat}`
  const qs = new URLSearchParams({
    access_token: MAPBOX_TOKEN,
    geometries: 'polyline6',
    overview: 'full',
    steps: 'true',
  })
  const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coords}?${qs.toString()}`

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Directions HTTP ${res.status}`)
  }
  const data = (await res.json()) as MapboxDirectionsResponse
  const route = data.routes?.[0]
  if (!route) {
    throw new Error('No route found')
  }

  const steps = (route.legs?.[0]?.steps ?? []).map((step) => ({
    instruction: step.maneuver.instruction,
    distanceMeters: Math.round(step.distance),
  }))

  return {
    route: {
      distanceMeters: Math.round(route.distance),
      durationSeconds: Math.round(route.duration),
      steps,
      geometryPolyline6: route.geometry,
      geometry: decodePolyline(route.geometry),
    },
  }
}

