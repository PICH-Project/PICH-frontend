"use client"

import { useState, useEffect, useMemo } from "react"
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
  StyleProp,
  ViewStyle,
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
import { useSafeAreaInsets } from "react-native-safe-area-context"
import donationsService, { type CharityCard } from "../../services/donationsService"
import { resolveNameFont } from "../../constants/cardCustomization"
import AvatarFrameWrapper from "../../components/cards/AvatarFrameWrapper"
import { DEFAULT_AVATAR_URL } from "../../constants/assets"

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
  const connectedCards = useSelector((state: RootState) => state.connections.connectedCards)
  /**
   * Toggle режиму:
   *  - 'mine'      — мої власні картки
   *  - 'connected' — чужі додані через scan
   *  - 'donate'    — hardcoded BAC charity-картки з /donations/charities
   */
  const [mode, setMode] = useState<"mine" | "connected" | "donate">("mine")
  const [charities, setCharities] = useState<CharityCard[]>([])
  const [charitiesLoading, setCharitiesLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredCards, setFilteredCards] = useState<CardGroup[]>([])
  const [isFolderEnabled, setIsFolderEnabled] = useState(false)
  const [isFilterEnabled, setIsFilterEnabled] = useState(false)
  const [isStarEnabled, setIsStarEnabled] = useState(false)
  const [starredCards, setStarredCards] = useState<string[]>([]) // IDs of starred cards
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null)
  const [actionMenuVisible, setActionMenuVisible] = useState(false)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const tabBarHeight = useTabBarHeight()
  const insets = useSafeAreaInsets()

  /**
   * Адаптуємо CharityCard → Card-like форму щоб переюзати існуючий
   * `renderCard`. useMemo обов'язковий — без нього новий array reference
   * щорендеру триггерить useEffect зі starredCards в нескінченний цикл.
   */
  const charityAsCards: Card[] = useMemo(
    () =>
      charities.map(
        (c) =>
          ({
            id: c.id,
            type: c.type,
            name: c.companyName,
            nickname: c.contactPerson,
            avatar: c.logoUrl,
            bio: c.slogan,
            phones: [],
            socialLinks: {},
            isMainCard: false,
            isPrime: false,
            isCharity: true,
            userId: "",
            createdAt: "",
            updatedAt: "",
            notes: {},
            category: "CHARITY",
          }) as unknown as Card,
      ),
    [charities],
  )

  /** Картки, які зараз показуємо — залежить від обраної таби. */
  const sourceCards = useMemo(
    () =>
      mode === "mine"
        ? cards
        : mode === "connected"
          ? connectedCards
          : charityAsCards,
    [mode, cards, connectedCards, charityAsCards],
  )

  useEffect(() => {
    dispatch(fetchCards())
  }, [dispatch])

  // Тягнемо charity-картки коли перший раз заходимо на таб 'donate'.
  useEffect(() => {
    if (mode === "donate" && charities.length === 0 && !charitiesLoading) {
      setCharitiesLoading(true)
      donationsService
        .getCharities()
        .then((data) => setCharities(data))
        .catch((err) => {
          console.error("Failed to fetch charities:", err)
          Alert.alert("Error", "Couldn't load charity list. Pull to refresh.")
        })
        .finally(() => setCharitiesLoading(false))
    }
  }, [mode, charities.length, charitiesLoading])

  // For demo purposes, let's mark some cards as starred
  useEffect(() => {
    if (sourceCards.length > 0) {
      // Mark cards with isPrime as starred for demo
      const starred = sourceCards.filter((card) => card.isPrime).map((card) => card.id)
      setStarredCards(starred)
    }
  }, [sourceCards])

  useEffect(() => {
    // Filter and group cards based on search query and button states
    const query = searchQuery.toLowerCase()
    const filtered: CardGroup[] = []
    let filteredCards = [...sourceCards]

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
        const baseTitle =
          mode === "mine"
            ? "ALL CARDS"
            : mode === "connected"
              ? "CONNECTED CARDS"
              : "CHARITY ORGANIZATIONS"
        filtered.push({
          title: isStarEnabled ? "SELECTED" : baseTitle,
          data: filteredCards,
        })
      }
    }

    setFilteredCards(filtered)
  }, [sourceCards, searchQuery, isFolderEnabled, isStarEnabled, starredCards])

  const getCardTypeColor = (type: Card["type"]) => {
      switch (type) {
        case "BAC":
          return "#FFBC56"
        case "PAC":
          return "#97F09A"
        case "VIPAC":
          return "#FF6347" // Red
        default:
          return "#A5A1F5"
      }
    }

  const handleCardPress = (cardId: string) => {
    console.log('cardId', cardId);
    // На таб 'donate' тапаємо charity-картку → ведемо на DonateCard screen,
    // передаючи весь charity-об'єкт як param (бо у Card-сторі його нема).
    if (mode === "donate") {
      const charity = charities.find((c) => c.id === cardId)
      if (charity) {
        stackNavigation.navigate("DonateCard", { charity })
        return
      }
    }
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

  const toggleFilterButton = () => {
    setIsFilterEnabled(!isFilterEnabled)
    if (!isFilterEnabled) {
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

  const renderCard = ({ item }: { item: Card }) => {
    // Преміум-кастомізації — null-safe.
    const customNameFont = resolveNameFont((item as any).nameFont)
    const nameFontStyle = customNameFont ? { fontFamily: customNameFont } : null

    // DEBUG: подивитись що приходить у renderCard для кожної картки.
    // TODO: прибрати коли avatar issue зафікситься.
    console.log(`[Stack] render card ${item.id.slice(0, 8)} → avatar=${item.avatar ?? "NULL"}`)

    return (
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
          <Text style={[styles.cardTypeText, item.type === 'PAC' && { color: colors.textPrimary }]}>{item.type}</Text>
        </View>

        <View style={styles.cardContent}>
          <AvatarFrameWrapper frame={(item as any).avatarFrame} size={32}>
            <Image
              source={{ uri: item.avatar || DEFAULT_AVATAR_URL }}
              style={[styles.avatar, deletingCardId === item.id && styles.avatarDeleting]}
              onError={(e) =>
                console.log(`[Stack] Image FAILED for ${item.id.slice(0, 8)}:`, e.nativeEvent.error, "url=", item.avatar)
              }
            />
          </AvatarFrameWrapper>

          <View style={styles.cardInfo}>
            <Text style={[styles.cardName, deletingCardId === item.id && styles.textDeleting, nameFontStyle]}>{item.name}</Text>
            <Text style={[styles.cardNickname, deletingCardId === item.id && styles.textDeleting]}>
              {item.nickname}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.callButton}
            onPress={(event) => handleCall(item.id, event)}
            disabled={deletingCardId === item.id}
          >
            <Ionicons name="call" size={24} color="#000000" />
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
  }

  const renderSectionHeader = ({ section }: { section: CardGroup }) => (
    <Text style={styles.sectionTitle}>{section.title}</Text>
  )

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />

      <View style={[styles.headerContainer, { paddingTop: insets.top + 15 }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Stack</Text>
          <TouchableOpacity style={styles.menuButton} onPress={navigateToActions}>
            <Ionicons name="menu" size={24} color="#000000" />
          </TouchableOpacity>
        </View>

        {/* Toggle: My Cards / Connected (segmented chip) */}
        <View style={styles.modeToggleContainer}>
          <TouchableOpacity
            style={[
              styles.modeToggleChip,
              mode === "mine" && styles.modeToggleChipActive,
            ]}
            onPress={() => setMode("mine")}
          >
            <Text
              style={[
                styles.modeToggleText,
                mode === "mine" && styles.modeToggleTextActive,
              ]}
            >
              My Cards
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeToggleChip,
              mode === "connected" && styles.modeToggleChipActive,
            ]}
            onPress={() => setMode("connected")}
          >
            <Text
              style={[
                styles.modeToggleText,
                mode === "connected" && styles.modeToggleTextActive,
              ]}
            >
              Connected{connectedCards.length > 0 ? ` (${connectedCards.length})` : ""}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeToggleChip,
              mode === "donate" && styles.modeToggleChipActive,
            ]}
            onPress={() => setMode("donate")}
          >
            <Text
              style={[
                styles.modeToggleText,
                mode === "donate" && styles.modeToggleTextActive,
              ]}
            >
              Donate
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={20} color="#CDCDCD" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#888888"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.micButton}>
              <Ionicons name="mic" size={24} color="#CDCDCD" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.folderButton, isFilterEnabled && styles.buttonEnabled]}
            onPress={toggleFilterButton}
          >
            <Ionicons name="funnel" size={24} color={isFilterEnabled ? "#000000" : "#CDCDCD"} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.folderButton, isFolderEnabled && styles.buttonEnabled]}
            onPress={toggleFolderButton}
          >
            <Ionicons name="folder" size={24} color={isFolderEnabled ? "#000000" : "#CDCDCD"} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.starButton, isStarEnabled && styles.buttonEnabled]}
            onPress={toggleStarButton}
          >
            <Ionicons name="star" size={24} color={isStarEnabled ? "#000000" : "#CDCDCD"} />
            {/* <StarIcon style={{ color: 'white', }} /> */}
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
    paddingBottom: 12,
  },
  title: {
    fontSize: 25,
    fontWeight: "medium",
    color: "#000000",
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  modeToggleContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  modeToggleChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DEDDD1",
    backgroundColor: "transparent",
  },
  modeToggleChipActive: {
    backgroundColor: "#27261F",
    borderColor: "#27261F",
  },
  modeToggleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#56554E",
  },
  modeToggleTextActive: {
    color: "#FFFFFF",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
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
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  folderButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  starButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
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
    minHeight: 60,
    overflow: "hidden", // This ensures the badge doesn't overflow the card's border radius
  },
  cardTypeBadge: {
    position: "absolute",
    left: 0,
    top: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopLeftRadius: 12, // Match the card's top-left border radius
    borderBottomRightRadius: 12, // Only round the bottom-right corner
    zIndex: 1,
  },
  cardTypeText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 11,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 28,
    minHeight: 80, // Ensure consistent height for all cards
  },
  avatar: {
    width: 32,
    height: 32,
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
