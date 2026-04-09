import { apiFetch } from '../http'
import type { UserTour } from './userTours'

type ListResponse<T> = { data?: T; items?: T }

type SavedTourWrapper = {
  tour?: UserTour
  Tour?: UserTour
  tour_id?: string
  id?: string
}

function normalizeSavedTours(input: unknown): UserTour[] {
  const list =
    (input as ListResponse<UserTour[]>)?.data ??
    (input as ListResponse<UserTour[]>)?.items ??
    (input as UserTour[]) ??
    []

  if (!Array.isArray(list)) return []

  const mapped = list
    .map((item) => {
      const wrapper = item as SavedTourWrapper
      const nested = wrapper.tour ?? wrapper.Tour
      if (nested) return nested
      return item as UserTour
    })
    .filter(Boolean) as UserTour[]

  return mapped
}

export async function getSavedTours(): Promise<UserTour[]> {
  const res = await apiFetch<ListResponse<UserTour[]> | UserTour[]>('/users/me/saved-tours')
  return normalizeSavedTours(res)
}

export async function saveTour(tourId: string) {
  return apiFetch(`/users/me/saved-tours/${encodeURIComponent(tourId)}`, { method: 'POST' })
}

export async function unsaveTour(tourId: string) {
  return apiFetch(`/users/me/saved-tours/${encodeURIComponent(tourId)}`, { method: 'DELETE' })
}
