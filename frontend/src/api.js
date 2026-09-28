const API_BASE = import.meta.env.VITE_API_URL || ''

function getToken() {
  return localStorage.getItem('token')
}

export async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  const token = getToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
    headers['X-Auth-Token'] = token
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }

  if (!res.ok) {
    const message = data?.error || `Request failed (${res.status})`
    const error = new Error(message)
    error.status = res.status
    throw error
  }

  if (data == null) {
    throw new Error('Server returned an invalid response. Check that PHP API and MySQL are running.')
  }

  return data
}

export const authApi = {
  login: (email, password) =>
    api('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  logout: () => api('/api/logout', { method: 'POST' }),
  me: () => api('/api/me'),
}

export const usersApi = {
  list: () => api('/api/users'),
}

export const activitiesApi = {
  list: () => api('/api/activities'),
  get: (id) => api(`/api/activities/${id}`),
  create: (payload) =>
    api('/api/activities', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id, payload) =>
    api(`/api/activities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  listUpdates: (id) => api(`/api/activities/${id}/updates`),
  addUpdate: (id, payload) =>
    api(`/api/activities/${id}/updates`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}
