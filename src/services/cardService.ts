import { mockCards } from "../utils/mockData"
import AsyncStorage from "@react-native-async-storage/async-storage"

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
      // Simulate API delay
      await delay(1000)

      const userId = await getUserId()

      // Create a new card
      const newCard: Card = {
        id: `card-${Date.now()}`,
        type: payload.type,
        name: payload.name,
        nickname: payload.nickname,
        email: payload.email,
        phone: payload.phone,
        bio: payload.bio,
        social: payload.social,
        location: payload.location,
        category: payload.category,
        isPrime: false,
        isMainCard: payload.isMainCard || false,
        isInWallet: payload.isInWallet || true,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // In a real app, we would save this to a database
      // For demo purposes, we'll just return the new card

      return newCard
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
      // Simulate API delay
      await delay(800)

      const userId = await getUserId()

      // Filter cards by user ID
      // For demo purposes, we'll return all mock cards
      // In a real app, we would filter by the current user's ID
      return mockCards
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
      // Simulate API delay
      await delay(500)

      // Find card by ID
      const card = mockCards.find((card) => card.id === cardId)

      if (!card) {
        throw new Error("Card not found")
      }

      return card
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
      // Simulate API delay
      await delay(500)

      // Find card by ID
      const card = mockCards.find((card) => card.id === cardId)

      if (!card) {
        throw new Error("Card not found")
      }

      return card
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
      // Simulate API delay
      await delay(1000)

      // Find card by ID
      const card = mockCards.find((card) => card.id === cardId)

      if (!card) {
        throw new Error("Card not found")
      }

      // Update card
      const updatedCard = { ...card, ...payload, updatedAt: new Date().toISOString() }

      // In a real app, we would save this to a database
      // For demo purposes, we'll just return the updated card

      return updatedCard
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
      // Simulate API delay
      await delay(800)

      // Find card by ID
      const card = mockCards.find((card) => card.id === cardId)

      if (!card) {
        throw new Error("Card not found")
      }

      // Toggle prime status
      const updatedCard = { ...card, isPrime: !card.isPrime, updatedAt: new Date().toISOString() }

      // In a real app, we would save this to a database
      // For demo purposes, we'll just return the updated card

      return updatedCard
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
      // Simulate API delay
      await delay(800)

      // Find card by ID
      const card = mockCards.find((card) => card.id === cardId)

      if (!card) {
        throw new Error("Card not found")
      }

      // Toggle wallet status
      const updatedCard = { ...card, isInWallet: !card.isInWallet, updatedAt: new Date().toISOString() }

      // In a real app, we would save this to a database
      // For demo purposes, we'll just return the updated card

      return updatedCard
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
      // Simulate API delay
      await delay(1000)

      // In a real app, we would delete the card from the database
      // For demo purposes, we'll just return

      return
    } catch (error) {
      console.error(`Delete card ${cardId} error:`, error)
      throw error
    }
  },
}

export default cardService
