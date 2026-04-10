import { apiFetch } from '../../api/http'
import type { ListResponse, PoiContent } from './merchantTypes'

export const fmtDate = (s: string) => new Date(s).toLocaleDateString('vi-VN')

export const fmtRating = (value: number | string | null | undefined) => {
  const num = Number(value)
  return Number.isFinite(num) ? num.toFixed(1) : '0.0'
}

export const getPoiContents = async (poiId: string) => {
  const res = await apiFetch<ListResponse<PoiContent[]> | PoiContent[]>(`/pois/${encodeURIComponent(poiId)}/content`)
  return (res as ListResponse<PoiContent[]>).data ?? (res as PoiContent[])
}
