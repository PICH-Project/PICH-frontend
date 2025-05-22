import api from "./api"
import type { Card } from "./cardService"

export interface Connection {
  id: string
  card1Id: string
  card2Id: string
  card1Notes?: string
  card2Notes?: string
  card1FavoritedCard2: boolean
  card2FavoritedCard1: boolean
  connectionDate: string
  lastInteractionDate?: string
  createdAt: string
  updatedAt: string
  card1: Card
  card2: Card
}

export interface CreateConnectionPayload {
  scannedCardId: string
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
      const response = await api.post<Connection>("/connections", payload)
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
      const response = await api.get<Connection[]>("/connections")
      return response.data
    } catch (error) {
      console.error("Get all connections error:", error)
      throw error
    }
  },

  /**
   * Get all connected cards
   * @returns Promise with an array of cards
   */
  getConnectedCards: async (): Promise<Card[]> => {
    try {
      const response = await api.get<Card[]>("/connections/cards")
      return response.data
    } catch (error) {
      console.error("Get connected cards error:", error)
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
      const response = await api.get<Connection>(`/connections/${connectionId}`)
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
      const response = await api.patch<Connection>(`/connections/${connectionId}/favorite`)
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
      const response = await api.patch<Connection>(`/connections/${connectionId}/notes`, payload)
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
      await api.delete(`/connections/${connectionId}`)
    } catch (error) {
      console.error(`Delete connection ${connectionId} error:`, error)
      throw error
    }
  },
}

export default connectionService
