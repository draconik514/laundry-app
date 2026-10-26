export const STATUS_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'pending_pickup', label: 'Menunggu Pickup' },
  { value: 'picked_up', label: 'Dijemput' },
  { value: 'washing', label: 'Dicuci' },
  { value: 'drying', label: 'Dikeringkan' },
  { value: 'ironing', label: 'Disetrika' },
  { value: 'ready_for_delivery', label: 'Siap Diantar' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
]

export const STATUS_COLORS = {
  pending_pickup: 'bg-amber-50 text-amber-700 border-amber-200',
  picked_up: 'bg-blue-50 text-blue-700 border-blue-200',
  washing: 'bg-violet-50 text-violet-700 border-violet-200',
  drying: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  ironing: 'bg-pink-50 text-pink-700 border-pink-200',
  ready_for_delivery: 'bg-orange-50 text-orange-700 border-orange-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
}

export const STATUS_LABELS = {
  pending_pickup: 'Menunggu Pickup',
  picked_up: 'Dijemput',
  washing: 'Dicuci',
  drying: 'Dikeringkan',
  ironing: 'Disetrika',
  ready_for_delivery: 'Siap Diantar',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
}

export const SOURCE_OPTIONS = [
  { value: 'walk_in', label: '🏪 Datang Langsung' },
  { value: 'whatsapp', label: '💬 WhatsApp' },
  { value: 'website', label: '🖥️ Website' },
]

export const SOURCE_LABELS = {
  website: 'Website',
  walk_in: 'Datang Langsung',
  whatsapp: 'WhatsApp'
}