"use client"
import { useState, useRef } from "react"
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
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useTheme } from "../../hooks/useTheme"
import { useSelector } from "react-redux"
import type { RootState } from "../../store"
import type { Card } from "../../store/slices/cardsSlice"

type RouteParams = {
  cardId: string
}

const { width, height } = Dimensions.get("window")
const CARD_WIDTH = width * 0.9
const CARD_HEIGHT = height * 0.65
const CARD_MARGIN = width * 0.05
const CARD_VERTICAL_OFFSET = 30 // How much of the back card is visible from bottom
const BACK_CARD_SCALE = 0.95 // Scale factor for the back card

const CardDetail = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { cardId } = route.params as RouteParams
  const { colors } = useTheme()
  const [showFront, setShowFront] = useState(true)

  // Animation values for position and scale
  const frontPosition = useRef(new Animated.Value(0)).current
  const backPosition = useRef(new Animated.Value(CARD_VERTICAL_OFFSET)).current
  const frontScale = useRef(new Animated.Value(1)).current
  const backScale = useRef(new Animated.Value(BACK_CARD_SCALE)).current

  const card = useSelector((state: RootState) => state.cards.cards.find((c) => c.id === cardId)) as Card

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

  const getCardTypeColor = (type: Card["type"]) => {
    switch (type) {
      case "BAC":
        return "#4CD964" // Green
      case "PAC":
        return "#FFCC4D" // Yellow
      case "VAC":
        return "#FF6347" // Red
      case "CAC":
        return "#DDDDDD" // Light gray for CAC as shown in the design
      default:
        return "#A5A1F5"
    }
  }

  const handleCall = () => {
    if (card.phone) {
      Linking.openURL(`tel:${card.phone}`)
    }
  }

  const flipCard = () => {
    // Animate the card positions and scales
    if (showFront) {
      // Move front card to the back (down and scaled)
      Animated.parallel([
        Animated.timing(frontPosition, {
          toValue: CARD_VERTICAL_OFFSET,
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
          toValue: 0,
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
          toValue: CARD_VERTICAL_OFFSET,
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
          toValue: 0,
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

  // Social media icons with proper colors
  const socialIcons = [
    { name: "paper-plane", color: "#DDDDDD", backgroundColor: "#F5F5F5" },
    { name: "logo-whatsapp", color: "#DDDDDD", backgroundColor: "#F5F5F5" },
    { name: "logo-linkedin", color: "#DDDDDD", backgroundColor: "#F5F5F5" },
    { name: "logo-facebook", color: "#DDDDDD", backgroundColor: "#F5F5F5" },
    { name: "logo-whatsapp", color: "#DDDDDD", backgroundColor: "#F5F5F5" },
    { name: "logo-twitter", color: "#DDDDDD", backgroundColor: "#F5F5F5" },
  ]

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#F5F5F7" }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContainer}>
        {/* Back Card */}
        <Animated.View
          style={[
            styles.card,
            {
              zIndex: showFront ? 1 : 2,
              transform: [{ translateY: backPosition }, { scale: backScale }],
              shadowOpacity: showFront ? 0.1 : 0.2,
            },
          ]}
        >
          {/* Card Type Badge */}
          <View style={[styles.cardTypeBadge, { backgroundColor: getCardTypeColor(card.type) }]}>
            <Text style={styles.cardTypeText}>{card.type}</Text>
          </View>

          {/* Prime Badge if applicable */}
          {card.isPrime && (
            <View style={styles.primeBadge}>
              <Text style={styles.primeText}>PRIME</Text>
            </View>
          )}

          {/* Back Card Content */}
          <View style={styles.backCardHeader}>
            <Image source={{ uri: card.avatar }} style={styles.backAvatar} />
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

          {/* Location Section */}
          <View style={styles.locationSection}>
            <View style={styles.locationHeader}>
              <Ionicons name="location-outline" size={20} color="#AAAAAA" />
              <Text style={styles.locationLabel}>Location</Text>
            </View>
            <View style={styles.locationContent}>
              <Text style={styles.locationText}>
                {card.location?.country || "Ukraine"}, {card.location?.city || "Kiev"}
              </Text>
              <Text style={styles.locationText}>
                {card.location?.address || "Lobanovskogo str. Building 5"}, {card.location?.postalCode || "03156"}
              </Text>
            </View>
            <TouchableOpacity style={styles.locationMenu}>
              <Ionicons name="ellipsis-vertical" size={20} color="#AAAAAA" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Front Card */}
        <Animated.View
          style={[
            styles.card,
            {
              zIndex: showFront ? 2 : 1,
              transform: [{ translateY: frontPosition }, { scale: frontScale }],
              shadowOpacity: showFront ? 0.2 : 0.1,
            },
          ]}
        >
          {/* Card Type Badge */}
          <View style={[styles.cardTypeBadge, { backgroundColor: getCardTypeColor(card.type) }]}>
            <Text style={styles.cardTypeText}>{card.type}</Text>
          </View>

          {/* Prime Badge if applicable */}
          {card.isPrime && (
            <View style={styles.primeBadge}>
              <Text style={styles.primeText}>PRIME</Text>
            </View>
          )}

          {/* Profile Section */}
          <View style={styles.profileSection}>
            <Image source={{ uri: card.avatar }} style={styles.avatar} />

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
          <TouchableOpacity style={styles.callButton} onPress={handleCall}>
            <Text style={styles.callButtonText}>To call</Text>
            <Ionicons name="call-outline" size={24} color="#000000" />
          </TouchableOpacity>

          {/* Social Media Icons */}
          <View style={styles.socialIconsContainer}>
            {socialIcons.map((icon, index) => (
              <TouchableOpacity key={index} style={[styles.socialIcon, { backgroundColor: icon.backgroundColor }]}>
                <Ionicons name={icon.name as any} size={24} color={icon.color} />
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Flip Card Touch Area */}
        <TouchableOpacity
          style={[
            styles.flipCardTouchArea,
            {
              bottom: 0,
              height: CARD_VERTICAL_OFFSET + 40, // Make touch area larger than visible area
            },
          ]}
          onPress={flipCard}
          activeOpacity={0.8}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    flex: 1,
    alignItems: "center",
    position: "relative",
    justifyContent: "center",
  },
  card: {
    position: "absolute",
    width: CARD_WIDTH,
    paddingBottom: 30,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 5,
  },
  flipCardTouchArea: {
    position: "absolute",
    width: CARD_WIDTH,
    zIndex: 10,
  },
  cardTypeBadge: {
    position: "absolute",
    left: 0,
    top: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    zIndex: 1,
  },
  cardTypeText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  primeBadge: {
    position: "absolute",
    right: 0,
    top: 16,
    backgroundColor: "#FFCC4D",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopLeftRadius: 20,
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
    marginTop: 20,
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
    marginTop: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000",
  },
  nickname: {
    fontSize: 18,
    color: "#888888",
    marginTop: 4,
  },
  descriptionSection: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFCC4D",
    borderRadius: 30,
    paddingVertical: 16,
    marginTop: 24,
  },
  callButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginRight: 8,
  },
  socialIconsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    paddingHorizontal: 16,
  },
  socialIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    fontSize: 16,
    color: "#888888",
  },
  infoSection: {
    height: 80,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    marginTop: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  addInfoButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  locationSection: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    width: 80,
  },
  locationLabel: {
    fontSize: 16,
    color: "#888888",
    marginLeft: 4,
  },
  locationContent: {
    flex: 1,
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
})

export default CardDetail
