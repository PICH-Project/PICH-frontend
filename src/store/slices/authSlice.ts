import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import AsyncStorage from "@react-native-async-storage/async-storage"
import authService, { type LoginPayload, type RegisterPayload, type UserProfile } from "../../services/authService"

interface AuthState {
  isAuthenticated: boolean
  token: string | null
  user: UserProfile | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  user: null,
  loading: false,
  error: null,
}

// Load token and user from AsyncStorage on app start
export const initAuth = createAsyncThunk("auth/init", async (_, { dispatch }) => {
  try {
    const token = await AsyncStorage.getItem("auth_token")
    const userJson = await AsyncStorage.getItem("auth_user")

    if (token && userJson) {
      const user = JSON.parse(userJson)
      return { token, user }
    }

    return { token: null, user: null }
  } catch (error) {
    console.error("Error initializing auth:", error)
    return { token: null, user: null }
  }
})

export const login = createAsyncThunk("auth/login", async (credentials: LoginPayload, { rejectWithValue }) => {
  try {
    const response = await authService.login(credentials)

    // Store token and user in AsyncStorage
    await AsyncStorage.setItem("auth_token", response.accessToken)
    await AsyncStorage.setItem("auth_user", JSON.stringify(response.user))

    return {
      token: response.accessToken,
      user: response.user,
    }
  } catch (error: any) {
    const errorMessage = error.message || "Login failed. Please check your credentials."
    return rejectWithValue(errorMessage)
  }
})

export const register = createAsyncThunk("auth/register", async (userData: RegisterPayload, { rejectWithValue }) => {
  try {
    const response = await authService.register(userData)

    // Store token and user in AsyncStorage
    await AsyncStorage.setItem("auth_token", response.accessToken)
    await AsyncStorage.setItem("auth_user", JSON.stringify(response.user))

    return {
      token: response.accessToken,
      user: response.user,
    }
  } catch (error: any) {
    const errorMessage = error.message || "Registration failed. Please try again."
    return rejectWithValue(errorMessage)
  }
})

export const fetchUserProfile = createAsyncThunk("auth/fetchUserProfile", async (_, { rejectWithValue }) => {
  try {
    const user = await authService.getUserProfile()

    // Update user in AsyncStorage
    await AsyncStorage.setItem("auth_user", JSON.stringify(user))

    return user
  } catch (error: any) {
    const errorMessage = error.message || "Failed to fetch user profile."
    return rejectWithValue(errorMessage)
  }
})

export const logout = createAsyncThunk("auth/logout", async () => {
  // Remove token and user from AsyncStorage
  await AsyncStorage.removeItem("auth_token")
  await AsyncStorage.removeItem("auth_user")

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
      // Init auth
      .addCase(initAuth.fulfilled, (state, action) => {
        if (action.payload.token && action.payload.user) {
          state.isAuthenticated = true
          state.token = action.payload.token
          state.user = action.payload.user
        }
      })

      // Login
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isAuthenticated = true
        state.token = action.payload.token
        state.user = action.payload.user
        state.loading = false
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Register
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isAuthenticated = true
        state.token = action.payload.token
        state.user = action.payload.user
        state.loading = false
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Fetch user profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.user = action.payload
        state.loading = false
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false
        state.token = null
        state.user = null
      })
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer
