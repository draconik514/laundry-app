import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { formatRupiah, formatDateTime } from '../../utils/helpers'
import StatusBadge from '../common/StatusBadge'

const sourceLabels = {
  website: '🖥️ Website',
  walk_in: '🏪 Datang Langsung',
  whatsapp: '💬 WhatsApp',
}

const OrdersTable = ({ orders, onEditPrice, onDelete }) => {
  const navigate = useNavigate()

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-3">📋</div>
        <p className="text-gray-500 font-medium">Belum ada pesanan</p>
        <p className="text-gray-400 text-sm mt-1">Pesanan akan muncul di sini</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto -mx-5">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kode</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pelanggan</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Layanan</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Berat</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sumber</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
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
              <td className="py-3.5 px-4 text-sm text-gray-700">
                {order.weight > 0 ? `${order.weight} ${order.service_unit || 'kg'}` : '-'}
              </td>
              <td className="py-3.5 px-4 text-sm font-semibold text-gray-900">
                {order.total_price > 0 ? formatRupiah(order.total_price) : '-'}
              </td>
              <td className="py-3.5 px-4">
                <StatusBadge status={order.status} orderSource={order.order_source} />
              </td>
              <td className="py-3.5 px-4 text-sm text-gray-500">
                {sourceLabels[order.order_source] || order.order_source}
              </td>
              <td className="py-3.5 px-4">
                <div className="flex items-center gap-1">
                  {onEditPrice && order.order_source !== 'walk_in' && !['completed', 'cancelled'].includes(order.status) && (
                    <button
                      onClick={() => onEditPrice(order)}
                      title="Konfirmasi Harga"
                      className="p-2 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(order.id)}
                      title="Hapus"
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/orders/${order.code}`)}
                    title="Detail"
                    className="p-2 rounded-lg hover:bg-primary-50 text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default OrdersTable