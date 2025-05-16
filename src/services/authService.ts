import api from "./api"

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
      const response = await api.post<AuthResponse>("/api/auth/register", payload)
      return response.data
    } catch (error) {
      console.error("Registration error:", error)
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
      const response = await api.post<AuthResponse>("/api/auth/login", payload)
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
      const response = await api.get<UserProfile>("/api/users/profile")
      return response.data
    } catch (error) {
      console.error("Get user profile error:", error)
      throw error
    }
  },
}

export default authService
