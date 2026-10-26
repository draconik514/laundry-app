import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react'
import { getDashboardStats } from '../utils/api'
import { formatRupiah } from '../utils/helpers'
import Card from '../components/common/Card'
import LoadingSpinner from '../components/common/LoadingSpinner'
import StatusBadge from '../components/common/StatusBadge'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardStats()
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch dashboard:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    )
  }

  const statCards = [
    { title: 'Total Order', value: stats?.totalOrders || 0, icon: ShoppingBag, color: 'from-blue-400 to-blue-600' },
    { title: 'Diproses', value: stats?.processingOrders || 0, icon: Clock, color: 'from-yellow-400 to-yellow-600' },
    { title: 'Selesai', value: stats?.completedOrders || 0, icon: CheckCircle, color: 'from-green-400 to-green-600' },
    { title: 'Terlambat', value: stats?.lateOrders || 0, icon: AlertTriangle, color: 'from-red-400 to-red-600' },
    { title: 'Pendapatan Hari Ini', value: formatRupiah(stats?.revenueToday || 0), icon: DollarSign, color: 'from-purple-400 to-purple-600' },
  ]

  const weeklyData = stats?.weeklyData || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Selamat datang, <span className="font-semibold text-primary-600">{user?.name}</span> — berikut ringkasan bisnis hari ini.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-400">{stat.title}</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center`}>
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
              <h3 className="font-semibold text-gray-900">Order Mingguan</h3>
              <p className="text-xs text-gray-400 mt-0.5">7 hari terakhir</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Recent Orders */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Order Terbaru</h3>
          </div>
          {!stats?.recentOrders || stats.recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">Belum ada order</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((order, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{order.code}</p>
                    <p className="text-xs text-gray-500">{order.customer}</p>
                  </div>
                  <StatusBadge status={order.status} className="text-xs" />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default Dashboard