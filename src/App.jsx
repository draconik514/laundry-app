import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { lazy, Suspense } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import { getServices } from './utils/api'

// Preload Apps Script on app start to warm up cold start
getServices().catch(() => {})

// Lazy load semua halaman — hanya load saat dibutuhkan
const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Orders = lazy(() => import('./pages/Orders'))
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'))
const Services = lazy(() => import('./pages/Services'))
const Feedbacks = lazy(() => import('./pages/Feedbacks'))
const Reports = lazy(() => import('./pages/Reports'))
const Profile = lazy(() => import('./pages/Profile'))
const CustomerPage = lazy(() => import('./pages/CustomerPage'))
const TrackingPage = lazy(() => import('./pages/TrackingPage'))

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
  </div>
)

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? children : <Navigate to="/manage-laundry/login" replace />
}

const AppRoutes = () => {
  const { user, loading } = useAuth()
  if (loading) return null

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public — Customer */}
        <Route path="/" element={<CustomerPage />} />
        <Route path="/tracking" element={<TrackingPage />} />
        <Route path="/track/:code" element={<TrackingPage />} />

        {/* Admin — URL tersembunyi */}
        <Route path="/manage-laundry/login" element={user ? <Navigate to="/manage-laundry" replace /> : <Login />} />
        <Route path="/manage-laundry" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
        <Route path="/manage-laundry/orders" element={<PrivateRoute><Layout><Orders /></Layout></PrivateRoute>} />
        <Route path="/manage-laundry/orders/:code" element={<PrivateRoute><Layout><OrderDetailPage /></Layout></PrivateRoute>} />
        <Route path="/manage-laundry/services" element={<PrivateRoute><Layout><Services /></Layout></PrivateRoute>} />
        <Route path="/manage-laundry/feedbacks" element={<PrivateRoute><Layout><Feedbacks /></Layout></PrivateRoute>} />
        <Route path="/manage-laundry/reports" element={<PrivateRoute><Layout><Reports /></Layout></PrivateRoute>} />
        <Route path="/manage-laundry/profile" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
