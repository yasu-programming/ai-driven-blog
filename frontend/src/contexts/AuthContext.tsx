"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'

interface User {
  id: number
  name: string
  email: string
  email_verified_at?: string
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
  error: string | null
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check for existing token on mount
    const savedToken = localStorage.getItem('auth_token')
    if (savedToken) {
      setToken(savedToken)
      apiClient.setToken(savedToken)
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
        headers: {
          'Authorization': `Bearer ${token || localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('auth_token')
        setToken(null)
        apiClient.setToken('')
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      localStorage.removeItem('auth_token')
      setToken(null)
      apiClient.setToken('')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      const { user, token } = data
      setUser(user)
      setToken(token)
      localStorage.setItem('auth_token', token)
      apiClient.setToken(token)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string, passwordConfirmation: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      const { user, token } = data
      setUser(user)
      setToken(token)
      localStorage.setItem('auth_token', token)
      apiClient.setToken(token)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setToken(null)
      localStorage.removeItem('auth_token')
      apiClient.setToken('')
    }
  }

  const clearError = () => setError(null)

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    error,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}