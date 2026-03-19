import { apiFetch } from '../http'

export type ClaimVoucherResponse = {
  poiId: string
  code: string
  expiresAt: string
}

export async function claimVoucher(poiId: string) {
  return apiFetch<ClaimVoucherResponse>(`/api/promotion/pois/${encodeURIComponent(poiId)}/claim`, { method: 'POST' })
}

