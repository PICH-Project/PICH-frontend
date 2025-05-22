"use client"

import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { login, register, logout, clearError } from "../store/slices/authSlice"
import type { RootState, AppDispatch } from "../store"

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated, token, loading, error, user } = useSelector((state: RootState) => state.auth)

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      if (error) {
        dispatch(clearError())
      }
    }
  }, [dispatch, error])

  const loginUser = (email: string, password: string) => {
    return dispatch(login({ email, password }))
  }

  const signupUser = (email: string, password: string) => {
    return dispatch(register({
      email, password,
      firstName: "",
      lastName: ""
    }))
  }

  const logoutUser = () => {
    return dispatch(logout())
  }

  const clearAuthError = () => {
    dispatch(clearError())
  }

  return {
    isAuthenticated,
    token,
    loading,
    error,
    login: loginUser,
    signup: signupUser,
    logout: logoutUser,
    clearError: clearAuthError,
    user
  }
}

export default useAuth
