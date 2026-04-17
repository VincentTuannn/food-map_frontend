import { apiFetch } from '../http'

// Tạo link thanh toán VNPay cho merchant
// Gửi đúng format backend: actor_type ('USER'|'MERCHANT'), actor_id, amount, orderInfo
export async function createPaymentUrl(params: {
  actor_type: 'MERCHANT' | 'USER';
  actor_id: string;
  amount: number;
  orderInfo: string;
}): Promise<{ url?: string; transactionId?: string; error?: string; message?: string }> {
  const res = await apiFetch('/payment/create', {
    method: 'POST',
    body: JSON.stringify(params),
    headers: { 'Content-Type': 'application/json' },
  });
  return res as { url?: string; transactionId?: string; error?: string; message?: string };
}

export type CreateCheckoutRequest = {
  planId: string
}

export type CreateCheckoutResponse = {
  checkoutUrl: string
}

export async function createCheckout(req: CreateCheckoutRequest) {
  return apiFetch<CreateCheckoutResponse>('/api/payment/checkout', { method: 'POST', json: req })
}

// User payment for premium package (mock)
export async function payPremium(userId: string, packageId: string) {
  return apiFetch<{ success: boolean; message: string }>('/api/payment/user/premium', {
    method: 'POST',
    json: { userId, packageId },
  });
}

// Merchant payment for service fee (mock)
export async function payServiceFee(merchantId: string, amount: number) {
  return apiFetch<{ success: boolean; message: string }>('/api/payment/merchant/service-fee', {
    method: 'POST',
    json: { merchantId, amount },
  });
}

