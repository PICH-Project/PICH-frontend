"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Dimensions, StatusBar } from "react-native"
import { Camera, CameraView } from "expo-camera"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "../../hooks/useTheme"

const { width, height } = Dimensions.get("window")
const SCAN_AREA_SIZE = width * 0.5

const ScanScreen = () => {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [scanned, setScanned] = useState(false)

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync()
      setHasPermission(status === "granted")
    }

    getBarCodeScannerPermissions()
  }, [])

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true)
    Alert.alert(
      "QR Code Scanned",
      `Card data: ${data}`,
      [
        {
          text: "Add to Stack",
          onPress: () => {
            // Here you would process the QR code data and add the card to the stack
            console.log("Adding card to stack:", data)
            navigation.navigate("Stack" as never)
          },
        },
        {
          text: "Scan Again",
          onPress: () => setScanned(false),
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
        <Text style={styles.title}>Scan</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="#1E1B4B" />
        </TouchableOpacity>
      </View>

      <View style={styles.scanContainer}>
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
      </View>

      {scanned && (
        <TouchableOpacity
          style={[styles.rescanButton, { backgroundColor: "#4CD964" }]}
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
