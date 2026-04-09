import { apiFetch } from '../http'

export type TourVisibility = 'PRIVATE' | 'PUBLIC' | 'UNLISTED'

export type UserTour = {
  id: string
  name?: string
  description?: string
  visibility?: TourVisibility
  share_token?: string
  shareToken?: string
  created_at?: string
  updated_at?: string
  poi_count?: number
  TourPois?: UserTourPoi[]
}

export type UserTourPoi = {
  id: string
  poi_id?: string
  name?: string
  order_index?: number
  lat?: number
  lng?: number
}

type ListResponse<T> = { data?: T; items?: T }

export async function getMyTours(): Promise<UserTour[]> {
  const res = await apiFetch<ListResponse<UserTour[]> | UserTour[]>('/users/me/tours')
  return (res as ListResponse<UserTour[]>).data ?? (res as ListResponse<UserTour[]>).items ?? (res as UserTour[])
}

export async function getMyTour(tourId: string): Promise<UserTour | undefined> {
  const res = await apiFetch<{ data?: UserTour } | UserTour>(`/users/me/tours/${encodeURIComponent(tourId)}`)
  return (res as { data?: UserTour }).data ?? (res as UserTour)
}

export async function createMyTour(payload: {
  name: string
  description?: string
  visibility?: TourVisibility
}) {
  return apiFetch<{ data?: UserTour } | UserTour>('/users/me/tours', {
    method: 'POST',
    json: payload,
  })
}

export async function updateMyTour(tourId: string, payload: {
  name?: string
  description?: string
  visibility?: TourVisibility
}) {
  return apiFetch<{ data?: UserTour } | UserTour>(`/users/me/tours/${encodeURIComponent(tourId)}` , {
    method: 'PUT',
    json: payload,
  })
}

export async function deleteMyTour(tourId: string) {
  return apiFetch(`/users/me/tours/${encodeURIComponent(tourId)}`, { method: 'DELETE' })
}

export async function getMyTourPois(tourId: string): Promise<UserTourPoi[]> {
  const res = await apiFetch<any>(`/users/me/tours/${encodeURIComponent(tourId)}/pois`)
  return res?.data?.items ?? res?.items ?? res?.data ?? res ?? []
}

export async function addPoiToMyTour(tourId: string, poiId: string, orderIndex?: number) {
  const payload: { poi_id: string; order_index?: number } = { poi_id: poiId }
  if (orderIndex) payload.order_index = orderIndex
  return apiFetch(`/users/me/tours/${encodeURIComponent(tourId)}/pois`, {
    method: 'POST',
    json: payload,
  })
}

export async function updateMyTourPoiOrder(tourId: string, poiId: string, orderIndex: number) {
  return apiFetch(`/users/me/tours/${encodeURIComponent(tourId)}/pois/${encodeURIComponent(poiId)}/order`, {
    method: 'PUT',
    json: { order_index: orderIndex },
  })
}

export async function removePoiFromMyTour(tourId: string, poiId: string) {
  return apiFetch(`/users/me/tours/${encodeURIComponent(tourId)}/pois/${encodeURIComponent(poiId)}`, {
    method: 'DELETE',
  })
}

export async function getSharedTour(shareToken: string) {
  return apiFetch<{ data?: UserTour } | UserTour>(`/tours/shared/${encodeURIComponent(shareToken)}`)
}
