"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "../../hooks/useTheme"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "../../store"
import { fetchCards } from "../../store/slices/cardsSlice"
import { toggleMainCard } from "../../store/slices/cardsSlice"
import type { Card } from "../../services/cardService"
import { useTabBarHeight } from "../../hooks/useTabBarHeight"

const SetMainCardScreen = () => {
  const navigation = useNavigation()
  const { colors, typography } = useTheme()
  const dispatch = useDispatch<AppDispatch>()
  const { cards, loading } = useSelector((state: RootState) => state.cards)
  const tabBarHeight = useTabBarHeight()
  const [settingMain, setSettingMain] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchCards())
  }, [dispatch])

  const getCardTypeColor = (type: Card["type"]) => {
    switch (type) {
      case "BAC":
        return "#4CD964"
      case "PAC":
        return "#FFCC4D"
      case "VAC":
        return "#FF6347"
      case "CAC":
        return "#5AC8FA"
      default:
        return colors.secondary
    }
  }

  const handleSetMainCard = async (card: Card) => {
    setSettingMain(card.id)
    try {
      console.log(`Setting card ${card.id} as main card`)
      await dispatch(toggleMainCard(card.id)).unwrap()
      Alert.alert("Success", `${card.name} has been set as your main card!`, [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ])
    } catch (error: any) {
      console.error("Error setting main card:", error)
      Alert.alert("Error", error.message || "Failed to set main card. Please try again.")
    } finally {
      setSettingMain(null)
    }
  }

  const renderCard = (card: Card) => {
    const isCurrentMain = card.isMainCard
    const isLoading = settingMain === card.id

    return (
      <TouchableOpacity
        key={card.id}
        style={[
          styles.cardContainer,
          {
            backgroundColor: colors.card,
            borderColor: isCurrentMain ? colors.primary : "transparent",
            borderWidth: isCurrentMain ? 2 : 0,
          },
        ]}
        onPress={() => handleSetMainCard(card)}
        activeOpacity={0.7}
        disabled={isLoading || isCurrentMain}
      >
        <View style={[styles.cardTypeBadge, { backgroundColor: getCardTypeColor(card.type) }]}>
          <Text style={styles.cardTypeText}>{card.type}</Text>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardInfo}>
            <Text style={[styles.cardName, { color: colors.text }]}>{card.name}</Text>
            <Text style={[styles.cardNickname, { color: colors.textSecondary }]}>{card.nickname}</Text>
            {card.email && <Text style={[styles.cardDetail, { color: colors.textSecondary }]}>{card.email}</Text>}
            {card.phone && <Text style={[styles.cardDetail, { color: colors.textSecondary }]}>{card.phone}</Text>}
          </View>

          <View style={styles.cardActions}>
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : isCurrentMain ? (
              <View style={[styles.mainBadge, { backgroundColor: colors.primary }]}>
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                <Text style={styles.mainBadgeText}>MAIN</Text>
              </View>
            ) : (
              <Ionicons name="radio-button-off" size={24} color={colors.textSecondary} />
            )}
          </View>
        </View>

        {card.isPrime && (
          <View style={styles.primeBadge}>
            <Text style={styles.primeText}>PRIME</Text>
          </View>
        )}
      </TouchableOpacity>
    )
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
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
            Set Main Card
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading cards...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
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
          Set Main Card
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Select a card to set as your main card. This will be used for sharing and connections.
        </Text>

        {cards.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="card-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No cards found</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Create your first card to get started
            </Text>
          </View>
        ) : (
          <View style={styles.cardsContainer}>{cards.map(renderCard)}</View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  cardsContainer: {
    gap: 16,
  },
  cardContainer: {
    borderRadius: 12,
    padding: 16,
    position: "relative",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTypeBadge: {
    position: "absolute",
    left: 0,
    top: 0,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderTopLeftRadius: 12,
    borderBottomRightRadius: 12,
    zIndex: 1,
  },
  cardTypeText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardNickname: {
    fontSize: 16,
    marginBottom: 4,
  },
  cardDetail: {
    fontSize: 14,
    marginBottom: 2,
  },
  cardActions: {
    padding: 8,
    alignItems: "center",
  },
  mainBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mainBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  primeBadge: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 24,
    backgroundColor: "#FFCC4D",
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  primeText: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 12,
    transform: [{ rotate: "90deg" }],
    width: 60,
    textAlign: "center",
  },
})

export default SetMainCardScreen
