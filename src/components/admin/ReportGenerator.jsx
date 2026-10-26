import React, { useState, useEffect } from 'react'
import { Download, TrendingUp, DollarSign, ShoppingBag, BarChart3 } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { getFinancialReport, getOrdersExport } from '../../utils/api'
import { formatRupiah } from '../../utils/helpers'
import Card from '../common/Card'
import LoadingSpinner from '../common/LoadingSpinner'
import toast from 'react-hot-toast'

const COLORS_CATEGORY = {
  'Cuci Komplit': '#3b82f6',
  Setrika: '#f97316',
  'Cuci Lipat': '#22c55e',
  Umum: '#8b5cf6',
}

const ReportGenerator = () => {
  const [report, setReport] = useState({
    dailyRevenue: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
    totalOrders: 0,
    dailyOrders: 0,
    monthlyOrders: 0,
    averageOrder: 0,
    revenueByService: [],
    dailyData: [],
  })
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [chartMode, setChartMode] = useState('daily')

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    const yearStart = new Date().getFullYear() + '-01-01'
    Promise.all([getFinancialReport(), getOrdersExport(yearStart, today)])
      .then(([reportData, ordersData]) => {
        setReport(reportData)
        setOrders(ordersData.data || [])
      })
      .catch(() => toast.error('Gagal memuat laporan'))
      .finally(() => setLoading(false))
  }, [])

  const exportExcel = () => {
    setExporting(true)
    try {
      const wb = XLSX.utils.book_new()
      const now = new Date().toLocaleString('id-ID')
      const today = new Date().toISOString().slice(0, 10)

      const statusLabel = {
        pending_pickup: 'Menunggu Pickup',
        picked_up: 'Dijemput',
        washing: 'Dicuci',
        drying: 'Dikeringkan',
        ironing: 'Disetrika',
        ready_for_delivery: 'Siap Diantar',
        completed: 'Selesai',
        cancelled: 'Dibatalkan',
      }
      const sourceLabel = {
        website: 'Website',
        walk_in: 'Datang Langsung',
        whatsapp: 'WhatsApp',
      }

      // Sheet 1: Summary
      const summaryData = [
        ['LAPORAN KEUANGAN LAUNDRYFLOW', ''],
        [`Dicetak pada: ${now}`, ''],
        ['', ''],
        ['RINGKASAN KEUANGAN', ''],
        ['Keterangan', 'Nilai'],
        ['Pendapatan Hari Ini', report.dailyRevenue],
        ['Pendapatan Bulan Ini', report.monthlyRevenue],
        ['Total Pendapatan', report.totalRevenue],
        ['', ''],
        ['RINGKASAN ORDER', ''],
        ['Keterangan', 'Jumlah'],
        ['Total Semua Order', report.totalOrders],
        ['Order Hari Ini', report.dailyOrders],
        ['Order Bulan Ini', report.monthlyOrders],
        ['Rata-rata Nilai per Order', report.averageOrder],
      ]
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
      wsSummary['!cols'] = [{ wch: 32 }, { wch: 22 }]
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan')

      // Sheet 2: Semua Order
      const orderHeaders = [
        'No.',
        'Kode Order',
        'Nama Pelanggan',
        'No. WhatsApp',
        'Layanan',
        'Berat',
        'Total Harga',
        'Status',
        'Sumber',
        'Tanggal',
      ]
      const orderRows = orders.map((o, i) => [
        i + 1,
        o.code,
        o.customer_name,
        o.customer_phone || '-',
        o.service_name,
        o.weight,
        o.total_price,
        statusLabel[o.status] || o.status,
        sourceLabel[o.order_source] || o.order_source,
        new Date(o.created_at).toLocaleString('id-ID'),
      ])
      const wsOrders = XLSX.utils.aoa_to_sheet([orderHeaders, ...orderRows])
      wsOrders['!cols'] = [
        { wch: 5 },
        { wch: 16 },
        { wch: 22 },
        { wch: 16 },
        { wch: 20 },
        { wch: 10 },
        { wch: 16 },
        { wch: 20 },
        { wch: 18 },
        { wch: 24 },
      ]
      XLSX.utils.book_append_sheet(wb, wsOrders, 'Semua Order')

      // Sheet 3: Per Layanan
      const serviceHeaders = ['Nama Layanan', 'Total Order', 'Total Pendapatan', 'Rata-rata']
      const serviceRows = report.revenueByService.map((s) => [
        s.serviceName,
        s.totalOrders,
        s.totalRevenue,
        s.totalOrders > 0 ? Math.round(s.totalRevenue / s.totalOrders) : 0,
      ])
      const wsService = XLSX.utils.aoa_to_sheet([serviceHeaders, ...serviceRows])
      wsService['!cols'] = [{ wch: 22 }, { wch: 14 }, { wch: 20 }, { wch: 20 }]
      XLSX.utils.book_append_sheet(wb, wsService, 'Per Layanan')

      // Sheet 4: Data Harian
      const dailyHeaders = ['Tanggal', 'Hari', 'Jumlah Order', 'Pendapatan']
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
      const dailyRows = report.dailyData.map((d) => [
        d.date,
        days[new Date(d.date).getDay()],
        d.orders,
        d.revenue,
      ])
      const wsDaily = XLSX.utils.aoa_to_sheet([dailyHeaders, ...dailyRows])
      wsDaily['!cols'] = [{ wch: 14 }, { wch: 12 }, { wch: 15 }, { wch: 20 }]
      XLSX.utils.book_append_sheet(wb, wsDaily, 'Data Harian')

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array', cellStyles: true })
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      saveAs(blob, `Laporan_LaundryFlow_${today}.xlsx`)
      toast.success('Laporan berhasil diexport!')
    } catch (err) {
      console.error(err)
      toast.error('Gagal export laporan')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan Keuangan</h1>
          <p className="text-gray-500 text-sm mt-1">Ringkasan pendapatan dan performa bisnis</p>
        </div>
        <button onClick={exportExcel} disabled={exporting} className="btn-primary flex items-center gap-2">
          {exporting ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Export Excel
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Pendapatan Hari Ini</p>
            <p className="text-lg font-bold text-gray-900">{formatRupiah(report.dailyRevenue)}</p>
            <p className="text-xs text-gray-400">{report.dailyOrders} order hari ini</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Pendapatan Bulan Ini</p>
            <p className="text-lg font-bold text-gray-900">{formatRupiah(report.monthlyRevenue)}</p>
            <p className="text-xs text-gray-400">{report.monthlyOrders} order bulan ini</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Pendapatan</p>
            <p className="text-lg font-bold text-gray-900">{formatRupiah(report.totalRevenue)}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Rata-rata per Order</p>
            <p className="text-lg font-bold text-gray-900">{formatRupiah(report.averageOrder)}</p>
            <p className="text-xs text-gray-400">dari {report.totalOrders} order</p>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">
                {chartMode === 'daily' ? 'Pendapatan 30 Hari Terakhir' : 'Pendapatan Per Bulan'}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Hanya dari order yang sudah selesai</p>
            </div>
            <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
              <button
                onClick={() => setChartMode('daily')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                  chartMode === 'daily' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-400'
                }`}
              >
                Harian
              </button>
              <button
                onClick={() => setChartMode('monthly')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                  chartMode === 'monthly' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-400'
                }`}
              >
                Bulanan
              </button>
            </div>
          </div>
          {report.dailyData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              Belum ada data pendapatan
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={report.dailyData} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  tickFormatter={(v) =>
                    new Date(v).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                  }
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  formatter={(v) => [formatRupiah(v), 'Pendapatan']}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900">Per Kategori</h3>
            <p className="text-xs text-gray-400 mt-0.5">Distribusi pendapatan</p>
          </div>
          {report.revenueByService.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              Belum ada data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={Object.values(
                    report.revenueByService.reduce((acc, s) => {
                      const cat = s.category || 'Umum'
                      if (!acc[cat]) acc[cat] = { name: cat, totalRevenue: 0 }
                      acc[cat].totalRevenue += Number(s.totalRevenue)
                      return acc
                    }, {})
                  )}
                  dataKey="totalRevenue"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius={80}
                  innerRadius={40}
                >
                  {Object.values(
                    report.revenueByService.reduce((acc, s) => {
                      const cat = s.category || 'Umum'
                      if (!acc[cat]) acc[cat] = { name: cat }
                      return acc
                    }, {})
                  ).map((entry, i) => (
                    <Cell key={i} fill={COLORS_CATEGORY[entry.name] || '#8b5cf6'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatRupiah(v)} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  )
}

export default ReportGenerator