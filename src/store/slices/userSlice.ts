import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import userService from "../../services/userService"
import type { UpdateUserPayload } from "../../services/userService"
import { logout } from "./authSlice"
import type { RootState } from ".."

// Update the UserProfile interface to match the backend entity structure
export interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  nickname?: string
  phone?: string
  avatar?: string
  gender?: string
  birthDate?: string
  subscriptionPlan: string
  subscriptionExpiresAt?: string
  isActive: boolean
  walletAddress?: string
  tokenBalance: number
  mainCardId?: string
  createdAt: string
  updatedAt: string
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

// Enhance the fetchUserProfile thunk to handle empty responses better
export const fetchUserProfile = createAsyncThunk("user/fetchUserProfile", async (_, { rejectWithValue, getState }) => {
  try {
    // Log the current auth state
    const state = getState() as RootState
    console.log("Auth state before fetching profile:", {
      isAuthenticated: state.auth.isAuthenticated,
      hasToken: !!state.auth.token,
    })

    console.log("Fetching user profile from API...")
    const profile = await userService.getCurrentUserProfile()

    // Validate the profile data
    if (!profile || !profile.id) {
      console.error("API returned invalid user profile data:", profile)
      return rejectWithValue("Invalid user profile data received from API")
    }

    console.log("User profile fetched successfully:", profile)
    return profile
  } catch (error: any) {
    console.error("Error fetching user profile:", error)
    // Add more detailed error logging
    if (error.response) {
      console.error("API Error Response:", error.response.data)
      console.error("API Error Status:", error.response.status)
    }
    const errorMessage = error.response?.data?.message || "Failed to fetch user profile. Please try again."
    return rejectWithValue(errorMessage)
  }
})

// Get a user by ID using the userService
export const getUserById = createAsyncThunk("user/getUserById", async (userId: string, { rejectWithValue }) => {
  try {
    console.log(`Fetching user with ID ${userId} from API...`)
    const user = await userService.getUserById(userId)
    console.log("User fetched:", user)
    return user
  } catch (error: any) {
    console.error(`Error fetching user with ID ${userId}:`, error)
    const errorMessage = error.response?.data?.message || `Failed to fetch user with ID ${userId}. Please try again.`
    return rejectWithValue(errorMessage)
  }
})

// Update the updateUserProfile thunk to use the correct payload structure
export const updateUserProfile = createAsyncThunk(
  "user/updateUserProfile",
  async ({ id, ...updates }: { id: string } & UpdateUserPayload, { rejectWithValue }) => {
    try {
      console.log(`Updating user with ID ${id}...`, updates)

      // Remove email from updates if it exists (API doesn't want it)
      const { email, ...validUpdates } = updates as any

      const updatedUser = await userService.updateUser(id, validUpdates)
      console.log("User updated:", updatedUser)
      return updatedUser
    } catch (error: any) {
      console.error("Error updating user profile:", error)
      const errorMessage = error.response?.data?.message || "Failed to update profile. Please try again."
      return rejectWithValue(errorMessage)
    }
  },
)

// Set a card as the user's main card using the userService
export const setMainCard = createAsyncThunk(
  "user/setMainCard",
  async ({ userId, cardId }: { userId: string; cardId: string }, { rejectWithValue }) => {
    try {
      console.log(`Setting card ${cardId} as main card for user ${userId}...`)
      const updatedUser = await userService.setMainCard(userId, cardId)
      console.log("Main card set:", updatedUser)
      return updatedUser
    } catch (error: any) {
      console.error("Error setting main card:", error)
      const errorMessage = error.response?.data?.message || "Failed to set main card. Please try again."
      return rejectWithValue(errorMessage)
    }
  },
)

// Update the upgradeSubscription thunk to use the correct field names
export const upgradeSubscription = createAsyncThunk(
  "user/upgradeSubscription",
  async ({ userId, plan }: { userId: string; plan: "basic" | "medium" | "premium" }, { rejectWithValue }) => {
    try {
      console.log(`Upgrading subscription for user ${userId} to ${plan}...`)

      // Create a subscription update payload with the correct field name
      const subscriptionData: UpdateUserPayload = {
        subscriptionPlan: plan,
        isActive: true,
      }

      // Update the user with the new subscription data
      const updatedUser = await userService.updateUser(userId, subscriptionData)
      console.log("Subscription upgraded:", updatedUser)

      return updatedUser
    } catch (error: any) {
      console.error("Error upgrading subscription:", error)
      const errorMessage = error.response?.data?.message || "Failed to upgrade subscription. Please try again."
      return rejectWithValue(errorMessage)
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

      // Get user by ID
      .addCase(getUserById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        // Only update the profile if it's the current user
        if (state.profile && state.profile.id === action.payload.id) {
          state.profile = action.payload
        }
        state.loading = false
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.profile = action.payload
        state.loading = false
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Set main card
      .addCase(setMainCard.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(setMainCard.fulfilled, (state, action) => {
        state.profile = action.payload
        state.loading = false
      })
      .addCase(setMainCard.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Upgrade subscription
      .addCase(upgradeSubscription.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(upgradeSubscription.fulfilled, (state, action) => {
        state.profile = action.payload
        state.loading = false
      })
      .addCase(upgradeSubscription.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Add a new action to reset the user state when logging out
      // This should be added to the extraReducers section

      // Add this case to the extraReducers builder
      .addCase(logout.fulfilled, (state) => {
        // Reset the user state when logging out
        state.profile = null
        state.loading = false
        state.error = null
      })
  },
})

export const { clearUserProfile, clearError } = userSlice.actions
export default userSlice.reducer
