import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Menu, X, ShoppingBag, Clock } from 'lucide-react'
import { getNotifications } from '../../utils/api'
import { useAuth } from '../../context/AuthContext'

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications()
        setNotifications(data.notifications || [])
      } catch {
        // silent fail
      }
    }
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const unread = notifications.length

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 flex items-center px-4">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="flex-1 px-3 lg:px-0">
          <p className="text-sm text-gray-500">Selamat datang kembali 👋</p>
          <p className="text-xs text-gray-400 hidden sm:block">Halo, <span className="font-semibold text-gray-600">{user?.name}</span></p>
        </div>

        <div className="ml-auto relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full" />
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <p className="font-semibold text-gray-900 text-sm">Notifikasi</p>
                {unread > 0 && (
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                    {unread}
                  </span>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Tidak ada notifikasi</p>
                  </div>
                ) : (
                  notifications.map((n, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setOpen(false)
                        navigate(`/manage-laundry/orders/${n.code}`)
                      }}
                      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${n.is_late ? 'bg-red-100' : 'bg-blue-100'}`}>
                        {n.is_late ? (
                          <Clock className="w-4 h-4 text-red-500" />
                        ) : (
                          <ShoppingBag className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${n.is_late ? 'text-red-600' : 'text-gray-800'}`}>
                          {n.is_late ? `Order ${n.code} terlambat!` : `Order ${n.code}`}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{n.customer_name} — {n.service_name}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar