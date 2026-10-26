import React, { createContext, useState, useContext, useEffect } from 'react'
import { login as apiLogin } from '../utils/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      try {
        // Simple JWT decode (Apps Script token is just a string)
        const userData = JSON.parse(atob(token))
        setUser(userData)
      } catch {
        localStorage.removeItem('token')
        setToken(null)
      }
    }
    setLoading(false)
  }, [token])

  const login = async (email, password) => {
    const response = await apiLogin(email, password)
    if (response.success) {
      const tokenStr = response.token
      localStorage.setItem('token', tokenStr)
      setToken(tokenStr)
      setUser(response.user)
      return response.user
    }
    throw new Error(response.message || 'Login failed')
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}