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
    return await cardService.getAllCards()
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Failed to fetch cards. Please try again."
    return rejectWithValue(errorMessage)
  }
})

export const createCard = createAsyncThunk(
  "cards/createCard",
  async (cardData: CreateCardPayload, { rejectWithValue }) => {
    try {
      return await cardService.createCard(cardData)
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
      return await cardService.updateCard(id, updates)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update card. Please try again."
      return rejectWithValue(errorMessage)
    }
  },
)

export const togglePrimeStatus = createAsyncThunk(
  "cards/togglePrimeStatus",
  async (id: string, { rejectWithValue }) => {
    try {
      return await cardService.togglePrimeStatus(id)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to toggle prime status. Please try again."
      return rejectWithValue(errorMessage)
    }
  },
)

export const toggleWalletStatus = createAsyncThunk(
  "cards/toggleWalletStatus",
  async (id: string, { rejectWithValue }) => {
    try {
      return await cardService.toggleWalletStatus(id)
    } catch (error: any) {
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
        const updatedCard = action.payload
        const index = state.cards.findIndex((card) => card.id === updatedCard.id)
        if (index !== -1) {
          state.cards[index] = updatedCard
        }
        state.loading = false
      })
      .addCase(updateCard.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Toggle prime status
      .addCase(togglePrimeStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(togglePrimeStatus.fulfilled, (state, action) => {
        const updatedCard = action.payload
        const index = state.cards.findIndex((card) => card.id === updatedCard.id)
        if (index !== -1) {
          state.cards[index] = updatedCard
        }
        state.loading = false
      })
      .addCase(togglePrimeStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Toggle wallet status
      .addCase(toggleWalletStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(toggleWalletStatus.fulfilled, (state, action) => {
        const updatedCard = action.payload
        const index = state.cards.findIndex((card) => card.id === updatedCard.id)
        if (index !== -1) {
          state.cards[index] = updatedCard
        }
        state.loading = false
      })
      .addCase(toggleWalletStatus.rejected, (state, action) => {
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
