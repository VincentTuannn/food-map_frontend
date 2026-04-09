import { apiFetch } from '../http'

export type Review = {
  id?: string
  poiId?: string
  author?: string
  stars?: number
  text?: string
  createdAt?: string
}

type ListResponse<T> = { data?: T }

export async function getReviewsByPoi(poiId: string): Promise<Review[]> {
  const res = await apiFetch<ListResponse<Review[]> | Review[]>(`/reviews/poi/${encodeURIComponent(poiId)}`)
  return (res as ListResponse<Review[]>).data ?? (res as Review[])
}

export async function createOrUpdateReview(poiId: string, stars: number, text: string) {
  return apiFetch(`/reviews`, { method: 'POST', json: { poiId, stars, text } })
}

export async function deleteReview(reviewId: string) {
  return apiFetch(`/reviews/${encodeURIComponent(reviewId)}`, { method: 'DELETE' })
}
