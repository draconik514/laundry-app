import React, { useState, useEffect } from 'react'
import { X, ClipboardCheck, User, Phone, MapPin, Package, Scale, FileText } from 'lucide-react'
import { getServices, createOrder } from '../../utils/api'
import { formatRupiah } from '../../utils/helpers'
import Button from '../common/Button'
import toast from 'react-hot-toast'

const emptyForm = {
  customer_name: '',
  customer_phone: '',
  customer_address: '',
  service_id: '',
  weight: '',
  note: '',
  order_source: 'walk_in',
}

const sourceOptions = [
  { value: 'walk_in', label: '🏪 Datang Langsung' },
  { value: 'whatsapp', label: '💬 WhatsApp' },
  { value: 'website', label: '🖥️ Website' },
]

const OrderForm = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState(emptyForm)
  const [services, setServices] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [successInfo, setSuccessInfo] = useState(null)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const data = await getServices()
      setServices(data || [])
      if (data.length > 0 && data[0].id != null) {
        setForm((f) => ({ ...f, service_id: String(data[0].id) }))
      }
    } catch {
      toast.error('Gagal memuat layanan')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        customerName: form.customer_name,
        customerPhone: form.customer_phone,
        customerAddress: form.customer_address,
        serviceId: parseInt(form.service_id),
        weight: parseFloat(form.weight) || 0,
        note: form.note,
        orderSource: form.order_source,
      }
      const data = await createOrder(payload)
      toast.success('Pesanan berhasil dibuat!')
      setSuccessInfo(data)
    } catch (err) {
      toast.error(err.message || 'Gagal membuat pesanan')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedService = services.find((s) => s.id === parseInt(form.service_id))
  const isSatuan = selectedService?.category === 'Cuci Satuan'
  const satuanUnit = selectedService?.unit || 'Kg'
  const estimatedPrice =
    selectedService && form.weight
      ? selectedService.price_per_kg * parseFloat(form.weight || 0)
      : null

  if (successInfo) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardCheck className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Pesanan Berhasil Dicatat!</h3>
          <p className="text-sm text-gray-500 mb-6">Berikut detail pesanan yang baru dibuat</p>
          <div className="w-full bg-primary-50 rounded-2xl p-5 text-left space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Kode Pesanan</span>
              <span className="text-lg font-bold text-primary-600 tracking-wider font-mono">
                {successInfo.code}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Total Harga</span>
              <span className="text-base font-bold text-gray-900">
                {formatRupiah(successInfo.totalPrice ?? successInfo.total_price)}
              </span>
            </div>
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={() => {
                setSuccessInfo(null)
                setForm({ ...emptyForm, service_id: form.service_id })
                if (onSuccess) onSuccess()
              }}
              className="btn-secondary flex-1"
            >
              + Pesanan Lagi
            </button>
            <button onClick={() => { if (onSuccess) onSuccess(); onClose() }} className="btn-primary flex-1">
              Selesai
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Buat Pesanan Baru</h2>
            <p className="text-xs text-gray-400 mt-0.5">Catat pesanan pelanggan</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* Sumber Pesanan */}
            <div>
              <label className="label">Sumber Pesanan</label>
              <div className="grid grid-cols-3 gap-2">
                {sourceOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm({ ...form, order_source: opt.value })}
                    className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-all text-center ${
                      form.order_source === opt.value
                        ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Nama & Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gray-400" /> Nama <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                  className="input"
                  placeholder="Nama lengkap"
                  required
                />
              </div>
              <div>
                <label className="label flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" /> WhatsApp
                </label>
                <input
                  type="tel"
                  value={form.customer_phone}
                  onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                  className="input"
                  placeholder="08xxxxxxxxxx"
                />
              </div>
            </div>

            {/* Alamat */}
            <div>
              <label className="label flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400" /> Alamat
                <span className="text-gray-400 font-normal text-xs">(opsional)</span>
              </label>
              <input
                type="text"
                value={form.customer_address}
                onChange={(e) => setForm({ ...form, customer_address: e.target.value })}
                className="input"
                placeholder="Alamat pelanggan"
              />
            </div>

            {/* Layanan & Berat */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-gray-400" /> Layanan <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.service_id}
                  onChange={(e) => setForm({ ...form, service_id: e.target.value, weight: '' })}
                  className="input"
                  required
                >
                  {services.length === 0 ? (
                    <option value="">Memuat...</option>
                  ) : (
                    (() => {
                      const grouped = {}
                      services.forEach((s) => {
                        const cat = s.category || 'Umum'
                        if (!grouped[cat]) grouped[cat] = []
                        grouped[cat].push(s)
                      })
                      return Object.entries(grouped).map(([cat, items]) => (
                        <optgroup key={cat} label={`── ${cat} ──`}>
                          {items.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} · {formatRupiah(s.price_per_kg)}/{s.unit || 'kg'}
                            </option>
                          ))}
                        </optgroup>
                      ))
                    })()
                  )}
                </select>
              </div>
              <div>
                {isSatuan && satuanUnit !== 'Kg' ? (
                  <>
                    <label className="label flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-gray-400" /> Jumlah ({satuanUnit}) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      value={form.weight}
                      onChange={(e) => setForm({ ...form, weight: e.target.value })}
                      className="input"
                      placeholder={`Jumlah ${satuanUnit}`}
                      required
                      min="1"
                      step="1"
                    />
                  </>
                ) : (
                  <>
                    <label className="label flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-gray-400" /> Berat (kg)
                      {isSatuan && satuanUnit === 'Kg' ? (
                        <span className="text-gray-400 font-normal text-xs">(opsional)</span>
                      ) : (
                        <span className="text-red-400">*</span>
                      )}
                    </label>
                    <input
                      type="number"
                      value={form.weight}
                      onChange={(e) => setForm({ ...form, weight: e.target.value })}
                      className="input"
                      placeholder={isSatuan ? 'Dikonfirmasi admin' : 'Contoh: 3'}
                      required={!isSatuan}
                      min="0.5"
                      step="0.5"
                    />
                  </>
                )}
              </div>
            </div>

            {isSatuan && satuanUnit === 'Kg' && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-700">
                ⚖️ <strong>Harga dikonfirmasi admin</strong> — item ini dihitung per Kg.
              </div>
            )}

            {estimatedPrice !== null && estimatedPrice > 0 && !(isSatuan && satuanUnit === 'Kg') && (
              <div className="bg-primary-50 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-primary-500 font-medium">
                    {isSatuan ? `Total (${form.weight} ${satuanUnit})` : 'Estimasi Total'}
                  </p>
                  <p className="text-xl font-bold text-primary-700">{formatRupiah(estimatedPrice)}</p>
                </div>
                {selectedService && (
                  <div className="text-right">
                    <p className="text-xs text-primary-400">Estimasi selesai</p>
                    <p className="text-sm font-semibold text-primary-600">
                      {selectedService.estimated_day === 1 ? 'Hari ini' : `${selectedService.estimated_day} hari`}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Catatan */}
            <div>
              <label className="label flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-gray-400" /> Catatan
                <span className="text-gray-400 font-normal text-xs">(opsional)</span>
              </label>
              <textarea
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                className="input resize-none"
                rows="2"
                placeholder="Contoh: ada karpet, jaket tebal"
              />
            </div>
          </div>

          <div className="flex gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || services.length === 0}
              className="btn-primary flex-1"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Menyimpan...
                </span>
              ) : (
                'Buat Pesanan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default OrderForm