import React, { useState } from 'react'
import { X, Star, ThumbsUp, Coffee } from 'lucide-react'
import { createFeedback } from '../../utils/api'
import Button from '../common/Button'
import toast from 'react-hot-toast'

const RATING_LABELS = {
  1: 'Sangat Buruk',
  2: 'Buruk',
  3: 'Cukup',
  4: 'Bagus',
  5: 'Sangat Bagus!',
}

const FeedbackModal = ({ orderCode, customerName, onClose }) => {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) {
      toast.error('Pilih rating dulu')
      return
    }

    setLoading(true)
    try {
      await createFeedback({
        order_code: orderCode,
        customer_name: customerName,
        rating,
        message,
      })
      setSubmitted(true)
    } catch (err) {
      toast.error(err.message || 'Gagal mengirim feedback')
    } finally {
      setLoading(false)
    }
  }

  // ============ SUBMITTED STATE ============
  if (submitted) {
    const isPositive = rating >= 4
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-soft">
              {isPositive ? (
                <ThumbsUp className="w-10 h-10 text-white" />
              ) : (
                <Coffee className="w-10 h-10 text-white" />
              )}
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {isPositive ? 'Terima Kasih!' : 'Terima Kasih atas Feedbacknya'}
            </h3>
            <p className="text-gray-500 mb-4">
              {isPositive
                ? 'Kami senang Anda menikmati pengalaman di sini!'
                : 'Kami akan segera memperbaiki layanan kami.'}
            </p>

            <div className="flex justify-center gap-1 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-8 h-8 ${
                    star <= rating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-200'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={onClose}
              className="btn-primary w-full py-3"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ============ FORM STATE ============
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900">Beri Penilaian</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Bagaimana pengalaman laundry Anda?
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Stars */}
          <div className="text-center">
            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-transform hover:scale-110"
                  aria-label={`Beri rating ${star}`}
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hovered || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm font-semibold text-gray-600 h-5">
              {RATING_LABELS[hovered || rating] || ''}
            </p>
          </div>

          {/* Message */}
          <div>
            <label className="label">
              Pesan{' '}
              <span className="text-gray-400 font-normal text-xs">
                (opsional)
              </span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="input resize-none"
              rows="3"
              placeholder="Ceritakan pengalaman Anda..."
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-3"
            disabled={loading || rating === 0}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Mengirim...
              </span>
            ) : (
              'Kirim Feedback'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default FeedbackModal