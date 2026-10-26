import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Search, Phone, MessageSquare, Star } from 'lucide-react'
import { getCustomerOrder, createFeedback } from '../../utils/api'
import { formatRupiah, formatDateTime, formatDate } from '../../utils/helpers'
import { STATUS_LABELS } from '../../utils/constants'
import Card from '../common/Card'
import LoadingSpinner from '../common/LoadingSpinner'
import StatusTimeline from '../admin/StatusTimeline'
import brand from '../../config/brand'
import toast from 'react-hot-toast'

const TrackingPage = () => {
  const { code: urlCode } = useParams()
  const navigate = useNavigate()
  const [code, setCode] = useState(urlCode || '')
  const [order, setOrder] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedback, setFeedback] = useState({ rating: 0, message: '' })
  const [alreadyFeedback, setAlreadyFeedback] = useState(false)

  useEffect(() => {
    if (urlCode) {
      setCode(urlCode)
      handleSearch(urlCode)
    }
  }, [urlCode])

  const handleSearch = async (searchCode = code) => {
    if (!searchCode.trim()) {
      toast.error('Masukkan kode order')
      return
    }
    setLoading(true)
    setSearched(true)
    try {
      const data = await getCustomerOrder(searchCode.trim())
      setOrder(data.order)
      setHistory(data.history || [])
      setAlreadyFeedback(false)
    } catch {
      toast.error('Order tidak ditemukan')
      setOrder(null)
      setHistory([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitFeedback = async () => {
    if (feedback.rating === 0) {
      toast.error('Pilih rating dulu')
      return
    }
    try {
      await createFeedback({
        orderCode: order.code,
        customerName: order.customer_name,
        rating: feedback.rating,
        message: feedback.message,
      })
      toast.success('Terima kasih atas feedback Anda!')
      setShowFeedback(false)
      setAlreadyFeedback(true)
    } catch {
      toast.error('Gagal mengirim feedback')
    }
  }

  const isWalkIn = order?.order_source === 'walk_in'
  const filteredHistory = history.filter((h) =>
    isWalkIn ? !['pending_pickup', 'picked_up'].includes(h.status) : true
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden">
              <img src="/laundryfoto.jpg" alt={brand.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">{brand.name}</p>
              <p className="text-xs text-gray-400 leading-tight">Tracking Pesanan</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/customer')}
            className="text-sm text-primary-600 font-medium hover:underline"
          >
            + Buat Order
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Cek Status Laundry</h1>
          <p className="text-gray-500 mt-1">Masukkan kode order untuk melihat status terkini</p>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSearch()
            }}
            className="flex gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Contoh: LW12345678"
                className="input pl-10 tracking-wider"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary px-6">
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Cek'
              )}
            </button>
          </form>
        </Card>

        {/* Result */}
        {order && !loading && (
          <div className="space-y-4">
            <Card>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Kode Order</p>
                  <p className="text-2xl font-bold text-primary-600 tracking-wider">{order.code}</p>
                </div>
                <span className="px-3 py-1.5 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full">
                  {STATUS_LABELS[order.status] || order.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Pelanggan</p>
                  <p className="font-semibold text-gray-800">{order.customer_name}</p>
                </div>
                <div>
                  <p className="text-gray-400">Layanan</p>
                  <p className="font-semibold text-gray-800">{order.service_name}</p>
                </div>
                <div>
                  <p className="text-gray-400">Berat</p>
                  <p className="font-semibold text-gray-800">
                    {order.weight > 0 ? (
                      `${order.weight} ${order.service_unit || 'kg'}`
                    ) : (
                      <span className="text-amber-500 text-xs">Belum ditimbang</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Total Harga</p>
                  {order.weight > 0 ? (
                    <p className="font-semibold text-gray-800">{formatRupiah(order.total_price)}</p>
                  ) : (
                    <p className="text-amber-500 text-xs font-medium">Menunggu konfirmasi</p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Estimasi Selesai</p>
                  <p className="text-sm font-semibold text-primary-600">
                    {order.created_at
                      ? formatDate(
                          new Date(
                            new Date(order.created_at).getTime() +
                              (order.estimated_day || 2) * 86400000
                          )
                        )
                      : '-'}
                  </p>
                </div>
                <a
                  href={`https://wa.me/${brand.adminWa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Hubungi Admin
                </a>
              </div>
            </Card>

            {/* Timeline */}
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Progress Laundry</h3>
              <StatusTimeline currentStatus={order.status} orderSource={order.order_source} />
            </Card>

            {/* History */}
            {filteredHistory.length > 0 && (
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Riwayat Status</h3>
                <div className="space-y-2">
                  {filteredHistory.map((h, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-primary-400 flex-shrink-0" />
                      <span className="text-gray-400 text-xs w-36 flex-shrink-0">
                        {formatDateTime(h.updated_at)}
                      </span>
                      <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-gray-700 text-xs font-medium">
                        {STATUS_LABELS[h.status] || h.status}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Feedback */}
            <Card className="text-center">
              {alreadyFeedback ? (
                <p className="text-sm text-gray-400">
                  ✅ Anda sudah memberikan feedback untuk order ini
                </p>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-3">
                    Puas dengan layanan kami? Beri penilaian yuk!
                  </p>
                  <button
                    onClick={() => setShowFeedback(true)}
                    className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors"
                  >
                    <Star className="w-4 h-4" />
                    Beri Penilaian
                  </button>
                </>
              )}
            </Card>
          </div>
        )}

        {searched && !order && !loading && (
          <Card className="text-center py-12">
            <div className="text-5xl mb-3">🔍</div>
            <p className="font-semibold text-gray-700">Order tidak ditemukan</p>
            <p className="text-sm text-gray-400 mt-1">Pastikan kode order yang dimasukkan benar</p>
          </Card>
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900">Beri Penilaian</h3>
                <p className="text-xs text-gray-400 mt-0.5">Bagaimana pengalaman laundry Anda?</p>
              </div>
              <button
                onClick={() => setShowFeedback(false)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <span className="text-gray-400 text-lg">×</span>
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="text-center">
                <div className="flex justify-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedback({ ...feedback, rating: star })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          star <= feedback.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Pesan (opsional)</label>
                <textarea
                  value={feedback.message}
                  onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                  className="input resize-none"
                  rows="3"
                  placeholder="Ceritakan pengalaman Anda..."
                />
              </div>

              <button
                onClick={handleSubmitFeedback}
                disabled={feedback.rating === 0}
                className="btn-primary w-full py-3 disabled:opacity-50"
              >
                Kirim Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TrackingPage