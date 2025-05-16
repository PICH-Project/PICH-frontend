"use client"

import { useState, useEffect, useCallback } from "react"
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
import { useTabBarHeight } from "../../hooks/useTabBarHeight"
import { fetchUserQRCode, refreshUserQRCode } from "../../services/qrService"
import * as FileSystem from "expo-file-system"
import * as Sharing from "expo-sharing"

const ShareScreen = () => {
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const tabBarHeight = useTabBarHeight()

  // Function to load the QR code
  const loadQRCode = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const qrCodeData = await fetchUserQRCode()
      // The QR code is already a data URL that can be used directly
      // It starts with "data:image/png;base64,..."
      setQrCode(qrCodeData)
    } catch (err) {
      setError("Failed to load QR code. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load QR code on component mount
  useEffect(() => {
    loadQRCode()
  }, [loadQRCode])

  // Function to refresh the QR code
  const handleRefresh = async () => {
    setLoading(true)
    setError(null)

    try {
      // Call the refreshUserQRCode function which now correctly uses the GET endpoint
      const newQRCode = await refreshUserQRCode()
      setQrCode(newQRCode)
      Alert.alert("Success", "Your connection QR code has been refreshed.")
    } catch (err) {
      setError("Failed to refresh QR code. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
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
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarHeight + 20 }, // Add padding to avoid tab bar overlap
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Update the header title and subtitle */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Connect with Others</Text>
          <Text style={styles.subtitle}>Let others scan your QR code to add you as a friend</Text>
        </View>

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
    backgroundColor: "#F5F5F7",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  headerContainer: {
    marginTop: 24,
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
    marginTop: 24,
    marginBottom: 32,
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
