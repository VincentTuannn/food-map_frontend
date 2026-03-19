import type { GeoPoint } from '../store/appStore'

const R = 6371_000

function toRad(n: number) {
  return (n * Math.PI) / 180
}

export function distanceMeters(a: GeoPoint, b: GeoPoint) {
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)

  const s =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2)

  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)))
}

