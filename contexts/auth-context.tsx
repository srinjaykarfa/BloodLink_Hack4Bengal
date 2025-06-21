"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { apiClient } from "@/lib/api"

interface User {
  id: string
  _id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  bloodType: string
  userType: "donor" | "recipient" | "admin"
  isVerified: boolean
  isActive: boolean
  donorInfo?: {
    isAvailable: boolean
    lastDonation?: string
  }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("token")
      if (token) {
        apiClient.setToken(token)
        const response = await apiClient.getCurrentUser()

        // Ensure both id and _id are set for compatibility
        const userData = response.user
        userData.id = userData._id || userData.id
        userData._id = userData._id || userData.id

        console.log("✅ User authenticated:", userData)
        setUser(userData)
      }
    } catch (error) {
      console.error("❌ Auth check failed:", error)
      localStorage.removeItem("token")
      apiClient.removeToken()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      console.log("🔐 Attempting login...")
      const response = await apiClient.login({ email, password })

      if (response.success && response.token) {
        localStorage.setItem("token", response.token)
        apiClient.setToken(response.token)

        // Ensure both id and _id are set for compatibility
        const userData = response.user
        userData.id = userData._id || userData.id
        userData._id = userData._id || userData.id

        console.log("✅ Login successful:", userData)
        setUser(userData)
      } else {
        throw new Error(response.message || "Login failed")
      }
    } catch (error: any) {
      console.error("❌ Login error:", error)
      throw error
    }
  }

  const register = async (userData: any) => {
    try {
      console.log("📝 Attempting registration...")
      const response = await apiClient.register(userData)

      if (response.success && response.token) {
        localStorage.setItem("token", response.token)
        apiClient.setToken(response.token)

        // Ensure both id and _id are set for compatibility
        const newUserData = response.user
        newUserData.id = newUserData._id || newUserData.id
        newUserData._id = newUserData._id || newUserData.id

        console.log("✅ Registration successful:", newUserData)
        setUser(newUserData)
      } else {
        throw new Error(response.message || "Registration failed")
      }
    } catch (error: any) {
      console.error("❌ Registration error:", error)
      throw error
    }
  }

  const logout = () => {
    console.log("👋 Logging out...")
    localStorage.removeItem("token")
    apiClient.removeToken()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
