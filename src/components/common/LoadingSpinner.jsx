import React from 'react'

const LoadingSpinner = ({ size = 'md', fullScreen = false }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  }

  const spinner = (
    <div className={`${sizes[size]} border-4 border-primary-500 border-t-transparent rounded-full animate-spin`} />
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-3">
          {spinner}
          <p className="text-sm text-gray-500">Memuat...</p>
        </div>
      </div>
    )
  }

  return spinner
}

export default LoadingSpinner