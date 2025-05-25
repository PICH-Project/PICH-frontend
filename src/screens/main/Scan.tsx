"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Dimensions, StatusBar } from "react-native"
import { Camera, CameraView } from "expo-camera"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation, useIsFocused } from "@react-navigation/native"
import { useDispatch } from "react-redux"
import { useTheme } from "../../hooks/useTheme"
import { useTabBarHeight } from "../../hooks/useTabBarHeight"
import { createConnection } from "../../store/slices/connectionsSlice"
import type { AppDispatch } from "../../store"

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

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync()
      setHasPermission(status === "granted")
    }

    getBarCodeScannerPermissions()
  }, [])

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    setScanned(true)

    try {
      // Try to parse the QR code data
      const qrData = JSON.parse(data)

      console.log(`qrData: ${qrData}`)

      const cardId = qrData.split('/').pop();

      console.log(`cardId: ${cardId}`)

      // Check if the QR code contains a user ID
      if (qrData && qrData.userId) {
        Alert.alert(
          "Connection Request",
          "Would you like to connect with this user?",
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => setScanned(false),
            },
            {
              text: "Connect",
              onPress: async () => {
                try {
                  // Create a connection with the scanned user
                  await dispatch(createConnection({ scannedUserId: qrData.userId })).unwrap()
                  Alert.alert("Success", "Connection request sent successfully!")
                  navigation.navigate("Stack" as never)
                } catch (error: any) {
                  Alert.alert("Error", error.message || "Failed to create connection. Please try again.")
                  setScanned(false)
                }
              },
            },
          ],
          { cancelable: false },
        )
      } else {
        Alert.alert("Invalid QR Code", "This QR code doesn't contain valid connection information.", [
          {
            text: "OK",
            onPress: () => setScanned(false),
          },
        ])
      }
    } catch (error) {
      Alert.alert("Invalid QR Code", "This QR code doesn't contain valid connection information.", [
        {
          text: "OK",
          onPress: () => setScanned(false),
        },
      ])
    }
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
      <SafeAreaView style={[styles.container, { backgroundColor: "#D9D9E6" }]}>
        <Text>No access to camera</Text>
        <TouchableOpacity style={[styles.button, { backgroundColor: "#4CD964" }]} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#D9D9E6" }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#6C63FF" />
        </TouchableOpacity>
        <Text style={styles.title}>Scan to Connect</Text>
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
    color: "#1E1B4B",
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
    marginTop: height * 0.05,
    marginBottom: height * 0.1,
    borderRadius: 20,
    overflow: "hidden",
  },
  camera: {
    flex: 1,
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
