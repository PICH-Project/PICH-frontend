"use client"

import { useEffect, useRef, useState } from "react"
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Alert, Dimensions, Animated, StatusBar } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useTheme } from "../../hooks/useTheme"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "../../store"
import { createCard } from "../../store/slices/cardsSlice"
import { useTabBarHeight } from "../../hooks/useTabBarHeight"
import { Card } from "@/services/cardService"
import Avatar from "@/components/common/Avatar"
import Button from "@/components/common/Button"
import Dialog from "react-native-dialog";
import PhoneNumberList from "@/components/common/PhoneNumberList"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import {
  CrownIcon,
  YellowCrownIcon,
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
import { selectHasPremiumPerks } from "@/store/slices/subscriptionsSlice"
import { CardType, getEffectiveCardLimits, VIPAC_THEME } from "@/constants/cards"

type RouteParams = {
  cardType: "PAC" | "BAC" | "VIPAC";
}

const { width, height } = Dimensions.get("window")
const CARD_WIDTH = width * 0.9
const CARD_MARGIN = width * 0.05
const CARD_VERTICAL_OFFSET = 20 // How much of the back card is visible from bottom
const FRONT_CARD_POSITION = -20 // Position the front card higher up (negative value)
const BACK_CARD_POSITION = CARD_VERTICAL_OFFSET // Position the back card lower
const BACK_CARD_SCALE = 0.95 // Scale factor for the back card
const HEADER_HEIGHT = 80 // Approximate height of the header container

const CreateCardNewScreen = () => {
  const route = useRoute()
  const { cardType } = route.params as RouteParams
  const [visibleTelegram, setVisibleTelegram] = useState(false);
  const [modalNetwork, setModalNetwork] = useState<
    "telegram" | "viber" | "instagram" | "twitter" | "linkedin" | "facebook" | "whatsapp" | null
  >(null);
  const navigation = useNavigation()
  const { colors, typography } = useTheme()
  const dispatch = useDispatch<AppDispatch>()
  const [showFront, setShowFront] = useState(true)

  // Combined limits з бека — використовуємо ТІЛЬКИ для maxCards (user-level)
  // і bioMaxLength (поки що не залежить від типу картки в спеці).
  const limits = useSelector((state: RootState) => state.subscriptions.limits)
  const bioMaxLength = limits?.bioMaxLength ?? 100
  const userMaxCards = limits?.maxCards ?? 1
  const userCardsCount = useSelector((state: RootState) => state.cards.cards.length)

  // Premium ADDON або VIP активний → перки картки і жовта корона на preview.
  const hasPerks = useSelector(selectHasPremiumPerks)
  const crownColor = hasPerks ? "#FFD700" : "#71706A"

  const tabBarHeight = useTabBarHeight()
  const insets = useSafeAreaInsets()
  const [cardHeight, setCardHeight] = useState(height * 0.9)
  const frontPosition = useRef(new Animated.Value(FRONT_CARD_POSITION)).current
  const backPosition = useRef(new Animated.Value(BACK_CARD_POSITION)).current
  const frontScale = useRef(new Animated.Value(1)).current
  const backScale = useRef(new Animated.Value(BACK_CARD_SCALE)).current

  const [numbers, setNumbers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: cardType as "BAC" | "PAC" | "VIPAC",
    name: "",
    nickname: "",
    avatar: "",
    phones: [],
    email: "",
    social: {} as Record<string, string>,
    isPrime: false,
    bio: "",
    /** Контактна особа — використовується ТІЛЬКИ для BAC. */
    contactPerson: "",
    location: {
      country: "",
      city: "",
      address: "",
      postalCode: "",
    },
    category: "OTHER" as "FAMILY" | "FRIENDS" | "WORK" | "OTHER",
    blockchainId: "",
    isMainCard: false,
    isInWallet: false,
    /**
     * Кастомні нотатки на back-side картки. Ключі — string-індекси слотів
     * ("0", "1", "2"). Зберігаються у бек-payload як `notes` (бек має додати
     * поле, поки що йде разом з payload — якщо бек ігнорує — нічого страшного).
     */
    notes: {} as Record<string, string>,
  })

  // Активний індекс note-слоту (0/1/2), для якого зараз відкрита модалка.
  // null — модалка закрита.
  const [noteIndex, setNoteIndex] = useState<number | null>(null)

  // Ліміти ЗА ТИПОМ КАРТКИ (PAC/BAC/VIPAC), augmented Premium-бонусом.
  // Spec: PAC 1/4/0, BAC 2/5/2, VIPAC 4/8/4 + Premium adds +1 phone, +2 socials
  // (крім VIPAC, який вже має максимум).
  // Обчислюється ПІСЛЯ formData (бо читає formData.type).
  const cardLimits = getEffectiveCardLimits(formData.type as CardType, hasPerks)
  const maxPhones = cardLimits.phones
  const maxSocials = cardLimits.socials
  const maxNotes = cardLimits.notes

  // VIPAC має чорно-золотисту тему (per Figma).
  const isVipac = formData.type === "VIPAC"
  const T = VIPAC_THEME

  // Social media platforms
  const [socialPlatforms, setSocialPlatforms] = useState([
    { key: "telegram", label: "Instagram", value: "" },
    { key: "instagram", label: "Instagram", value: "" },
    { key: "twitter", label: "Twitter", value: "" },
    { key: "linkedin", label: "LinkedIn", value: "" },
    { key: "facebook", label: "Facebook", value: "" },
  ])

  // const cardTypes = [
  //   { value: "PAC", label: "Personal Card", color: "#97F09A" },
  //   { value: "BAC", label: "Business Card", color: "#FFBC56" },
  //   { value: "VIPAC", label: "VIP Card", color: "#FF6459" },
  // ]

  const categories = [
    { value: "FAMILY", label: "Family" },
    { value: "FRIENDS", label: "Friends" },
    { value: "WORK", label: "Work" },
    { value: "OTHER", label: "Other" },
  ]

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

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field.startsWith("location.")) {
      const locationField = field.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value,
        },
      }))
    } else if (field.startsWith("social.")) {
      const socialField = field.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        social: {
          ...prev.social,
          [socialField]: value as string,
        },
      }))
    } else if (field.startsWith("notes.")) {
      const noteKey = field.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        notes: {
          ...prev.notes,
          [noteKey]: value as string,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const handleSocialChange = (platform: string, value: string) => {
    setSocialPlatforms((prev) => prev.map((p) => (p.key === platform ? { ...p, value } : p)))

    // Update formData.social
    setFormData((prev) => ({
      ...prev,
      social: {
        ...prev.social,
        [platform]: value,
      },
    }))
  }

  const handleAvatarChange = (uri: string) => {
    setFormData((prev) => ({
      ...prev,
      avatar: uri,
    }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert(
        "Validation Error",
        formData.type === "BAC" ? "Company name is required" : "Name is required",
      )
      return false
    }
    // Nickname required ТІЛЬКИ для PAC/VIPAC. Для BAC поле приховане і
    // підставляється з name у preparePayload.
    if (formData.type !== "BAC" && !formData.nickname.trim()) {
      Alert.alert("Validation Error", "Nickname is required")
      return false
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      Alert.alert("Validation Error", "Please enter a valid email address")
      return false
    }
    // Кожен номер телефону — мінімум 7 цифр (international мінімум).
    const phoneRegex = /^[\d\s()+-]{7,}$/
    for (const phone of formData.phones) {
      if (phone && !phoneRegex.test(phone)) {
        Alert.alert("Validation Error", `Invalid phone number: ${phone}`)
        return false
      }
    }
    // Лімит довжини нотаток — 200 символів.
    for (const [slot, text] of Object.entries(formData.notes)) {
      if (text && text.length > 200) {
        Alert.alert("Validation Error", `Note ${Number(slot) + 1} is too long (max 200 chars)`)
        return false
      }
    }
    return true
  }

  /**
   * Прибирає leading @ з username для платформ, що його не потребують
   * у deep-link URL (telegram, twitter, instagram).
   */
  const normalizeSocialHandle = (network: string, value: string): string => {
    const trimmed = value.trim()
    if (["telegram", "twitter", "instagram"].includes(network) && trimmed.startsWith("@")) {
      return trimmed.slice(1)
    }
    return trimmed
  }

  const preparePayload = () => {
    // Filter out empty social media entries + нормалізація username (прибрати @).
    const filteredSocial = Object.entries(formData.social).reduce(
      (acc, [key, value]) => {
        if (value && value.trim()) {
          acc[key] = normalizeSocialHandle(key, value)
        }
        return acc
      },
      {} as Record<string, string>,
    )

    // Те саме для notes — пропускаємо порожні слоти.
    const filteredNotes = Object.entries(formData.notes).reduce(
      (acc, [key, value]) => {
        if (value && value.trim()) {
          acc[key] = value.trim()
        }
        return acc
      },
      {} as Record<string, string>,
    )

    // Prepare location object, only include if at least one field is filled
    const hasLocationData = Object.values(formData.location).some((value) => value && value.trim())
    const location = hasLocationData
      ? {
        country: formData.location.country || undefined,
        city: formData.location.city || undefined,
        address: formData.location.address || undefined,
        postalCode: formData.location.postalCode || undefined,
      }
      : undefined

    // Для BAC nickname приховано в UI — підставляємо name, щоб бек-валідація прошла.
    const effectiveNickname =
      formData.type === "BAC"
        ? formData.nickname.trim() || formData.name.trim()
        : formData.nickname.trim()

    return {
      type: formData.type,
      name: formData.name.trim(),
      nickname: effectiveNickname,
      avatar: formData.avatar || undefined,
      phones: formData.phones,
      email: formData.email.trim() || undefined,
      social: Object.keys(filteredSocial).length > 0 ? filteredSocial : undefined,
      notes: Object.keys(filteredNotes).length > 0 ? filteredNotes : undefined,
      isPrime: formData.isPrime,
      bio: formData.bio.trim() || undefined,
      contactPerson:
        formData.type === "BAC" && formData.contactPerson.trim()
          ? formData.contactPerson.trim()
          : undefined,
      location,
      category: formData.category,
      blockchainId: formData.blockchainId.trim() || undefined,
      isMainCard: formData.isMainCard,
      isInWallet: formData.isInWallet,
    }
  }

  // Social media icons — тримаємо КОМПОНЕНТИ (не вже-відрендерені елементи),
  // щоб мати можливість пробросити їм color prop динамічно (filled vs empty стан).
  const socialIcons = [
    { social: 'telegram', Icon: TelegramIcon },
    { social: 'viber', Icon: ViberIcon },
    { social: 'linkedin', Icon: LinkedInIcon },
    { social: 'facebook', Icon: FacebookIcon },
    { social: 'whatsapp', Icon: WhatsAppIcon },
    { social: 'twitter', Icon: TwitterIcon },
  ]

  const handleSubmit = async () => {
    if (!validateForm()) return

    // User-level: ліміт кількості карток. -1 у бек = unlimited.
    if (userMaxCards !== -1 && userCardsCount >= userMaxCards) {
      Alert.alert(
        "Card limit reached",
        `Your current plan allows up to ${userMaxCards} card${userMaxCards === 1 ? "" : "s"}. ` +
          "Upgrade to create more.",
      )
      return
    }

    setLoading(true)
    try {
      const payload = preparePayload()
      await dispatch(createCard(payload)).unwrap()

      Alert.alert("Success", "Card created successfully!", [
        {
          text: "OK",
          onPress: () => navigation.navigate('StackMain' as never),
        },
      ])
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create card. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const showNeededPremiumError = () => Alert.alert('premium is needed to use this feature')

  useEffect(() => {
    // Calculate available space between header and tab bar
    const availableHeight = height - HEADER_HEIGHT - tabBarHeight - 40 // 40px for additional padding
    // Set card height to fit within available space
    setCardHeight(availableHeight * 0.92) // Use 90% of available space for cards, but cap at original height
  }, [height, tabBarHeight])

  return (
    // <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
    //   <View style={styles.header}>
    //     <TouchableOpacity onPress={() => navigation.goBack()}>
    //       <Ionicons name="chevron-back" size={24} color={colors.text} />
    //     </TouchableOpacity>
    //     <Text
    //       style={[
    //         styles.headerTitle,
    //         {
    //           color: colors.text,
    //           fontFamily: typography.fontFamily.bold,
    //           fontSize: typography.fontSize.xl,
    //         },
    //       ]}
    //     >
    //       Create Card
    //     </Text>
    //     <View style={{ width: 24 }} />
    //   </View>

    //   <ScrollView
    //     contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + 20 }]}
    //     showsVerticalScrollIndicator={false}
    //   >
    //     <View style={styles.avatarContainer}>
    //       <Avatar uri={formData.avatar} size={120} editable onImageSelected={handleAvatarChange} />
    //       <Text style={[styles.avatarLabel, { color: colors.textSecondary }]}>Tap to add photo</Text>
    //     </View>

    //     <View style={styles.section}>
    //       <Text style={[styles.sectionTitle, { color: colors.text }]}>Card Type</Text>
    //       <View style={styles.cardTypeContainer}>
    //         {cardTypes.map((type) => (
    //           <TouchableOpacity
    //             key={type.value}
    //             style={[
    //               styles.cardTypeButton,
    //               {
    //                 backgroundColor: formData.type === type.value ? type.color : colors.card,
    //                 borderColor: formData.type === type.value ? type.color : colors.border,
    //               },
    //             ]}
    //             onPress={() => handleInputChange("type", type.value)}
    //           >
    //             <Text
    //               style={[
    //                 styles.cardTypeText,
    //                 {
    //                   color: formData.type === type.value ? "#FFFFFF" : colors.text,
    //                 },
    //               ]}
    //             >
    //               {type.label}
    //             </Text>
    //           </TouchableOpacity>
    //         ))}
    //       </View>
    //     </View>

    //     <View style={styles.section}>
    //       <Text style={[styles.sectionTitle, { color: colors.text }]}>Basic Information</Text>

    //       <View style={styles.inputGroup}>
    //         <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Name *</Text>
    //         <TextInput
    //           style={[styles.input, { color: colors.text, borderColor: colors.border }]}
    //           value={formData.name}
    //           onChangeText={(value) => handleInputChange("name", value)}
    //           placeholder="Enter full name"
    //           placeholderTextColor={colors.textSecondary}
    //         />
    //       </View>

    //       <View style={styles.inputGroup}>
    //         <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Nickname *</Text>
    //         <TextInput
    //           style={[styles.input, { color: colors.text, borderColor: colors.border }]}
    //           value={formData.nickname}
    //           onChangeText={(value) => handleInputChange("nickname", value)}
    //           placeholder="Enter nickname"
    //           placeholderTextColor={colors.textSecondary}
    //         />
    //       </View>

    //       <View style={styles.inputGroup}>
    //         <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Phone</Text>
    //         <TextInput
    //           style={[styles.input, { color: colors.text, borderColor: colors.border }]}
    //           value={formData.phone}
    //           onChangeText={(value) => handleInputChange("phone", value)}
    //           placeholder="Enter phone number"
    //           placeholderTextColor={colors.textSecondary}
    //           keyboardType="phone-pad"
    //         />
    //       </View>

    //       <View style={styles.inputGroup}>
    //         <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email</Text>
    //         <TextInput
    //           style={[styles.input, { color: colors.text, borderColor: colors.border }]}
    //           value={formData.email}
    //           onChangeText={(value) => handleInputChange("email", value)}
    //           placeholder="Enter email address"
    //           placeholderTextColor={colors.textSecondary}
    //           keyboardType="email-address"
    //           autoCapitalize="none"
    //         />
    //       </View>

    //       <View style={styles.inputGroup}>
    //         <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Bio</Text>
    //         <TextInput
    //           style={[styles.textArea, { color: colors.text, borderColor: colors.border }]}
    //           value={formData.bio}
    //           onChangeText={(value) => handleInputChange("bio", value)}
    //           placeholder="Enter bio description"
    //           placeholderTextColor={colors.textSecondary}
    //           multiline
    //           numberOfLines={4}
    //         />
    //       </View>

    //       <View style={styles.inputGroup}>
    //         <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Blockchain ID</Text>
    //         <TextInput
    //           style={[styles.input, { color: colors.text, borderColor: colors.border }]}
    //           value={formData.blockchainId}
    //           onChangeText={(value) => handleInputChange("blockchainId", value)}
    //           placeholder="Enter blockchain ID (optional)"
    //           placeholderTextColor={colors.textSecondary}
    //         />
    //       </View>
    //     </View>

    //     <View style={styles.section}>
    //       <Text style={[styles.sectionTitle, { color: colors.text }]}>Social Media</Text>
    //       {socialPlatforms.map((platform) => (
    //         <View key={platform.key} style={styles.inputGroup}>
    //           <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{platform.label}</Text>
    //           <TextInput
    //             style={[styles.input, { color: colors.text, borderColor: colors.border }]}
    //             value={platform.value}
    //             onChangeText={(value) => handleSocialChange(platform.key, value)}
    //             placeholder={`Enter ${platform.label} username/URL`}
    //             placeholderTextColor={colors.textSecondary}
    //             autoCapitalize="none"
    //           />
    //         </View>
    //       ))}
    //     </View>

    //     <View style={styles.section}>
    //       <Text style={[styles.sectionTitle, { color: colors.text }]}>Location</Text>

    //       <View style={styles.inputRow}>
    //         <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
    //           <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Country</Text>
    //           <TextInput
    //             style={[styles.input, { color: colors.text, borderColor: colors.border }]}
    //             value={formData.location.country}
    //             onChangeText={(value) => handleInputChange("location.country", value)}
    //             placeholder="Country"
    //             placeholderTextColor={colors.textSecondary}
    //           />
    //         </View>
    //         <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
    //           <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>City</Text>
    //           <TextInput
    //             style={[styles.input, { color: colors.text, borderColor: colors.border }]}
    //             value={formData.location.city}
    //             onChangeText={(value) => handleInputChange("location.city", value)}
    //             placeholder="City"
    //             placeholderTextColor={colors.textSecondary}
    //           />
    //         </View>
    //       </View>

    //       <View style={styles.inputGroup}>
    //         <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Address</Text>
    //         <TextInput
    //           style={[styles.input, { color: colors.text, borderColor: colors.border }]}
    //           value={formData.location.address}
    //           onChangeText={(value) => handleInputChange("location.address", value)}
    //           placeholder="Enter address"
    //           placeholderTextColor={colors.textSecondary}
    //         />
    //       </View>

    //       <View style={styles.inputGroup}>
    //         <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Postal Code</Text>
    //         <TextInput
    //           style={[styles.input, { color: colors.text, borderColor: colors.border }]}
    //           value={formData.location.postalCode}
    //           onChangeText={(value) => handleInputChange("location.postalCode", value)}
    //           placeholder="Enter postal code"
    //           placeholderTextColor={colors.textSecondary}
    //         />
    //       </View>
    //     </View>

    //     <View style={styles.section}>
    //       <Text style={[styles.sectionTitle, { color: colors.text }]}>Category</Text>
    //       <View style={styles.categoryContainer}>
    //         {categories.map((category) => (
    //           <TouchableOpacity
    //             key={category.value}
    //             style={[
    //               styles.categoryButton,
    //               {
    //                 backgroundColor: formData.category === category.value ? colors.primary : colors.card,
    //                 borderColor: formData.category === category.value ? colors.primary : colors.border,
    //               },
    //             ]}
    //             onPress={() => handleInputChange("category", category.value)}
    //           >
    //             <Text
    //               style={[
    //                 styles.categoryText,
    //                 {
    //                   color: formData.category === category.value ? "#FFFFFF" : colors.text,
    //                 },
    //               ]}
    //             >
    //               {category.label}
    //             </Text>
    //           </TouchableOpacity>
    //         ))}
    //       </View>
    //     </View>

    //     <View style={styles.section}>
    //       <Text style={[styles.sectionTitle, { color: colors.text }]}>Card Settings</Text>

    //       <Toggle
    //         label="Prime Card"
    //         description="Mark this card as a premium card with enhanced features"
    //         value={formData.isPrime}
    //         onValueChange={(value) => handleInputChange("isPrime", value)}
    //       />

    //       <Toggle
    //         label="Set as Main Card"
    //         description="Use this card as your primary card for sharing"
    //         value={formData.isMainCard}
    //         onValueChange={(value) => handleInputChange("isMainCard", value)}
    //       />

    //       <Toggle
    //         label="Add to Wallet"
    //         description="Include this card in your wallet collection"
    //         value={formData.isInWallet}
    //         onValueChange={(value) => handleInputChange("isInWallet", value)}
    //       />
    //     </View>

    //     <Button title="Create Card" onPress={handleSubmit} loading={loading} style={styles.submitButton} fullWidth />
    //   </ScrollView>
    // </SafeAreaView>

    <>
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
              <View style={[styles.cardTypeBadge, { backgroundColor: getCardTypeColor(formData.type) }]}>
                <Text
                  style={[styles.cardTypeText,
                  (formData.type === 'PAC' && { color: colors.textPrimary })
                  ]}
                >
                  {formData.type}
                </Text>
              </View>

              {/* Prime Badge — жовта корона без фону якщо Premium/VIP, інакше сіра з фоном-таблеткою */}
              {(
                <View
                  style={[
                    styles.primeBadge,
                    hasPerks
                      ? { backgroundColor: "transparent" }
                      : { backgroundColor: "#F0F0F0" },
                  ]}
                >
                  <CrownIcon color={crownColor} />
                </View>
              )}

              {/* Back Card Content */}
              <View style={styles.backCardHeader}>
              </View>

              {/* Additional Info Sections — кількість слотів залежить від типу картки:
                  PAC=0, BAC=2, VIPAC=4 (per spec). Тап → модалка вводу.
                  Якщо порожньо — компактний плюс по центру; якщо є текст —
                  він рендериться на всю ширину секції (з еліпсисом при переповненні). */}
              {Array.from({ length: maxNotes }, (_, i) => i).map((slot) => {
                const value = formData.notes[String(slot)] ?? ""
                return (
                  <TouchableOpacity
                    key={slot}
                    style={[
                      styles.infoSection,
                      isVipac && { backgroundColor: T.noteSlotBg },
                    ]}
                    onPress={() => setNoteIndex(slot)}
                    activeOpacity={0.7}
                  >
                    {value ? (
                      <Text
                        numberOfLines={2}
                        ellipsizeMode="tail"
                        style={{
                          color: isVipac ? T.noteSlotText : colors.text,
                          fontSize: 14,
                          paddingHorizontal: 16,
                          width: "100%",
                        }}
                      >
                        {value}
                      </Text>
                    ) : (
                      <View style={styles.addInfoButton}>
                        <Ionicons
                          name="add"
                          size={24}
                          color={isVipac ? T.noteSlotPlus : "#CCCCCC"}
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                )
              })}

              {/* Location Section */}
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
                  <TextInput
                    style={[
                      styles.input,
                      styles.nickname,
                      {
                        color: isVipac ? T.textPrimary : colors.text,
                        borderColor: colors.border,
                        textAlign: 'left',
                        height: 40,
                        alignItems: 'center',
                      },
                    ]}
                    value={formData.location.country}
                    onChangeText={(value) => handleInputChange("location.country", value)}
                    placeholder="Country, city"
                    placeholderTextColor={isVipac ? T.textSecondary : colors.textSecondary}
                  />
                </View>
              </View>
            </Animated.View>

            {/* Front Card */}
            <Animated.View
              style={[
                styles.card,
                {
                  height: cardHeight,
                  zIndex: showFront ? 2 : 1,
                  transform: [{ translateY: frontPosition }, { scale: frontScale }],
                  shadowOpacity: showFront ? 0.2 : 0.1,
                },
                isVipac && { backgroundColor: T.cardBg },
              ]}
            >
              {/* Card Type Badge */}
              <View
                style={[
                  styles.cardTypeBadge,
                  { backgroundColor: getCardTypeColor(formData.type) },
                ]}
              >
                <Text
                  style={[
                    styles.cardTypeText,
                    (formData.type === 'PAC' && { color: colors.textPrimary })
                  ]}
                >
                  {formData.type}
                </Text>
              </View>

              {/* Prime Badge — жовта корона без фону якщо Premium/VIP, інакше сіра з фоном-таблеткою */}
              {(
                <View
                  style={[
                    styles.primeBadge,
                    hasPerks
                      ? { backgroundColor: "transparent" }
                      : { backgroundColor: "#F0F0F0" },
                  ]}
                >
                  <CrownIcon color={crownColor} />
                </View>
              )}

              {/* Profile Section */}
              {/* <View style={styles.profileSection}>
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="star-outline" size={24} color="#888888" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="sync-outline" size={24} color="#888888" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="qr-code-outline" size={24} color="#888888" />
                </TouchableOpacity>
              </View>
            </View> */}

              <View style={styles.avatarContainer}>
                <Avatar
                  uri={formData.avatar}
                  size={128}
                  editable
                  onImageSelected={handleAvatarChange}
                />
              </View>

              {/* Identity block */}
              <View>
                <TextInput
                  style={[
                    styles.input,
                    styles.name,
                    {
                      color: isVipac ? T.textPrimary : colors.text,
                      borderColor: colors.border,
                      textAlign: 'center',
                    },
                  ]}
                  value={formData.name}
                  onChangeText={(value) => handleInputChange("name", value)}
                  placeholder={formData.type === "BAC" ? "Company Name*" : "Name Surname*"}
                  placeholderTextColor={isVipac ? T.textSecondary : colors.textSecondary}
                />
                {formData.type === "BAC" ? (
                  <TextInput
                    style={[
                      styles.input,
                      styles.nickname,
                      { color: colors.text, borderColor: colors.border, textAlign: 'center', height: 40, alignItems: 'center' }]}
                    value={formData.contactPerson}
                    onChangeText={(value) => handleInputChange("contactPerson", value)}
                    placeholder="Contact person"
                    placeholderTextColor={colors.textSecondary}
                  />
                ) : (
                  <TextInput
                    style={[
                      styles.input,
                      styles.nickname,
                      {
                        color: isVipac ? T.textSecondary : colors.text,
                        borderColor: colors.border,
                        textAlign: 'center',
                        height: 40,
                        alignItems: 'center',
                      },
                    ]}
                    value={formData.nickname}
                    onChangeText={(value) => handleInputChange("nickname", value)}
                    placeholder="Pseudo"
                    placeholderTextColor={isVipac ? T.textSecondary : colors.textSecondary}
                  />
                )}
              </View>

              {/* Description / Bio.
                  Для PAC/VIPAC — multi-line bio про себе.
                  Для BAC — single-line slogan (компактно щоб все влізло у картку). */}
              <View style={styles.descriptionSection}>
                <TextInput
                  style={[
                    styles.input,
                    styles.description,
                    {
                      color: isVipac ? T.textPrimary : colors.text,
                      borderColor: colors.border,
                      textAlign: formData.type === "BAC" ? "center" : "left",
                      height: formData.type === "BAC" ? 40 : 60,
                      textAlignVertical: formData.type === "BAC" ? "center" : "top",
                    },
                  ]}
                  value={formData.bio}
                  multiline={formData.type !== "BAC"}
                  numberOfLines={formData.type === "BAC" ? 1 : 4}
                  onChangeText={(value) => handleInputChange("bio", value)}
                  placeholder={
                    formData.type === "BAC"
                      ? "Your slogan or motto"
                      : "Write something about yourself"
                  }
                  placeholderTextColor={isVipac ? T.textSecondary : colors.textSecondary}
                  maxLength={bioMaxLength}
                />
              </View>

              <PhoneNumberList
                phoneNumbers={formData.phones}
                onChange={(numbers) => handleInputChange('phones', numbers as any)}
                maxItems={maxPhones}
                darkMode={isVipac}
              />

              {/* Social Media Icons — обмежуємо за лімітом плану.
                  Filled-стан (значення введено): чорний фон + біла іконка.
                  Empty-стан: прозорий фон + сіра обводка + сіра іконка. */}
              <View style={styles.socialIconsContainer}>
                {socialIcons.slice(0, maxSocials).map((icon, index) => {
                  const filled = !!formData.social[icon.social]?.trim()
                  const Icon = icon.Icon
                  // Для VIPAC соц-іконки на світло-кремовому фоні з темним glyph'ом.
                  const filledBg = isVipac ? T.socialIconBg : "#9B9B9B"
                  const filledIconColor = isVipac ? T.socialIconColor : "#FFFFFF"
                  const emptyBorder = isVipac ? T.textSecondary : "#9B9B9B"
                  const emptyIconColor = isVipac ? T.textSecondary : "#9B9B9B"
                  return (
                    <TouchableOpacity
                      onPress={() => setModalNetwork(icon.social as any)}
                      key={index}
                      style={[
                        styles.socialIcon,
                        filled
                          ? { backgroundColor: filledBg, borderWidth: 0 }
                          : {
                              backgroundColor: "transparent",
                              borderWidth: 1,
                              borderColor: emptyBorder,
                            },
                      ]}
                    >
                      <Icon color={filled ? filledIconColor : emptyIconColor} />
                    </TouchableOpacity>
                  )
                })}
              </View>

              <Button
                title="Save"
                onPress={handleSubmit}
                loading={loading}
                fullWidth
                variant="yellow"
              />
            </Animated.View>

            {/* Flip Card Touch Area */}
            <TouchableOpacity
              style={[
                styles.flipCardTouchArea,
                {
                  bottom: 0,
                  height: CARD_VERTICAL_OFFSET + 20, // Increased touch area for better interaction
                },
              ]}
              onPress={flipCard}
              activeOpacity={0.8}
            />
          </View>
          {/* Extra space at the bottom to ensure content doesn't go under tab bar */}
          <View style={styles.bottomActions}>
            <TouchableOpacity style={styles.actionBottomButton} activeOpacity={0.7}>
              <TouchableOpacity
                onPress={() => showNeededPremiumError()}
                style={{
                  zIndex: 5, position: 'absolute', alignItems: 'center',
                  justifyContent: 'center', backgroundColor: '#56554E60', width: 56,
                  height: 56, borderRadius: 28,
                }}>
                <YellowCrownIcon />
              </TouchableOpacity>
              <PaletteIcon />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBottomButton} activeOpacity={0.7}>
              <TouchableOpacity
                onPress={() => showNeededPremiumError()}
                style={{
                  zIndex: 5, position: 'absolute', alignItems: 'center',
                  justifyContent: 'center', backgroundColor: '#56554E60', width: 56,
                  height: 56, borderRadius: 28,
                }}>
                <YellowCrownIcon />
              </TouchableOpacity>
              <Text style={styles.fontIcon}>Aa</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBottomButton} activeOpacity={0.7}>
              <View style={{
                zIndex: 5, position: 'absolute', alignItems: 'center',
                justifyContent: 'center', backgroundColor: '#56554E60', width: 56,
                height: 56, borderRadius: 28,
              }}>
                <YellowCrownIcon />
              </View>
              <PaletteFilledIcon />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBottomButton} activeOpacity={0.7}>
              <View style={{
                zIndex: 5, position: 'absolute', alignItems: 'center',
                justifyContent: 'center', backgroundColor: '#56554E60', width: 56,
                height: 56, borderRadius: 28,
              }}>
                <YellowCrownIcon />
              </View>
              <SettingsIcon />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      <Dialog.Container visible={!!modalNetwork}>
        <Dialog.Title>Enter your {modalNetwork} nickname</Dialog.Title>
        <Dialog.Input
          value={formData.social[modalNetwork!]}
          onChangeText={(text) => handleInputChange(`social.${modalNetwork}`, text)}
        />
        <Dialog.Button label="OK" onPress={() => setModalNetwork(null)} />
      </Dialog.Container>

      {/* Notes-modal — додатковий текст для слоту note.0 / note.1 / note.2.
          Зберігається в formData.notes і відправляється на бек у payload. */}
      <Dialog.Container visible={noteIndex !== null}>
        <Dialog.Title>Add a note</Dialog.Title>
        <Dialog.Description>
          Anything you'd like to share — quote, location, project tag, or just a memo.
        </Dialog.Description>
        <Dialog.Input
          value={noteIndex !== null ? formData.notes[String(noteIndex)] ?? "" : ""}
          onChangeText={(text) =>
            noteIndex !== null && handleInputChange(`notes.${noteIndex}`, text)
          }
          placeholder="Type your note..."
        />
        <Dialog.Button label="Cancel" onPress={() => setNoteIndex(null)} />
        <Dialog.Button label="Save" onPress={() => setNoteIndex(null)} />
      </Dialog.Container>
    </>
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
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
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
    height: height * 0.75, // Fixed height for card container
    alignItems: "center",
    position: "relative",
    justifyContent: "center",
  },
  card: {
    position: "absolute",
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    // shadowColor: "#000000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowRadius: 6,
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
  name: {
    fontSize: 18,
  },
  nickname: {
    fontSize: 14,
    marginTop: 8,
  },
  descriptionSection: {
    marginVertical: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#EEEEEE",
  },
  description: {
    fontSize: 12,
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
    marginVertical: 16,
    paddingHorizontal: 0,
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
    marginTop: 24,
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
    fontSize: 14,
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
  avatarContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  avatarLabel: {
    marginTop: 8,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  bottomActions: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 40,
  },
  actionBottomButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4E4F50",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    position: 'relative',
  },
  fontIcon: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFFFFF",
  },
})


export default CreateCardNewScreen
