import { mockUsers, generateMockConnections } from "../utils/mockData"
import AsyncStorage from "@react-native-async-storage/async-storage"
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

// Mock delay function to simulate network requests
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Function to get user ID from AsyncStorage
const getUserId = async (): Promise<string> => {
  const userJson = await AsyncStorage.getItem("auth_user")
  if (!userJson) {
    throw new Error("User not authenticated")
  }
  return JSON.parse(userJson).id
}

// Generate mock connections
const mockConnections = generateMockConnections()

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
      // Simulate API delay
      await delay(1500)

      const userId = await getUserId()

      // Find the scanned user
      const scannedUser = mockUsers.find((user) => user.id === payload.scannedUserId)

      if (!scannedUser) {
        throw new Error("User not found")
      }

      // Find the current user
      const currentUser = mockUsers.find((user) => user.id === userId)

      if (!currentUser) {
        throw new Error("Current user not found")
      }

      // Create a new connection
      const newConnection: Connection = {
        id: `conn-${Date.now()}`,
        user1Id: userId,
        user2Id: payload.scannedUserId,
        user1FavoritedUser2: false,
        user2FavoritedUser1: false,
        connectionDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user1: currentUser,
        user2: scannedUser,
      }

      // In a real app, we would save this to a database
      // For demo purposes, we'll just return the new connection

      return newConnection
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
      // Simulate API delay
      await delay(1000)

      const userId = await getUserId()

      // Filter connections by user ID
      // For demo purposes, we'll return all mock connections
      // In a real app, we would filter by the current user's ID
      return mockConnections
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
      // Simulate API delay
      await delay(800)

      const userId = await getUserId()

      // Get all connections for the current user
      const userConnections = mockConnections.filter((conn) => conn.user1Id === userId || conn.user2Id === userId)

      // Extract friend profiles
      const friends = userConnections.map((conn) => {
        return conn.user1Id === userId ? conn.user2 : conn.user1
      })

      return friends
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
      // Simulate API delay
      await delay(500)

      // Find connection by ID
      const connection = mockConnections.find((conn) => conn.id === connectionId)

      if (!connection) {
        throw new Error("Connection not found")
      }

      return connection
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
      // Simulate API delay
      await delay(800)

      const userId = await getUserId()

      // Find connection by ID
      const connection = mockConnections.find((conn) => conn.id === connectionId)

      if (!connection) {
        throw new Error("Connection not found")
      }

      // Toggle favorite status based on which user is toggling
      let updatedConnection: Connection

      if (connection.user1Id === userId) {
        updatedConnection = {
          ...connection,
          user1FavoritedUser2: !connection.user1FavoritedUser2,
          updatedAt: new Date().toISOString(),
        }
      } else {
        updatedConnection = {
          ...connection,
          user2FavoritedUser1: !connection.user2FavoritedUser1,
          updatedAt: new Date().toISOString(),
        }
      }

      // In a real app, we would save this to a database
      // For demo purposes, we'll just return the updated connection

      return updatedConnection
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
      // Simulate API delay
      await delay(1000)

      const userId = await getUserId()

      // Find connection by ID
      const connection = mockConnections.find((conn) => conn.id === connectionId)

      if (!connection) {
        throw new Error("Connection not found")
      }

      // Update notes based on which user is updating
      let updatedConnection: Connection

      if (connection.user1Id === userId) {
        updatedConnection = {
          ...connection,
          user1Notes: payload.notes,
          updatedAt: new Date().toISOString(),
        }
      } else {
        updatedConnection = {
          ...connection,
          user2Notes: payload.notes,
          updatedAt: new Date().toISOString(),
        }
      }

      // In a real app, we would save this to a database
      // For demo purposes, we'll just return the updated connection

      return updatedConnection
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
      // Simulate API delay
      await delay(1000)

      // In a real app, we would delete the connection from the database
      // For demo purposes, we'll just return

      return
    } catch (error) {
      console.error(`Delete connection ${connectionId} error:`, error)
      throw error
    }
  },
}

export default connectionService
