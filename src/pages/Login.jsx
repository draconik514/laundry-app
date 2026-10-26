import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, Eye, EyeOff, Home } from 'lucide-react'
import toast from 'react-hot-toast'
import brand from '../config/brand'
import Card from '../components/common/Card'
import Button from '../components/common/Button'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Login berhasil!')
      navigate('/')
    } catch (error) {
      toast.error(error.message || 'Email atau password salah')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <div className="relative w-full max-w-sm">
        {/* Decorative blur */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary-300 rounded-full blur-3xl opacity-20" />
        
        <Card className="relative z-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-soft">
              <Home className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{brand.name}</h2>
            <p className="text-sm text-gray-400 mt-1">Dashboard Manajemen Laundry</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="admin@laundry.com"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Memproses...
                </span>
              ) : 'Masuk'}
            </Button>

            <p className="text-xs text-center text-gray-400 mt-4">
              Demo: admin@laundry.com / password123
            </p>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default Login