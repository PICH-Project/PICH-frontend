"use client"

import { useCallback } from "react"
import { useAuth } from "../contexts/AuthContext"
import api from "../services/api"
import type { AxiosRequestConfig } from "axios"

/**
 * Custom hook for making protected API calls
 * Automatically handles authentication and error handling
 */
export const useProtectedApi = () => {
  const { isAuthenticated, logout } = useAuth()

  /**
   * Make a GET request to a protected endpoint
   * @param url The endpoint URL
   * @param config Optional Axios request config
   * @returns Promise with the response data
   */
  const get = useCallback(
    async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
      if (!isAuthenticated) {
        throw new Error("User is not authenticated")
      }

      try {
        const response = await api.get<T>(url, config)
        return response.data
      } catch (error: any) {
        if (error.response?.status === 401) {
          // Token expired or invalid, logout user
          logout()
          throw new Error("Your session has expired. Please log in again.")
        }
        throw error
      }
    },
    [isAuthenticated, logout],
  )

  /**
   * Make a POST request to a protected endpoint
   * @param url The endpoint URL
   * @param data The data to send
   * @param config Optional Axios request config
   * @returns Promise with the response data
   */
  const post = useCallback(
    async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
      if (!isAuthenticated) {
        throw new Error("User is not authenticated")
      }

      try {
        const response = await api.post<T>(url, data, config)
        return response.data
      } catch (error: any) {
        if (error.response?.status === 401) {
          // Token expired or invalid, logout user
          logout()
          throw new Error("Your session has expired. Please log in again.")
        }
        throw error
      }
    },
    [isAuthenticated, logout],
  )

  /**
   * Make a PATCH request to a protected endpoint
   * @param url The endpoint URL
   * @param data The data to send
   * @param config Optional Axios request config
   * @returns Promise with the response data
   */
  const patch = useCallback(
    async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
      if (!isAuthenticated) {
        throw new Error("User is not authenticated")
      }

      try {
        const response = await api.patch<T>(url, data, config)
        return response.data
      } catch (error: any) {
        if (error.response?.status === 401) {
          // Token expired or invalid, logout user
          logout()
          throw new Error("Your session has expired. Please log in again.")
        }
        throw error
      }
    },
    [isAuthenticated, logout],
  )

  /**
   * Make a DELETE request to a protected endpoint
   * @param url The endpoint URL
   * @param config Optional Axios request config
   * @returns Promise with the response data
   */
  const del = useCallback(
    async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
      if (!isAuthenticated) {
        throw new Error("User is not authenticated")
      }

      try {
        const response = await api.delete<T>(url, config)
        return response.data
      } catch (error: any) {
        if (error.response?.status === 401) {
          // Token expired or invalid, logout user
          logout()
          throw new Error("Your session has expired. Please log in again.")
        }
        throw error
      }
    },
    [isAuthenticated, logout],
  )

  return {
    get,
    post,
    patch,
    delete: del,
  }
}
