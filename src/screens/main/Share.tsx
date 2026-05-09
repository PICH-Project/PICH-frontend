"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Alert,
  Share as RNShare,
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useSelector } from "react-redux"
import type { RootState } from "../../store"
import { useTabBarHeight } from "../../hooks/useTabBarHeight"
import { fetchCardQRCode } from "../../services/qrService"
import * as FileSystem from "expo-file-system"
import * as Sharing from "expo-sharing"
import { useTheme } from "@/hooks/useTheme"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const ShareScreen = () => {
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const tabBarHeight = useTabBarHeight()
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()

  // Картки юзера + main card. На маунті обираємо main, інакше першу.
  const cards = useSelector((state: RootState) => state.cards.cards)
  const defaultCardId = useMemo(() => {
    const main = cards.find((c) => c.isMainCard)
    return main?.id ?? cards[0]?.id ?? null
  }, [cards])

  useEffect(() => {
    // Якщо ще не вибрана картка, або обрана зникла зі списку — фолбек на default.
    if (!selectedCardId || !cards.find((c) => c.id === selectedCardId)) {
      setSelectedCardId(defaultCardId)
    }
  }, [defaultCardId, selectedCardId, cards])

  // Завантажуємо QR для конкретної картки. Викликається при зміні selectedCardId.
  const loadQRCode = useCallback(async () => {
    if (!selectedCardId) {
      setQrCode(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const qrCodeData = await fetchCardQRCode(selectedCardId)
      setQrCode(qrCodeData)
    } catch (err) {
      setError("Failed to load QR code. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [selectedCardId])

  useEffect(() => {
    loadQRCode()
  }, [loadQRCode])

  // Refresh — просто перевикликає завантаження для поточної selected картки.
  const handleRefresh = async () => {
    await loadQRCode()
    Alert.alert("Refreshed", "QR code reloaded.")
  }

  // Function to share the QR code
  const handleShare = async () => {
    if (!qrCode) return

    try {
      // For base64 QR codes, we can extract the base64 data and save to a temporary file
      if (qrCode.startsWith("data:image")) {
        const base64Data = qrCode.split(",")[1]
        const fileUri = FileSystem.documentDirectory + "user_qr_code.png"

        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        })

        if (Platform.OS === "ios") {
          await Sharing.shareAsync(fileUri)
        } else {
          await RNShare.share({
            url: fileUri,
            title: "My Connection QR Code",
          })
        }
      } else {
        // If it's a URL, share the URL directly
        await RNShare.share({
          url: qrCode,
          title: "My Connection QR Code",
        })
      }
    } catch (err) {
      console.error("Error sharing QR code:", err)
      Alert.alert("Error", "Failed to share QR code. Please try again.")
    }
  }

  // Validate QR code format
  const isValidQRCode = qrCode && qrCode.startsWith("data:image")

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarHeight + 20 }, // Add padding to avoid tab bar overlap
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Update the header title and subtitle */}
        <View style={[styles.headerContainer, { paddingTop: insets.top + 15 }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Connect with Others</Text>
          <Text style={styles.subtitle}>Let others scan your QR code to add you as a friend</Text>
        </View>

        {/* Card picker — горизонтальний скрол з картками юзера. Active card
            виділена; default = main card (або перша). */}
        {cards.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardPickerContainer}
          >
            {cards.map((card) => {
              const active = card.id === selectedCardId
              return (
                <TouchableOpacity
                  key={card.id}
                  onPress={() => setSelectedCardId(card.id)}
                  style={[
                    styles.cardPickerChip,
                    {
                      backgroundColor: active ? "#27261F" : "#FFFFFF",
                      borderColor: active ? "#27261F" : "#DEDDD1",
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: active ? "#FFFFFF" : colors.textPrimary,
                      fontWeight: "600",
                      fontSize: 12,
                    }}
                  >
                    {card.type}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: active ? "#FFFFFF" : colors.textPrimary,
                      fontSize: 13,
                      maxWidth: 120,
                    }}
                  >
                    {card.name}
                  </Text>
                  {card.isMainCard && (
                    <Ionicons
                      name="star"
                      size={14}
                      color={active ? "#FFCC4D" : "#FFCC4D"}
                    />
                  )}
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        )}

        <View style={styles.qrContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFCC4D" />
              <Text style={styles.loadingText}>Loading your QR code...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={60} color="#FF6347" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadQRCode}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : !isValidQRCode ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={60} color="#FF6347" />
              <Text style={styles.errorText}>Invalid QR code format received from server</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadQRCode}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Update the text below the QR code image
            <View style={styles.qrImageContainer}>
              <Image source={{ uri: qrCode }} style={styles.qrImage} resizeMode="contain" />
              <Text style={styles.scanText}>Scan to connect with me</Text>
            </View>
          )}
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleRefresh} disabled={loading}>
            <Ionicons name="refresh-outline" size={24} color="#000000" />
            <Text style={styles.actionButtonText}>Refresh</Text>
          </TouchableOpacity>

          {/* Update the share button title */}
          <TouchableOpacity style={styles.actionButton} onPress={handleShare} disabled={loading || !isValidQRCode}>
            <Ionicons name="share-social-outline" size={24} color="#000000" />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Update the info items at the bottom */}
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#4CD964" />
            <Text style={styles.infoText}>Your QR code is secure and unique to your profile</Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={24} color="#FFCC4D" />
            <Text style={styles.infoText}>Refresh your QR code anytime for enhanced security</Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="people-outline" size={24} color="#5AC8FA" />
            <Text style={styles.infoText}>When someone scans your code, they'll instantly connect with you</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  cardPickerContainer: {
    paddingHorizontal: 4,
    paddingBottom: 16,
    gap: 8,
  },
  cardPickerChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  headerContainer: {
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  qrContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 300,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666666",
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#FF6347",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#FFCC4D",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  qrImageContainer: {
    alignItems: "center",
  },
  qrImage: {
    width: 250,
    height: 250,
    marginBottom: 16,
  },
  scanText: {
    fontSize: 16,
    color: "#666666",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 32,
    marginTop: 24,
  },
  actionButton: {
    backgroundColor: "#FFCC4D",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginLeft: 8,
  },
  infoContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: "#333333",
    marginLeft: 12,
    flex: 1,
  },
})

export default ShareScreen
