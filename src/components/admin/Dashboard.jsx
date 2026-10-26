import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  TrendingUp,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useAuth } from '../../context/AuthContext'
import { getDashboardStats } from '../../utils/api'
import { formatRupiah } from '../../utils/helpers'
import Card from '../common/Card'
import LoadingSpinner from '../common/LoadingSpinner'
import StatusBadge from '../common/StatusBadge'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    lateOrders: 0,
    revenueToday: 0,
    weeklyData: [],
    recentOrders: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const data = await getDashboardStats()
      setStats({
        totalOrders: data.totalOrders ?? 0,
        processingOrders: data.processingOrders ?? 0,
        completedOrders: data.completedOrders ?? 0,
        lateOrders: data.lateOrders ?? 0,
        revenueToday: data.revenueToday ?? 0,
        weeklyData: data.weeklyData ?? [],
        recentOrders: data.recentOrders ?? [],
      })
    } catch (err) {
      setError('Gagal memuat dashboard')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="text-center py-12">
        <p className="text-red-500 font-medium">{error}</p>
        <button
          onClick={fetchDashboard}
          className="btn-primary mt-4 inline-flex"
        >
          Coba Lagi
        </button>
      </Card>
    )
  }

  const statCards = [
    {
      title: 'Total Order',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'from-blue-400 to-blue-600',
    },
    {
      title: 'Diproses',
      value: stats.processingOrders,
      icon: Clock,
      color: 'from-yellow-400 to-yellow-600',
    },
    {
      title: 'Selesai',
      value: stats.completedOrders,
      icon: CheckCircle,
      color: 'from-green-400 to-green-600',
    },
    {
      title: 'Terlambat',
      value: stats.lateOrders,
      icon: AlertTriangle,
      color: 'from-red-400 to-red-600',
    },
    {
      title: 'Pendapatan Hari Ini',
      value: formatRupiah(stats.revenueToday),
      icon: DollarSign,
      color: 'from-purple-400 to-purple-600',
    },
  ]

  const hasWeeklyData = stats.weeklyData.some((d) => d.count > 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Selamat datang,{' '}
          <span className="font-semibold text-primary-600">{user?.name}</span> —
          berikut ringkasan bisnis hari ini.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-400 truncate">{stat.title}</p>
                  <p className="text-lg font-bold text-gray-900 mt-1 truncate">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary-500" />
                Order Mingguan
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">7 hari terakhir</p>
            </div>
          </div>

          {!hasWeeklyData ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              Belum ada data order minggu ini
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.weeklyData} barSize={32}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value) => [`${value} order`, 'Jumlah']}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Recent Orders */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Order Terbaru</h3>
            <Link
              to="/orders"
              className="text-xs text-primary-600 font-medium hover:underline"
            >
              Lihat semua
            </Link>
          </div>

          {stats.recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Belum ada order</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  to={`/orders/${order.code}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {order.code}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {order.customer}
                    </p>
                  </div>
                  <StatusBadge
                    status={order.status}
                    className="text-xs flex-shrink-0 ml-2"
                  />
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default Dashboard