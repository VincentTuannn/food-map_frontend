import { useAppStore } from '../shared/store/appStore'

export type ApiError = {
  status: number
  message: string
  details?: unknown
}

export class HttpError extends Error {
  public status: number
  public details?: unknown

  constructor(err: ApiError) {
    super(err.message)
    this.name = 'HttpError'
    this.status = err.status
    this.details = err.details
  }
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined

type Json = string | number | boolean | null | { [k: string]: Json } | Json[]
// Sửa lỗi joinBaseUrl để xử lý đúng trường hợp BASE_URL có hoặc không có dấu gạch chéo ở cuối, và path có hoặc không có dấu gạch chéo ở đầu
function joinBaseUrl(base: string, path: string) {
  const [rawPath, rawQuery] = path.split('?')
  const normalizedPath = rawPath.startsWith('/') ? rawPath.slice(1) : rawPath
  const url = new URL(base)
  const basePath = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`
  url.pathname = `${basePath}${normalizedPath}`
  url.search = rawQuery ? `?${rawQuery}` : ''
  return url.toString()
}

export async function apiFetch<TResponse>(path: string, init?: RequestInit & { json?: Json }): Promise<TResponse> {
  const url = BASE_URL ? joinBaseUrl(BASE_URL, path) : path

  const headers = new Headers(init?.headers)
  if (init?.json !== undefined) headers.set('Content-Type', 'application/json')
  
  const token = useAppStore.getState().userToken
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(url, {
    ...init,
    body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
    headers,
  })

  const contentType = res.headers.get('content-type') ?? ''
  const isJson = contentType.includes('application/json')

  if (!res.ok) {
    let details: unknown = undefined
    try {
      details = isJson ? await res.json() : await res.text()
    } catch {
      // ignore
    }
    throw new HttpError({
      status: res.status,
      message: `HTTP ${res.status} ${res.statusText}`,
      details,
    })
  }

  if (res.status === 204) return undefined as TResponse
  return (isJson ? await res.json() : ((await res.text()) as unknown)) as TResponse
}

