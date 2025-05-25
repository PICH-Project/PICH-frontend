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

// Update CreateCardPayload to exactly match the server's CreateCardDto
export interface CreateCardPayload {
  type: "BAC" | "PAC" | "VAC" | "CAC"
  name: string
  nickname: string
  avatar?: string
  phone?: string
  email?: string
  social?: Record<string, string>
  isPrime?: boolean
  bio?: string
  location?: {
    country?: string
    city?: string
    address?: string
    postalCode?: string
  }
  category?: "FAMILY" | "FRIENDS" | "WORK" | "OTHER"
  blockchainId?: string
  isMainCard?: boolean
  isInWallet?: boolean
}

export interface UpdateCardPayload {
  type?: "BAC" | "PAC" | "VAC" | "CAC"
  name?: string
  nickname?: string
  avatar?: string
  phone?: string
  email?: string
  social?: Record<string, string>
  isPrime?: boolean
  bio?: string
  location?: {
    country?: string
    city?: string
    address?: string
    postalCode?: string
  }
  category?: "FAMILY" | "FRIENDS" | "WORK" | "OTHER"
  blockchainId?: string
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

      // Ensure required fields are present and not empty
      if (!payload.name || !payload.name.trim()) {
        throw new Error("Name is required and cannot be empty")
      }
      if (!payload.nickname || !payload.nickname.trim()) {
        throw new Error("Nickname is required and cannot be empty")
      }

      // Clean the payload to ensure no undefined values for required fields
      const cleanPayload: CreateCardPayload = {
        type: payload.type,
        name: payload.name.trim(),
        nickname: payload.nickname.trim(),
        ...(payload.avatar && { avatar: payload.avatar }),
        ...(payload.phone && { phone: payload.phone }),
        ...(payload.email && { email: payload.email }),
        ...(payload.social && Object.keys(payload.social).length > 0 && { social: payload.social }),
        ...(payload.isPrime !== undefined && { isPrime: payload.isPrime }),
        ...(payload.bio && { bio: payload.bio }),
        ...(payload.location && { location: payload.location }),
        ...(payload.category && { category: payload.category }),
        ...(payload.blockchainId && { blockchainId: payload.blockchainId }),
        ...(payload.isMainCard !== undefined && { isMainCard: payload.isMainCard }),
        ...(payload.isInWallet !== undefined && { isInWallet: payload.isInWallet }),
      }

      const response = await api.post<Card>("/cards", cleanPayload)
      // console.log("Card created successfully:", response.data)
      return response.data
    } catch (error: any) {
      console.error("Create card error:", error)
      console.error("Error response:", error.response?.data)
      throw error
    }
  },

  /**
   * Get all cards for the current user
   * @returns Promise with an array of cards
   */
  getAllCards: async (): Promise<Card[]> => {
    try {
      const response = await api.get<Card[]>("/cards")
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
      const response = await api.get<Card>(`/cards/${cardId}`)
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
      const response = await api.get<Card>(`/cards/public/${cardId}`)
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
      const response = await api.patch<Card>(`/cards/${cardId}`, payload)
      return response.data
    } catch (error) {
      console.error(`Update card ${cardId} error:`, error)
      throw error
    }
  },

  /**
   * Toggle the main card status
   * @param cardId The ID of the card to set as main
   * @returns Promise with the updated card
   */
  toggleMainCard: async (cardId: string): Promise<Card> => {
    try {
      const response = await api.patch<Card>(`/cards/${cardId}/toggle-main`)
      return response.data
    } catch (error: any) {
      console.error(`Toggle main card error:`, error)
      console.error("Error response:", error.response?.data)
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
      const response = await api.patch<Card>(`/cards/${cardId}/toggle-prime`)
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
      const response = await api.patch<Card>(`/cards/${cardId}/toggle-wallet`)
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
      await api.delete(`/cards/${cardId}`)
    } catch (error) {
      console.error(`Delete card ${cardId} error:`, error)
      throw error
    }
  },
}

export default cardService
