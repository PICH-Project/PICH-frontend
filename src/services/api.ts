import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { store } from "../store"
import { logout } from "../store/slices/authSlice"

// Update the base URL to point to the PICH backend API
const api = axios.create({
  baseURL: "http://localhost:3000/api", // Updated to match the API documentation base URL
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
})

// Add request and response logging to the API interceptors

// Add a request interceptor to include the auth token in all requests
api.interceptors.request.use(
  async (config) => {
    // Get the token from AsyncStorage
    const token = await AsyncStorage.getItem("auth_token")

    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log(`API Request to ${config.url} with auth token`)
    } else {
      console.log(`API Request to ${config.url} without auth token`)
    }

    return config
  },
  (error: any) => {
    console.error("API Request Error:", error)
    return Promise.reject(error)
  },
)

// Add a response interceptor to handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => {
    console.log(`API Response from ${response.config.url} - Status: ${response.status}`)
    return response
  },
  async (error) => {
    const originalRequest = error.config
    console.error(`API Error Response from ${originalRequest?.url} - Status: ${error.response?.status}`)

    // If the error is 401 (Unauthorized) and it's not a retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("Unauthorized request detected, logging out user")
      originalRequest._retry = true

      // Dispatch logout action to clear auth state
      store.dispatch(logout())
    }

    return Promise.reject(error)
  },
)

export default api
