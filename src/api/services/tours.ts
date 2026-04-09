import { apiFetch } from '../http'

export type Tour = {
  id: string
  name?: string
  code?: string
  description?: string
}

export type TourPoi = {
  id: string
  name?: string
  lat?: number
  lng?: number
  order?: number
}

type ListResponse<T> = { data?: T }

export async function getTours(): Promise<Tour[]> {
  const res = await apiFetch<ListResponse<Tour[]> | Tour[]>('/tours')
  return (res as ListResponse<Tour[]>).data ?? (res as Tour[])
}

export async function getTourById(tourId: string): Promise<Tour | undefined> {
  const res = await apiFetch<ListResponse<Tour> | Tour>(`/tours/${encodeURIComponent(tourId)}`)
  return (res as ListResponse<Tour>).data ?? (res as Tour)
}

export async function getTourPois(tourId: string): Promise<TourPoi[]> {
  const res = await apiFetch<ListResponse<TourPoi[]> | TourPoi[]>(`/tours/${encodeURIComponent(tourId)}/pois`)
  return (res as ListResponse<TourPoi[]>).data ?? (res as TourPoi[])
}
