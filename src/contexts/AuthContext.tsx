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
// Add this import at the top of the file
import { clearUserProfile as clearUserProfileAction } from "../store/slices/userSlice"

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

  // Update the login function to ensure user profile is fetched
  const login = async (credentials: LoginPayload) => {
    try {
      const result = await dispatch(loginAction(credentials)).unwrap()
      console.log("Login successful:", result)

      // Explicitly fetch the user profile after login
      if (result && result.token) {
        console.log("Fetching user profile after login")
        await dispatch(fetchUserProfile())
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  // Update the register function to ensure user profile is fetched
  const register = async (userData: RegisterPayload) => {
    try {
      // Register the user
      const result = await dispatch(registerAction(userData)).unwrap()
      console.log("Registration successful:", result)

      // Explicitly fetch the user profile after registration
      if (result && result.token) {
        console.log("Fetching user profile after registration")
        await dispatch(fetchUserProfile())
      }
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  // Update the logout function in AuthContext to clear user profile
  const logout = async () => {
    try {
      // First dispatch the logout action
      await dispatch(logoutAction())

      // Explicitly clear the user profile from Redux store
      dispatch(clearUserProfileAction())

      console.log("Logout successful, user state cleared")
    } catch (error) {
      console.error("Error during logout:", error)
    }
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
