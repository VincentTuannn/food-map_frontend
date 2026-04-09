import { apiFetch } from '../http'

export type UserVoucher = {
  id: string
  code?: string
  expiresAt?: string
  promotionId?: string
  poiId?: string
  status?: string
}

type ListResponse<T> = { data?: T }

export async function claimVoucher(poiId: string, promotionId?: string) {
  const payload: { poiId: string; promotionId?: string } = { poiId }
  if (promotionId) payload.promotionId = promotionId
  return apiFetch('/user-vouchers/claim', { method: 'POST', json: payload })
}

export async function getMyVouchers(): Promise<UserVoucher[]> {
  const res = await apiFetch<ListResponse<UserVoucher[]> | UserVoucher[]>('/user-vouchers/my')
  return (res as ListResponse<UserVoucher[]>).data ?? (res as UserVoucher[])
}
