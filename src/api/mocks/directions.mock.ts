import type { DirectionsRequest, DirectionsRoute } from '../services/directions'

export function mockDirections(_req: DirectionsRequest): DirectionsRoute {
  return {
    distanceMeters: 680,
    durationSeconds: 540,
    steps: [
      { instruction: 'Đi thẳng 120m', distanceMeters: 120 },
      { instruction: 'Rẽ phải ở ngã tư', distanceMeters: 80 },
      { instruction: 'Tiếp tục 300m', distanceMeters: 300 },
      { instruction: 'Đến điểm đến bên trái', distanceMeters: 180 },
    ],
    geometryPolyline6: undefined,
  }
}

