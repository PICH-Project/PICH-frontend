"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Dimensions, StatusBar } from "react-native"
import { Camera, CameraView } from "expo-camera"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation, useIsFocused } from "@react-navigation/native"
import { useDispatch } from "react-redux"
import { useTheme } from "../../hooks/useTheme"
import { useTabBarHeight } from "../../hooks/useTabBarHeight"
import { createConnection, fetchConnectedCards } from "../../store/slices/connectionsSlice"
import type { AppDispatch } from "../../store"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const { width, height } = Dimensions.get("window")
const SCAN_AREA_SIZE = width * 0.5

const ScanScreen = () => {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [scanned, setScanned] = useState(false)
  const tabBarHeight = useTabBarHeight()
  const isFocused = useIsFocused()
  const dispatch = useDispatch<AppDispatch>()
  const insets = useSafeAreaInsets()

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync()
      setHasPermission(status === "granted")
    }

    getBarCodeScannerPermissions()
  }, [])

  /**
   * Дістати cardId зі сканованого URL.
   * Підтримує три формати:
   *   pich://connect/<uuid>      ← QR з нашого бек-генератора
   *   pich://card/<uuid>         ← legacy / share-link
   *   https://pich.app/card/<uuid>
   *   ...або просто чистий UUID на крайній випадок.
   * Повертає `null` якщо нічого не розпізнали.
   */
  const extractCardIdFromQR = (raw: string): string | null => {
    if (!raw) return null
    const trimmed = raw.trim()
    // Швидка перевірка — чистий UUID без будь-якого URL?
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (uuidRegex.test(trimmed)) return trimmed
    // Інакше — беремо останній сегмент після '/'.
    const lastSegment = trimmed.split('/').pop()?.split('?')[0]
    if (lastSegment && uuidRegex.test(lastSegment)) return lastSegment
    return null
  }

  const handleBarCodeScanned = async ({ data }: { type: string; data: string }) => {
    setScanned(true)

    const cardId = extractCardIdFromQR(data)
    if (!cardId) {
      Alert.alert(
        "Invalid QR Code",
        "This QR doesn't look like a PICH card. Try scanning again.",
        [{ text: "OK", onPress: () => setScanned(false) }],
      )
      return
    }

    Alert.alert(
      "Add this card?",
      "Add this card to your contacts?",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => setScanned(false),
        },
        {
          text: "Add",
          onPress: async () => {
            try {
              await dispatch(createConnection({ scannedCardId: cardId })).unwrap()
              // Підвантажимо нові connectedCards щоб у Stack вкладці "Connected"
              // одразу з'явилась нова картка.
              dispatch(fetchConnectedCards())
              Alert.alert(
                "Card added",
                "The card has been added to your contacts.",
                [
                  {
                    text: "View",
                    onPress: () => navigation.navigate("Stack" as never),
                  },
                  { text: "OK", style: "cancel" },
                ],
              )
            } catch (err: any) {
              // Бек повертає різні помилки: 409 (вже існує / своя ж картка), 404 (не знайдено).
              const msg =
                typeof err === "string"
                  ? err
                  : err?.response?.data?.message ?? err?.message ?? "Failed to add card"
              Alert.alert("Couldn't add card", msg, [
                { text: "OK", onPress: () => setScanned(false) },
              ])
            }
          },
        },
      ],
      { cancelable: false },
    )
  }

  if (hasPermission === null) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: "#D9D9E6" }]}>
        <Text>Requesting camera permission...</Text>
      </SafeAreaView>
    )
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={[styles.container]}>
        <Text>No access to camera</Text>
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.textPrimary }]} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />

      <View style={[styles.headerContainer, { paddingTop: insets.top + 15 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Scan</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="#1E1B4B" />
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.scanContainer,
          { marginBottom: tabBarHeight + 16 }, // Add margin to avoid tab bar
        ]}
      >
        {isFocused ? (
          <CameraView
            style={styles.camera}
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          >
            {/* Darkened overlay with transparent scanning area */}
            <View style={styles.darkenedOverlay}>
              {/* Top section (darkened) */}
              <View style={styles.darkSection} />

              {/* Middle section with scanning area */}
              <View style={styles.middleSection}>
                {/* Left darkened area */}
                <View style={styles.darkSection} />

                {/* Clear scanning area */}
                <View style={styles.scanArea}>
                  {/* Corner markers */}
                  <View style={styles.cornerTL} />
                  <View style={styles.cornerTR} />
                  <View style={styles.cornerBL} />
                  <View style={styles.cornerBR} />
                </View>

                {/* Right darkened area */}
                <View style={styles.darkSection} />
              </View>

              {/* Bottom section (darkened) */}
              <View style={styles.darkSection} />
            </View>

            <TouchableOpacity style={styles.qrIconContainer}>
              <Ionicons name="qr-code" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </CameraView>
        ) : (
          <View style={[styles.camera, { backgroundColor: "#333", justifyContent: "center", alignItems: "center" }]}>
            <Text style={{ color: "#FFF", fontSize: 16, textAlign: "center" }}>
              Camera paused. Return to this screen to resume scanning.
            </Text>
          </View>
        )}
      </View>

      {scanned && isFocused && (
        <TouchableOpacity
          style={[
            styles.rescanButton,
            {
              backgroundColor: "#4CD964",
              bottom: tabBarHeight + 16, // Add padding above the tab bar
            },
          ]}
          onPress={() => setScanned(false)}
        >
          <Text style={styles.buttonText}>Scan Again</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
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
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  scanContainer: {
    flex: 1,
    marginHorizontal: 32,
    marginTop: height * 0.02,
    paddingBottom: height * 0.05,
    borderRadius: 20,
    overflow: "hidden",
  },
  camera: {
    flex: 1,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  darkenedOverlay: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
  },
  darkSection: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black for darkened effect
  },
  middleSection: {
    flexDirection: "row",
    height: SCAN_AREA_SIZE,
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    backgroundColor: "transparent", // Completely transparent to show camera feed
    position: "relative",
  },
  cornerTL: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: "#FFFFFF",
  },
  cornerTR: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: "#FFFFFF",
  },
  cornerBL: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: "#FFFFFF",
  },
  cornerBR: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: "#FFFFFF",
  },
  qrIconContainer: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignSelf: "center",
  },
  rescanButton: {
    position: "absolute",
    bottom: 32,
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
})

export default ScanScreen
