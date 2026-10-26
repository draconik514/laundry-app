import { useState, useEffect, useCallback } from 'react'
import { getOrders } from '../utils/api'

export const useOrders = (initialFilters = {}) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(initialFilters)
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  })

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getOrders({
        ...filters,
        page: pagination.page,
      })
      setOrders(data.orders || [])
      setPagination({
        page: data.page || 1,
        totalPages: data.totalPages || 1,
        total: data.total || 0,
      })
    } catch (err) {
      setError(err.message || 'Gagal memuat pesanan')
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.page])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const setPage = (page) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  return {
    orders,
    loading,
    error,
    filters,
    pagination,
    updateFilters,
    setPage,
    refetch: fetchOrders,
  }
}

export default useOrders