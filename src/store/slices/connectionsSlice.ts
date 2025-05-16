import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import connectionService, { type Connection, type CreateConnectionPayload } from "../../services/connectionService"
import type { UserProfile } from "../../services/authService"

interface ConnectionsState {
  connections: Connection[]
  friends: UserProfile[]
  loading: boolean
  error: string | null
  selectedConnectionId: string | null
}

const initialState: ConnectionsState = {
  connections: [],
  friends: [],
  loading: false,
  error: null,
  selectedConnectionId: null,
}

export const fetchConnections = createAsyncThunk("connections/fetchConnections", async (_, { rejectWithValue }) => {
  try {
    return await connectionService.getAllConnections()
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Failed to fetch connections. Please try again."
    return rejectWithValue(errorMessage)
  }
})

export const fetchFriends = createAsyncThunk("connections/fetchFriends", async (_, { rejectWithValue }) => {
  try {
    return await connectionService.getFriends()
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Failed to fetch friends. Please try again."
    return rejectWithValue(errorMessage)
  }
})

export const createConnection = createAsyncThunk(
  "connections/createConnection",
  async (payload: CreateConnectionPayload, { rejectWithValue }) => {
    try {
      return await connectionService.createConnection(payload)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to create connection. Please try again."
      return rejectWithValue(errorMessage)
    }
  },
)

export const toggleFavorite = createAsyncThunk(
  "connections/toggleFavorite",
  async (connectionId: string, { rejectWithValue }) => {
    try {
      return await connectionService.toggleFavorite(connectionId)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to toggle favorite. Please try again."
      return rejectWithValue(errorMessage)
    }
  },
)

export const updateNotes = createAsyncThunk(
  "connections/updateNotes",
  async ({ connectionId, notes }: { connectionId: string; notes: string }, { rejectWithValue }) => {
    try {
      return await connectionService.updateNotes(connectionId, { notes })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update notes. Please try again."
      return rejectWithValue(errorMessage)
    }
  },
)

export const deleteConnection = createAsyncThunk(
  "connections/deleteConnection",
  async (connectionId: string, { rejectWithValue }) => {
    try {
      await connectionService.deleteConnection(connectionId)
      return connectionId
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to delete connection. Please try again."
      return rejectWithValue(errorMessage)
    }
  },
)

const connectionsSlice = createSlice({
  name: "connections",
  initialState,
  reducers: {
    selectConnection: (state, action) => {
      state.selectedConnectionId = action.payload
    },
    clearSelectedConnection: (state) => {
      state.selectedConnectionId = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch connections
      .addCase(fetchConnections.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchConnections.fulfilled, (state, action) => {
        state.connections = action.payload
        state.loading = false
      })
      .addCase(fetchConnections.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Fetch friends
      .addCase(fetchFriends.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchFriends.fulfilled, (state, action) => {
        state.friends = action.payload
        state.loading = false
      })
      .addCase(fetchFriends.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Create connection
      .addCase(createConnection.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createConnection.fulfilled, (state, action) => {
        state.connections.push(action.payload)
        state.loading = false
      })
      .addCase(createConnection.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Toggle favorite
      .addCase(toggleFavorite.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const updatedConnection = action.payload
        const index = state.connections.findIndex((connection) => connection.id === updatedConnection.id)
        if (index !== -1) {
          state.connections[index] = updatedConnection
        }
        state.loading = false
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Update notes
      .addCase(updateNotes.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateNotes.fulfilled, (state, action) => {
        const updatedConnection = action.payload
        const index = state.connections.findIndex((connection) => connection.id === updatedConnection.id)
        if (index !== -1) {
          state.connections[index] = updatedConnection
        }
        state.loading = false
      })
      .addCase(updateNotes.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Delete connection
      .addCase(deleteConnection.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteConnection.fulfilled, (state, action) => {
        state.connections = state.connections.filter((connection) => connection.id !== action.payload)
        if (state.selectedConnectionId === action.payload) {
          state.selectedConnectionId = null
        }
        state.loading = false
      })
      .addCase(deleteConnection.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { selectConnection, clearSelectedConnection, clearError } = connectionsSlice.actions
export default connectionsSlice.reducer
