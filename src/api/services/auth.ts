import { apiFetch } from '../http'

export type AuthResponse = {
  success: boolean
  data: {
    token: string
    user?: any
    merchant?: any
    role?: string
  }
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    json: { email, password },
  })
}

export async function registerUser(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/register/user', {
    method: 'POST',
    json: { email, password },
  })
}
