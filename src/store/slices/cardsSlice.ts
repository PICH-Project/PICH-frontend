import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { blockchainService } from "../../services/blockchain"

export interface Card {
  id: string
  type: "BAC" | "PAC" | "VAC" | "CAC"
  name: string
  nickname: string
  avatar?: string
  phone?: string
  email?: string
  social?: {
    [key: string]: string
  }
  isPrime?: boolean
  bio?: string
  location?: {
    country?: string
    city?: string
    address?: string
    postalCode?: string
  }
  category?: "FAMILY" | "FRIENDS" | "WORK" | "OTHER"
  createdAt: number
  updatedAt: number
  blockchainId?: string
}

interface CardsState {
  cards: Card[]
  loading: boolean
  error: string | null
  selectedCardId: string | null
}

const initialState: CardsState = {
  cards: [],
  loading: false,
  error: null,
  selectedCardId: null,
}

export const fetchCards = createAsyncThunk("cards/fetchCards", async (_, { rejectWithValue }) => {
  try {
    // In a real app, this would fetch from an API
    // For now, we'll return mock data
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return [
      {
        id: "1",
        type: "BAC",
        name: "John Doe",
        nickname: "Johny",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        phone: "+1 234 567 890",
        email: "john.doe@example.com",
        isPrime: true,
        bio: "John is a dedicated software engineer with a passion for creating user-friendly applications.",
        location: {
          country: "Ukraine",
          city: "Kiev",
          address: "Lobanovskogo str. Building 5",
          postalCode: "03156",
        },
        category: "FAMILY",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        blockchainId: "sol:abc123",
      },
      {
        id: "2",
        type: "PAC",
        name: "Jane Smith",
        nickname: "Jane",
        avatar: "https://randomuser.me/api/portraits/women/32.jpg",
        phone: "+1 234 567 891",
        email: "jane.smith@example.com",
        category: "FRIENDS",
        createdAt: Date.now() - 86400000, // 1 day ago
        updatedAt: Date.now() - 86400000,
        blockchainId: "sol:def456",
      },
      {
        id: "3",
        type: "VAC",
        name: "John Doe",
        nickname: "Johny",
        avatar: "https://randomuser.me/api/portraits/men/33.jpg",
        phone: "+1 234 567 892",
        email: "john.doe2@example.com",
        category: "FAMILY",
        createdAt: Date.now() - 172800000, // 2 days ago
        updatedAt: Date.now() - 172800000,
        blockchainId: "sol:ghi789",
      },
      {
        id: "4",
        type: "CAC",
        name: "John Doe",
        nickname: "Johny",
        avatar: "https://randomuser.me/api/portraits/men/34.jpg",
        phone: "+1 234 567 893",
        email: "john.doe3@example.com",
        isPrime: true,
        category: "FRIENDS",
        createdAt: Date.now() - 259200000, // 3 days ago
        updatedAt: Date.now() - 259200000,
        blockchainId: "sol:jkl012",
      },
      {
        id: "5",
        type: "PAC",
        name: "John Doe",
        nickname: "Johny",
        avatar: "https://randomuser.me/api/portraits/men/35.jpg",
        phone: "+1 234 567 894",
        email: "john.doe4@example.com",
        category: "FAMILY",
        createdAt: Date.now() - 345600000, // 4 days ago
        updatedAt: Date.now() - 345600000,
        blockchainId: "sol:mno345",
      },
      {
        id: "6",
        type: "VAC",
        name: "John Doe",
        nickname: "Johny",
        avatar: "https://randomuser.me/api/portraits/men/36.jpg",
        phone: "+1 234 567 895",
        email: "john.doe5@example.com",
        isPrime: true,
        category: "FRIENDS",
        createdAt: Date.now() - 432000000, // 5 days ago
        updatedAt: Date.now() - 432000000,
        blockchainId: "sol:pqr678",
      },
    ] as Card[]
  } catch (error) {
    return rejectWithValue("Failed to fetch cards. Please try again.")
  }
})

export const createCard = createAsyncThunk("cards/createCard", async (cardData: Partial<Card>, { rejectWithValue }) => {
  try {
    // In a real app, this would create a card via API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Create card on blockchain
    const blockchainId = await blockchainService.createCard(
      cardData,
      "mock-private-key", // In a real app, this would be securely stored
    )

    const newCard: Card = {
      id: Math.random().toString(36).substring(2, 10),
      type: cardData.type || "PAC",
      name: cardData.name || "New Card",
      nickname: cardData.nickname || "",
      avatar: cardData.avatar,
      phone: cardData.phone,
      email: cardData.email,
      social: cardData.social,
      bio: cardData.bio,
      location: cardData.location,
      category: cardData.category || "OTHER",
      isPrime: cardData.isPrime || false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      blockchainId,
    }

    return newCard
  } catch (error) {
    return rejectWithValue("Failed to create card. Please try again.")
  }
})

export const updateCard = createAsyncThunk(
  "cards/updateCard",
  async ({ id, updates }: { id: string; updates: Partial<Card> }, { rejectWithValue }) => {
    try {
      // In a real app, this would update a card via API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      return { id, updates: { ...updates, updatedAt: Date.now() } }
    } catch (error) {
      return rejectWithValue("Failed to update card. Please try again.")
    }
  },
)

export const deleteCard = createAsyncThunk("cards/deleteCard", async (id: string, { rejectWithValue }) => {
  try {
    // In a real app, this would delete a card via API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return id
  } catch (error) {
    return rejectWithValue("Failed to delete card. Please try again.")
  }
})

const cardsSlice = createSlice({
  name: "cards",
  initialState,
  reducers: {
    selectCard: (state, action) => {
      state.selectedCardId = action.payload
    },
    clearSelectedCard: (state) => {
      state.selectedCardId = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cards
      .addCase(fetchCards.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCards.fulfilled, (state, action) => {
        state.cards = action.payload
        state.loading = false
      })
      .addCase(fetchCards.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Create card
      .addCase(createCard.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createCard.fulfilled, (state, action) => {
        state.cards.push(action.payload)
        state.loading = false
      })
      .addCase(createCard.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Update card
      .addCase(updateCard.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCard.fulfilled, (state, action) => {
        const { id, updates } = action.payload
        const cardIndex = state.cards.findIndex((card) => card.id === id)
        if (cardIndex !== -1) {
          state.cards[cardIndex] = { ...state.cards[cardIndex], ...updates }
        }
        state.loading = false
      })
      .addCase(updateCard.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Delete card
      .addCase(deleteCard.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteCard.fulfilled, (state, action) => {
        state.cards = state.cards.filter((card) => card.id !== action.payload)
        if (state.selectedCardId === action.payload) {
          state.selectedCardId = null
        }
        state.loading = false
      })
      .addCase(deleteCard.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { selectCard, clearSelectedCard, clearError } = cardsSlice.actions
export default cardsSlice.reducer
