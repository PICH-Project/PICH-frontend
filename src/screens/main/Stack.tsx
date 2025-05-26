"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Image,
  SectionList,
  StatusBar,
  Alert,
  Modal,
  Animated,
  Dimensions,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { StackParamList } from "@/navigation/types"
import { useTheme } from "../../hooks/useTheme"
import { useSelector, useDispatch } from "react-redux"
import { useTabBarHeight } from "../../hooks/useTabBarHeight"
import type { RootState, AppDispatch } from "../../store"
import { fetchCards, deleteCard } from "../../store/slices/cardsSlice"
import type { Card } from "../../services/cardService"

interface CardGroup {
  title: string
  data: Card[]
}

interface ActionMenuProps {
  visible: boolean
  card: Card | null
  position: { x: number; y: number }
  onClose: () => void
  onDelete: (card: Card) => void
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

type StackNav = NativeStackNavigationProp<StackParamList>

const ActionMenu = ({ visible, card, position, onClose, onDelete }: ActionMenuProps) => {
  const { colors } = useTheme()
  const fadeAnim = new Animated.Value(0)
  const scaleAnim = new Animated.Value(0.8)

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [visible])

  if (!visible || !card) return null

  const menuWidth = 200
  const menuHeight = 60 // Height for one action, will expand as we add more

  // Calculate position to keep menu on screen
  let menuX = position.x
  let menuY = position.y

  // Adjust horizontal position if menu would go off screen
  if (menuX + menuWidth > screenWidth - 20) {
    menuX = screenWidth - menuWidth - 20
  }
  if (menuX < 20) {
    menuX = 20
  }

  // Adjust vertical position if menu would go off screen
  if (menuY + menuHeight > screenHeight - 100) {
    menuY = position.y - menuHeight - 20
  }

  const actions = [
    {
      id: "delete",
      title: "Delete",
      icon: "trash-outline",
      color: "#FF6347",
      onPress: () => {
        onClose()
        onDelete(card)
      },
    },
    // Future actions can be added here
    // {
    //   id: "edit",
    //   title: "Edit",
    //   icon: "pencil-outline",
    //   color: "#007AFF",
    //   onPress: () => {
    //     onClose()
    //     // Handle edit
    //   },
    // },
  ]

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <Animated.View
          style={[
            styles.actionMenu,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              left: menuX,
              top: menuY,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.menuHeader}>
            <Text style={[styles.menuTitle, { color: colors.text }]} numberOfLines={1}>
              {card.name}
            </Text>
          </View>
          {actions.map((action, index) => (
            <TouchableOpacity
              key={action.id}
              style={[
                styles.actionItem,
                index === actions.length - 1 && styles.lastActionItem,
                { borderBottomColor: colors.border },
              ]}
              onPress={action.onPress}
              activeOpacity={0.7}
            >
              <Ionicons name={action.icon as any} size={20} color={action.color} />
              <Text style={[styles.actionText, { color: action.color }]}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  )
}

const StackScreen = () => {
  const navigation = useNavigation()
  const stackNavigation = useNavigation<StackNav>()
  const { colors } = useTheme()
  const dispatch = useDispatch<AppDispatch>()
  const { cards, loading } = useSelector((state: RootState) => state.cards)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredCards, setFilteredCards] = useState<CardGroup[]>([])
  const [isFolderEnabled, setIsFolderEnabled] = useState(false)
  const [isStarEnabled, setIsStarEnabled] = useState(false)
  const [starredCards, setStarredCards] = useState<string[]>([]) // IDs of starred cards
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null)
  const [actionMenuVisible, setActionMenuVisible] = useState(false)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const tabBarHeight = useTabBarHeight()

  useEffect(() => {
    dispatch(fetchCards())
  }, [dispatch])

  // For demo purposes, let's mark some cards as starred
  useEffect(() => {
    if (cards.length > 0) {
      // Mark cards with isPrime as starred for demo
      const starred = cards.filter((card) => card.isPrime).map((card) => card.id)
      setStarredCards(starred)
    }
  }, [cards])

  useEffect(() => {
    // Filter and group cards based on search query and button states
    const query = searchQuery.toLowerCase()
    const filtered: CardGroup[] = []
    let filteredCards = [...cards]

    // Apply search filter if query exists
    if (query) {
      filteredCards = filteredCards.filter(
        (card) => card.name.toLowerCase().includes(query) || card.nickname.toLowerCase().includes(query),
      )
    }

    // Apply star filter if enabled
    if (isStarEnabled) {
      filteredCards = filteredCards.filter((card) => starredCards.includes(card.id))
    }

    // Group by category if folder is enabled, otherwise show in a single section
    if (isFolderEnabled) {
      // Group by category
      const categories = filteredCards.reduce(
        (acc, card) => {
          const category = card.category || "OTHER"
          if (!acc[category]) {
            acc[category] = []
          }
          acc[category].push(card)
          return acc
        },
        {} as Record<string, Card[]>,
      )

      // Convert to section list format
      Object.entries(categories).forEach(([category, cards]) => {
        if (cards.length > 0) {
          filtered.push({ title: category, data: cards })
        }
      })
    } else {
      // Single section with all filtered cards
      if (filteredCards.length > 0) {
        filtered.push({ title: "ALL CARDS", data: filteredCards })
      }
    }

    setFilteredCards(filtered)
  }, [cards, searchQuery, isFolderEnabled, isStarEnabled, starredCards])

  const getCardTypeColor = (type: Card["type"]) => {
    switch (type) {
      case "BAC":
        return "#4CD964" // Green
      case "PAC":
        return "#FFCC4D" // Yellow
      case "VAC":
        return "#FF6347" // Red
      case "CAC":
        return "#5AC8FA" // Blue
      default:
        return colors.secondary
    }
  }

  const handleCardPress = (cardId: string) => {
    stackNavigation.navigate("CardDetail", { cardId })
  }

  const handleCall = (id: string, event: any) => {
    // Stop the event from bubbling up to the card press handler
    event.stopPropagation()
    console.log("Call card:", id)
    // Implement call functionality
  }

  const navigateToActions = () => {
    // Now we can use the stack navigation directly since Actions is part of the Stack navigator
    stackNavigation.navigate("Actions", { cardId: "" })
  }

  const toggleFolderButton = () => {
    setIsFolderEnabled(!isFolderEnabled)
    if (!isFolderEnabled) {
      // If enabling folder, disable star
      setIsStarEnabled(false)
    }
  }

  const toggleStarButton = () => {
    setIsStarEnabled(!isStarEnabled)
    if (!isStarEnabled) {
      // If enabling star, disable folder
      setIsFolderEnabled(false)
    }
  }

  const showActionMenu = (card: Card, event: any) => {
    const { pageX, pageY } = event.nativeEvent
    setSelectedCard(card)
    setMenuPosition({ x: pageX, y: pageY })
    setActionMenuVisible(true)
  }

  const hideActionMenu = () => {
    setActionMenuVisible(false)
    setSelectedCard(null)
  }

  const confirmDeleteCard = (card: Card) => {
    Alert.alert(
      "Delete Card",
      `Are you sure you want to delete "${card.name}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDeleteCard(card.id),
        },
      ],
      { cancelable: true },
    )
  }

  const handleDeleteCard = async (cardId: string) => {
    setDeletingCardId(cardId)
    try {
      console.log(`Deleting card with ID: ${cardId}`)
      await dispatch(deleteCard(cardId)).unwrap()
      console.log("Card deleted successfully")
      Alert.alert("Success", "Card deleted successfully")
    } catch (error: any) {
      console.error("Error deleting card:", error)
      const errorMessage = error.message || "Failed to delete card. Please try again."
      Alert.alert("Error", errorMessage)
    } finally {
      setDeletingCardId(null)
    }
  }

  const handleCardLongPress = (card: Card, event: any) => {
    console.log(`Long press on card: ${card.name}`)
    showActionMenu(card, event)
  }

  const renderCard = ({ item }: { item: Card }) => (
    <TouchableOpacity
      style={[styles.cardOuterContainer, deletingCardId === item.id && styles.cardDeleting]}
      onPress={() => handleCardPress(item.id)}
      onLongPress={(event) => handleCardLongPress(item, event)}
      delayLongPress={500}
      activeOpacity={0.7}
      disabled={deletingCardId === item.id}
    >
      <View style={styles.cardContainer}>
        <View style={[styles.cardTypeBadge, { backgroundColor: getCardTypeColor(item.type) }]}>
          <Text style={styles.cardTypeText}>{item.type}</Text>
        </View>

        <View style={styles.cardContent}>
          <Image
            source={{ uri: item.avatar || "https://randomuser.me/api/portraits/men/32.jpg" }}
            style={[styles.avatar, deletingCardId === item.id && styles.avatarDeleting]}
          />

          <View style={styles.cardInfo}>
            <Text style={[styles.cardName, deletingCardId === item.id && styles.textDeleting]}>{item.name}</Text>
            <Text style={[styles.cardNickname, deletingCardId === item.id && styles.textDeleting]}>
              {item.nickname}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.callButton}
            onPress={(event) => handleCall(item.id, event)}
            disabled={deletingCardId === item.id}
          >
            <Ionicons name="call-outline" size={24} color="#000000" />
          </TouchableOpacity>
        </View>

        {item.isPrime && (
          <View style={styles.primeBadge}>
            <Text style={styles.primeText}>PRIME</Text>
          </View>
        )}

        {deletingCardId === item.id && (
          <View style={styles.deletingOverlay}>
            <Text style={styles.deletingText}>Deleting...</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )

  const renderSectionHeader = ({ section }: { section: CardGroup }) => (
    <Text style={styles.sectionTitle}>{section.title}</Text>
  )

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#FFFFFF" }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Stack</Text>
          <TouchableOpacity style={styles.menuButton} onPress={navigateToActions}>
            <Ionicons name="menu" size={24} color="#000000" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={20} color="#888888" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#888888"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.micButton}>
              <Ionicons name="mic-outline" size={20} color="#888888" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.folderButton, isFolderEnabled && styles.buttonEnabled]}
            onPress={toggleFolderButton}
          >
            <Ionicons name="folder-outline" size={24} color={isFolderEnabled ? "#000000" : "#888888"} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.starButton, isStarEnabled && styles.buttonEnabled]}
            onPress={toggleStarButton}
          >
            <Ionicons name="star" size={24} color={isStarEnabled ? "#000000" : "#FFCC4D"} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading cards...</Text>
        </View>
      ) : (
        <SectionList
          sections={filteredCards}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={[styles.listContent, { paddingBottom: tabBarHeight }]}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      )}

      <ActionMenu
        visible={actionMenuVisible}
        card={selectedCard}
        position={menuPosition}
        onClose={hideActionMenu}
        onDelete={confirmDeleteCard}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    paddingBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000000",
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    backgroundColor: "#F5F5F5",
    borderRadius: 24,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#000000",
  },
  micButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  folderButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  starButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  buttonEnabled: {
    backgroundColor: "#FFCC4D",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#888888",
    marginBottom: 8,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  cardOuterContainer: {
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardDeleting: {
    opacity: 0.6,
  },
  cardContainer: {
    position: "relative",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    minHeight: 80,
    overflow: "hidden", // This ensures the badge doesn't overflow the card's border radius
  },
  cardTypeBadge: {
    position: "absolute",
    left: 0,
    top: 0,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderTopLeftRadius: 12, // Match the card's top-left border radius
    borderBottomRightRadius: 12, // Only round the bottom-right corner
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
    padding: 16,
    minHeight: 80, // Ensure consistent height for all cards
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarDeleting: {
    opacity: 0.5,
  },
  cardInfo: {
    flex: 1,
    marginLeft: 16,
  },
  cardName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
  },
  cardNickname: {
    fontSize: 16,
    color: "#888888",
  },
  textDeleting: {
    opacity: 0.5,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
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
    width: 60, // Increased width to ensure text fits properly when rotated
    textAlign: "center", // Center the text
  },
  deletingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  deletingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6347",
  },
  // Action Menu Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  actionMenu: {
    position: "absolute",
    minWidth: 200,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  lastActionItem: {
    borderBottomWidth: 0,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 12,
  },
})

export default StackScreen
