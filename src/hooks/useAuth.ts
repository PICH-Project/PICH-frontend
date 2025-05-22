"use client"

import { useEffect, useCallback } from "react"
import { useSelector, useDispatch } from "react-redux"
import { login, register, logout, clearError } from "../store/slices/authSlice"
import { fetchUserProfile, clearUserProfile } from "../store/slices/userSlice"
import type { RootState, AppDispatch } from "../store"
import type { LoginPayload, RegisterPayload } from "../services/authService"

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>()
  const {
    isAuthenticated,
    token,
    loading: authLoading,
    error: authError,
  } = useSelector((state: RootState) => state.auth)
  const { profile: user, loading: userLoading, error: userError } = useSelector((state: RootState) => state.user)

  // Combined loading and error states
  const loading = authLoading || userLoading
  const error = authError || userError

  // Fetch user profile when authenticated
  useEffect(() => {
    if (isAuthenticated && !user && !userLoading) {
      dispatch(fetchUserProfile())
    }
  }, [isAuthenticated, user, userLoading, dispatch])

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      if (error) {
        dispatch(clearError())
      }
    }
  }, [dispatch, error])

  const loginUser = useCallback(
    async (credentials: LoginPayload) => {
      try {
        const result = await dispatch(login(credentials)).unwrap()
        console.log("Login successful:", result)

        // Explicitly fetch the user profile after login
        if (result && result.token) {
          console.log("Fetching user profile after login")
          await dispatch(fetchUserProfile()).unwrap()
        }
      } catch (error) {
        console.error("Login error:", error)
        throw error
      }
    },
    [dispatch],
  )

  const signupUser = useCallback(
    async (userData: RegisterPayload) => {
      try {
        // Register the user
        const result = await dispatch(register(userData)).unwrap()
        console.log("Registration successful:", result)

        // Explicitly fetch the user profile after registration
        if (result && result.token) {
          console.log("Fetching user profile after registration")
          await dispatch(fetchUserProfile()).unwrap()
        }
      } catch (error) {
        console.error("Registration error:", error)
        throw error
      }
    },
    [dispatch],
  )

  const logoutUser = useCallback(async () => {
    try {
      // First dispatch the logout action
      await dispatch(logout()).unwrap()

      // Explicitly clear the user profile from Redux store
      dispatch(clearUserProfile())

      console.log("Logout successful, user state cleared")
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }, [dispatch])

  const clearAuthError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  // Function to manually refresh the user profile
  const refreshUserProfile = useCallback(async () => {
    if (isAuthenticated) {
      return dispatch(fetchUserProfile()).unwrap()
    }
    return Promise.reject(new Error("Not authenticated"))
  }, [isAuthenticated, dispatch])

  return {
    isAuthenticated,
    token,
    user,
    loading,
    error,
    login: loginUser,
    signup: signupUser,
    logout: logoutUser,
    clearError: clearAuthError,
    refreshUserProfile,
  }
}

export default useAuth
