"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "../store"
import {
  login as loginAction,
  register as registerAction,
  logout as logoutAction,
  fetchUserProfile,
  initAuth,
  clearError,
} from "../store/slices/authSlice"
import type { LoginPayload, RegisterPayload, UserProfile } from "../services/authService"

interface AuthContextType {
  isAuthenticated: boolean
  user: UserProfile | null
  token: string | null
  loading: boolean
  error: string | null
  login: (credentials: LoginPayload) => Promise<void>
  register: (userData: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  refreshUserProfile: () => Promise<void>
  clearAuthError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated, token, user, loading, error } = useSelector((state: RootState) => state.auth)
  const [initialized, setInitialized] = useState(false)

  // Initialize auth state on app start
  useEffect(() => {
    const initialize = async () => {
      await dispatch(initAuth())
      setInitialized(true)
    }

    initialize()
  }, [dispatch])

  const login = async (credentials: LoginPayload) => {
    await dispatch(loginAction(credentials)).unwrap()
  }

  const register = async (userData: RegisterPayload) => {
    await dispatch(registerAction(userData)).unwrap()
  }

  const logout = async () => {
    await dispatch(logoutAction())
  }

  const refreshUserProfile = async () => {
    if (isAuthenticated) {
      await dispatch(fetchUserProfile())
    }
  }

  const clearAuthError = () => {
    dispatch(clearError())
  }

  // Don't render children until auth is initialized
  if (!initialized) {
    return null // Or a loading spinner
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        token,
        user,
        loading,
        error,
        login,
        register,
        logout,
        refreshUserProfile,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
