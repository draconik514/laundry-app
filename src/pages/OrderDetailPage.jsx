import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, CheckCircle, Send, Copy, Share2 } from 'lucide-react'
import { getOrderByCode, updateOrderStatus, deleteOrder } from '../utils/api'
import { formatRupiah, formatDateTime, formatDate } from '../utils/helpers'
import { STATUS_OPTIONS, STATUS_LABELS } from '../utils/constants'
import Card from '../components/common/Card'
import StatusBadge from '../components/common/StatusBadge'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import brand from '../config/brand'

const normalizePhone = (phone) => {
  const raw = String(phone).replace(/[^0-9]/g, '')
  return raw.startsWith('62') ? raw : raw.startsWith('0') ? '62' + raw.slice(1) : '62' + raw
}

const StatusTimeline = ({ currentStatus, orderSource }) => {
  const walkInStatuses = [
    { key: 'washing', label: 'Dicuci', icon: '🫧' },
    { key: 'drying', label: 'Kering', icon: '💨' },
    { key: 'ironing', label: 'Setrika', icon: '👕' },
    { key: 'ready_for_delivery', label: 'Siap Diambil', icon: '📫' },
    { key: 'completed', label: 'Selesai', icon: '✅' },
  ]
  const deliveryStatuses = [
    { key: 'pending_pickup', label: 'Pickup', icon: '📦' },
    { key: 'picked_up', label: 'Dijemput', icon: '🚐' },
    { key: 'washing', label: 'Dicuci', icon: '🫧' },
    { key: 'drying', label: 'Kering', icon: '💨' },
    { key: 'ironing', label: 'Setrika', icon: '👕' },
    { key: 'ready_for_delivery', label: 'Siap Diantar', icon: '📫' },
    { key: 'completed', label: 'Selesai', icon: '✅' },
  ]
  const statuses = orderSource === 'walk_in' ? walkInStatuses : deliveryStatuses
  const currentIndex = statuses.findIndex(s => s.key === currentStatus)

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-start min-w-max gap-0">
        {statuses.map((status, index) => {
          const done = index < currentIndex
          const active = index === currentIndex
          return (
            <React.Fragment key={status.key}>
              <div className="flex flex-col items-center w-16">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all duration-300 flex-shrink-0 ${
                  done ? 'bg-primary-500 text-white shadow-sm shadow-primary-200' :
                  active ? 'bg-primary-600 text-white shadow-md shadow-primary-300 ring-4 ring-primary-100' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {done ? <CheckCircle className="w-4 h-4" /> : <span>{status.icon}</span>}
                </div>
                <span className={`text-xs mt-2 text-center leading-tight ${done || active ? 'text-primary-600 font-semibold' : 'text-gray-400'}`}>
                  {status.label}
                </span>
              </div>
              {index < statuses.length - 1 && (
                <div className={`flex-1 h-0.5 mt-4 mx-1 min-w-6 transition-all duration-300 ${index < currentIndex ? 'bg-primary-400' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

const OrderDetailPage = () => {
  const { code } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')

  useEffect(() => { fetchOrder() }, [code])

  const fetchOrder = async () => {
    try {
      const data = await getOrderByCode(code)
      setOrder(data.order)
      setHistory(data.history || [])
      setSelectedStatus(data.order.status)
    } catch {
      toast.error('Order tidak ditemukan')
      navigate('/manage-laundry/orders')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (selectedStatus === order.status) return
    const label = STATUS_LABELS[selectedStatus] || selectedStatus
    if (!window.confirm(`Ubah status menjadi "${label}"?`)) {
      setSelectedStatus(order.status)
      return
    }
    setUpdating(true)
    try {
      await updateOrderStatus(order.id, selectedStatus)
      toast.success('Status berhasil diupdate')
      if (['completed', 'ready_for_delivery', 'picked_up'].includes(selectedStatus) && order.customer_phone) {
        if (window.confirm(`Kirim notifikasi WhatsApp ke ${order.customer_name}?`)) {
          openWANotification(order, selectedStatus)
        }
      }
      fetchOrder()
    } catch {
      toast.error('Gagal mengupdate status')
      setSelectedStatus(order.status)
    } finally {
      setUpdating(false)
    }
  }

  const getTrackingWAUrl = () => {
    if (!order?.customer_phone) return '#'
    const phone = normalizePhone(order.customer_phone)
    const trackUrl = `${window.location.origin}/track/${order.code}`
    const message = `Halo *${order.customer_name}*! 👋\n\nPesanan laundry Anda sudah kami terima.\n\n📋 *Detail Order:*\n• Kode: *${order.code}*\n• Layanan: ${order.service_name}\n• Total: *${formatRupiah(order.total_price)}*\n\n🔍 Cek status pesanan Anda di:\n${trackUrl}\n\nTerima kasih telah menggunakan layanan ${brand.name} 🧺`
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
  }

  const openWANotification = (orderData, newStatus) => {
    const phone = normalizePhone(orderData.customer_phone)
    let message = ''
    if (newStatus === 'completed') {
      message = `✅ *Laundry Selesai!*\n\nHalo *${orderData.customer_name}*,\n\nLaundry Anda sudah selesai dan siap diambil! 🎉\n\n📋 *Detail Order:*\n• Kode: *${orderData.code}*\n• Layanan: ${orderData.service_name}\n• Total: *${formatRupiah(orderData.total_price)}*\n\nTerima kasih telah menggunakan layanan ${brand.name} 🧺`
    } else if (newStatus === 'ready_for_delivery') {
      if (orderData.order_source !== 'walk_in') {
        message = `🚐 *Laundry Siap Diantar!*\n\nHalo *${orderData.customer_name}*,\n\nLaundry Anda akan segera kami antar.\n\n📋 Kode: *${orderData.code}*\n📍 Alamat: ${orderData.customer_address || '-'}\n\nTerima kasih! 🧺`
      } else {
        message = `📦 *Laundry Siap Diambil!*\n\nHalo *${orderData.customer_name}*,\n\nLaundry Anda siap diambil di toko kami.\n\n📋 Kode: *${orderData.code}*\n📍 ${brand.address}\n⏰ ${brand.hours}\n\nTerima kasih! 🧺`
      }
    }
    if (message) window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
  }

  const handleDelete = async () => {
    if (!window.confirm('Yakin ingin menghapus order ini?')) return
    try {
      await deleteOrder(order.id)
      toast.success('Order berhasil dihapus')
      navigate('/manage-laundry/orders')
    } catch {
      toast.error('Gagal menghapus order')
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(order.code)
    toast.success('Kode disalin!')
  }

  const shareTrackingLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/track/${order.code}`)
    toast.success('Link tracking disalin!')
  }

  const isDelivery = order?.order_source !== 'walk_in'
  const statusOptions = isDelivery
    ? STATUS_OPTIONS.filter(s => s.value !== 'all')
    : STATUS_OPTIONS
        .filter(s => !['pending_pickup', 'picked_up', 'all'].includes(s.value))
        .map(s => s.value === 'ready_for_delivery' ? { ...s, label: 'Siap Diambil' } : s)

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>
  if (!order) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/manage-laundry/orders')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900 truncate">Detail Order</h1>
            <span className="text-gray-400 font-mono text-sm">#{order.code}</span>
          </div>
        </div>
        <StatusBadge status={order.status} orderSource={order.order_source} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kiri: Info + Tracking + Timeline + History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informasi Order */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-primary-500 rounded-full" />
              Informasi Order
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              {[
                { label: 'Pelanggan', value: order.customer_name },
                { label: 'WhatsApp', value: order.customer_phone },
                { label: 'Sumber', value: order.order_source === 'website' ? '🖥️ Website' : order.order_source === 'walk_in' ? '🏪 Datang Langsung' : '💬 WhatsApp' },
                { label: 'Layanan', value: order.service_name },
                { label: 'Berat', value: order.weight > 0 ? `${order.weight} ${order.service_unit || 'kg'}` : 'Belum ditimbang' },
                { label: 'Total Harga', value: order.total_price > 0 ? formatRupiah(order.total_price) : 'Belum dikonfirmasi' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-sm font-semibold text-gray-900">{value}</p>
                </div>
              ))}
              <div className="col-span-2 sm:col-span-3">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Alamat</p>
                <p className="text-sm font-semibold text-gray-900">{order.customer_address || '-'}</p>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Estimasi Selesai</p>
                <p className="text-sm font-semibold text-gray-900">
                  {order.created_at ? formatDate(new Date(new Date(order.created_at).getTime() + (order.estimated_day || 2) * 86400000)) : '-'}
                </p>
              </div>
            </div>
            {order.note && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Catatan</p>
                <p className="text-sm text-gray-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">{order.note}</p>
              </div>
            )}
          </Card>

          {/* Kode Tracking */}
          <Card className="border-2 border-primary-100 bg-primary-50/30">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-primary-500 rounded-full" />
              Kode Tracking untuk Customer
            </h3>
            <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-primary-100 mb-4">
              <span className="text-2xl font-bold text-primary-600 tracking-widest font-mono flex-1">{order.code}</span>
              <button onClick={copyCode} className="p-2 hover:bg-primary-50 rounded-lg transition-colors" title="Salin kode">
                <Copy className="w-5 h-5 text-primary-500" />
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={shareTrackingLink} className="btn-secondary flex-1 text-sm flex items-center justify-center gap-2">
                <Share2 className="w-4 h-4" />
                Salin Link
              </button>
              <a
                href={getTrackingWAUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors ${!order.customer_phone ? 'opacity-40 pointer-events-none' : ''}`}
              >
                <Send className="w-4 h-4" />
                Kirim via WA
              </a>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">Customer bisa cek status di: /track/{order.code}</p>
          </Card>

          {/* Progress Status */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-green-500 rounded-full" />
              Progress Status
            </h3>
            <StatusTimeline currentStatus={order.status} orderSource={order.order_source} />
          </Card>

          {/* Riwayat Status */}
          {history.length > 0 && (
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-purple-500 rounded-full" />
                Riwayat Status
              </h3>
              <div className="space-y-2">
                {history.map((h, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
                    <span className="text-gray-400 text-xs w-36 flex-shrink-0">{formatDateTime(h.updated_at)}</span>
                    <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-700">
                      {STATUS_LABELS[h.status] || h.status}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Kanan: Update Status + Hapus */}
        <div className="space-y-4">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
            <div className="space-y-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                disabled={updating}
                className="input w-full"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={updating || selectedStatus === order.status}
                className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-3 rounded-2xl transition-colors"
              >
                {updating
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><CheckCircle className="w-4 h-4" /><span>Simpan Status</span></>
                }
              </button>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 mb-3">Zona Bahaya</h3>
            <button onClick={handleDelete} className="btn-danger w-full flex items-center justify-center gap-2">
              <Trash2 className="w-4 h-4" />
              Hapus Order
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">Tindakan ini tidak dapat dibatalkan</p>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailPage
 
