import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

interface AuthState {
  isAuthenticated: boolean
  token: string | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  loading: false,
  error: null,
}

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      // Implement actual API call here
      // For now, we'll just simulate a successful login
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return { token: "sample-token" }
    } catch (error) {
      return rejectWithValue("Login failed. Please check your credentials.")
    }
  },
)

export const signup = createAsyncThunk(
  "auth/signup",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      // Implement actual API call here
      // For now, we'll just simulate a successful signup
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return { token: "sample-token" }
    } catch (error) {
      return rejectWithValue("Signup failed. Please try again.")
    }
  },
)

export const logout = createAsyncThunk("auth/logout", async () => {
  // Implement actual logout logic here
  await new Promise((resolve) => setTimeout(resolve, 500))
  return null
})

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isAuthenticated = true
        state.token = action.payload.token
        state.loading = false
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(signup.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.isAuthenticated = true
        state.token = action.payload.token
        state.loading = false
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false
        state.token = null
      })
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer
