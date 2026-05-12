"use client"
import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
  Linking,
  StatusBar,
  ScrollView,
  Alert,
  Modal,
  Easing,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useTheme } from "../../hooks/useTheme"
import { useSelector, useDispatch } from "react-redux"
import { useTabBarHeight } from "../../hooks/useTabBarHeight"
import type { AppDispatch, RootState } from "../../store"
import { fetchCards, togglePrimeStatus } from "../../store/slices/cardsSlice"
import {
  fetchConnectedCards,
  toggleFavorite as toggleConnectionFavorite,
  deleteConnection,
  updateNotes as updateConnectionNotes,
} from "../../store/slices/connectionsSlice"
import { fetchCardQRCode } from "../../services/qrService"
import type { Card } from "../../store/slices/cardsSlice"
import Avatar from "@/components/common/Avatar"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { selectHasPremiumPerks } from "@/store/slices/subscriptionsSlice"
import { VIPAC_THEME } from "@/constants/cards"
import { resolveNameFont } from "@/constants/cardCustomization"
import AvatarFrameWrapper from "@/components/cards/AvatarFrameWrapper"
import { DEFAULT_AVATAR_URL } from "@/constants/assets"
import {
  CrownIcon,
  TelegramIcon,
  ViberIcon,
  LinkedInIcon,
  FacebookIcon,
  WhatsAppIcon,
  TwitterIcon,
  PaletteIcon,
  PaletteFilledIcon,
  SettingsIcon,
} from "@/components/icons"

type RouteParams = {
  cardId: string
}

const { width, height } = Dimensions.get("window")
const CARD_WIDTH = width * 0.9
const CARD_MARGIN = width * 0.05
const CARD_VERTICAL_OFFSET = 20 // How much of the back card is visible from bottom
const FRONT_CARD_POSITION = -20 // Position the front card higher up (negative value)
const BACK_CARD_POSITION = CARD_VERTICAL_OFFSET // Position the back card lower
const BACK_CARD_SCALE = 0.95 // Scale factor for the back card
const HEADER_HEIGHT = 80 // Approximate height of the header container

const CardDetail = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { cardId } = route.params as RouteParams
  const { colors } = useTheme()
  const [showFront, setShowFront] = useState(true)
  const tabBarHeight = useTabBarHeight()
  const insets = useSafeAreaInsets()
  const dispatch = useDispatch<AppDispatch>()
  const [cardHeight, setCardHeight] = useState(height * 0.6)
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [showQrModal, setShowQrModal] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [qrLoading, setQrLoading] = useState(false)

  // Перки власника картки (Premium ADDON або VIP).
  // Своя картка — беремо мою підписку.
  // Чужа картка — VIPAC однозначно означає що власник на VIP-плані → золота корона.
  // Для чужих не-VIPAC поки гадати не можемо (бек не віддає subscription власника),
  // тому залишаємо сіру корону. Коли бек добавить — підкорегуємо тут.
  const myHasPerks = useSelector(selectHasPremiumPerks)
  const ownerHasPerks =
    card && (isMine ? myHasPerks : card.type === "VIPAC")
  const hasPerks = !!ownerHasPerks // alias для існуючих перевірок далі по файлу
  const crownColor = ownerHasPerks ? "#FFD700" : "#71706A"

  // Animation values for position and scale
  const frontPosition = useRef(new Animated.Value(FRONT_CARD_POSITION)).current
  const backPosition = useRef(new Animated.Value(BACK_CARD_POSITION)).current
  const frontScale = useRef(new Animated.Value(1)).current
  const backScale = useRef(new Animated.Value(BACK_CARD_SCALE)).current

  const slideAnimation = useRef(new Animated.Value(0)).current

  // Шукаємо картку і у своїх (state.cards.cards), і у чужих (state.connections.connectedCards).
  // Чужі = ті що додав через scan. Detail-екран повинен працювати з обома.
  const card: Card = useSelector((state: RootState) => {
    const all = [...state.cards.cards, ...state.connections.connectedCards]
    if (cardId) return all.find((c) => c.id === cardId) as Card
    return state.cards.cards[0] as Card
  })

  /** Своя ця картка чи додана через scan. */
  const isMine = useSelector((state: RootState) =>
    card ? state.cards.cards.some((c) => c.id === card.id) : false,
  )

  /** Connection-запис між моєю картою і чужою (потрібен для favorite/notes/delete). */
  const connection = useSelector((state: RootState) =>
    !isMine && card
      ? state.connections.connections.find(
          (c) => c.card1Id === card.id || c.card2Id === card.id,
        )
      : undefined,
  )

  // VIPAC має чорно-золотисту тему. Все інше (PAC/BAC) — світла дефолтна.
  const isVipac = card?.type === "VIPAC"
  const T = VIPAC_THEME

  // Кастомний шрифт name (Premium-фіча). null = system default.
  const customNameFont = resolveNameFont(card?.nameFont)
  const nameFontStyle = customNameFont ? { fontFamily: customNameFont } : null

  // Calculate the optimal card height based on available space
  useEffect(() => {
    // Calculate available space between header and tab bar
    const availableHeight = height - HEADER_HEIGHT - tabBarHeight - 40 // 40px for additional padding
    // Set card height to fit within available space
    setCardHeight(Math.min(availableHeight * 0.93, height * 0.63)) // Use 90% of available space for cards, but cap at original height
  }, [height, tabBarHeight])

  const translateX = useRef(new Animated.Value(0)).current;

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

  const handleCall = () => {
    if (!!card.phones?.length) {
      if (card.phones?.length === 1) {
        Linking.openURL(`tel:${card.phones[0]}`)
      } else {
        setShowPhoneModal(true)
      }
    }
  }

  const handlePhoneSelect = (phoneNumber: string) => {
    setShowPhoneModal(false)
    Linking.openURL(`tel:${phoneNumber}`)
  }

  // ---------------------------------------------------------------------------
  //  Bottom-actions handlers (Phase 2)
  // ---------------------------------------------------------------------------

  /** Перевантажити дані картки (для своїх — fetchCards, для чужих — connectedCards). */
  const handleRefresh = () => {
    if (isMine) dispatch(fetchCards())
    else dispatch(fetchConnectedCards())
  }

  /** Відкрити QR-модалку (тільки для своїх — інакше нема сенсу). */
  const handleShowQr = async () => {
    if (!card) return
    setShowQrModal(true)
    setQrCode(null)
    setQrLoading(true)
    try {
      const data = await fetchCardQRCode(card.id)
      setQrCode(data)
    } catch {
      Alert.alert("Error", "Failed to load QR code.")
      setShowQrModal(false)
    } finally {
      setQrLoading(false)
    }
  }

  /** Toggle prime-status для своєї картки. */
  const handleTogglePrime = async () => {
    if (!card) return
    try {
      await dispatch(togglePrimeStatus(card.id)).unwrap()
    } catch (err: any) {
      Alert.alert("Error", err?.toString?.() ?? "Failed to update card")
    }
  }

  /** Toggle favorite для чужої картки (через connection). */
  const handleToggleConnectionFavorite = async () => {
    if (!connection) {
      Alert.alert("Error", "Connection record not found.")
      return
    }
    try {
      await dispatch(toggleConnectionFavorite(connection.id)).unwrap()
    } catch (err: any) {
      Alert.alert("Error", err?.toString?.() ?? "Failed to update favorite")
    }
  }

  /** Видалити чужу картку зі списку контактів (delete connection). */
  const handleRemoveFromContacts = () => {
    if (!connection) return
    Alert.alert(
      "Remove from contacts?",
      "This card will be removed from your connections. You can re-add it by scanning again.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await dispatch(deleteConnection(connection.id)).unwrap()
              dispatch(fetchConnectedCards())
              navigation.goBack()
            } catch (err: any) {
              Alert.alert("Error", err?.toString?.() ?? "Failed to remove")
            }
          },
        },
      ],
    )
  }

  /** Чи є чужа картка у favorites поточного юзера. */
  const isFavorited =
    !!connection &&
    (connection.card1FavoritedCard2 || connection.card2FavoritedCard1)

  const [showVerifiedInfo, setShowVerifiedInfo] = useState(false)
  const verifiedAnimation = useRef(new Animated.Value(0)).current

  const toggleVerifiedInfo = () => {
    const toValue = showVerifiedInfo ? 0 : 1
    setShowVerifiedInfo(!showVerifiedInfo)

    Animated.spring(verifiedAnimation, {
      toValue,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start()
  }

  const verifiedHeight = verifiedAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 255], // From small badge height to full expanded height
  })

  const verifiedOpacity = verifiedAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  })

  const flipCard = () => {
    // Animate the card positions and scales
    if (showFront) {
      // Move front card to the back (down and scaled)
      Animated.parallel([
        Animated.timing(frontPosition, {
          toValue: BACK_CARD_POSITION,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(frontScale, {
          toValue: BACK_CARD_SCALE,
          duration: 300,
          useNativeDriver: true,
        }),
        // Move back card to the front (up and full scale)
        Animated.timing(backPosition, {
          toValue: FRONT_CARD_POSITION,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      // Move back card to the back (down and scaled)
      Animated.parallel([
        Animated.timing(backPosition, {
          toValue: BACK_CARD_POSITION,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backScale, {
          toValue: BACK_CARD_SCALE,
          duration: 300,
          useNativeDriver: true,
        }),
        // Move front card to the front (up and full scale)
        Animated.timing(frontPosition, {
          toValue: FRONT_CARD_POSITION,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(frontScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    }

    setShowFront(!showFront)
  }

  /**
   * Спробувати відкрити нативний app deep-link, якщо не вийшло — fallback на web URL.
   * Якщо і web не відкрився — показати alert.
   */
  const tryOpenLinks = async (appUrl: string, webUrl: string, errorLabel: string) => {
    try {
      const supported = await Linking.canOpenURL(appUrl)
      if (supported) {
        await Linking.openURL(appUrl)
      } else {
        await Linking.openURL(webUrl)
      }
    } catch (error) {
      Alert.alert("Error", `Unable to open ${errorLabel}`)
    }
  }

  /**
   * Відкрити соц-мережу за іменем платформи і значенням з картки.
   * Для phone-based мереж (whatsapp/viber) value — це номер (digits-only).
   * Для username-based (telegram/twitter/instagram/linkedin/facebook) — handle.
   */
  const openSocial = async (network: string) => {
    const value = card?.social?.[network]
    if (!value) return

    const handle = encodeURIComponent(value.replace(/^@/, ""))
    // Для whatsapp/viber беремо тільки цифри (на випадок якщо юзер написав з пробілами/дужками).
    const digits = value.replace(/\D/g, "")

    switch (network) {
      case "telegram": {
        const msg = encodeURIComponent("Hello! I came from the PICH app")
        return tryOpenLinks(
          `tg://resolve?domain=${handle}&text=${msg}`,
          `https://t.me/${handle}?text=${msg}`,
          "Telegram",
        )
      }
      case "instagram":
        return tryOpenLinks(
          `instagram://user?username=${handle}`,
          `https://www.instagram.com/${handle}`,
          "Instagram",
        )
      case "twitter":
        return tryOpenLinks(
          `twitter://user?screen_name=${handle}`,
          `https://x.com/${handle}`,
          "Twitter / X",
        )
      case "linkedin":
        return tryOpenLinks(
          `linkedin://in/${handle}`,
          `https://www.linkedin.com/in/${handle}`,
          "LinkedIn",
        )
      case "facebook":
        return tryOpenLinks(
          `fb://profile/${handle}`,
          `https://www.facebook.com/${handle}`,
          "Facebook",
        )
      case "whatsapp": {
        if (!digits) {
          Alert.alert("Error", "WhatsApp requires a phone number")
          return
        }
        return tryOpenLinks(
          `whatsapp://send?phone=${digits}`,
          `https://wa.me/${digits}`,
          "WhatsApp",
        )
      }
      case "viber": {
        if (!digits) {
          Alert.alert("Error", "Viber requires a phone number")
          return
        }
        return tryOpenLinks(
          `viber://chat?number=%2B${digits}`,
          `https://www.viber.com/`,
          "Viber",
        )
      }
      default:
        Alert.alert("Error", `Unsupported social network: ${network}`)
    }
  }

  // Social media icons with proper colors
  const socialIcons = [
    { social: 'telegram', name: <TelegramIcon />, color: "#DDDDDD", backgroundColor: "#F5F5F5" },
    { social: 'viber', name: <ViberIcon />, color: "#DDDDDD", backgroundColor: "#F5F5F5" },
    { social: 'linkedin', name: <LinkedInIcon />, color: "#DDDDDD", backgroundColor: "#F5F5F5" },
    { social: 'facebook', name: <FacebookIcon />, color: "#DDDDDD", backgroundColor: "#F5F5F5" },
    { social: 'whatsapp', name: <WhatsAppIcon />, color: "#DDDDDD", backgroundColor: "#F5F5F5" },
    { social: 'twitter', name: <TwitterIcon />, color: "#DDDDDD", backgroundColor: "#F5F5F5" },
  ]


  if (!card) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: "#F5F5F7" }]}>
        <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="menu" size={24} color="#000000" />
          </TouchableOpacity>
        </View>
        <View style={styles.centerContent}>
          <Text style={{ color: "#000000", fontSize: 18 }}>Card not found</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />
      {/* Header with shadow */}
      <View style={styles.headerContainer}>
        <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="menu" size={24} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardContainer}>
          {/* Back Card */}
          <Animated.View
            style={[
              styles.card,
              {
                height: cardHeight,
                zIndex: showFront ? 1 : 2,
                transform: [{ translateY: backPosition }, { scale: backScale }],
              },
              isVipac && { backgroundColor: T.cardBg },
            ]}
          >
            {/* Card Type Badge */}
            <View style={[styles.cardTypeBadge, { backgroundColor: getCardTypeColor(card.type) }]}>
              <Text style={[styles.cardTypeText, (card.type === 'PAC' && { color: colors.textPrimary })]}>{card.type}</Text>
            </View>

            {/* Prime Badge if applicable */}
            {!card.isPrime && (
              <View
                style={[
                  styles.primeBadge,
                  // Якщо у власника Premium/VIP — без сірого фону;
                  // інакше — стандартний сірий фон-таблетка.
                  hasPerks
                    ? { backgroundColor: "transparent" }
                    : { backgroundColor: "#F0F0F0" },
                ]}
              >
                <CrownIcon color={crownColor} />
              </View>
            )}

            {/* Back Card Content.
                Для BAC nickname (= company name + name) приховуємо, бо
                у формі для нього немає окремого вводу. */}
            <View style={styles.backCardHeader}>
              <View style={styles.backNameSection}>
                <Text
                  style={[
                    styles.backName,
                    isVipac && { color: T.textPrimary },
                    nameFontStyle,
                  ]}
                >
                  {card.name}
                </Text>
                {card.type !== "BAC" && (
                  <Text style={[styles.backNickname, isVipac && { color: T.textSecondary }]}>
                    {card.nickname}
                  </Text>
                )}
                {card.type === "BAC" && card.contactPerson && (
                  <Text style={[styles.backNickname, isVipac && { color: T.textSecondary }]}>
                    {card.contactPerson}
                  </Text>
                )}
              </View>
            </View>

            {/* Additional Info Sections — рендеримо реальні нотатки з card.notes.
                У режимі перегляду показуємо лише заповнені слоти. */}
            {card.notes &&
              Object.entries(card.notes)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([slot, text]) =>
                  text ? (
                    <View
                      key={slot}
                      style={[
                        styles.infoSection,
                        isVipac && { backgroundColor: T.noteSlotBg },
                      ]}
                    >
                      <Text
                        numberOfLines={2}
                        style={{
                          color: isVipac ? T.noteSlotText : "#333",
                          fontSize: 14,
                          paddingHorizontal: 16,
                          width: "100%",
                          textAlign: "center",
                        }}
                      >
                        {text}
                      </Text>
                    </View>
                  ) : null,
                )}

            {/* Location Section - Updated to match Figma design */}
            <View style={styles.locationSectionColumn}>
              <View style={styles.locationHeaderRow}>
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={isVipac ? T.textPrimary : "#AAAAAA"}
                />
                <Text style={[styles.locationLabel, isVipac && { color: T.textPrimary }]}>
                  Location
                </Text>
                <TouchableOpacity style={styles.locationMenu}>
                  <Ionicons
                    name="ellipsis-vertical"
                    size={20}
                    color={isVipac ? T.textPrimary : "#AAAAAA"}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.locationContentColumn}>
                <Text style={[styles.locationText, isVipac && { color: T.textPrimary }]}>
                  {card.location?.country || "Ukraine"}, {card.location?.city || "Kiev"}
                </Text>
                {/* <Text style={styles.locationText}>
                  {card.location?.address || "Lobanovskogo str. Building 5"}, {card.location?.postalCode || "03156"}
                </Text> */}
              </View>
            </View>

            {/* Verified-смужка декоративна (тільки для VIPAC) */}
            {isVipac && (
              <View
                style={{
                  flexDirection: "row",
                  backgroundColor: T.verifiedStripBg,
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  justifyContent: "space-between",
                  marginTop: 8,
                  marginHorizontal: -16,
                  marginBottom: -16,
                  borderBottomLeftRadius: 16,
                  borderBottomRightRadius: 16,
                }}
              >
                {[0, 1, 2, 3, 4].map((i) => (
                  <Text
                    key={i}
                    style={{
                      color: T.verifiedStripText,
                      fontSize: 10,
                      fontWeight: "600",
                    }}
                  >
                    Verified
                  </Text>
                ))}
              </View>
            )}
          </Animated.View>

          {/* Front Card */}
          <Animated.View
            style={[
              styles.card,
              {
                height: cardHeight,
                zIndex: showFront ? 2 : 1,
                transform: [{ translateY: frontPosition }, { scale: frontScale }],
              },
              isVipac && { backgroundColor: T.cardBg },
            ]}
          >
            {/* Card Type Badge */}
            <View style={[styles.cardTypeBadge, { backgroundColor: getCardTypeColor(card.type) }]}>
              <Text style={[styles.cardTypeText, (card.type === 'PAC' && { color: colors.textPrimary })]}>{card.type}</Text>
            </View>

            {/* Prime Badge if applicable */}
            {!card.isPrime && (
              <View
                style={[
                  styles.primeBadge,
                  // Якщо у власника Premium/VIP — без сірого фону;
                  // інакше — стандартний сірий фон-таблетка.
                  hasPerks
                    ? { backgroundColor: "transparent" }
                    : { backgroundColor: "#F0F0F0" },
                ]}
              >
                <CrownIcon color={crownColor} />
              </View>
            )}

            {/* Profile Section */}
            <View style={styles.profileSection}>
              <AvatarFrameWrapper
                frame={card.avatarFrame}
                size={128}
                innerBackgroundColor={isVipac ? T.cardBg : "#FFFFFF"}
              >
                <Avatar
                  uri={card.avatar || DEFAULT_AVATAR_URL}
                  size={128}
                />
              </AvatarFrameWrapper>
            </View>

            {/* Name and Nickname.
                Для BAC: name = company name; під ним contactPerson (якщо є),
                pseudo не показуємо. */}
            <View style={styles.nameSection}>
              <Text style={[styles.name, isVipac && { color: T.textPrimary }, nameFontStyle]}>
                {card.name}
              </Text>
              {card.type === "BAC" ? (
                card.contactPerson ? (
                  <Text style={[styles.nickname, isVipac && { color: T.textSecondary }]}>
                    {card.contactPerson}
                  </Text>
                ) : null
              ) : (
                <Text style={[styles.nickname, isVipac && { color: T.textSecondary }]}>
                  {card.nickname}
                </Text>
              )}
            </View>

            {/* Description / Slogan.
                BAC: показуємо як slogan — single-line, центр, italic-style.
                PAC/VIPAC: повний multiline-bio. */}
            <View style={styles.descriptionSection}>
              {card.type === "BAC" ? (
                card.bio ? (
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.description,
                      { fontStyle: "italic", textAlign: "center" },
                    ]}
                  >
                    "{card.bio}"
                  </Text>
                ) : null
              ) : (
                <Text style={[styles.description, isVipac && { color: T.textPrimary }]}>
                  {card.bio ||
                    "John is a dedicated software engineer with a passion for creating user-friendly applications."}
                </Text>
              )}
            </View>

            {/* Call Button — VIPAC жовтий, інші світло-сірі */}
            <TouchableOpacity
              style={[
                styles.callButton,
                {
                  backgroundColor: isVipac ? T.callButtonBg : "#F2F1EB",
                  borderWidth: isVipac ? 0 : 1,
                  borderColor: "#DEDDD1",
                  position: "relative",
                },
                !card.phones?.length && { opacity: 0.5 },
              ]}
              onPress={handleCall}
              disabled={!card.phones?.length}
            >
              <View style={[{ opacity: 0 }]}>
                <Ionicons name="call" size={28} color={colors.primary} />
              </View>
              <Text
                style={[
                  styles.callButtonText,
                  { alignSelf: "center" },
                  isVipac && { color: T.callButtonText, fontWeight: "700" },
                ]}
              >
                TO CALL
              </Text>
              <View style={[{ alignSelf: "flex-end" }]}>
                <Ionicons
                  name="call"
                  size={28}
                  color={isVipac ? T.callButtonText : colors.primary}
                />
              </View>
            </TouchableOpacity>

            {/* Social Media Icons — для VIPAC світло-кремовий фон,
                для решти — світло-сірий */}
            <View style={styles.socialIconsContainer}>
              {socialIcons.map((icon, index) => {
                const hasValue = !!card?.social?.[icon.social]
                return (
                  <TouchableOpacity
                    onPress={() => openSocial(icon.social)}
                    disabled={!hasValue}
                    key={index}
                    style={[
                      styles.socialIcon,
                      {
                        backgroundColor: isVipac ? T.socialIconBg : '#F3F3F3',
                        opacity: hasValue ? 1 : 0.4,
                      },
                    ]}
                  >
                    {icon.name}
                  </TouchableOpacity>
                )
              })}
            </View>

            <View
              style={styles.verifiedContainerAbsoluteExpander}
            >
              <TouchableOpacity
                onPress={toggleVerifiedInfo}
              >
                <Ionicons
                  name="caret-up-outline"
                  size={24}
                  color="#97F09A"
                />
              </TouchableOpacity>
            </View>

            <Animated.View
              style={[
                styles.verifiedContainerAbsolute,
                {
                  height: verifiedHeight,
                },
              ]}
            >
              {!showVerifiedInfo ? (
                <View style={styles.verifiedBadgeWrapper}>
                  <Animated.View
                    style={[
                      {
                      },
                    ]}
                  >
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedBadgeText}>Verified</Text>
                      <Text style={styles.verifiedBadgeText}>Verified</Text>
                      <Text style={styles.verifiedBadgeText}>Verified</Text>
                      <Text style={styles.verifiedBadgeText}>Verified</Text>
                      <Text style={styles.verifiedBadgeText}>Verified</Text>
                      <Text style={styles.verifiedBadgeText}>Verified</Text>
                    </View>

                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedBadgeText}>Verified</Text>
                      <Text style={styles.verifiedBadgeText}>Verified</Text>
                      <Text style={styles.verifiedBadgeText}>Verified</Text>
                      <Text style={styles.verifiedBadgeText}>Verified</Text>
                      <Text style={styles.verifiedBadgeText}>Verified</Text>
                      <Text style={styles.verifiedBadgeText}>Verified</Text>
                    </View>
                  </Animated.View>
                </View>
              ) : (
                <Animated.View
                  style={[
                    styles.verifiedInfoContainer,
                    {
                      opacity: verifiedOpacity,
                    },
                  ]}
                >
                  <TouchableOpacity style={styles.verifiedInfoContent} onPress={toggleVerifiedInfo} activeOpacity={0.9}>
                    <Ionicons
                      name="caret-down-outline"
                      size={24}
                      color="white"
                    />
                    <Text style={styles.verifiedTitle}>Verified card</Text>
                    <Text style={styles.verifiedDetail}>Verification date: 09/10/2025</Text>
                    <Text style={styles.verifiedDetail}>Verification code: 1111111</Text>
                    <Text style={styles.verifiedDetail}>Any additional information</Text>
                    <Text style={styles.verifiedDetail}>Any additional information</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </Animated.View>
          </Animated.View>

          {/* Flip Card Touch Area */}
          <TouchableOpacity
            style={[
              styles.flipCardTouchArea,
              {
                bottom: 0,
                height: CARD_VERTICAL_OFFSET + 33, // Increased touch area for better interaction
              },
            ]}
            onPress={flipCard}
            activeOpacity={0.8}
          />
        </View>
        {/* Extra space at the bottom to ensure content doesn't go under tab bar */}
        <View style={{ height: 20 }} />
      </ScrollView>

      <Modal
        visible={showPhoneModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPhoneModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowPhoneModal(false)}>
              <Ionicons name="close" size={24} color="#000000" />
            </TouchableOpacity>

            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Choose a number{"\n"}for your call:</Text>

            <View style={styles.phoneListContainer}>
              {card.phones?.map((phone: string, index: number) => (
                <TouchableOpacity key={index} style={[styles.phoneOption, { borderColor: colors.textPrimary }]} onPress={() => handlePhoneSelect(phone)}>
                  <Text style={[styles.phoneOptionText, , { color: colors.textPrimary }]}>+380 {phone}</Text>
                  <Ionicons name="call" size={24} color="#000000" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom actions — різний набір для своїх і чужих карток. */}
      <View style={styles.bottomButtonsContainer}>
        {/* Refresh — спільна для обох типів */}
        <TouchableOpacity style={styles.circularButton} onPress={handleRefresh}>
          <Ionicons name="sync-outline" size={20} color="#666666" />
        </TouchableOpacity>

        {isMine ? (
          <>
            {/* Своя картка: показати QR для шарингу */}
            <TouchableOpacity style={styles.circularButton} onPress={handleShowQr}>
              <Ionicons name="qr-code-outline" size={20} color="#666666" />
            </TouchableOpacity>
            {/* Toggle prime-статус (зірка) */}
            <TouchableOpacity style={styles.circularButton} onPress={handleTogglePrime}>
              <Ionicons
                name={card?.isPrime ? "star" : "star-outline"}
                size={20}
                color={card?.isPrime ? "#FFCC4D" : "#666666"}
              />
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Чужа картка: toggle favorite (на connection) */}
            <TouchableOpacity
              style={styles.circularButton}
              onPress={handleToggleConnectionFavorite}
              disabled={!connection}
            >
              <Ionicons
                name={isFavorited ? "heart" : "heart-outline"}
                size={20}
                color={isFavorited ? "#FF3B30" : "#666666"}
              />
            </TouchableOpacity>
            {/* Видалити з контактів */}
            <TouchableOpacity
              style={styles.circularButton}
              onPress={handleRemoveFromContacts}
              disabled={!connection}
            >
              <Ionicons name="trash-outline" size={20} color="#666666" />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* QR-modal для своїх карток */}
      <Modal
        visible={showQrModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQrModal(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.7)",
            justifyContent: "center",
            alignItems: "center",
          }}
          activeOpacity={1}
          onPress={() => setShowQrModal(false)}
        >
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 24,
              alignItems: "center",
              gap: 12,
              minWidth: 280,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#27261F" }}>
              Scan to add this card
            </Text>
            {qrLoading ? (
              <View style={{ width: 240, height: 240, justifyContent: "center" }}>
                <Text style={{ color: "#666", textAlign: "center" }}>Loading...</Text>
              </View>
            ) : qrCode ? (
              <Image
                source={{ uri: qrCode }}
                style={{ width: 240, height: 240 }}
                resizeMode="contain"
              />
            ) : null}
            <Text style={{ fontSize: 13, color: "#666", textAlign: "center" }}>
              {card?.name}
            </Text>
            <TouchableOpacity
              onPress={() => setShowQrModal(false)}
              style={{
                marginTop: 8,
                paddingHorizontal: 24,
                paddingVertical: 10,
                backgroundColor: "#27261F",
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },
  scrollContainer: {
    flex: 1,
  },
  centerContent: {
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
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContainer: {
    height: height * 0.7, // Fixed height for card container
    alignItems: "center",
    position: "relative",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  card: {
    position: "absolute",
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    overflow: "visible",
  },
  flipCardTouchArea: {
    position: "absolute",
    width: CARD_WIDTH,
    zIndex: 10,
  },
  cardTypeBadge: {
    position: "absolute",
    left: 0,
    top: 0,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopLeftRadius: 20,
    borderBottomRightRadius: 20,
    zIndex: 1,
  },
  cardTypeText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 20,
  },
  primeBadge: {
    position: "absolute",
    right: 0,
    top: 0,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    zIndex: 1,
  },
  primeText: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 14,
  },
  profileSection: {
    alignItems: "center",
    marginTop: 12,
    position: "relative",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  actionButtons: {
    position: "absolute",
    top: 50,
    right: 0,
    flexDirection: "column",
    alignItems: "center",
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  nameSection: {
    alignItems: "center",
    marginTop: 12,
  },
  name: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#000000",
  },
  nickname: {
    fontSize: 18,
    color: "#888888",
    marginTop: 4,
  },
  descriptionSection: {
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#EEEEEE",
  },
  description: {
    fontSize: 16,
    color: "#333333",
    lineHeight: 24,
    textAlign: "center",
  },
  callButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  callButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 8,
  },
  socialIconsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingHorizontal: 16,
  },
  socialIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  // Back card styles
  backCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 36,
  },
  backAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  backNameSection: {
    marginLeft: 16,
  },
  backName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
  },
  backNickname: {
    fontSize: 16,
    color: "#888888",
  },
  infoSection: {
    height: 70,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    marginTop: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  addInfoButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  // Updated location section styles to match Figma design
  locationSectionColumn: {
    marginTop: 12,
    paddingHorizontal: 4,
  },
  locationHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  locationLabel: {
    fontSize: 16,
    color: "#888888",
    marginLeft: 4,
    flex: 1,
  },
  locationContentColumn: {
    paddingLeft: 4,
  },
  locationText: {
    fontSize: 16,
    color: "#333333",
    lineHeight: 24,
  },
  locationMenu: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#F0EFE9",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    position: "relative",
  },
  modalCloseButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 28,
  },
  phoneListContainer: {
    gap: 12,
  },
  phoneOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F0EFE9",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
  },
  phoneOptionText: {
    fontSize: 18,
    fontWeight: "500",
  },
  verifiedContainerAbsolute: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#A8F5A8",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    justifyContent: "flex-end",
    zIndex: 10,
    overflow: 'hidden'
  },
  verifiedContainerAbsoluteExpander: {
    position: "absolute",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    bottom: 18,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 6,
  },
  verifiedBadgeText: {
    fontSize: 8,
    fontWeight: "600",
    color: "#3D5C3E",
  },
  verifiedInfoContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
  },
  verifiedInfoContent: {
    padding: 24,
    alignItems: "center",
  },
  verifiedChevron: {
    marginBottom: 8,
  },
  verifiedTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B5E20",
    marginBottom: 24,
  },
  verifiedDetail: {
    fontSize: 14,
    color: "#2E7D32",
    marginBottom: 20,
    textAlign: "center",
  },
  bottomButtonsContainer: {
    position: "absolute",
    bottom: 100,
    right: 20,
    flexDirection: "row",
    gap: 12,
  },
  circularButton: {
    borderRadius: 24,
    backgroundColor: "#F3F3F3",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 6,
  },
  verifiedBadgeWrapper: {
    width: "100%",
    overflow: "hidden",
    height: 20,
  },
  verifiedBadgeScroller: {
    flexDirection: "row",
  },
})

export default CardDetail
