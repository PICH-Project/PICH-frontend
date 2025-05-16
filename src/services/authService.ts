import { mockUsers } from "../utils/mockData"
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

// Mock delay function to simulate network requests
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

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
      // Simulate API delay
      await delay(1000)

      // Check if email already exists
      if (mockUsers.some((user) => user.email === payload.email)) {
        throw new Error("Email already in use")
      }

      // Create a new user
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        nickname: payload.nickname,
        subscriptionPlan: "basic",
        isActive: true,
        tokenBalance: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Generate a mock token
      const token = `mock-token-${Date.now()}`

      return {
        user: newUser,
        accessToken: token,
      }
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
      // Simulate API delay
      await delay(1000)

      // Find user by email
      const user = mockUsers.find((user) => user.email === payload.email)

      if (!user) {
        throw new Error("User not found")
      }

      // In a real app, we would check the password here
      // For demo purposes, we'll accept any password

      // Generate a mock token
      const token = `mock-token-${Date.now()}`

      return {
        user,
        accessToken: token,
      }
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
      // Simulate API delay
      await delay(500)

      // Get the stored user from AsyncStorage
      const userJson = await AsyncStorage.getItem("auth_user")

      if (!userJson) {
        throw new Error("User not found")
      }

      return JSON.parse(userJson)
    } catch (error) {
      console.error("Get user profile error:", error)
      throw error
    }
  },
}

export default authService
