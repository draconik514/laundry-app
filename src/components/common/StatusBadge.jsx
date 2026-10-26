import React from 'react'
import { STATUS_COLORS, STATUS_LABELS } from '../../utils/constants'

const StatusBadge = ({ status, orderSource = 'website', className = '' }) => {
  let label = STATUS_LABELS[status] || status
  if (status === 'ready_for_delivery' && orderSource === 'walk_in') {
    label = 'Siap Diambil'
  }
  
  const colorClass = STATUS_COLORS[status] || 'bg-gray-100 text-gray-700 border-gray-200'

  return (
    <span className={`badge ${colorClass} ${className}`}>
      {label}
    </span>
  )
}

export default StatusBadge