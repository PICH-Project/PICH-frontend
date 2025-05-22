import api from "./api"

import AsyncStorage from "@react-native-async-storage/async-storage"

export interface RegisterPayload {
  email: string
  firstName: string
  lastName: string
  nickname?: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthResponse {
  user: UserProfile
  accessToken: string
}

// Update the UserProfile interface to match the backend entity structure
export interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  nickname?: string
  phone?: string
  avatar?: string
  gender?: string
  birthDate?: string
  subscriptionPlan: string
  subscriptionExpiresAt?: string
  isActive: boolean
  walletAddress?: string
  tokenBalance: number
  mainCardId?: string
  createdAt: string
  updatedAt: string
}

/**
 * Service for handling authentication-related API calls
 */
const authService = {
  /**
   * Register a new user
   * @param payload User registration data
   * @returns Promise with the authentication response
   */
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    try {
      console.log("Registering user with data:", { ...payload, password: "***" })
      const response = await api.post<AuthResponse>("/auth/register", payload)
      console.log("Registration response:", response.data)

      // Store the token in AsyncStorage for future requests
      if (response.data.accessToken) {
        await AsyncStorage.setItem("auth_token", response.data.accessToken)
        await AsyncStorage.setItem("auth_user", JSON.stringify(response.data.user))
      }

      return response.data
    } catch (error: any) {
      console.error("Registration error:", error.response?.data || error.message || error)
      throw error
    }
  },

  /**
   * Login an existing user
   * @param payload User login credentials
   * @returns Promise with the authentication response
   */
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>("/auth/login", payload)

      // Store the token in AsyncStorage for future requests
      if (response.data.accessToken) {
        await AsyncStorage.setItem("auth_token", response.data.accessToken)
        await AsyncStorage.setItem("auth_user", JSON.stringify(response.data.user))
      }

      return response.data
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  },

  /**
   * Get the current user's profile
   * @returns Promise with the user profile
   */
  getUserProfile: async (): Promise<UserProfile> => {
    try {
      // Updated to use the correct endpoint from the API documentation
      const response = await api.get<UserProfile>("/users/profile")
      return response.data
    } catch (error) {
      console.error("Get user profile error:", error)
      throw error
    }
  },
}

export default authService
