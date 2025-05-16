import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { store } from "../store"
import { logout } from "../store/slices/authSlice"

// Create an axios instance with default config
const api = axios.create({
  baseURL: "https://mock-api.pich.app", // This is a fake URL since we're using mocks
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
})

// Add a request interceptor to include the auth token in all requests
api.interceptors.request.use(
  async (config) => {
    // Get the token from AsyncStorage
    const token = await AsyncStorage.getItem("auth_token")

    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error: any) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor to handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If the error is 401 (Unauthorized) and it's not a retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // Dispatch logout action to clear auth state
      store.dispatch(logout())

      // You could also navigate to the login screen here if needed
      // This would require a navigation reference, which we'll handle in the auth context
    }

    return Promise.reject(error)
  },
)

export default api
