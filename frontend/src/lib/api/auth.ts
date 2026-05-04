import { request } from './http'

export type AuthRole = 'finance_admin' | 'accountant' | 'treasurer' | 'viewer'

export type AuthUser = {
  user_id: string
  company_id: string
  email: string
  role: AuthRole
}

export type AuthSessionResponse = {
  user: AuthUser
}

export function loginRequest(email: string, password: string) {
  return request<AuthSessionResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function logoutRequest() {
  return request<{ status: string }>('/api/v1/auth/logout', {
    method: 'POST',
  })
}

export function refreshSessionRequest() {
  return request<AuthSessionResponse>('/api/v1/auth/refresh', {
    method: 'POST',
  })
}

export function getCurrentSession() {
  return request<AuthSessionResponse>('/api/v1/auth/me', {
    headers: {},
  })
}
