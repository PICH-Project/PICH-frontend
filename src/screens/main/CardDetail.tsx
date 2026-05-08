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
import { useSelector } from "react-redux"
import { useTabBarHeight } from "../../hooks/useTabBarHeight"
import type { RootState } from "../../store"
import type { Card } from "../../store/slices/cardsSlice"
import Svg, { ClipPath, Defs, G, Path, Rect } from "react-native-svg"
import Avatar from "@/components/common/Avatar"

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
  const [cardHeight, setCardHeight] = useState(height * 0.6)
  const [showPhoneModal, setShowPhoneModal] = useState(false)

  // Animation values for position and scale
  const frontPosition = useRef(new Animated.Value(FRONT_CARD_POSITION)).current
  const backPosition = useRef(new Animated.Value(BACK_CARD_POSITION)).current
  const frontScale = useRef(new Animated.Value(1)).current
  const backScale = useRef(new Animated.Value(BACK_CARD_SCALE)).current

  const slideAnimation = useRef(new Animated.Value(0)).current

  const card: Card = useSelector((state: RootState) =>
    (cardId
      ? state.cards.cards.find((c) => c.id === cardId) as Card
      : state.cards.cards[0]) as Card);

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

  const openTelegram = async () => {
    const tgNick = card?.social?.telegram;

    if (tgNick) {
      const encodedMsg = encodeURIComponent('Hello! I came from the PICH app');

      // Telegram deep links
      const tgAppUrl = `tg://resolve?domain=${tgNick}&text=${encodedMsg}`;
      const tgWebUrl = `https://t.me/${tgNick}?text=${encodedMsg}`;

      try {
        const supported = await Linking.canOpenURL(tgAppUrl);
        if (supported) {
          await Linking.openURL(tgAppUrl); // open Telegram app
        } else {
          await Linking.openURL(tgWebUrl); // fallback to web
        }
      } catch (error) {
        Alert.alert("Error", "Unable to open Telegram");
      }
    }
  };

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
        <View style={styles.header}>
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
        <View style={styles.header}>
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
            ]}
          >
            {/* Card Type Badge */}
            <View style={[styles.cardTypeBadge, { backgroundColor: getCardTypeColor(card.type) }]}>
              <Text style={[styles.cardTypeText, (card.type === 'PAC' && { color: colors.textPrimary })]}>{card.type}</Text>
            </View>

            {/* Prime Badge if applicable */}
            {!card.isPrime && (
              <View style={styles.primeBadge}>
                <CrownIcon />
              </View>
            )}

            {/* Back Card Content */}
            <View style={styles.backCardHeader}>
              <View style={styles.backNameSection}>
                <Text style={styles.backName}>{card.name}</Text>
                <Text style={styles.backNickname}>{card.nickname}</Text>
              </View>
            </View>

            {/* Additional Info Sections */}
            <View style={styles.infoSection}>
              <TouchableOpacity style={styles.addInfoButton}>
                <Ionicons name="add" size={24} color="#CCCCCC" />
              </TouchableOpacity>
            </View>

            <View style={styles.infoSection}>
              <TouchableOpacity style={styles.addInfoButton}>
                <Ionicons name="add" size={24} color="#CCCCCC" />
              </TouchableOpacity>
            </View>

            <View style={styles.infoSection}>
              <TouchableOpacity style={styles.addInfoButton}>
                <Ionicons name="add" size={24} color="#CCCCCC" />
              </TouchableOpacity>
            </View>

            {/* Location Section - Updated to match Figma design */}
            <View style={styles.locationSectionColumn}>
              <View style={styles.locationHeaderRow}>
                <Ionicons name="location-outline" size={20} color="#AAAAAA" />
                <Text style={styles.locationLabel}>Location</Text>
                <TouchableOpacity style={styles.locationMenu}>
                  <Ionicons name="ellipsis-vertical" size={20} color="#AAAAAA" />
                </TouchableOpacity>
              </View>
              <View style={styles.locationContentColumn}>
                <Text style={styles.locationText}>
                  {card.location?.country || "Ukraine"}, {card.location?.city || "Kiev"}
                </Text>
                {/* <Text style={styles.locationText}>
                  {card.location?.address || "Lobanovskogo str. Building 5"}, {card.location?.postalCode || "03156"}
                </Text> */}
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
              },
            ]}
          >
            {/* Card Type Badge */}
            <View style={[styles.cardTypeBadge, { backgroundColor: getCardTypeColor(card.type) }]}>
              <Text style={[styles.cardTypeText, (card.type === 'PAC' && { color: colors.textPrimary })]}>{card.type}</Text>
            </View>

            {/* Prime Badge if applicable */}
            {!card.isPrime && (
              <View style={styles.primeBadge}>
                <CrownIcon />
              </View>
            )}

            {/* Profile Section */}
            <View style={styles.profileSection}>
              <Avatar
                uri={"https://randomuser.me/api/portraits/men/32.jpg"}
                size={128}
              />
            </View>

            {/* Name and Nickname */}
            <View style={styles.nameSection}>
              <Text style={styles.name}>{card.name}</Text>
              <Text style={styles.nickname}>{card.nickname}</Text>
            </View>

            {/* Description */}
            <View style={styles.descriptionSection}>
              <Text style={styles.description}>
                {card.bio ||
                  "John is a dedicated software engineer with a passion for creating user-friendly applications."}
              </Text>
            </View>

            {/* Call Button */}
            <TouchableOpacity
              style={[styles.callButton, { backgroundColor: '#F2F1EB', borderWidth: 1, borderColor: '#DEDDD1', position: 'relative' }, !card.phones?.length && { opacity: 0.5 }]}
              onPress={handleCall}
              disabled={!card.phones?.length}
            >
              <View style={[{ opacity: 0 }]}>
                <Ionicons name="call" size={28} color={colors.primary} />
              </View>
              <Text style={[styles.callButtonText, { alignSelf: 'center' }]}>TO CALL</Text>
              <View style={[{ alignSelf: 'flex-end' }]}>
                <Ionicons name="call" size={28} color={colors.primary} />
              </View>
            </TouchableOpacity>

            {/* Social Media Icons */}
            <View style={styles.socialIconsContainer}>
              {socialIcons.map((icon, index) => (
                <TouchableOpacity
                  onPress={() => icon.social === 'telegram' && openTelegram()}
                  key={index}
                  style={[styles.socialIcon, {  backgroundColor: '#F3F3F3' }]}
                >
                  {icon.name}
                </TouchableOpacity>
              ))}
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

      <View style={styles.bottomButtonsContainer}>
        <TouchableOpacity style={styles.circularButton}>
          <Ionicons name="sync-outline" size={20} color="#666666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.circularButton}>
          <Ionicons name="qr-code-outline" size={20} color="#666666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.circularButton}>
          <Ionicons name="star-outline" size={20} color="#666666" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const CrownIcon = () => (
  <Svg
    width={31}
    height={31}
    viewBox="0 0 31 31"
    fill="none"
  >
    <Path
      d="M15.5 6.45801C15.6672 6.45802 15.832 6.50159 15.9775 6.58398C16.123 6.66637 16.2441 6.7854 16.3301 6.92871L20.4795 13.8203L26.5977 9.84375C26.754 9.7423 26.9367 9.68794 27.123 9.6875C27.3096 9.68715 27.4926 9.74088 27.6494 9.8418C27.8063 9.94273 27.9308 10.0869 28.0078 10.2568C28.0847 10.4267 28.1106 10.6154 28.083 10.7998L26.1455 23.7158C26.1112 23.9453 25.996 24.1552 25.8203 24.3066C25.6444 24.4581 25.4196 24.5421 25.1875 24.542H5.8125C5.58037 24.5421 5.35559 24.4581 5.17969 24.3066C5.00396 24.1552 4.88883 23.9453 4.85449 23.7158L2.91699 10.7998C2.88944 10.6154 2.91529 10.4267 2.99219 10.2568C3.06916 10.0869 3.19373 9.94273 3.35059 9.8418C3.50744 9.74087 3.69043 9.68715 3.87695 9.6875C4.06334 9.68793 4.24598 9.74229 4.40234 9.84375L10.5205 13.8203L14.6699 6.92676C14.7561 6.78381 14.8781 6.66508 15.0234 6.58301C15.1689 6.50102 15.3331 6.45789 15.5 6.45801ZM14.6621 13.9834V16.833H11.8115V18.5059H14.6621V21.3555H16.334V18.5059H19.1836V16.833H16.334V13.9834H14.6621Z"
      fill="#71706A"
    />
  </Svg>
);

function TelegramIcon() {
  return (
    <Svg
      width={16}
      height={14}
      viewBox="0 0 16 14"
      fill="none"
      accessibilityLabel="Telegram icon"
      accessibilityRole="image"
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.3427 0.0935102C14.5394 0.0107119 14.7547 -0.0178447 14.9662 0.0108124C15.1777 0.0394695 15.3777 0.124293 15.5453 0.256454C15.7129 0.388614 15.842 0.563281 15.9192 0.762273C15.9964 0.961266 16.0188 1.17731 15.9842 1.38792L14.1787 12.3394C14.0035 13.3958 12.8445 14.0016 11.8757 13.4754C11.0653 13.0352 9.8616 12.3569 8.77895 11.6492C8.23763 11.295 6.57942 10.1606 6.78321 9.35338C6.95834 8.66319 9.74458 6.06959 11.3367 4.52761C11.9616 3.9218 11.6766 3.57233 10.9387 4.12958C9.10614 5.51314 6.16387 7.61715 5.19107 8.20943C4.33291 8.73165 3.88552 8.82081 3.35056 8.73165C2.37458 8.56925 1.46945 8.31769 0.730701 8.01121C-0.267568 7.59725 -0.219008 6.22483 0.729905 5.8252L14.3427 0.0935102Z"
        fill="#9B9B9B"
      />
    </Svg>
  );
}

function ViberIcon() {
  return (
    <Svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      accessibilityRole="image"
    >
      <G clipPath="url(#clip0)">
        <Path
          d="M7.59983 0C6.31517 0.0186667 3.55517 0.229333 2.01317 1.64467C0.867834 2.79133 0.463834 4.46667 0.421834 6.54467C0.379834 8.62267 0.325168 12.5173 4.07983 13.5733H4.08183L4.07917 15.184C4.07917 15.184 4.0545 15.8353 4.48583 15.9687C5.00383 16.13 5.3085 15.6353 5.80583 15.1007C6.07717 14.8073 6.45383 14.378 6.73717 14.0473C9.30383 14.2647 11.2785 13.77 11.5038 13.6973C12.0212 13.5293 14.9545 13.1533 15.4318 9.25933C15.9252 5.246 15.1918 2.706 13.8718 1.562C13.4745 1.19533 11.8678 0.0286667 8.2885 0.0133333C8.2885 0.0133333 8.02517 -0.00333333 7.59717 0.002L7.59983 0ZM7.6385 1.12867C8.00183 1.126 8.22517 1.14 8.22517 1.14C11.2532 1.15333 12.7032 2.06533 13.0398 2.37067C14.1565 3.32733 14.7265 5.616 14.3105 8.96867V8.97C13.9078 12.222 11.5278 12.426 11.0892 12.5667C10.9025 12.6267 9.16783 13.058 6.98717 12.916C6.98717 12.916 5.36317 14.876 4.85583 15.3853C4.77583 15.4653 4.6825 15.4967 4.62117 15.4813C4.5345 15.4593 4.5105 15.356 4.51117 15.2053L4.5245 12.5267C1.34983 11.6467 1.5345 8.332 1.57117 6.59667C1.60717 4.86067 1.93317 3.438 2.90183 2.48133C4.2085 1.29933 6.55117 1.136 7.64183 1.128L7.6385 1.12867ZM7.89183 2.86333C7.84015 2.86594 7.79142 2.88822 7.75563 2.92561C7.71985 2.963 7.69972 3.01266 7.69938 3.06441C7.69904 3.11616 7.71851 3.16608 7.7538 3.20394C7.78909 3.24179 7.83752 3.26471 7.88917 3.268C8.97183 3.27467 9.85317 3.626 10.5745 4.32933C11.2898 5.02667 11.6545 5.97467 11.6632 7.21867C11.6645 7.33 11.7565 7.41867 11.8678 7.41867C11.9211 7.41797 11.972 7.3963 12.0094 7.35837C12.0469 7.32044 12.0678 7.26929 12.0678 7.216C12.0585 5.89333 11.6558 4.81867 10.8572 4.04C10.0638 3.26667 9.06183 2.87133 7.89183 2.86333ZM5.25183 3.32667C5.1101 3.30699 4.96582 3.3344 4.84117 3.40467L4.8345 3.406C4.54783 3.57067 4.2905 3.78067 4.0705 4.02733L4.06517 4.03267C3.88739 4.24778 3.78517 4.45844 3.7585 4.66467C3.7533 4.69549 3.75174 4.72681 3.75383 4.758C3.75383 4.84911 3.76828 4.938 3.79717 5.02467L3.80583 5.03133C3.89583 5.35133 4.12117 5.882 4.60917 6.76733C4.88917 7.27933 5.21117 7.76733 5.57317 8.22467C5.75317 8.45444 5.9465 8.67311 6.15317 8.88067L6.24117 8.96867C6.44828 9.17445 6.66694 9.36778 6.89717 9.54867C7.35483 9.9108 7.84235 10.2335 8.3545 10.5133C9.23983 11.002 9.77183 11.2267 10.0905 11.3173L10.0972 11.3267C10.2133 11.3641 10.3359 11.3766 10.4572 11.3633C10.6643 11.3389 10.8749 11.2367 11.0892 11.0567C11.0918 11.0567 11.0912 11.0553 11.0945 11.0533C11.3412 10.8333 11.5498 10.5733 11.7145 10.288L11.7165 10.2813C11.8665 9.99333 11.8165 9.72 11.5965 9.53467C11.5938 9.53467 11.1312 9.148 10.9052 8.98133C10.6652 8.81111 10.4178 8.65333 10.1632 8.508C9.82317 8.318 9.47517 8.43733 9.33117 8.624L9.03317 9C8.87983 9.18867 8.59517 9.164 8.59517 9.164C6.51517 8.63333 5.9585 6.52733 5.9585 6.52733C5.9585 6.52733 5.93383 6.24333 6.12383 6.09L6.49917 5.79133C6.68383 5.648 6.80317 5.3 6.6125 4.95933C6.46743 4.70369 6.30945 4.45559 6.13917 4.216C5.9602 3.98166 5.7757 3.7516 5.58583 3.526C5.50232 3.42121 5.38322 3.35075 5.25117 3.328L5.25183 3.32667ZM8.24517 3.91333C8.19159 3.91174 8.13958 3.9315 8.10057 3.96826C8.06157 4.00501 8.03876 4.05576 8.03717 4.10933C8.03558 4.16291 8.05533 4.21492 8.09209 4.25393C8.12885 4.29293 8.17959 4.31574 8.23317 4.31733C9.0065 4.374 9.57783 4.628 9.9965 5.084C10.4165 5.54267 10.6165 6.1 10.6005 6.79733C10.6034 6.8486 10.6255 6.89689 10.6625 6.93255C10.6994 6.96821 10.7485 6.98863 10.7998 6.98973C10.8512 6.99082 10.901 6.97251 10.9395 6.93845C10.9779 6.9044 11.0021 6.8571 11.0072 6.806C11.0238 6.02267 10.7845 5.344 10.2958 4.81C9.8025 4.27 9.11117 3.97467 8.2625 3.91267H8.2465L8.24517 3.91333ZM8.55383 5C8.5025 5.00075 8.45335 5.0209 8.41625 5.05639C8.37916 5.09187 8.35686 5.14008 8.35383 5.19133C8.3485 5.30267 8.43383 5.398 8.54583 5.40467C8.8945 5.42333 9.12917 5.52133 9.28783 5.686C9.44783 5.84933 9.5465 6.09933 9.56517 6.462C9.57203 6.51226 9.5975 6.55813 9.63653 6.59053C9.67557 6.62293 9.72534 6.63951 9.77601 6.63699C9.82668 6.63448 9.87456 6.61306 9.9102 6.57696C9.94584 6.54085 9.96664 6.4927 9.9685 6.442C9.9485 6.01267 9.82517 5.65667 9.58183 5.404C9.33717 5.152 8.9865 5.02133 8.5685 4.99933H8.5565L8.55383 5Z"
          fill="#9B9B9B"
        />
      </G>
      <Defs>
        <ClipPath id="clip0">
          <Rect width="16" height="16" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

const LinkedInIcon = () => (
  <Svg
    width={13}
    height={12}
    viewBox="0 0 13 12"
    fill="none"
  >
    <Path
      d="M2.66667 1.334C2.66649 1.68762 2.52584 2.02669 2.27567 2.27661C2.0255 2.52654 1.68629 2.66684 1.33267 2.66667C0.979045 2.66649 0.639976 2.52584 0.390053 2.27567C0.140129 2.0255 -0.000176644 1.68629 1.66908e-07 1.33267C0.000176978 0.979045 0.140822 0.639976 0.390996 0.390053C0.641169 0.140129 0.980378 -0.000176644 1.334 1.66908e-07C1.68762 0.000176978 2.02669 0.140822 2.27661 0.390996C2.52654 0.641169 2.66684 0.980378 2.66667 1.334ZM2.70667 3.654H0.0400001V12.0007H2.70667V3.654ZM6.92 3.654H4.26667V12.0007H6.89333V7.62067C6.89333 5.18067 10.0733 4.954 10.0733 7.62067V12.0007H12.7067V6.714C12.7067 2.60067 8 2.754 6.89333 4.774L6.92 3.654Z"
      fill="#9B9B9B"
    />
  </Svg>
);

const FacebookIcon = () => (
  <Svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    fill="none"
  >
    <Path
      d="M9.33317 8.99967H10.9998L11.6665 6.33301H9.33317V4.99967C9.33317 4.31301 9.33317 3.66634 10.6665 3.66634H11.6665V1.42634C11.4492 1.39767 10.6285 1.33301 9.76184 1.33301C7.95184 1.33301 6.6665 2.43767 6.6665 4.46634V6.33301H4.6665V8.99967H6.6665V14.6663H9.33317V8.99967Z"
      fill="#9B9B9B"
    />
  </Svg>
);

const WhatsAppIcon = () => (
  <Svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    fill="none"
  >
    <G clipPath="url(#clip0_2507_95)">
      <Path
        d="M13.6683 2.32804C12.9311 1.58732 12.0531 1.00001 11.0854 0.600331C10.1178 0.200649 9.07987 -0.00341053 8.03216 4.3116e-05C3.64221 4.3116e-05 0.0643217 3.56003 0.0643217 7.92802C0.0643217 9.32802 0.434171 10.688 1.12563 11.888L0 16L4.22111 14.896C5.38693 15.528 6.69749 15.864 8.03216 15.864C12.4221 15.864 16 12.304 16 7.93602C16 5.81603 15.1719 3.82403 13.6683 2.32804ZM8.03216 14.52C6.84221 14.52 5.67638 14.2 4.65528 13.6L4.41407 13.456L1.90553 14.112L2.57286 11.68L2.41206 11.432C1.75079 10.3817 1.39974 9.16744 1.39899 7.92802C1.39899 4.29603 4.37387 1.33604 8.02412 1.33604C9.79296 1.33604 11.4573 2.02404 12.7035 3.27203C13.3207 3.88312 13.8098 4.61006 14.1424 5.41069C14.475 6.21132 14.6446 7.06969 14.6412 7.93602C14.6573 11.568 11.6824 14.52 8.03216 14.52ZM11.6663 9.59202C11.4653 9.49602 10.4844 9.01602 10.3075 8.94402C10.1226 8.88002 9.99397 8.84802 9.85729 9.04002C9.7206 9.24002 9.34271 9.68802 9.23015 9.81602C9.11759 9.95202 8.99698 9.96802 8.79598 9.86402C8.59497 9.76802 7.95176 9.55202 7.19598 8.88002C6.601 8.35202 6.20703 7.70402 6.08643 7.50402C5.97387 7.30402 6.07035 7.20002 6.17487 7.09602C6.26332 7.00802 6.37588 6.86402 6.47236 6.75203C6.56884 6.64003 6.60905 6.55203 6.67337 6.42403C6.73769 6.28803 6.70553 6.17603 6.65729 6.08003C6.60904 5.98403 6.20703 5.00803 6.04623 4.60803C5.88543 4.22403 5.71658 4.27203 5.59598 4.26403H5.21005C5.07337 4.26403 4.86432 4.31203 4.6794 4.51203C4.50251 4.71203 3.98794 5.19203 3.98794 6.16803C3.98794 7.14402 4.70352 8.08802 4.8 8.21602C4.89648 8.35202 6.20703 10.352 8.201 11.208C8.67538 11.416 9.04523 11.536 9.33467 11.624C9.80904 11.776 10.2432 11.752 10.5889 11.704C10.9749 11.648 11.7709 11.224 11.9317 10.76C12.1005 10.296 12.1005 9.90402 12.0442 9.81602C11.9879 9.72802 11.8673 9.68802 11.6663 9.59202Z"
        fill="#9B9B9B"
      />
    </G>
    <Defs>
      <ClipPath id="clip0_2507_95">
        <Rect width={16} height={16} fill="white" />
      </ClipPath>
    </Defs>
  </Svg>
);

const TwitterIcon = () => (
  <Svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    fill="none"
  >
    <Path
      d="M12.6007 0.768555H15.054L9.694 6.89522L16 15.2306H11.0627L7.196 10.1746L2.77067 15.2306H0.316L6.04933 8.67722L0 0.769221H5.06267L8.558 5.39056L12.6007 0.768555ZM11.74 13.7626H13.0993L4.324 2.15989H2.86533L11.74 13.7626Z"
      fill="#9B9B9B"
    />
  </Svg>
);

const PaletteIcon = () => (
  <Svg
    width={23}
    height={26}
    viewBox="0 0 23 26"
    fill="none"
  >
    <Path
      d="M18.9092 0C20.867 0.00014636 22.4538 1.58717 22.4541 3.54492V22.4541C22.4541 24.4121 20.8672 25.9999 18.9092 26H3.54492C1.58719 25.9996 0 24.4119 0 22.4541V3.54492C0.000311634 1.58735 1.58738 0.000430851 3.54492 0H18.9092ZM3.54492 2.36328C2.89278 2.36371 2.36359 2.89275 2.36328 3.54492V22.4541C2.36328 23.1065 2.89259 23.6353 3.54492 23.6357H18.9092C19.5618 23.6356 20.0908 23.1067 20.0908 22.4541V3.54492C20.0905 2.89258 19.5616 2.36343 18.9092 2.36328H3.54492ZM11.8184 5.9082C15.7341 5.90822 18.9092 8.7295 18.9092 12.2119C18.9091 13.2565 18.4944 14.2584 17.7559 14.9971C17.0171 15.7359 16.0145 16.1514 14.9697 16.1514H13.5752C13.2618 16.1514 12.9609 16.2755 12.7393 16.4971C12.5177 16.7187 12.3936 17.0196 12.3936 17.333C12.3936 17.6323 12.5112 17.9084 12.6924 18.1211C12.8814 18.3259 12.9999 18.6011 13 18.9082C13 19.2215 12.8758 19.5225 12.6543 19.7441C12.4327 19.9658 12.1318 20.0908 11.8184 20.0908C9.93787 20.0908 8.13446 19.3433 6.80469 18.0137C5.47488 16.6839 4.72754 14.8796 4.72754 12.999C4.72766 11.1186 5.47499 9.31505 6.80469 7.98535C8.13447 6.6557 9.93785 5.9082 11.8184 5.9082ZM7.48535 10.6357C7.17191 10.6357 6.87105 10.7608 6.64941 10.9824C6.42795 11.204 6.3028 11.5041 6.30273 11.8174C6.30273 12.1308 6.42778 12.4317 6.64941 12.6533C6.87104 12.8749 7.17194 12.999 7.48535 12.999C7.79858 12.9989 8.09878 12.8748 8.32031 12.6533C8.54195 12.4317 8.66699 12.1308 8.66699 11.8174C8.66692 11.5041 8.54185 11.204 8.32031 10.9824C8.09877 10.7609 7.79866 10.6358 7.48535 10.6357ZM16.1514 10.6357C15.838 10.6358 15.538 10.7609 15.3164 10.9824C15.0948 11.204 14.9698 11.504 14.9697 11.8174C14.9697 12.1308 15.0948 12.4317 15.3164 12.6533C15.538 12.8748 15.8381 12.9989 16.1514 12.999C16.4648 12.999 16.7657 12.875 16.9873 12.6533C17.2089 12.4317 17.333 12.1308 17.333 11.8174C17.3329 11.5041 17.2087 11.204 16.9873 10.9824C16.7657 10.7608 16.4648 10.6357 16.1514 10.6357ZM9.84863 7.48438C9.53523 7.48438 9.23432 7.60849 9.0127 7.83008C8.79109 8.05168 8.66702 8.35262 8.66699 8.66602C8.66699 8.97943 8.79109 9.28032 9.0127 9.50195C9.23433 9.72359 9.5352 9.84766 9.84863 9.84766C10.1621 9.84765 10.4629 9.72358 10.6846 9.50195C10.9062 9.28033 11.0303 8.97942 11.0303 8.66602C11.0302 8.35262 10.9062 8.05168 10.6846 7.83008C10.4629 7.60848 10.162 7.48438 9.84863 7.48438ZM13.7881 7.48438C13.4747 7.48438 13.1738 7.6085 12.9521 7.83008C12.7305 8.05168 12.6065 8.35262 12.6064 8.66602C12.6064 8.97944 12.7305 9.28032 12.9521 9.50195C13.1738 9.72359 13.4746 9.84766 13.7881 9.84766C14.1015 9.84764 14.4024 9.72357 14.624 9.50195C14.8456 9.28033 14.9697 8.97941 14.9697 8.66602C14.9697 8.35262 14.8456 8.05168 14.624 7.83008C14.4024 7.60848 14.1015 7.48439 13.7881 7.48438Z"
      fill="white"
    />
  </Svg>
);

const PaletteFilledIcon = () => (
  <Svg
    width={22}
    height={22}
    viewBox="0 0 22 22"
    fill="none"
  >
    <Path
      d="M17.1364 10.6364C16.6662 10.6364 16.2153 10.4496 15.8829 10.1171C15.5504 9.78469 15.3636 9.33379 15.3636 8.86364C15.3636 8.39348 15.5504 7.94258 15.8829 7.61013C16.2153 7.27768 16.6662 7.09091 17.1364 7.09091C17.6065 7.09091 18.0574 7.27768 18.3899 7.61013C18.7223 7.94258 18.9091 8.39348 18.9091 8.86364C18.9091 9.33379 18.7223 9.78469 18.3899 10.1171C18.0574 10.4496 17.6065 10.6364 17.1364 10.6364ZM13.5909 5.90909C13.1208 5.90909 12.6699 5.72232 12.3374 5.38987C12.005 5.05742 11.8182 4.60652 11.8182 4.13636C11.8182 3.66621 12.005 3.21531 12.3374 2.88286C12.6699 2.55041 13.1208 2.36364 13.5909 2.36364C14.0611 2.36364 14.512 2.55041 14.8444 2.88286C15.1769 3.21531 15.3636 3.66621 15.3636 4.13636C15.3636 4.60652 15.1769 5.05742 14.8444 5.38987C14.512 5.72232 14.0611 5.90909 13.5909 5.90909ZM7.68182 5.90909C7.21166 5.90909 6.76076 5.72232 6.42831 5.38987C6.09586 5.05742 5.90909 4.60652 5.90909 4.13636C5.90909 3.66621 6.09586 3.21531 6.42831 2.88286C6.76076 2.55041 7.21166 2.36364 7.68182 2.36364C8.15197 2.36364 8.60288 2.55041 8.93533 2.88286C9.26778 3.21531 9.45455 3.66621 9.45455 4.13636C9.45455 4.60652 9.26778 5.05742 8.93533 5.38987C8.60288 5.72232 8.15197 5.90909 7.68182 5.90909ZM4.13636 10.6364C3.66621 10.6364 3.21531 10.4496 2.88286 10.1171C2.55041 9.78469 2.36364 9.33379 2.36364 8.86364C2.36364 8.39348 2.55041 7.94258 2.88286 7.61013C3.21531 7.27768 3.66621 7.09091 4.13636 7.09091C4.60652 7.09091 5.05742 7.27768 5.38987 7.61013C5.72232 7.94258 5.90909 8.39348 5.90909 8.86364C5.90909 9.33379 5.72232 9.78469 5.38987 10.1171C5.05742 10.4496 4.60652 10.6364 4.13636 10.6364ZM10.6364 0C7.81542 0 5.11002 1.12061 3.11532 3.11532C1.12061 5.11002 0 7.81542 0 10.6364C0 13.4573 1.12061 16.1627 3.11532 18.1574C5.11002 20.1521 7.81542 21.2727 10.6364 21.2727C11.1065 21.2727 11.5574 21.086 11.8899 20.7535C12.2223 20.4211 12.4091 19.9702 12.4091 19.5C12.4091 19.0391 12.2318 18.6255 11.9482 18.3182C11.6764 17.9991 11.4991 17.5855 11.4991 17.1364C11.4991 16.6662 11.6859 16.2153 12.0183 15.8829C12.3508 15.5504 12.8017 15.3636 13.2718 15.3636H15.3636C16.9308 15.3636 18.4338 14.7411 19.542 13.6329C20.6502 12.5247 21.2727 11.0217 21.2727 9.45455C21.2727 4.23091 16.51 0 10.6364 0Z"
      fill="white"
    />
  </Svg>
);

const SettingsIcon = () => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
  >
    <Path
      d="M3.95943 6.90909C5.59118 6.90909 6.91397 5.5863 6.91397 3.95455C6.91397 2.3228 5.59118 1 3.95943 1C2.32768 1 1.00488 2.3228 1.00488 3.95455C1.00488 5.5863 2.32768 6.90909 3.95943 6.90909Z"
      fill="white"
    />
    <Path
      d="M14.8025 11.8429C14.8014 11.2337 14.6114 10.6398 14.2586 10.1431C13.9058 9.64638 13.4076 9.27132 12.8328 9.0696V6.72566C13.2432 6.57823 13.6157 6.34149 13.9235 6.03253C14.2313 5.72358 14.4666 5.35012 14.6124 4.93914H16.9435C17.0901 5.3514 17.3266 5.72582 17.636 6.03519C17.9453 6.34456 18.3198 6.58111 18.732 6.72763V9.07157C18.0752 9.30554 17.5223 9.76418 17.171 10.3664C16.8196 10.9687 16.6925 11.6757 16.8121 12.3626C16.9317 13.0495 17.2902 13.672 17.8244 14.1201C18.3586 14.5682 19.034 14.813 19.7312 14.8112C20.4284 14.8095 21.1026 14.5613 21.6345 14.1106C22.1665 13.6598 22.5219 13.0355 22.6381 12.348C22.7542 11.6606 22.6236 10.9541 22.2692 10.3537C21.9149 9.7532 21.3597 9.29733 20.7017 9.06664V6.72664C21.1719 6.56141 21.5926 6.27963 21.9243 5.90767C22.2561 5.5357 22.4881 5.08569 22.5987 4.59971C22.7092 4.11372 22.6948 3.60763 22.5567 3.12874C22.4185 2.64986 22.1612 2.21382 21.8088 1.86139C21.4564 1.50897 21.0203 1.25166 20.5414 1.11352C20.0625 0.975384 19.5565 0.960932 19.0705 1.07152C18.5845 1.1821 18.1345 1.41411 17.7625 1.74585C17.3905 2.0776 17.1088 2.49824 16.9435 2.96846H14.6124C14.4469 2.49798 14.1647 2.07718 13.7923 1.74547C13.4198 1.41375 12.9693 1.18197 12.4829 1.07181C11.9964 0.961644 11.49 0.976711 11.011 1.11559C10.5319 1.25448 10.096 1.51264 9.74393 1.86591C9.39187 2.21918 9.13519 2.656 8.99794 3.13549C8.86069 3.61499 8.84735 4.12146 8.95917 4.60752C9.07099 5.09357 9.30431 5.5433 9.63729 5.91461C9.97028 6.28592 10.392 6.56668 10.8631 6.73058V9.06861C10.2878 9.26964 9.78935 9.64455 9.43664 10.1414C9.08393 10.6383 8.89445 11.2326 8.89445 11.8419C8.89445 12.4513 9.08393 13.0456 9.43664 13.5424C9.78935 14.0393 10.2878 14.4143 10.8631 14.6153V16.9543C10.4481 17.1002 10.0711 17.3372 9.75972 17.6478C9.44836 17.9585 9.21054 18.335 9.06376 18.7497H6.73459C6.58836 18.3365 6.35174 17.9612 6.04198 17.6511C5.73223 17.341 5.35716 17.1039 4.94414 16.9572V14.6182C5.60166 14.3879 6.15659 13.9325 6.51086 13.3326C6.86512 12.7327 6.99592 12.0269 6.88012 11.3399C6.76433 10.6529 6.4094 10.0289 5.87807 9.57826C5.34674 9.12762 4.6732 8.87931 3.9765 8.87722C3.2798 8.87513 2.60479 9.11939 2.07077 9.56684C1.53674 10.0143 1.17807 10.6361 1.05816 11.3224C0.938246 12.0087 1.0648 12.7153 1.41546 13.3173C1.76612 13.9194 2.31831 14.378 2.97444 14.6123V16.9563C2.50453 17.1216 2.08417 17.4032 1.75262 17.775C1.42107 18.1468 1.18915 18.5965 1.07851 19.0822C0.967869 19.5679 0.982122 20.0737 1.11994 20.5524C1.25775 21.0311 1.51463 21.4671 1.86659 21.8196C2.21855 22.1721 2.65411 22.4297 3.13258 22.5682C3.61106 22.7068 4.11684 22.7218 4.60271 22.612C5.08858 22.5021 5.53868 22.2709 5.91097 21.9399C6.28326 21.6089 6.56561 21.189 6.73164 20.7194H9.06573C9.23153 21.1887 9.51347 21.6083 9.88526 21.9392C10.2571 22.2702 10.7066 22.5015 11.1919 22.6118C11.6773 22.7221 12.1827 22.7077 12.6609 22.5699C13.1392 22.4321 13.5748 22.1755 13.9271 21.8239C14.2795 21.4723 14.537 21.0373 14.6758 20.5593C14.8146 20.0813 14.83 19.576 14.7208 19.0904C14.6115 18.6048 14.3811 18.1548 14.0509 17.7823C13.7208 17.4098 13.3017 17.127 12.8328 16.9602V14.6163C13.4078 14.4145 13.9061 14.0393 14.2589 13.5424C14.6117 13.0455 14.8016 12.4523 14.8025 11.8429Z"
      fill="white"
    />
    <Path
      d="M19.7168 22.6855C21.3485 22.6855 22.6713 21.3627 22.6713 19.7309C22.6713 18.0992 21.3485 16.7764 19.7168 16.7764C18.085 16.7764 16.7622 18.0992 16.7622 19.7309C16.7622 21.3627 18.085 22.6855 19.7168 22.6855Z"
      fill="white"
    />
  </Svg>
);

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
