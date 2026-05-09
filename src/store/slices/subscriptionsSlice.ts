import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import subscriptionService, {
  type Subscription,
  type SubscriptionPlan,
  type CombinedLimits,
} from "../../services/subscriptionService"
import { PlanCode } from "../../constants/subscriptions"
import { logout } from "./authSlice"

interface SubscriptionsState {
  /** Всі активні підписки юзера: PRIMARY + опційно ADDON. */
  subscriptions: Subscription[]
  /** Зведені перки/ліміти юзера (бек агрегує PRIMARY + ADDON). */
  limits: CombinedLimits | null
  /** Список усіх планів — для UI Subscription скріна. */
  plans: SubscriptionPlan[]
  loading: boolean
  error: string | null
}

const initialState: SubscriptionsState = {
  subscriptions: [],
  limits: null,
  plans: [],
  loading: false,
  error: null,
}

export const fetchAllSubscriptions = createAsyncThunk(
  "subscriptions/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await subscriptionService.getAllActiveSubscriptions()
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to fetch subscriptions."
      return rejectWithValue(message)
    }
  },
)

export const fetchUserLimits = createAsyncThunk(
  "subscriptions/fetchLimits",
  async (_, { rejectWithValue }) => {
    try {
      return await subscriptionService.getUserLimits()
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to fetch user limits."
      return rejectWithValue(message)
    }
  },
)

export const fetchActivePlans = createAsyncThunk(
  "subscriptions/fetchPlans",
  async (_, { rejectWithValue }) => {
    try {
      return await subscriptionService.getActivePlans()
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to fetch plans."
      return rejectWithValue(message)
    }
  },
)

/**
 * Купити Premium ADDON. Бек поки не вимагає payment-доказу, тож просто
 * викликає `POST /subscriptions/premium`. Коли підключимо solana-оплату,
 * сюди передаватимемо signature/txHash і бек звірятиме on-chain.
 */
export const addPremiumAddon = createAsyncThunk(
  "subscriptions/addPremium",
  async (
    { billingCycle = "monthly" }: { billingCycle?: "monthly" | "yearly" } = {},
    { dispatch, rejectWithValue },
  ) => {
    try {
      const sub = await subscriptionService.addPremiumAddon(billingCycle)
      // після успішного апгрейду оновлюємо список і ліміти
      dispatch(fetchAllSubscriptions())
      dispatch(fetchUserLimits())
      return sub
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to subscribe to Premium."
      return rejectWithValue(message)
    }
  },
)

const subscriptionsSlice = createSlice({
  name: "subscriptions",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllSubscriptions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllSubscriptions.fulfilled, (state, action) => {
        state.subscriptions = action.payload
        state.loading = false
      })
      .addCase(fetchAllSubscriptions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      .addCase(fetchUserLimits.fulfilled, (state, action) => {
        state.limits = action.payload
      })
      .addCase(fetchUserLimits.rejected, (state, action) => {
        state.error = action.payload as string
      })

      .addCase(fetchActivePlans.fulfilled, (state, action) => {
        state.plans = action.payload
      })
      .addCase(fetchActivePlans.rejected, (state, action) => {
        state.error = action.payload as string
      })

      .addCase(addPremiumAddon.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addPremiumAddon.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(addPremiumAddon.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Очищаємо стейт при логауті, щоб новий юзер не бачив підписки попереднього.
      .addCase(logout.fulfilled, (state) => {
        state.subscriptions = []
        state.limits = null
        state.plans = []
        state.loading = false
        state.error = null
      })
  },
})

export const { clearError } = subscriptionsSlice.actions
export default subscriptionsSlice.reducer

// =============================================================================
//  SELECTORS — типізовані помічники для компонентів. Кладемо тут, щоб логіка
//  "що означає бути преміумом" була в одному місці.
// =============================================================================

import type { RootState } from ".."
import { CardType } from "../../constants/cards"

/** Усі активні коди планів юзера (PRIMARY + ADDON). */
export const selectActivePlanCodes = (state: RootState): PlanCode[] =>
  state.subscriptions.subscriptions.map((s) => s.plan?.code).filter(Boolean) as PlanCode[]

/** PRIMARY підписка (FREE/BUSINESS/VIP). */
export const selectPrimarySubscription = (state: RootState): Subscription | undefined =>
  state.subscriptions.subscriptions.find((s) => s.subscriptionType === "primary")

/** PREMIUM ADDON підписка, якщо активна. */
export const selectPremiumAddon = (state: RootState): Subscription | undefined =>
  state.subscriptions.subscriptions.find((s) => s.subscriptionType === "addon")

/** Чи має юзер преміум-перки (PREMIUM ADDON або VIP PRIMARY). */
export const selectHasPremiumPerks = (state: RootState): boolean => {
  const codes = selectActivePlanCodes(state)
  return codes.includes(PlanCode.PREMIUM) || codes.includes(PlanCode.VIP)
}

/** Чи має юзер VIP. */
export const selectHasVip = (state: RootState): boolean =>
  selectActivePlanCodes(state).includes(PlanCode.VIP)

/** Чи має юзер Business (відкриває BAC). */
export const selectHasBusiness = (state: RootState): boolean =>
  selectActivePlanCodes(state).includes(PlanCode.BUSINESS)

/**
 * Чи може юзер створити картку даного типу.
 * Логіка:
 *  - PAC   → завжди доступний
 *  - BAC   → треба BUSINESS у будь-якій активній підписці
 *  - VIPAC → треба VIP
 */
export const selectCanCreateCardType =
  (cardType: CardType) =>
  (state: RootState): boolean => {
    const codes = selectActivePlanCodes(state)
    switch (cardType) {
      case CardType.PAC:
        return true
      case CardType.BAC:
        return codes.includes(PlanCode.BUSINESS) || codes.includes(PlanCode.VIP)
      case CardType.VIPAC:
        return codes.includes(PlanCode.VIP)
      default:
        return false
    }
  }
