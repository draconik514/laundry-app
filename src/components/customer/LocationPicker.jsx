import React, { useState } from 'react'
import { MapPin, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'

const LocationPicker = ({ onLocationSelect, adminPhone, customerName }) => {
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [locationData, setLocationData] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  const getLocation = () => {
    if (!navigator.geolocation) {
      setStatus('error')
      setErrorMsg('Browser Anda tidak mendukung GPS. Isi alamat manual.')
      return
    }

    setStatus('loading')
    setErrorMsg('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        const googleMapsUrl = `https://maps.google.com/?q=${lat},${lng}`
        const addressText = `📍 Lokasi GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}`

        const data = { lat, lng, googleMapsUrl, address: addressText }
        setLocationData(data)
        setStatus('success')

        if (onLocationSelect) {
          onLocationSelect(data)
        }
      },
      (err) => {
        setStatus('error')
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setErrorMsg('Izin lokasi ditolak. Aktifkan GPS di browser lalu coba lagi.')
            break
          case err.POSITION_UNAVAILABLE:
            setErrorMsg('Lokasi tidak tersedia. Coba lagi atau isi alamat manual.')
            break
          case err.TIMEOUT:
            setErrorMsg('Permintaan lokasi timeout. Coba lagi.')
            break
          default:
            setErrorMsg('Gagal mendapatkan lokasi. Isi alamat manual.')
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={getLocation}
          disabled={status === 'loading'}
          className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm font-medium hover:bg-green-100 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Mendeteksi...
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4" />
              📡 Gunakan Lokasi GPS
            </>
          )}
        </button>
      </div>

      {status === 'success' && locationData && (
        <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm">
          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-green-700 font-medium">Lokasi GPS berhasil dideteksi!</p>
            <a
              href={locationData.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-600 underline break-all"
            >
              {locationData.googleMapsUrl}
            </a>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-red-600">{errorMsg}</p>
        </div>
      )}

      {status === 'idle' && (
        <p className="text-xs text-gray-400">
          💡 Klik tombol di atas untuk otomatis mengisi lokasi Anda, atau isi alamat manual di bawah.
        </p>
      )}
    </div>
  )
}

export default LocationPicker