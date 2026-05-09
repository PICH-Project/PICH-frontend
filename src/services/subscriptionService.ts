import api from "./api"
import type { PlanCode } from "../constants/subscriptions"

/**
 * Features плану — те, що повертає бек у `subscription.plan.features`.
 * Дзеркало `PlanFeatures` з PICH-backend/src/subscriptions/entities/subscription-plan.entity.ts.
 */
export interface PlanFeatures {
  maxCards: number
  cardTypes: string[]
  phoneNumbers: number
  socialLinks: number
  bioMaxLength: number
  customization: boolean
  additionalPhones: number
  additionalSocials: number
  coinFarmBonus: boolean
  vipIndicator: boolean
  blackTheme: boolean
  privacySettings: boolean
  animatedPhoto: boolean
  animatedBackground: boolean
}

export interface SubscriptionPlan {
  id: string
  name: string // 'FREE' | 'BUSINESS' | 'VIP' | 'PREMIUM'
  displayName: string
  code: PlanCode
  price: number
  durationMonths: number
  features: PlanFeatures
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type SubscriptionType = "primary" | "addon"
export type BillingCycle = "monthly" | "yearly"
export type SubscriptionStatus = "active" | "expired" | "cancelled" | "pending"

export interface Subscription {
  id: string
  userId: string
  planId: string
  plan: SubscriptionPlan // populated relation
  subscriptionType: SubscriptionType
  billingCycle: BillingCycle | null
  status: SubscriptionStatus
  startedAt: string | null
  expiresAt: string | null
  autoRenew: boolean
  paymentProvider: string | null
  externalSubscriptionId: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Combined limits — аґреґована інформація з беку: PRIMARY + ADDON у одному обʼєкті.
 * Дзеркало `CombinedLimits` з PICH-backend/src/subscriptions/subscriptions.service.ts.
 */
export interface CombinedLimits {
  cardTypes: string[]
  maxCards: number
  phoneNumbers: number
  socialLinks: number
  bioMaxLength: number
  customization: boolean
  coinFarmBonus: boolean
  vipIndicator: boolean
  blackTheme: boolean
  privacySettings: boolean
  animatedPhoto: boolean
  animatedBackground: boolean
}

const subscriptionService = {
  /**
   * Повертає всі активні підписки юзера: PRIMARY (FREE/BUSINESS/VIP) і опційно
   * ADDON (PREMIUM). PRIMARY завжди першим у відповіді.
   */
  getAllActiveSubscriptions: async (): Promise<Subscription[]> => {
    const response = await api.get<Subscription[]>("/subscriptions/all")
    return response.data
  },

  /**
   * Повертає поточну PRIMARY підписку. Якщо немає — бек створить FREE і поверне її.
   */
  getCurrentSubscription: async (): Promise<Subscription> => {
    const response = await api.get<Subscription>("/subscriptions/current")
    return response.data
  },

  /**
   * Зведені ліміти/перки юзера (бек уже об'єднав PRIMARY + ADDON).
   * Зручно для UI форми створення картки (скільки номерів, соц-мереж тощо).
   */
  getUserLimits: async (): Promise<CombinedLimits> => {
    const response = await api.get<CombinedLimits>("/subscriptions/limits")
    return response.data
  },

  /**
   * Список усіх планів (для скріна Subscription).
   */
  getActivePlans: async (): Promise<SubscriptionPlan[]> => {
    const response = await api.get<SubscriptionPlan[]>("/subscriptions/plans")
    return response.data
  },

  /**
   * Купити PREMIUM (ADDON).
   */
  addPremiumAddon: async (billingCycle: BillingCycle = "monthly"): Promise<Subscription> => {
    const response = await api.post<Subscription>("/subscriptions/premium", { billingCycle })
    return response.data
  },

  /**
   * Скасувати підписку (PRIMARY або ADDON).
   */
  cancelSubscription: async (type: SubscriptionType = "primary"): Promise<Subscription> => {
    const response = await api.post<Subscription>(`/subscriptions/cancel?type=${type}`)
    return response.data
  },
}

export default subscriptionService
