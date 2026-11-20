// Small client for the week6-assignment-backend FastAPI service.
// Override the base URL with VITE_API_URL in a .env file (see .env.example).
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export class ApiError extends Error {
  constructor(message, status, fieldErrors = {}) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

// FastAPI sends errors as {detail: "text"} or, for validation (422),
// {detail: [{loc: ["body", "first_name"], msg: "..."}]}.
function toApiError(status, body) {
  const detail = body?.detail
  if (Array.isArray(detail)) {
    const fieldErrors = {}
    for (const err of detail) {
      const field = err.loc?.[err.loc.length - 1]
      if (field && !fieldErrors[field]) fieldErrors[field] = err.msg
    }
    return new ApiError('Please fix the highlighted fields.', status, fieldErrors)
  }
  return new ApiError(detail || `Request failed (${status})`, status)
}

async function request(path, { method = 'GET', body } = {}) {
  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(`Can't reach the API at ${API_URL}. Is the backend running?`, 0)
  }
  if (res.status === 204) return null
  const data = await res.json().catch(() => null)
  if (!res.ok) throw toApiError(res.status, data)
  return data
}

export function getHealth() {
  return request('/health')
}

export function listAuthors({ q = '', limit = 20, offset = 0 } = {}) {
  const params = new URLSearchParams({ limit, offset })
  if (q.trim()) params.set('q', q.trim())
  return request(`/authors?${params}`)
}

export function createAuthor(author) {
  return request('/authors', { method: 'POST', body: author })
}

export function updateAuthor(id, changes) {
  return request(`/authors/${id}`, { method: 'PATCH', body: changes })
}

export function deleteAuthor(id) {
  return request(`/authors/${id}`, { method: 'DELETE' })
}
