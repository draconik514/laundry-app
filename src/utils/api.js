const BASE_URL = import.meta.env.VITE_APP_SCRIPT_URL || 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'

const getToken = () => localStorage.getItem('token')

// Simple cache: { key: { data, ts } }
const _cache = {}
const CACHE_TTL = 60000 // 60 detik
const CACHE_TTL_LONG = 10 * 60 * 1000 // 10 menit

// Clear all cache on load to avoid stale data
Object.keys(_cache).forEach(k => delete _cache[k])

const request = async (params = {}, cacheTTL = 0) => {
  const token = getToken()
  const allParams = { ...params, ...(token ? { token } : {}) }
  // Remove undefined/null values
  Object.keys(allParams).forEach(k => allParams[k] == null && delete allParams[k])
  const query = new URLSearchParams(allParams).toString()

  if (cacheTTL > 0) {
    const cached = _cache[query]
    if (cached && Date.now() - cached.ts < cacheTTL) return cached.data
  }

  const res = await fetch(`${BASE_URL}?${query}`)
  const data = await res.json()
  if (data.status === 'error') throw new Error(data.message)

  if (cacheTTL > 0) _cache[query] = { data, ts: Date.now() }
  return data
}

const invalidateCache = (actionPrefix) => {
  Object.keys(_cache).forEach(k => { if (k.includes(actionPrefix)) delete _cache[k] })
}

const get = (params = {}, cacheTTL = 0) => request(params, cacheTTL)
const post = (body = {}) => request(body)

// ============= AUTH =============
export const login = async (email, password) => {
  return await post({ action: 'login', email, password })
}

export const register = async (name, email, password) => {
  return await post({ action: 'register', name, email, password })
}

// ============= ORDERS =============
export const createOrder = async (orderData) => {
  const res = await post({ action: 'createOrder', ...orderData })
  invalidateCache('getOrders')
  invalidateCache('getDashboardStats')
  return res
}

export const getOrders = async (filters = {}) => {
  return await get({ action: 'getOrders', ...filters }, CACHE_TTL)
}

export const getOrderByCode = async (code) => {
  return await get({ action: 'getOrderByCode', code })
}

export const updateOrderStatus = async (orderId, status) => {
  const res = await post({ action: 'updateOrderStatus', orderId, status })
  invalidateCache('getOrders')
  invalidateCache('getDashboardStats')
  return res
}

export const updateOrderPrice = async (orderId, weight, totalPrice, note) => {
  const res = await post({ action: 'updateOrderPrice', orderId, weight, totalPrice, note })
  invalidateCache('getOrders')
  return res
}

export const deleteOrder = async (orderId) => {
  const res = await post({ action: 'deleteOrder', orderId })
  invalidateCache('getOrders')
  invalidateCache('getDashboardStats')
  return res
}

export const archiveOldOrders = async () => {
  const res = await post({ action: 'archiveOldOrders' })
  invalidateCache('getOrders')
  invalidateCache('getDashboardStats')
  return res
}

// ============= CUSTOMER =============
export const getCustomerOrders = async (phone) => {
  return await get({ action: 'getCustomerOrders', phone })
}

export const getCustomerOrder = async (code) => {
  return await get({ action: 'getCustomerOrder', code })
}

export const createCustomerOrder = async (orderData) => {
  return await post({ action: 'createCustomerOrder', ...orderData })
}

// ============= SERVICES =============
export const getServices = async (forceRefresh = false) => {
  if (forceRefresh) invalidateCache('getServices')
  return await get({ action: 'getServices' }, CACHE_TTL_LONG)
}

export const createService = async (serviceData) => {
  const res = await post({ action: 'createService', ...serviceData })
  invalidateCache('getServices')
  return res
}

export const updateService = async (serviceId, serviceData) => {
  const res = await post({ action: 'updateService', serviceId, ...serviceData })
  invalidateCache('getServices')
  return res
}

export const deleteService = async (serviceId) => {
  const res = await post({ action: 'deleteService', serviceId })
  invalidateCache('getServices')
  return res
}

// ============= DASHBOARD =============
export const getDashboardStats = async () => {
  return await get({ action: 'getDashboardStats' }, CACHE_TTL)
}

// ============= FEEDBACKS =============
export const getFeedbacks = async (page = 1) => {
  return await get({ action: 'getFeedbacks', page })
}

export const createFeedback = async (feedbackData) => {
  return await post({ action: 'createFeedback', ...feedbackData })
}

export const deleteFeedback = async (feedbackId) => {
  return await post({ action: 'deleteFeedback', feedbackId })
}

// ============= REPORTS =============
export const getFinancialReport = async () => {
  return await get({ action: 'getFinancialReport' })
}

export const getOrdersExport = async (dateFrom, dateTo) => {
  return await get({ action: 'getOrdersExport', dateFrom, dateTo })
}

// ============= NOTIFICATIONS =============
export const getNotifications = async () => {
  return await get({ action: 'getNotifications' }, CACHE_TTL)
}

// ============= PROFILE =============
export const updateProfile = async (profileData) => {
  return await post({ action: 'updateProfile', ...profileData })
}