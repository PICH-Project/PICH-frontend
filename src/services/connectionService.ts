import api from "./api"
import type { UserProfile } from "./authService"

export interface Connection {
  id: string
  user1Id: string
  user2Id: string
  user1Notes?: string
  user2Notes?: string
  user1FavoritedUser2: boolean
  user2FavoritedUser1: boolean
  connectionDate: string
  lastInteractionDate?: string
  createdAt: string
  updatedAt: string
  user1: UserProfile
  user2: UserProfile
}

export interface CreateConnectionPayload {
  scannedUserId: string
}

export interface UpdateNotesPayload {
  notes: string
}

/**
 * Service for handling connection-related API calls
 */
const connectionService = {
  /**
   * Create a new connection
   * @param payload The connection data to create
   * @returns Promise with the created connection
   */
  createConnection: async (payload: CreateConnectionPayload): Promise<Connection> => {
    try {
      const response = await api.post<Connection>("/api/connections", payload)
      return response.data
    } catch (error) {
      console.error("Create connection error:", error)
      throw error
    }
  },

  /**
   * Get all connections for the current user
   * @returns Promise with an array of connections
   */
  getAllConnections: async (): Promise<Connection[]> => {
    try {
      const response = await api.get<Connection[]>("/api/connections")
      return response.data
    } catch (error) {
      console.error("Get all connections error:", error)
      throw error
    }
  },

  /**
   * Get all friends for the current user
   * @returns Promise with an array of user profiles
   */
  getFriends: async (): Promise<UserProfile[]> => {
    try {
      const response = await api.get<UserProfile[]>("/api/connections/friends")
      return response.data
    } catch (error) {
      console.error("Get friends error:", error)
      throw error
    }
  },

  /**
   * Get a connection by ID
   * @param connectionId The ID of the connection to fetch
   * @returns Promise with the connection
   */
  getConnectionById: async (connectionId: string): Promise<Connection> => {
    try {
      const response = await api.get<Connection>(`/api/connections/${connectionId}`)
      return response.data
    } catch (error) {
      console.error(`Get connection ${connectionId} error:`, error)
      throw error
    }
  },

  /**
   * Toggle favorite status for a connection
   * @param connectionId The ID of the connection to toggle
   * @returns Promise with the updated connection
   */
  toggleFavorite: async (connectionId: string): Promise<Connection> => {
    try {
      const response = await api.patch<Connection>(`/api/connections/${connectionId}/favorite`)
      return response.data
    } catch (error) {
      console.error(`Toggle favorite error:`, error)
      throw error
    }
  },

  /**
   * Update notes for a connection
   * @param connectionId The ID of the connection to update
   * @param payload The notes data to update
   * @returns Promise with the updated connection
   */
  updateNotes: async (connectionId: string, payload: UpdateNotesPayload): Promise<Connection> => {
    try {
      const response = await api.patch<Connection>(`/api/connections/${connectionId}/notes`, payload)
      return response.data
    } catch (error) {
      console.error(`Update notes error:`, error)
      throw error
    }
  },

  /**
   * Delete a connection
   * @param connectionId The ID of the connection to delete
   * @returns Promise with an empty object
   */
  deleteConnection: async (connectionId: string): Promise<void> => {
    try {
      await api.delete(`/api/connections/${connectionId}`)
    } catch (error) {
      console.error(`Delete connection ${connectionId} error:`, error)
      throw error
    }
  },
}

export default connectionService
