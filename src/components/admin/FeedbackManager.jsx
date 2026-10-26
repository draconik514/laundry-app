import React, { useState, useEffect } from 'react'
import { Star, MessageSquare, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { getFeedbacks, deleteFeedback } from '../../utils/api'
import Card from '../common/Card'
import LoadingSpinner from '../common/LoadingSpinner'
import toast from 'react-hot-toast'

const Stars = ({ rating, size = 'w-4 h-4' }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) =>
      s <= rating ? (
        <Star key={s} className={`${size} text-yellow-400 fill-yellow-400`} />
      ) : (
        <Star key={s} className={`${size} text-gray-300`} />
      )
    )}
  </div>
)

const FeedbackManager = () => {
  const [data, setData] = useState({
    feedbacks: [],
    total: 0,
    avg_rating: 0,
    total_pages: 1,
    distribution: {},
  })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState(null)

  const fetchFeedbacks = async () => {
    setLoading(true)
    try {
      const result = await getFeedbacks(page)
      setData(result)
    } catch {
      toast.error('Gagal memuat feedback')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeedbacks()
  }, [page])

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus feedback ini?')) return
    setDeleting(id)
    try {
      await deleteFeedback(id)
      toast.success('Feedback dihapus')
      fetchFeedbacks()
    } catch {
      toast.error('Gagal menghapus feedback')
    } finally {
      setDeleting(null)
    }
  }

  const ratingCount = (star) => data.distribution?.[star] ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Feedback Pelanggan</h1>
        <p className="text-gray-500 text-sm mt-1">Penilaian dan ulasan dari pelanggan</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="text-center">
              <p className="text-4xl font-extrabold text-yellow-400">{data.avg_rating.toFixed(1)}</p>
              <div className="flex justify-center mt-2">
                <Stars rating={Math.round(data.avg_rating)} size="w-5 h-5" />
              </div>
              <p className="text-xs text-gray-400 mt-1">Rating Rata-rata</p>
            </Card>
            <Card className="text-center">
              <p className="text-4xl font-extrabold text-primary-600">{data.total}</p>
              <p className="text-xs text-gray-400 mt-2">Total Feedback</p>
            </Card>
            <Card>
              <p className="text-xs font-semibold text-gray-500 mb-2">Distribusi Rating</p>
              <div className="space-y-1">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-3">{star}</span>
                    <Star className="w-3 h-3 text-yellow-400 flex-shrink-0 fill-yellow-400" />
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-yellow-400 h-1.5 rounded-full transition-all"
                        style={{
                          width: data.total ? `${(ratingCount(star) / data.total) * 100}%` : '0%',
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-4">{ratingCount(star)}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* List */}
          {data.feedbacks.length === 0 ? (
            <Card className="text-center py-16">
              <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="font-semibold text-gray-500">Belum ada feedback</p>
              <p className="text-sm text-gray-400 mt-1">Feedback dari pelanggan akan muncul di sini</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {data.feedbacks.map((f) => (
                <Card key={f.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold flex-shrink-0">
                        {f.customer_name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{f.customer_name}</p>
                        <p className="text-xs text-gray-400">
                          Order: <span className="font-mono text-primary-600">{f.order_code}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                      <Stars rating={f.rating} />
                      <p className="text-xs text-gray-400">
                        {new Date(f.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                      <button
                        onClick={() => handleDelete(f.id)}
                        disabled={deleting === f.id}
                        className="mt-1 p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {f.message && (
                    <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3 leading-relaxed">
                      "{f.message}"
                    </p>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {data.total_pages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-400">
                Halaman {page} dari {data.total_pages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                  disabled={page === data.total_pages}
                  className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default FeedbackManager