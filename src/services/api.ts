import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { store } from "../store"
import { logout } from "../store/slices/authSlice"

// Update the base URL to point to the PICH backend API
// http://157.180.71.47:3003/api - prod
// http://10.0.2.2:3003/api - Android emulator -> host
// http://192.168.0.103:3003/api - local LAN (Seeker / phone on same Wi-Fi)
// https://tackle-crinkle-despise.ngrok-free.dev/api - ngrok tunnel
//   (працює і на фіз. девайсі, і на емуляторі — публічний URL)
const api = axios.create({
  baseURL: "https://tackle-crinkle-despise.ngrok-free.dev/api",
  headers: {
    "Content-Type": "application/json",
    // ngrok-free.dev показує warning-page перед першим запитом якщо
    // нема цього header'а. Без нього axios отримає HTML замість JSON.
    "ngrok-skip-browser-warning": "true",
  },
  // ngrok-free сильно лагає під час навантаження (concurrent polling + image loads).
  // 20с — компроміс щоб не падати по false-таймауту на повільних запитах.
  timeout: 20000,
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
    // console.log(`API Response from ${response.config.url} - Status: ${response.status}`)
    return response
  },
  async (error) => {
    const originalRequest = error.config
    // Деталізоване логування: для HTTP-помилок показуємо status + body,
    // для network errors (немає response) — axios code + message щоб видно
    // що це таймаут / DNS / ngrok issue.
    if (error.response?.status) {
      console.error(
        `API ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url} — ` +
          `HTTP ${error.response.status} ${error.response.statusText ?? ""}: ` +
          `${JSON.stringify(error.response.data)}`,
      )
    } else {
      console.error(
        `API ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url} — ` +
          `NETWORK ERROR [${error.code ?? "unknown"}]: ${error.message}`,
      )
    }

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
