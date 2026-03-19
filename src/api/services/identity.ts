import { apiFetch } from '../http'

export type AuthRole = 'USER' | 'MERCHANT' | 'ADMIN'

export type SessionInitResponse = {
  deviceId: string
  sessionId: string
}

export type LoginResponse = {
  accessToken: string
  refreshToken?: string
  role: AuthRole
}

export async function initAnonymousSession(deviceId: string) {
  return apiFetch<SessionInitResponse>('/api/identity/sessions/anonymous', {
    method: 'POST',
    json: { deviceId },
  })
}

export async function login(email: string, password: string) {
  return apiFetch<LoginResponse>('/api/identity/login', {
    method: 'POST',
    json: { email, password },
  })
}

