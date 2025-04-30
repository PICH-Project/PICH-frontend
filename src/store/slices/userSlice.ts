import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  nickname: string
  email: string
  phone: string
  avatar?: string
  gender?: string
  birthDate?: string
  createdAt: number
  updatedAt: number
  subscription: {
    plan: "basic" | "medium" | "premium"
    expiresAt: number
    isActive: boolean
  }
  walletAddress?: string
  tokenBalance: number
}

interface UserState {
  profile: UserProfile | null
  loading: boolean
  error: string | null
}

const initialState: UserState = {
  profile: null,
  loading: false,
  error: null,
}

export const fetchUserProfile = createAsyncThunk("user/fetchUserProfile", async (_, { rejectWithValue }) => {
  try {
    // In a real app, this would fetch from an API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Return mock user profile
    return {
      id: "user123",
      firstName: "John",
      lastName: "Doe",
      nickname: "Johny",
      email: "john.doe@example.com",
      phone: "+1 876 765 56 54",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      gender: "M",
      birthDate: "24.02.1986",
      createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
      updatedAt: Date.now(),
      subscription: {
        plan: "basic",
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
        isActive: true,
      },
      walletAddress: "sol:abc123def456",
      tokenBalance: 100,
    } as UserProfile
  } catch (error) {
    return rejectWithValue("Failed to fetch user profile. Please try again.")
  }
})

export const updateUserProfile = createAsyncThunk(
  "user/updateUserProfile",
  async (updates: Partial<UserProfile>, { rejectWithValue }) => {
    try {
      // In a real app, this would update via API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      return { ...updates, updatedAt: Date.now() }
    } catch (error) {
      return rejectWithValue("Failed to update profile. Please try again.")
    }
  },
)

export const upgradeSubscription = createAsyncThunk(
  "user/upgradeSubscription",
  async (plan: "basic" | "medium" | "premium", { rejectWithValue }) => {
    try {
      // In a real app, this would handle payment and subscription upgrade
      await new Promise((resolve) => setTimeout(resolve, 1500))

      return {
        plan,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
        isActive: true,
      }
    } catch (error) {
      return rejectWithValue("Failed to upgrade subscription. Please try again.")
    }
  },
)

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUserProfile: (state) => {
      state.profile = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profile = action.payload
        state.loading = false
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile = { ...state.profile, ...action.payload }
        }
        state.loading = false
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Upgrade subscription
      .addCase(upgradeSubscription.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(upgradeSubscription.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.subscription = action.payload
        }
        state.loading = false
      })
      .addCase(upgradeSubscription.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearUserProfile, clearError } = userSlice.actions
export default userSlice.reducer
