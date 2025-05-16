import api from "./api"

export interface Card {
  id: string
  type: "BAC" | "PAC" | "VAC" | "CAC"
  name: string
  nickname: string
  avatar?: string
  phone?: string
  email?: string
  social?: Record<string, string>
  isPrime: boolean
  bio?: string
  location?: {
    country?: string
    city?: string
    address?: string
    postalCode?: string
  }
  category?: "FAMILY" | "FRIENDS" | "WORK" | "OTHER"
  blockchainId?: string
  isMainCard: boolean
  isInWallet: boolean
  userId: string
  createdAt: string
  updatedAt: string
}

export interface CreateCardPayload {
  type: "BAC" | "PAC" | "VAC" | "CAC"
  name: string
  nickname: string
  email?: string
  phone?: string
  bio?: string
  social?: Record<string, string>
  location?: {
    country?: string
    city?: string
    address?: string
    postalCode?: string
  }
  category?: "FAMILY" | "FRIENDS" | "WORK" | "OTHER"
  isMainCard?: boolean
  isInWallet?: boolean
}

export interface UpdateCardPayload {
  type?: "BAC" | "PAC" | "VAC" | "CAC"
  name?: string
  nickname?: string
  email?: string
  phone?: string
  bio?: string
  social?: Record<string, string>
  location?: {
    country?: string
    city?: string
    address?: string
    postalCode?: string
  }
  category?: "FAMILY" | "FRIENDS" | "WORK" | "OTHER"
  isMainCard?: boolean
  isInWallet?: boolean
}

/**
 * Service for handling card-related API calls
 */
const cardService = {
  /**
   * Create a new card
   * @param payload The card data to create
   * @returns Promise with the created card
   */
  createCard: async (payload: CreateCardPayload): Promise<Card> => {
    try {
      const response = await api.post<Card>("/api/cards", payload)
      return response.data
    } catch (error) {
      console.error("Create card error:", error)
      throw error
    }
  },

  /**
   * Get all cards for the current user
   * @returns Promise with an array of cards
   */
  getAllCards: async (): Promise<Card[]> => {
    try {
      const response = await api.get<Card[]>("/api/cards")
      return response.data
    } catch (error) {
      console.error("Get all cards error:", error)
      throw error
    }
  },

  /**
   * Get a card by ID
   * @param cardId The ID of the card to fetch
   * @returns Promise with the card
   */
  getCardById: async (cardId: string): Promise<Card> => {
    try {
      const response = await api.get<Card>(`/api/cards/${cardId}`)
      return response.data
    } catch (error) {
      console.error(`Get card ${cardId} error:`, error)
      throw error
    }
  },

  /**
   * Get a public card by ID (no authentication required)
   * @param cardId The ID of the public card to fetch
   * @returns Promise with the public card
   */
  getPublicCard: async (cardId: string): Promise<Card> => {
    try {
      const response = await api.get<Card>(`/api/cards/public/${cardId}`)
      return response.data
    } catch (error) {
      console.error(`Get public card ${cardId} error:`, error)
      throw error
    }
  },

  /**
   * Update a card
   * @param cardId The ID of the card to update
   * @param payload The card data to update
   * @returns Promise with the updated card
   */
  updateCard: async (cardId: string, payload: UpdateCardPayload): Promise<Card> => {
    try {
      const response = await api.patch<Card>(`/api/cards/${cardId}`, payload)
      return response.data
    } catch (error) {
      console.error(`Update card ${cardId} error:`, error)
      throw error
    }
  },

  /**
   * Toggle the prime status of a card
   * @param cardId The ID of the card to toggle
   * @returns Promise with the updated card
   */
  togglePrimeStatus: async (cardId: string): Promise<Card> => {
    try {
      const response = await api.patch<Card>(`/api/cards/${cardId}/toggle-prime`)
      return response.data
    } catch (error) {
      console.error(`Toggle prime status error:`, error)
      throw error
    }
  },

  /**
   * Toggle the wallet status of a card
   * @param cardId The ID of the card to toggle
   * @returns Promise with the updated card
   */
  toggleWalletStatus: async (cardId: string): Promise<Card> => {
    try {
      const response = await api.patch<Card>(`/api/cards/${cardId}/toggle-wallet`)
      return response.data
    } catch (error) {
      console.error(`Toggle wallet status error:`, error)
      throw error
    }
  },

  /**
   * Delete a card
   * @param cardId The ID of the card to delete
   * @returns Promise with an empty object
   */
  deleteCard: async (cardId: string): Promise<void> => {
    try {
      await api.delete(`/api/cards/${cardId}`)
    } catch (error) {
      console.error(`Delete card ${cardId} error:`, error)
      throw error
    }
  },
}

export default cardService
