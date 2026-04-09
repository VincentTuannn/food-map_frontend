import { apiFetch } from '../http'

export type Promotion = {
  id: string
  poiId?: string
  title?: string
  description?: string
  code?: string
  expiresAt?: string
  status?: string
}

type ListResponse<T> = { data?: T }

export async function getPromotionsByPoi(poiId: string): Promise<Promotion[]> {
  const res = await apiFetch<ListResponse<Promotion[]> | Promotion[]>(`/promotions/poi/${encodeURIComponent(poiId)}`)
  return (res as ListResponse<Promotion[]>).data ?? (res as Promotion[])
}

