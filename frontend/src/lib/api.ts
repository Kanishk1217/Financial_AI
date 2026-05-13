import axios from 'axios'

// In dev, Vite proxies /api → http://localhost:8000 (see vite.config.ts).
// In prod (Cloudflare Pages), VITE_API_URL points at the deployed backend.
const baseURL = (import.meta as any).env?.VITE_API_URL ?? '/api'
const api = axios.create({ baseURL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// ── User profile ──────────────────────────────────────────────────────────────
export const userAPI = {
  me:             () => api.get('/me'),
  updateProfile:  (d: { name?: string }) => api.patch('/me', d),
  changePassword: (d: { current_password: string; new_password: string }) => api.patch('/me/password', d),
  deleteAccount:  () => api.delete('/me'),
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (d: { email: string; password: string; name: string }) =>
    api.post('/signup', d),
  login: async (d: { username: string; password: string }) => {
    const res = await api.post('/login', { email: d.username, password: d.password })
    // Backend returns {"error":"..."} with HTTP 200 on bad credentials — normalise it
    if (res.data?.error) throw { response: { data: { detail: res.data.error } } }
    return res
  },
  forgotPassword: (email: string) =>
    api.post('/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) =>
    api.post('/reset-password', { token, new_password: newPassword }),
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashAPI = {
  insights: (startDate: string, endDate: string) =>
    api.get('/insights', { params: { start_date: startDate, end_date: endDate } }),
  netWorth: () => api.get('/net-worth'),
  budgetStatus: () => api.get('/budget/status'),
  savingsGoals: () => api.get('/savings-goals'),
}

// ── Transactions ──────────────────────────────────────────────────────────────
export const txAPI = {
  list: (startDate: string, endDate: string) =>
    api.get('/transactions', { params: { start_date: startDate, end_date: endDate } }),
  create: (d: { amount: number; category: string; description: string; date: string }) =>
    api.post('/transactions', d),
  update: (id: number, d: { amount: number; category: string; description: string; date: string }) =>
    api.put(`/transactions/${id}`, d),
  patch: (id: number, d: { notes?: string; tags?: string[]; category?: string }) =>
    api.patch(`/transactions/${id}`, d),
  remove: (id: number) => api.delete(`/transactions/${id}`),
  bulkRemove: (ids: number[]) => api.post('/transactions/bulk-delete', { ids }),
  bulkTag:    (ids: number[], tag: string) => api.post('/transactions/bulk-tag', { ids, tag }),
  importCSV:  (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return api.post('/transactions/import-csv', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  refresh: () => api.post('/transactions/refresh'),
  recurring: () => api.get('/recurring-transactions'),
}

// ── Budget ────────────────────────────────────────────────────────────────────
export const budgetAPI = {
  set: (d: { category: string; amount: number; month: number; year: number }) =>
    api.post('/budget', d),
  status: () => api.get('/budget/status'),
  optimize: (income: number, expenses: number) =>
    api.get('/budget/optimizer', { params: { income, expenses } }),
}

// ── Reports ───────────────────────────────────────────────────────────────────
export const reportAPI = {
  monthly: (month: number, year: number) =>
    api.get('/reports/monthly', { params: { month, year } }),
  exportCSV: (startDate: string, endDate: string) =>
    api.get('/reports/export', { params: { start_date: startDate, end_date: endDate }, responseType: 'blob' }),
}

// ── Smart ─────────────────────────────────────────────────────────────────────
export const smartAPI = {
  goals: () => api.get('/savings-goals'),
  createGoal: (d: { name: string; target_amount: number; current_amount: number; deadline: string }) =>
    api.post('/savings-goals', d),
  occasionPlanner: (occasion: string, budget: number) =>
    api.post('/occasion-planner', { occasion, budget }),
  anomalies: (startDate: string, endDate: string) =>
    api.get('/anomalies', { params: { start_date: startDate, end_date: endDate } }),
}

// ── Plaid ─────────────────────────────────────────────────────────────────────
export const plaidAPI = {
  createLinkToken: () => api.post('/plaid/link-token'),
  exchangeToken: (publicToken: string) => api.post('/plaid/exchange-token', { public_token: publicToken }),
  sync: () => api.post('/plaid/sync'),
  status: () => api.get('/plaid/status'),
  accounts: () => api.get('/plaid/accounts'),
  disconnect: (itemId?: string) =>
    api.delete('/plaid/disconnect', { params: itemId ? { item_id: itemId } : undefined }),
}
