"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  AppState,
  Linking,
  RefreshControl,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as WebBrowser from "expo-web-browser"
import { useNavigation } from "@react-navigation/native"
import { useDispatch, useSelector } from "react-redux"
import { useTheme } from "../../hooks/useTheme"
import { useTabBarHeight } from "../../hooks/useTabBarHeight"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { YellowCrownIcon as CrownIcon } from "../../components/icons"
import type { AppDispatch, RootState } from "../../store"
import {
  fetchActivePlans,
  fetchAllSubscriptions,
  selectActivePlanCodes,
  selectHasVip,
} from "../../store/slices/subscriptionsSlice"
import paymentsService from "../../services/paymentsService"
import {
  PlanCode,
  PLAN_DISPLAY,
  formatPlanFeatures,
} from "../../constants/subscriptions"
import type { SubscriptionPlan } from "../../services/subscriptionService"

/**
 * Префіксуємо path у KiraPay-checkout URL'і `/solana/` — це примушує
 * їхній UI пропустити мульти-чейн picker і одразу показати Solana flow.
 *
 * Приклад:
 *   https://checkout.kira-pay.com/9sj68yfm13
 *   →
 *   https://checkout.kira-pay.com/solana/9sj68yfm13
 */
function forceSolanaCheckout(url: string): string {
  try {
    const parsed = new URL(url)
    if (!parsed.pathname.startsWith("/solana/")) {
      parsed.pathname = `/solana${parsed.pathname}`
    }
    return parsed.toString()
  } catch {
    return url
  }
}

/**
 * Відкриваємо KiraPay checkout у системному in-app браузері
 * (SFSafariViewController на iOS / Custom Tabs на Android).
 *
 * Чому це краще ніж Phantom in-app browser:
 * - Не інжектить `window.ethereum` → KiraPay одразу йде Solana flow.
 * - Стабільніше за `Linking.openURL` — нема залежності від встановлених apps.
 * - Юзер не виходить з нашої апки, після закриття browser-tab вертається сюди.
 *
 * Phantom для підпису транзи відкриється сам через KiraPay deeplink.
 */
async function openInBrowser(rawPaymentUrl: string): Promise<boolean> {
  // TEMP: без /solana/ префіксу — дивимось як KiraPay поведе себе
  // у звичайному in-app браузері (без window.ethereum injection).
  // Раніше: const paymentUrl = forceSolanaCheckout(rawPaymentUrl)
  const paymentUrl = rawPaymentUrl

  console.log("[Subscribe/browser] rawPaymentUrl =", rawPaymentUrl)
  console.log("[Subscribe/browser] paymentUrl (raw, no /solana/) =", paymentUrl)

  try {
    const result = await WebBrowser.openBrowserAsync(paymentUrl, {
      // Solana-чорний на дефолтну тулбарку щоб не різало око у нашому темному UI.
      toolbarColor: "#21201C",
      controlsColor: "#FFFFFF",
      // На iOS дозволяємо share/safari menu — раптом юзеру треба буде відкрити в Phantom.
      enableBarCollapsing: true,
      showTitle: true,
    })
    console.log("[Subscribe/browser] result:", result)
    return true
  } catch (err) {
    console.log("[Subscribe/browser] failed:", err)
    return false
  }
}

/**
 * Відкриваємо KiraPay checkout у вбудованому браузері Phantom через universal link.
 *
 * Офіційний формат (https://docs.phantom.com/phantom-deeplinks/provider-methods/browse):
 *   https://phantom.app/ul/browse/<encoded-url>?ref=<encoded-ref>
 *
 * ФІКС "Unsupported account" — `forceSolanaCheckout()` префіксує path `/solana/`,
 * щоб KiraPay одразу йшов Solana-only flow і не намагався хапати `window.ethereum`.
 */
async function openInWallet(rawPaymentUrl: string): Promise<boolean> {
  const paymentUrl = forceSolanaCheckout(rawPaymentUrl)
  const encodedUrl = encodeURIComponent(paymentUrl)
  const encodedRef = encodeURIComponent("https://pich.app")

  const candidates = [
    // 1. Phantom universal link з ref як query-параметром (документований формат).
    `https://phantom.app/ul/browse/${encodedUrl}?ref=${encodedRef}`,
    // 2. Custom scheme — буває потрібен якщо universal link перехоплюється.
    `phantom://browse/${encodedUrl}?ref=${encodedRef}`,
    // 3. Без ref — на випадок якщо саме ref ламає роутинг.
    `https://phantom.app/ul/browse/${encodedUrl}`,
    // 4. Останній резерв — системний браузер.
    paymentUrl,
  ]

  console.log("[Subscribe/phantom] rawPaymentUrl =", rawPaymentUrl)
  console.log("[Subscribe/phantom] paymentUrl (with /solana/) =", paymentUrl)

  for (const link of candidates) {
    try {
      const supported = await Linking.canOpenURL(link)
      console.log(`[Subscribe/phantom] canOpenURL("${link.slice(0, 80)}...") → ${supported}`)
      if (supported) {
        await Linking.openURL(link)
        console.log("[Subscribe/phantom] opened:", link)
        return true
      }
    } catch (err) {
      console.log("[Subscribe/phantom] failed to open:", link, err)
    }
  }
  return false
}

/**
 * SubscriptionScreen
 *
 * Показує список усіх активних планів з бека (`/subscriptions/plans`).
 * Підтримує:
 *  - "Current" бейдж для активних планів юзера (PRIMARY + ADDON).
 *  - Subscribe-кнопку, disabled якщо план уже активний або не може бути куплений
 *    у поточному стані (наприклад, Premium коли вже є VIP).
 *  - Опис плану з бекенду (`plan.description`).
 *  - Список фічей, побудований з `plan.features` за форматером з constants.
 *
 * TODO (phase 2): При натисканні Subscribe — відкривати Solana wallet через
 * `useMobileWallet` (див. src/features/solana/useMobileWallet.ts), просити
 * подпис мокової транзи / повідомлення, після повернення дергати backend і
 * оновлювати стейт. Бек має додати ендпоінт для покупки BUSINESS/VIP — зараз
 * є лише `POST /subscriptions/premium`.
 */
const SubscriptionScreen = () => {
  const navigation = useNavigation()
  const { colors, typography } = useTheme()
  const insets = useSafeAreaInsets()
  const tabBarHeight = useTabBarHeight()
  const dispatch = useDispatch<AppDispatch>()

  const { plans, loading } = useSelector((state: RootState) => state.subscriptions)
  const activeCodes = useSelector(selectActivePlanCodes)
  const hasVip = useSelector(selectHasVip)

  const [subscribingPlanId, setSubscribingPlanId] = useState<string | null>(null)
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Тягнемо плани і поточні підписки, якщо ще не завантажені.
  useEffect(() => {
    if (!plans.length) dispatch(fetchActivePlans())
    dispatch(fetchAllSubscriptions())
  }, [dispatch])

  /** Pull-to-refresh handler — корисно щоб вручну перевірити чи активувалась
   *  підписка коли webhook прийшов з затримкою / закрилось polling-вікно. */
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([
        dispatch(fetchActivePlans()).unwrap(),
        dispatch(fetchAllSubscriptions()).unwrap(),
      ])
    } catch (err) {
      console.warn("[Subscribe] refresh failed:", err)
    } finally {
      setRefreshing(false)
    }
  }

  /**
   * Сортуємо плани за `sortOrder` з PLAN_DISPLAY (FREE → PREMIUM → BUSINESS → VIP).
   * Невідомі коди — у кінець.
   */
  const sortedPlans = useMemo(() => {
    return [...plans].sort((a, b) => {
      const orderA = PLAN_DISPLAY[a.code]?.sortOrder ?? 999
      const orderB = PLAN_DISPLAY[b.code]?.sortOrder ?? 999
      return orderA - orderB
    })
  }, [plans])

  /**
   * Чи доступна "Subscribe" дія для цього плану.
   * Повертає або null (можна), або текст з причиною (заблоковано).
   */
  const getDisabledReason = (planCode: PlanCode): string | null => {
    if (planCode === PlanCode.FREE) {
      return "Free plan is enabled by default"
    }
    if (activeCodes.includes(planCode)) {
      return "Already active"
    }
    if (planCode === PlanCode.PREMIUM && hasVip) {
      return "VIP already includes all premium features"
    }
    return null
  }

  // Polling: коли юзер повертається в апку після оплати, перевіряємо
  // чи бек уже отримав webhook від KiraPay і активував підписку.
  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
    setPendingOrderId(null)
  }

  const startPollingForActivation = (expectedCode: PlanCode) => {
    let attempts = 0
    let consecutiveErrors = 0
    let inFlight = false
    const MAX_ATTEMPTS = 20 // 20 * 2с = ~40с — більш ніж достатньо для webhook'а
    const MAX_CONSECUTIVE_ERRORS = 3 // 3 поспіль фейли → бек/ngrok лежить, нема сенсу довбати
    pollingRef.current = setInterval(async () => {
      if (inFlight) return // не накопичуємо запити поверх попереднього
      attempts++
      inFlight = true
      try {
        await dispatch(fetchAllSubscriptions()).unwrap()
        consecutiveErrors = 0
      } catch {
        consecutiveErrors++
        if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
          stopPolling()
          return
        }
      } finally {
        inFlight = false
      }
      if (attempts >= MAX_ATTEMPTS) {
        stopPolling()
      }
    }, 2000)
  }

  // Як тільки в activeCodes з'являється план який ми чекали → success і стоп.
  useEffect(() => {
    if (pendingOrderId && pollingRef.current) {
      const [, planCode] = pendingOrderId.split("|")
      if (planCode && activeCodes.includes(planCode as PlanCode)) {
        stopPolling()
        Alert.alert("Success", "Subscription activated!")
      }
    }
  }, [activeCodes, pendingOrderId])

  // При поверненні в апку зразу робимо рефреш підписок (на випадок якщо
  // полінг прокинувся але webhook прийшов поки апка була в фоні).
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && pendingOrderId) {
        dispatch(fetchAllSubscriptions())
      }
    })
    return () => sub.remove()
  }, [pendingOrderId, dispatch])

  // Cleanup при анмаунті — щоб таймер не "висів"
  useEffect(() => () => stopPolling(), [])

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    const code = plan.code as PlanCode

    if (code === PlanCode.FREE) {
      Alert.alert("Free plan", "Free plan is enabled by default")
      return
    }

    setSubscribingPlanId(plan.id)
    try {
      // 1. Бек створює KiraPay checkout-сесію
      const { paymentUrl, orderId } = await paymentsService.createCheckoutSession({
        planCode: code,
        billingCycle: "monthly",
      })

      // 2. Відкриваємо payment-link у Phantom in-app browser через universal link.
      //    URL префіксується `/solana/` (forceSolanaCheckout) щоб KiraPay
      //    одразу йшов Solana-only flow і не падав на window.ethereum.
      //    Якщо хочеш протестити в системному браузері — поміняй на `openInBrowser`.
      const opened = await openInWallet(paymentUrl)
      if (!opened) {
        Alert.alert("Error", "Couldn't open payment page. Please try again.")
        return
      }

      // 3. Запускаємо polling — коли юзер повернеться в апку, ми очікуємо
      //    що бек прийняв webhook від KiraPay і активував підписку.
      setPendingOrderId(orderId)
      startPollingForActivation(code)
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to start checkout. Please try again."
      Alert.alert("Error", msg)
    } finally {
      setSubscribingPlanId(null)
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text
          style={[
            styles.headerTitle,
            {
              color: colors.text,
              fontFamily: typography.fontFamily.bold,
              fontSize: typography.fontSize.xl,
            },
          ]}
        >
          Subscription
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={{ marginRight: 12 }}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="menu" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.text}
            colors={[colors.text]}
          />
        }
      >
        <Text
          style={[
            styles.title,
            {
              color: colors.text,
              fontFamily: typography.fontFamily.bold,
              fontSize: typography.fontSize.xxl,
            },
          ]}
        >
          Choose Your Plan
        </Text>
        <Text
          style={[
            styles.subtitle,
            {
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.regular,
              fontSize: typography.fontSize.sm,
            },
          ]}
        >
          Choose a subscription plan to unlock all the functionality of the application
        </Text>

        {loading && !plans.length ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading plans...
            </Text>
          </View>
        ) : (
          <View style={styles.plansContainer}>
            {sortedPlans.map((plan) => {
              const code = plan.code as PlanCode
              const meta = PLAN_DISPLAY[code]
              const isCurrent = activeCodes.includes(code)
              const disabledReason = getDisabledReason(code)
              const isSubscribing = subscribingPlanId === plan.id
              const featureLines = formatPlanFeatures(code, plan.features)
              const description = plan.description ?? meta?.prettyName

              return (
                <View
                  key={plan.id}
                  style={[
                    styles.planCard,
                    {
                      backgroundColor: meta?.backgroundColor ?? colors.card,
                    },
                    // Free-картка має облямівку, як у початковому дизайні.
                    code === PlanCode.FREE && {
                      borderWidth: 1,
                      borderColor: colors.textPrimary,
                    },
                  ]}
                >
                  <View style={styles.planContent}>
                    <View style={styles.planLeft}>
                      <View style={styles.titleRow}>
                        {meta?.showCrown && <CrownIcon />}
                        <Text
                          style={[
                            styles.planTitle,
                            {
                              fontFamily: typography.fontFamily.bold,
                              fontSize: typography.fontSize.lg,
                              fontWeight: "bold",
                              color: colors.textPrimary,
                            },
                          ]}
                        >
                          {meta?.prettyName ?? plan.displayName ?? plan.name}
                        </Text>
                        {isCurrent && (
                          <View style={styles.currentBadge}>
                            <Text style={styles.currentBadgeText}>Current</Text>
                          </View>
                        )}
                      </View>

                      {description && (
                        <Text
                          style={[
                            styles.description,
                            {
                              fontFamily: typography.fontFamily.regular,
                              fontSize: typography.fontSize.sm,
                              color: colors.textPrimary,
                            },
                          ]}
                        >
                          {description}
                        </Text>
                      )}

                      <Text
                        style={[
                          styles.includesText,
                          {
                            fontFamily: typography.fontFamily.regular,
                            fontSize: typography.fontSize.sm,
                            color: colors.textPrimary,
                          },
                        ]}
                      >
                        Includes
                      </Text>

                      <View style={styles.featuresContainer}>
                        {featureLines.map((line, idx) => (
                          <View key={idx} style={styles.featureItem}>
                            <View style={styles.featureBullet} />
                            <Text
                              style={[
                                styles.featureText,
                                {
                                  fontFamily: typography.fontFamily.regular,
                                  fontSize: typography.fontSize.sm,
                                  color: colors.textPrimary,
                                },
                              ]}
                            >
                              {line}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    <View style={styles.planRight}>
                      {plan.price > 0 ? (
                        <View style={styles.priceRow}>
                          <Text
                            style={[
                              styles.priceAmount,
                              { fontFamily: typography.fontFamily.bold, color: "#71706A" },
                            ]}
                          >
                            ${plan.price}
                          </Text>
                          <Text
                            style={[
                              styles.pricePeriod,
                              {
                                fontFamily: typography.fontFamily.regular,
                                color: "#71706A",
                              },
                            ]}
                          >
                            {plan.durationMonths === 0
                              ? "Forever"
                              : plan.durationMonths === 12
                              ? "Yearly"
                              : "Monthly"}
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.priceRow}>
                          <Text
                            style={[
                              styles.priceAmount,
                              { fontFamily: typography.fontFamily.bold, color: "#71706A" },
                            ]}
                          >
                            Free
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Subscribe / disabled-з-причиною */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      onPress={() => handleSubscribe(plan)}
                      disabled={!!disabledReason || isSubscribing}
                      activeOpacity={0.7}
                      style={[
                        styles.subscribeButton,
                        (!!disabledReason || isSubscribing) && styles.subscribeButtonDisabled,
                      ]}
                    >
                      {isSubscribing ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.subscribeButtonText}>
                          {isCurrent ? "Active" : "Subscribe"}
                        </Text>
                      )}
                    </TouchableOpacity>
                    {disabledReason && !isCurrent && (
                      <Text style={[styles.disabledReason, { color: colors.textSecondary }]}>
                        {disabledReason}
                      </Text>
                    )}
                  </View>
                </View>
              )
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    textAlign: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  loadingState: {
    paddingVertical: 60,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
  },
  plansContainer: {
    marginBottom: 24,
  },
  planCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    position: "relative",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 8,
    gap: 8,
  },
  currentBadge: {
    backgroundColor: "#71706A",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    alignSelf: "center",
  },
  currentBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  planContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  planLeft: {
    flex: 1,
    paddingRight: 16,
  },
  planTitle: {
    color: "#333333",
  },
  description: {
    marginBottom: 12,
    color: "#666666",
    lineHeight: 18,
  },
  includesText: {
    marginBottom: 8,
    color: "#666666",
  },
  featuresContainer: {
    gap: 6,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  featureBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#333333",
    marginRight: 8,
    marginTop: 6,
  },
  featureText: {
    flex: 1,
    color: "#333333",
  },
  planRight: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
    flexDirection: "row",
    paddingTop: 32,
    gap: 12,
  },
  priceRow: {
    alignItems: "flex-end",
    marginBottom: 8,
  },
  priceAmount: {
    fontSize: 24,
    color: "#333333",
  },
  pricePeriod: {
    fontSize: 12,
    color: "#666666",
  },
  actionRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  subscribeButton: {
    backgroundColor: "#27261F",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 120,
    alignItems: "center",
  },
  subscribeButtonDisabled: {
    backgroundColor: "#B5B4AE",
  },
  subscribeButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  disabledReason: {
    fontSize: 12,
    flexShrink: 1,
  },
})

export default SubscriptionScreen
