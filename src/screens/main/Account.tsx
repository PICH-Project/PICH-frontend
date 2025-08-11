"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useDispatch, useSelector } from "react-redux"
import { useTheme } from "../../hooks/useTheme"
import { useTabBarHeight } from "../../hooks/useTabBarHeight"
import Avatar from "../../components/common/Avatar"
import Button from "../../components/common/Button"
import type { AppDispatch, RootState } from "../../store"
import { fetchUserProfile } from "../../store/slices/userSlice"
import { fetchCards } from "../../store/slices/cardsSlice"
import type { NavigationProp } from "@react-navigation/native"

// Card type and category enums to match backend
enum CardType {
  BAC = "BAC", // Business Automatic Card
  PAC = "PAC", // Personal Automatic Card
  VAC = "VAC", // Virtual Automatic Card
  CAC = "CAC", // Custom Automatic Card
}

enum CardCategory {
  FAMILY = "FAMILY",
  FRIENDS = "FRIENDS",
  WORK = "WORK",
  OTHER = "OTHER",
}

const AccountScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>()
  const { colors, typography } = useTheme()
  const dispatch = useDispatch<AppDispatch>()
  const tabBarHeight = useTabBarHeight()

  // Redux state
  const { profile: user, loading: userLoading, error: userError } = useSelector((state: RootState) => state.user)
  const { cards, loading: cardsLoading } = useSelector((state: RootState) => state.cards)

  // Local state
  const [refreshing, setRefreshing] = useState(false)

  // Load data on component mount
  useEffect(() => {
    loadAccountData()
  }, [])

  const loadAccountData = async () => {
    try {
      console.log("Loading account data...")
      await Promise.all([dispatch(fetchUserProfile()).unwrap(), dispatch(fetchCards()).unwrap()])
      console.log("Account data loaded successfully")
    } catch (error) {
      console.error("Error loading account data:", error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadAccountData()
    setRefreshing(false)
  }

  const handleEditProfile = () => {
    navigation.navigate("Settings", { screen: "AccountSettings" })
  }

  const handleViewCards = () => {
    navigation.navigate("StackMain")
  }

  const handleCreateCard = () => {
    navigation.navigate("CreateCard")
  }

  const handleUpgradeSubscription = () => {
    navigation.navigate("Settings", { screen: "Subscription" })
  }

  // Get main card
  const mainCard = cards.find((card) => card.isMainCard)
  const cardCount = cards.length
  const connectionCount = 0 // This would come from connections data when implemented

  // Get subscription plan display name
  const getSubscriptionDisplayName = (plan: string) => {
    switch (plan) {
      case "basic":
        return "Basic"
      case "medium":
        return "Medium"
      case "premium":
        return "Premium"
      default:
        return "Basic"
    }
  }

  // Get subscription color
  const getSubscriptionColor = (plan: string) => {
    switch (plan) {
      case "premium":
        return colors.accent
      case "medium":
        return colors.secondary
      default:
        return colors.textSecondary
    }
  }

  // Get card type display name
  const getCardTypeDisplay = (type: CardType) => {
    switch (type) {
      case CardType.BAC:
        return "Business"
      case CardType.PAC:
        return "Personal"
      case CardType.VAC:
        return "Virtual"
      case CardType.CAC:
        return "Custom"
      default:
        return "Personal"
    }
  }

  // Get card category display name
  const getCardCategoryDisplay = (category: CardCategory) => {
    switch (category) {
      case CardCategory.FAMILY:
        return "Family"
      case CardCategory.FRIENDS:
        return "Friends"
      case CardCategory.WORK:
        return "Work"
      case CardCategory.OTHER:
        return "Other"
      default:
        return "Other"
    }
  }

  // Get card type color
  const getCardTypeColor = (type: CardType) => {
    switch (type) {
      case CardType.BAC:
        return colors.accent
      case CardType.PAC:
        return colors.primary
      case CardType.VAC:
        return colors.secondary
      case CardType.CAC:
        return colors.warning
      default:
        return colors.primary
    }
  }

  if (userLoading && !user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text, fontFamily: typography.fontFamily.regular }]}>
            Loading your account...
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  if (userError && !user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error, fontFamily: typography.fontFamily.medium }]}>
            Failed to load account data
          </Text>
          <Button title="Try Again" onPress={loadAccountData} variant="primary" style={styles.retryButton} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + 20 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text
            style={[
              styles.headerTitle,
              {
                color: colors.text,
                fontFamily: typography.fontFamily.bold,
                fontSize: typography.fontSize.xxl,
              },
            ]}
          >
            Account
          </Text>
          <TouchableOpacity onPress={handleEditProfile}>
            <Ionicons name="settings-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View style={[styles.profileSection, { backgroundColor: colors.card }]}>
          <View style={styles.profileHeader}>
            <Avatar
              uri={user?.avatar || "https://randomuser.me/api/portraits/men/32.jpg"}
              size={80}
            />
            <View style={styles.profileInfo}>
              <Text
                style={[
                  styles.userName,
                  {
                    color: colors.text,
                    fontFamily: typography.fontFamily.bold,
                    fontSize: typography.fontSize.xl,
                  },
                ]}
              >
                {user?.firstName} {user?.lastName}
              </Text>
              {user?.nickname && (
                <Text
                  style={[
                    styles.userNickname,
                    {
                      color: colors.textSecondary,
                      fontFamily: typography.fontFamily.regular,
                      fontSize: typography.fontSize.md,
                    },
                  ]}
                >
                  "{user.nickname}"
                </Text>
              )}
              <Text
                style={[
                  styles.userEmail,
                  {
                    color: colors.textSecondary,
                    fontFamily: typography.fontFamily.regular,
                    fontSize: typography.fontSize.sm,
                  },
                ]}
              >
                {user?.email}
              </Text>
            </View>
          </View>

          {/* Subscription Badge */}
          <View style={styles.subscriptionContainer}>
            <View
              style={[
                styles.subscriptionBadge,
                { backgroundColor: getSubscriptionColor(user?.subscriptionPlan || "basic") },
              ]}
            >
              <Ionicons name="star" size={16} color={colors.background} />
              <Text
                style={[
                  styles.subscriptionText,
                  {
                    color: colors.background,
                    fontFamily: typography.fontFamily.medium,
                    fontSize: typography.fontSize.sm,
                  },
                ]}
              >
                {getSubscriptionDisplayName(user?.subscriptionPlan || "basic")} Plan
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View style={[styles.statsSection, { backgroundColor: colors.card }]}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.text,
                fontFamily: typography.fontFamily.bold,
                fontSize: typography.fontSize.lg,
              },
            ]}
          >
            Your Stats
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text
                style={[
                  styles.statValue,
                  {
                    color: colors.primary,
                    fontFamily: typography.fontFamily.bold,
                    fontSize: typography.fontSize.xxl,
                  },
                ]}
              >
                {cardCount}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  {
                    color: colors.textSecondary,
                    fontFamily: typography.fontFamily.regular,
                    fontSize: typography.fontSize.sm,
                  },
                ]}
              >
                Cards
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text
                style={[
                  styles.statValue,
                  {
                    color: colors.secondary,
                    fontFamily: typography.fontFamily.bold,
                    fontSize: typography.fontSize.xxl,
                  },
                ]}
              >
                {connectionCount}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  {
                    color: colors.textSecondary,
                    fontFamily: typography.fontFamily.regular,
                    fontSize: typography.fontSize.sm,
                  },
                ]}
              >
                Connections
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text
                style={[
                  styles.statValue,
                  {
                    color: colors.accent,
                    fontFamily: typography.fontFamily.bold,
                    fontSize: typography.fontSize.xxl,
                  },
                ]}
              >
                {user?.tokenBalance || 0}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  {
                    color: colors.textSecondary,
                    fontFamily: typography.fontFamily.regular,
                    fontSize: typography.fontSize.sm,
                  },
                ]}
              >
                Tokens
              </Text>
            </View>
          </View>
        </View>

        {/* Main Card Section */}
        {mainCard && (
          <View style={[styles.mainCardSection, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: colors.text,
                    fontFamily: typography.fontFamily.bold,
                    fontSize: typography.fontSize.lg,
                  },
                ]}
              >
                Main Card
              </Text>
              <TouchableOpacity onPress={handleViewCards}>
                <Text
                  style={[
                    styles.sectionAction,
                    {
                      color: colors.primary,
                      fontFamily: typography.fontFamily.medium,
                      fontSize: typography.fontSize.sm,
                    },
                  ]}
                >
                  View All
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.mainCard, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={() => navigation.navigate("CardDetail", { cardId: mainCard.id })}
            >
              <View style={styles.mainCardHeader}>
                <View style={styles.mainCardTitleContainer}>
                  <Text
                    style={[
                      styles.mainCardName,
                      {
                        color: colors.text,
                        fontFamily: typography.fontFamily.bold,
                        fontSize: typography.fontSize.md,
                      },
                    ]}
                  >
                    {mainCard.name}
                  </Text>
                  {mainCard.nickname && (
                    <Text
                      style={[
                        styles.mainCardNickname,
                        {
                          color: colors.textSecondary,
                          fontFamily: typography.fontFamily.regular,
                          fontSize: typography.fontSize.sm,
                        },
                      ]}
                    >
                      "{mainCard.nickname}"
                    </Text>
                  )}
                </View>
                <View style={[styles.mainCardBadge, { backgroundColor: colors.primary }]}>
                  <Text
                    style={[
                      styles.mainCardBadgeText,
                      {
                        color: colors.background,
                        fontFamily: typography.fontFamily.medium,
                        fontSize: typography.fontSize.xs,
                      },
                    ]}
                  >
                    MAIN
                  </Text>
                </View>
              </View>

              <View style={styles.cardMetaContainer}>
                <View style={[styles.cardTypeBadge, { backgroundColor: getCardTypeColor(mainCard.type as CardType) }]}>
                  <Text
                    style={[
                      styles.cardTypeBadgeText,
                      {
                        color: colors.background,
                        fontFamily: typography.fontFamily.medium,
                        fontSize: typography.fontSize.xs,
                      },
                    ]}
                  >
                    {getCardTypeDisplay(mainCard.type as CardType)}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.cardCategoryText,
                    {
                      color: colors.textSecondary,
                      fontFamily: typography.fontFamily.regular,
                      fontSize: typography.fontSize.xs,
                    },
                  ]}
                >
                  {getCardCategoryDisplay(mainCard.category as CardCategory)}
                </Text>
              </View>

              {mainCard.bio && (
                <Text
                  style={[
                    styles.mainCardBio,
                    {
                      color: colors.textSecondary,
                      fontFamily: typography.fontFamily.regular,
                      fontSize: typography.fontSize.sm,
                    },
                  ]}
                  numberOfLines={2}
                >
                  {mainCard.bio}
                </Text>
              )}

              {/* Contact info preview */}
              <View style={styles.contactInfoContainer}>
                {mainCard.email && (
                  <View style={styles.contactItem}>
                    <Ionicons name="mail-outline" size={14} color={colors.textSecondary} />
                    <Text
                      style={[
                        styles.contactText,
                        {
                          color: colors.textSecondary,
                          fontFamily: typography.fontFamily.regular,
                          fontSize: typography.fontSize.xs,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {mainCard.email}
                    </Text>
                  </View>
                )}

                {mainCard.phone && (
                  <View style={styles.contactItem}>
                    <Ionicons name="call-outline" size={14} color={colors.textSecondary} />
                    <Text
                      style={[
                        styles.contactText,
                        {
                          color: colors.textSecondary,
                          fontFamily: typography.fontFamily.regular,
                          fontSize: typography.fontSize.xs,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {mainCard.phone}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions */}
        <View style={[styles.actionsSection, { backgroundColor: colors.card }]}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.text,
                fontFamily: typography.fontFamily.bold,
                fontSize: typography.fontSize.lg,
              },
            ]}
          >
            Quick Actions
          </Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={handleEditProfile}
            >
              <Ionicons name="person-outline" size={24} color={colors.primary} />
              <Text
                style={[
                  styles.actionButtonText,
                  {
                    color: colors.text,
                    fontFamily: typography.fontFamily.medium,
                    fontSize: typography.fontSize.sm,
                  },
                ]}
              >
                Edit Profile
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={handleCreateCard}
            >
              <Ionicons name="add-circle-outline" size={24} color={colors.secondary} />
              <Text
                style={[
                  styles.actionButtonText,
                  {
                    color: colors.text,
                    fontFamily: typography.fontFamily.medium,
                    fontSize: typography.fontSize.sm,
                  },
                ]}
              >
                Create Card
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={handleViewCards}
            >
              <Ionicons name="layers-outline" size={24} color={colors.accent} />
              <Text
                style={[
                  styles.actionButtonText,
                  {
                    color: colors.text,
                    fontFamily: typography.fontFamily.medium,
                    fontSize: typography.fontSize.sm,
                  },
                ]}
              >
                My Cards
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={handleUpgradeSubscription}
            >
              <Ionicons name="star-outline" size={24} color={colors.warning} />
              <Text
                style={[
                  styles.actionButtonText,
                  {
                    color: colors.text,
                    fontFamily: typography.fontFamily.medium,
                    fontSize: typography.fontSize.sm,
                  },
                ]}
              >
                Upgrade Plan
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  retryButton: {
    minWidth: 120,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {},
  profileSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    columnGap: 16,
  },
  avatar: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    marginBottom: 4,
  },
  userNickname: {
    marginBottom: 4,
  },
  userEmail: {},
  subscriptionContainer: {
    alignItems: "flex-start",
  },
  subscriptionBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  subscriptionText: {
    marginLeft: 4,
  },
  statsSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    marginBottom: 4,
  },
  statLabel: {},
  mainCardSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionAction: {},
  mainCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  mainCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  mainCardTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  mainCardName: {
    marginBottom: 4,
  },
  mainCardNickname: {
    marginBottom: 4,
  },
  mainCardBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mainCardBadgeText: {},
  mainCardBio: {
    marginTop: 8,
    marginBottom: 12,
  },
  cardMetaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  cardTypeBadgeText: {},
  cardCategoryText: {},
  contactInfoContainer: {
    marginTop: 8,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  contactText: {
    marginLeft: 6,
  },
  actionsSection: {
    borderRadius: 16,
    padding: 20,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionButton: {
    width: "48%",
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  actionButtonText: {
    marginTop: 8,
    textAlign: "center",
  },
})

export default AccountScreen
