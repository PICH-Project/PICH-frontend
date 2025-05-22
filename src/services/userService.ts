import api from "./api"
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
      const response = await api.get<UserProfile>("/users/profile")
      return response.data
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
      const response = await api.get<UserProfile>(`/users/${userId}`)
      return response.data
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
      const response = await api.patch<UserProfile>(`/users/${userId}`, payload)
      return response.data
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
      const response = await api.patch<UserProfile>(`/users/${userId}/main-card/${cardId}`)
      return response.data
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
      await api.delete(`/users/${userId}`)
    } catch (error) {
      console.error(`Delete user ${userId} error:`, error)
      throw error
    }
  },
}

export default userService
