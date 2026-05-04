export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const configuredAgentApiUrl = (import.meta.env.VITE_AGENT_API_URL || '').replace(/\/$/, '')

function resolveRequestUrl(path: string) {
  if (/^https?:\/\//.test(path) || configuredAgentApiUrl.length === 0) {
    return path
  }
  return `${configuredAgentApiUrl}${path}`
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(resolveRequestUrl(path), {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`
    try {
      const error = (await response.json()) as { detail?: string }
      if (error.detail) {
        message = error.detail
      }
    } catch (error) {
      void error
    }
    throw new ApiError(response.status, message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
