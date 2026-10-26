import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Star,
  BarChart3,
  User,
  LogOut,
  Home,
} from 'lucide-react'
import brand from '../../config/brand'

const navigation = [
  { name: 'Dashboard', href: '/manage-laundry', icon: LayoutDashboard },
  { name: 'Pesanan', href: '/manage-laundry/orders', icon: ShoppingBag },
  { name: 'Layanan', href: '/manage-laundry/services', icon: Package },
  { name: 'Feedback', href: '/manage-laundry/feedbacks', icon: Star },
  { name: 'Laporan', href: '/manage-laundry/reports', icon: BarChart3 },
  { name: 'Profil', href: '/manage-laundry/profile', icon: User },
]

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const isActive = (path) => {
    if (path === '/manage-laundry') return location.pathname === path
    return location.pathname.startsWith(path)
  }

  const handleLogout = () => {
    logout()
    navigate('/manage-laundry/login')
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 z-40 w-64 h-screen bg-white border-r border-gray-100 flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <p className="text-base font-bold text-gray-900 leading-tight">{brand.name}</p>
            <p className="text-xs text-gray-400 leading-tight">Manajemen Laundry</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Menu</p>
          {navigation.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${active
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-primary-500' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* User & Logout */}
        <div className="px-3 py-4 border-t border-gray-100 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Keluar
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar