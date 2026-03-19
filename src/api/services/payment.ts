import { apiFetch } from '../http'

export type CreateCheckoutRequest = {
  planId: string
}

export type CreateCheckoutResponse = {
  checkoutUrl: string
}

export async function createCheckout(req: CreateCheckoutRequest) {
  return apiFetch<CreateCheckoutResponse>('/api/payment/checkout', { method: 'POST', json: req })
}

