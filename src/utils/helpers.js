export const formatRupiah = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount || 0)
}

export const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

export const formatDateTime = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const timeAgo = (timestamp) => {
  const diff = Math.floor((new Date() - new Date(timestamp)) / 1000)
  if (diff < 60) return 'Baru saja'
  if (diff < 3600) return Math.floor(diff / 60) + ' menit lalu'
  if (diff < 86400) return Math.floor(diff / 3600) + ' jam lalu'
  if (diff < 604800) return Math.floor(diff / 86400) + ' hari lalu'
  return formatDate(timestamp)
}

export const generateOrderCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'LW'
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export const getStatusLabel = (status, orderSource = 'website') => {
  if (status === 'ready_for_delivery' && orderSource === 'walk_in') {
    return 'Siap Diambil'
  }
  return STATUS_LABELS[status] || status
}