import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import cardService, { type Card, type CreateCardPayload, type UpdateCardPayload } from "../../services/cardService"

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
    const cards = await cardService.getAllCards()
    // console.log(`Redux: Successfully fetched ${cards.length} cards`)
    return cards
  } catch (error: any) {
    console.error("Error fetching cards:", error)
    const errorMessage = error.response?.data?.message || "Failed to fetch cards. Please try again."
    return rejectWithValue(errorMessage)
  }
})

export const createCard = createAsyncThunk(
  "cards/createCard",
  async (cardData: CreateCardPayload, { rejectWithValue }) => {
    try {

      const newCard = await cardService.createCard(cardData)
      // console.log("Card created successfully:", JSON.stringify(newCard, null, 2))
      return newCard
    } catch (error: any) {

      const errorMessage = error.response?.data?.message || "Failed to create card. Please try again."
      return rejectWithValue(errorMessage)
    }
  },
)

export const updateCard = createAsyncThunk(
  "cards/updateCard",
  async ({ id, updates }: { id: string; updates: UpdateCardPayload }, { rejectWithValue }) => {
    try {
      const updatedCard = await cardService.updateCard(id, updates)
      return updatedCard
    } catch (error: any) {
      console.error("Redux: Error updating card:", error)
      const errorMessage = error.response?.data?.message || "Failed to update card. Please try again."
      return rejectWithValue(errorMessage)
    }
  },
)

export const toggleMainCard = createAsyncThunk("cards/toggleMainCard", async (cardId: string, { rejectWithValue }) => {
  try {
    const updatedCard = await cardService.toggleMainCard(cardId)
    return updatedCard
  } catch (error: any) {
    console.error("Toggle main card error in thunk:", error)
    const errorMessage = error.response?.data?.message || "Failed to set main card. Please try again."
    return rejectWithValue(errorMessage)
  }
})

export const togglePrimeStatus = createAsyncThunk(
  "cards/togglePrimeStatus",
  async (id: string, { rejectWithValue }) => {
    try {
      const updatedCard = await cardService.togglePrimeStatus(id)
      return updatedCard
    } catch (error: any) {
      console.error("Redux: Error toggling prime status:", error)
      const errorMessage = error.response?.data?.message || "Failed to toggle prime status. Please try again."
      return rejectWithValue(errorMessage)
    }
  },
)

export const toggleWalletStatus = createAsyncThunk(
  "cards/toggleWalletStatus",
  async (id: string, { rejectWithValue }) => {
    try {
      const updatedCard = await cardService.toggleWalletStatus(id)
      return updatedCard
    } catch (error: any) {
      console.error("Redux: Error toggling wallet status:", error)
      const errorMessage = error.response?.data?.message || "Failed to toggle wallet status. Please try again."
      return rejectWithValue(errorMessage)
    }
  },
)

export const deleteCard = createAsyncThunk("cards/deleteCard", async (id: string, { rejectWithValue }) => {
  try {
    await cardService.deleteCard(id)
    return id
  } catch (error: any) {
    console.error("Error deleting card:", error)
    const errorMessage = error.response?.data?.message || "Failed to delete card. Please try again."
    return rejectWithValue(errorMessage)
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
        // console.log(`Fetch cards fulfilled with ${action.payload.length} cards`)
        state.cards = action.payload
        state.loading = false
      })
      .addCase(fetchCards.rejected, (state, action) => {
        console.log("Fetch cards rejected:", action.payload)
        state.loading = false
        state.error = action.payload as string
      })

      // Create card
      .addCase(createCard.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createCard.fulfilled, (state, action) => {
        // console.log("Create card fulfilled:", action.payload.name)
        state.cards.push(action.payload)
        state.loading = false
      })
      .addCase(createCard.rejected, (state, action) => {
        console.log("Create card rejected:", action.payload)
        state.loading = false
        state.error = action.payload as string
      })

      // Update card
      .addCase(updateCard.pending, (state) => {
        // console.log("Update card pending")
        state.loading = true
        state.error = null
      })
      .addCase(updateCard.fulfilled, (state, action) => {
        // console.log("Update card fulfilled:", action.payload.name)
        const updatedCard = action.payload
        const index = state.cards.findIndex((card) => card.id === updatedCard.id)
        if (index !== -1) {
          state.cards[index] = updatedCard
        }
        state.loading = false
      })
      .addCase(updateCard.rejected, (state, action) => {
        console.log("Update card rejected:", action.payload)
        state.loading = false
        state.error = action.payload as string
      })

      // Toggle main card status
      .addCase(toggleMainCard.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(toggleMainCard.fulfilled, (state, action) => {
        // Update all cards to reflect the new main card status
        state.cards = state.cards.map((card) => ({
          ...card,
          isMainCard: card.id === action.payload.id,
        }))
        state.loading = false
      })
      .addCase(toggleMainCard.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        console.error("toggleMainCard.rejected with error:", action.payload)
      })

      // Toggle prime status
      .addCase(togglePrimeStatus.pending, (state) => {
        // console.log("Toggle prime status pending")
        state.loading = true
        state.error = null
      })
      .addCase(togglePrimeStatus.fulfilled, (state, action) => {
        // console.log("Toggle prime status fulfilled")
        const updatedCard = action.payload
        const index = state.cards.findIndex((card) => card.id === updatedCard.id)
        if (index !== -1) {
          state.cards[index] = updatedCard
        }
        state.loading = false
      })
      .addCase(togglePrimeStatus.rejected, (state, action) => {
        console.log("Toggle prime status rejected:", action.payload)
        state.loading = false
        state.error = action.payload as string
      })

      // Toggle wallet status
      .addCase(toggleWalletStatus.pending, (state) => {
        // console.log("Toggle wallet status pending")
        state.loading = true
        state.error = null
      })
      .addCase(toggleWalletStatus.fulfilled, (state, action) => {
        // console.log("Toggle wallet status fulfilled")
        const updatedCard = action.payload
        const index = state.cards.findIndex((card) => card.id === updatedCard.id)
        if (index !== -1) {
          state.cards[index] = updatedCard
        }
        state.loading = false
      })
      .addCase(toggleWalletStatus.rejected, (state, action) => {
        console.log("Toggle wallet status rejected:", action.payload)
        state.loading = false
        state.error = action.payload as string
      })

      // Delete card
      .addCase(deleteCard.pending, (state) => {
        // console.log("Delete card pending")
        state.loading = true
        state.error = null
      })
      .addCase(deleteCard.fulfilled, (state, action) => {
        // console.log("Delete card fulfilled")
        state.cards = state.cards.filter((card) => card.id !== action.payload)
        if (state.selectedCardId === action.payload) {
          state.selectedCardId = null
        }
        state.loading = false
      })
      .addCase(deleteCard.rejected, (state, action) => {
        console.log("Delete card rejected:", action.payload)
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { selectCard, clearSelectedCard, clearError } = cardsSlice.actions
export default cardsSlice.reducer
