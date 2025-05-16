import { mockUsers } from "../utils/mockData"
import AsyncStorage from "@react-native-async-storage/async-storage"
import type { UserProfile } from "./authService"

export interface UpdateUserPayload {
  email?: string
  firstName?: string
  lastName?: string
  nickname?: string
  phone?: string
  avatar?: string
  gender?: string
  birthDate?: string
  password?: string
}

// Mock delay function to simulate network requests
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Service for handling user-related API calls
 */
const userService = {
  /**
   * Get the current user's profile
   * @returns Promise with the user profile
   */
  getCurrentUserProfile: async (): Promise<UserProfile> => {
    try {
      // Simulate API delay
      await delay(800)

      // Get the stored user from AsyncStorage
      const userJson = await AsyncStorage.getItem("auth_user")

      if (!userJson) {
        throw new Error("User not found")
      }

      const userId = JSON.parse(userJson).id

      // Find user by ID
      const user = mockUsers.find((user) => user.id === userId)

      if (!user) {
        throw new Error("User not found")
      }

      return user
    } catch (error) {
      console.error("Get current user profile error:", error)
      throw error
    }
  },

  /**
   * Get a user by ID
   * @param userId The ID of the user to fetch
   * @returns Promise with the user profile
   */
  getUserById: async (userId: string): Promise<UserProfile> => {
    try {
      // Simulate API delay
      await delay(500)

      // Find user by ID
      const user = mockUsers.find((user) => user.id === userId)

      if (!user) {
        throw new Error("User not found")
      }

      return user
    } catch (error) {
      console.error(`Get user ${userId} error:`, error)
      throw error
    }
  },

  /**
   * Update a user's profile
   * @param userId The ID of the user to update
   * @param payload The user data to update
   * @returns Promise with the updated user profile
   */
  updateUser: async (userId: string, payload: UpdateUserPayload): Promise<UserProfile> => {
    try {
      // Simulate API delay
      await delay(1200)

      // Find user by ID
      const user = mockUsers.find((user) => user.id === userId)

      if (!user) {
        throw new Error("User not found")
      }

      // Update user
      const updatedUser = { ...user, ...payload, updatedAt: new Date().toISOString() }

      // In a real app, we would save this to a database
      // For demo purposes, we'll just return the updated user

      // Update the stored user in AsyncStorage if it's the current user
      const userJson = await AsyncStorage.getItem("auth_user")
      if (userJson) {
        const currentUser = JSON.parse(userJson)
        if (currentUser.id === userId) {
          await AsyncStorage.setItem("auth_user", JSON.stringify(updatedUser))
        }
      }

      return updatedUser
    } catch (error) {
      console.error(`Update user ${userId} error:`, error)
      throw error
    }
  },

  /**
   * Set a card as the user's main card
   * @param userId The ID of the user
   * @param cardId The ID of the card to set as main
   * @returns Promise with the updated user profile
   */
  setMainCard: async (userId: string, cardId: string): Promise<UserProfile> => {
    try {
      // Simulate API delay
      await delay(1000)

      // Find user by ID
      const user = mockUsers.find((user) => user.id === userId)

      if (!user) {
        throw new Error("User not found")
      }

      // Update user
      const updatedUser = { ...user, mainCardId: cardId, updatedAt: new Date().toISOString() }

      // In a real app, we would save this to a database
      // For demo purposes, we'll just return the updated user

      // Update the stored user in AsyncStorage if it's the current user
      const userJson = await AsyncStorage.getItem("auth_user")
      if (userJson) {
        const currentUser = JSON.parse(userJson)
        if (currentUser.id === userId) {
          await AsyncStorage.setItem("auth_user", JSON.stringify(updatedUser))
        }
      }

      return updatedUser
    } catch (error) {
      console.error(`Set main card error:`, error)
      throw error
    }
  },

  /**
   * Delete a user account
   * @param userId The ID of the user to delete
   * @returns Promise with an empty object
   */
  deleteUser: async (userId: string): Promise<void> => {
    try {
      // Simulate API delay
      await delay(1500)

      // In a real app, we would delete the user from the database
      // For demo purposes, we'll just return

      // Clear the stored user in AsyncStorage if it's the current user
      const userJson = await AsyncStorage.getItem("auth_user")
      if (userJson) {
        const currentUser = JSON.parse(userJson)
        if (currentUser.id === userId) {
          await AsyncStorage.removeItem("auth_user")
          await AsyncStorage.removeItem("auth_token")
        }
      }

      return
    } catch (error) {
      console.error(`Delete user ${userId} error:`, error)
      throw error
    }
  },
}

export default userService
