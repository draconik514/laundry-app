import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Plus,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2
} from 'lucide-react'
import { getOrders, deleteOrder, updateOrderStatus, archiveOldOrders } from '../utils/api'
import { formatRupiah, formatDateTime } from '../utils/helpers'
import { STATUS_OPTIONS, STATUS_LABELS } from '../utils/constants'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import StatusBadge from '../components/common/StatusBadge'
import LoadingSpinner from '../components/common/LoadingSpinner'
import OrderForm from '../components/admin/OrderForm'
import toast from 'react-hot-toast'

const Orders = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [date, setDate] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [archiving, setArchiving] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [search, status, date, page])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = { action: 'getOrders', page }
      if (search) params.search = search
      if (status !== 'all') params.status = status
      if (date) params.date = date
      const data = await getOrders(params)
      setOrders(data.orders || [])
      setTotalPages(data.totalPages || 1)
      setTotalOrders(data.total || 0)
    } catch (error) {
      toast.error('Gagal memuat pesanan')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus pesanan ini?')) return
    try {
      await deleteOrder(id)
      toast.success('Pesanan berhasil dihapus')
      fetchOrders()
    } catch (error) {
      toast.error('Gagal menghapus pesanan')
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateOrderStatus(id, newStatus)
      toast.success('Status berhasil diupdate')
      fetchOrders()
    } catch (error) {
      toast.error('Gagal mengupdate status')
    }
  }

  const handleArchive = async () => {
    setArchiving(true)
    try {
      const res = await archiveOldOrders()
      toast.success(res.message || 'Selesai')
      setShowArchiveModal(false)
      fetchOrders()
    } catch (error) {
      toast.error('Gagal menghapus order lama')
    } finally {
      setArchiving(false)
    }
  }

  const sourceLabels = {
    website: '🖥️ Website',
    walk_in: '🏪 Datang Langsung',
    whatsapp: '💬 WhatsApp'
  }

  const hasFilter = search || status !== 'all' || date
  const clearFilters = () => {
    setSearch('')
    setStatus('all')
    setDate('')
  }

  return (
    <div className="space-y-6">
      {showForm && (
        <OrderForm
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); fetchOrders() }}
        />
      )}

      {/* Modal Konfirmasi Arsip */}
      {showArchiveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="text-center mb-4">
              <div className="text-4xl mb-3">🗑️</div>
              <h3 className="text-lg font-bold text-gray-900">Hapus Order Lama</h3>
              <p className="text-sm text-gray-500 mt-2">
                Semua order <span className="font-semibold text-gray-700">Selesai</span> dan <span className="font-semibold text-gray-700">Dibatalkan</span> yang lebih dari <span className="font-semibold text-red-600">7 hari</span> akan dihapus permanen.
              </p>
              <p className="text-xs text-red-500 mt-2">Tindakan ini tidak bisa dibatalkan.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowArchiveModal(false)}
                disabled={archiving}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleArchive}
                disabled={archiving}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                {archiving ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pesanan</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola semua pesanan laundry</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Buat Pesanan
          </Button>
          <button
            onClick={() => setShowArchiveModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Hapus Order Lama
          </button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama pelanggan atau kode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input sm:w-48"
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input sm:w-44"
          />
          {hasFilter && (
            <button
              onClick={clearFilters}
              className="btn-secondary flex items-center gap-1 whitespace-nowrap"
            >
              <X className="w-4 h-4" />
              Reset
            </button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {loading ? 'Memuat...' : `${totalOrders} pesanan ditemukan`}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-gray-500 font-medium">Belum ada pesanan</p>
            <p className="text-gray-400 text-sm mt-1">Pesanan akan muncul di sini</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kode</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pelanggan</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Layanan</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sumber</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="text-sm font-bold text-primary-600">{order.code}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-sm font-medium text-gray-900">{order.customer_name}</p>
                      <p className="text-xs text-gray-400">{order.customer_phone}</p>
                    </td>
                    <td className="py-3.5 px-4 text-sm text-gray-700">{order.service_name}</td>
                    <td className="py-3.5 px-4 text-sm font-semibold text-gray-900">
                      {formatRupiah(order.total_price)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={order.status} orderSource={order.order_source} />
                    </td>
                    <td className="py-3.5 px-4 text-sm text-gray-500">
                      {sourceLabels[order.order_source] || order.order_source}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => navigate(`/manage-laundry/orders/${order.code}`)}
                        className="p-2 rounded-lg hover:bg-primary-50 text-gray-400 hover:text-primary-600 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-400">
              Halaman {page} dari {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

export default Orders