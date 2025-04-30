import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

interface SettingsState {
  theme: "light" | "dark" | "system"
  notifications: {
    push: boolean
    email: boolean
  }
  privacy: {
    locationEnabled: boolean
    shareData: boolean
  }
  appearance: {
    buttonPlacement: "left" | "center" | "right"
    fontSize: "small" | "medium" | "large"
  }
  loading: boolean
  error: string | null
}

const initialState: SettingsState = {
  theme: "system",
  notifications: {
    push: true,
    email: true,
  },
  privacy: {
    locationEnabled: true,
    shareData: false,
  },
  appearance: {
    buttonPlacement: "center",
    fontSize: "medium",
  },
  loading: false,
  error: null,
}

export const saveSettings = createAsyncThunk(
  "settings/saveSettings",
  async (settings: Partial<SettingsState>, { rejectWithValue }) => {
    try {
      // In a real app, this would save settings to an API or local storage
      await new Promise((resolve) => setTimeout(resolve, 500))
      return settings
    } catch (error) {
      return rejectWithValue("Failed to save settings. Please try again.")
    }
  },
)

export const fetchSettings = createAsyncThunk("settings/fetchSettings", async (_, { rejectWithValue }) => {
  try {
    // In a real app, this would fetch settings from an API or local storage
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Return mock settings
    return {
      theme: "system",
      notifications: {
        push: true,
        email: true,
      },
      privacy: {
        locationEnabled: true,
        shareData: false,
      },
      appearance: {
        buttonPlacement: "center",
        fontSize: "medium",
      },
    }
  } catch (error) {
    return rejectWithValue("Failed to fetch settings. Please try again.")
  }
})

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload
    },
    togglePushNotifications: (state) => {
      state.notifications.push = !state.notifications.push
    },
    toggleEmailNotifications: (state) => {
      state.notifications.email = !state.notifications.email
    },
    toggleLocationEnabled: (state) => {
      state.privacy.locationEnabled = !state.privacy.locationEnabled
    },
    toggleShareData: (state) => {
      state.privacy.shareData = !state.privacy.shareData
    },
    setButtonPlacement: (state, action) => {
      state.appearance.buttonPlacement = action.payload
    },
    setFontSize: (state, action) => {
      state.appearance.fontSize = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Save settings
      .addCase(saveSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(saveSettings.fulfilled, (state, action) => {
        // Update state with saved settings
        Object.assign(state, { ...state, ...action.payload, loading: false })
      })
      .addCase(saveSettings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Fetch settings
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        // Update state with fetched settings
        Object.assign(state, { ...state, ...action.payload, loading: false })
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const {
  setTheme,
  togglePushNotifications,
  toggleEmailNotifications,
  toggleLocationEnabled,
  toggleShareData,
  setButtonPlacement,
  setFontSize,
  clearError,
} = settingsSlice.actions

export default settingsSlice.reducer
