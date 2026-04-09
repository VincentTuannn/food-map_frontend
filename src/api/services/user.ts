import { apiFetch } from '../http'

export type UserProfile = {
  id?: string
  email?: string
  name?: string
  phone?: string
  language?: string
}

type ResponseWrap<T> = { data?: T }

export async function getUserProfile(): Promise<UserProfile | undefined> {
  const res = await apiFetch<ResponseWrap<UserProfile> | UserProfile>('/users/profile')
  return (res as ResponseWrap<UserProfile>).data ?? (res as UserProfile)
}

export async function updateUserLanguage(language: string) {
  return apiFetch('/users/me/language', {
    method: 'PATCH',
    json: { language_pref: language },
  })
}
