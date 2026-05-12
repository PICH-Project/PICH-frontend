"use client"
import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useTheme } from "../../hooks/useTheme"
import { useTabBarHeight } from "../../hooks/useTabBarHeight"
import donationsService from "../../services/donationsService"
import { useMobileWallet } from "../../features/solana/useMobileWallet"
import { Connection, VersionedTransaction } from "@solana/web3.js"
import { Buffer } from "buffer"
import type { StackParamList } from "../../navigation/types"

/**
 * Скільки lamports у 1 SOL. Юзер вводить SOL — конвертуємо в lamports для бека.
 */
const LAMPORTS_PER_SOL = 1_000_000_000

/**
 * Мережа Solana, на якій підписуємо/сабмітимо. Має збігатись з UMBRA_NETWORK
 * на беку. Якщо там 'devnet' — і тут має бути 'devnet'.
 */
const SOLANA_CLUSTER: "mainnet-beta" | "devnet" = "mainnet-beta"

const SOLANA_RPC_URL =
  SOLANA_CLUSTER === "mainnet-beta"
    ? "https://api.mainnet-beta.solana.com"
    : "https://api.devnet.solana.com"

const SOLSCAN_BASE =
  SOLANA_CLUSTER === "mainnet-beta"
    ? "https://solscan.io/tx"
    : "https://solscan.io/tx" // ?cluster=devnet додамо нижче

const DonateCardScreen = () => {
  const navigation = useNavigation()
  const route = useRoute<RouteProp<StackParamList, "DonateCard">>()
  const { charity } = route.params

  const insets = useSafeAreaInsets()
  const tabBarHeight = useTabBarHeight()
  const { colors, typography } = useTheme()

  const wallet = useMobileWallet({
    identity: { name: "PICH", uri: "https://pich.app" },
    cluster: SOLANA_CLUSTER,
  })

  const [amountSol, setAmountSol] = useState("0.01")
  const [phase, setPhase] = useState<
    "idle" | "preparing" | "signing" | "confirming" | "done"
  >("idle")
  const [txSignature, setTxSignature] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const isBusy = phase === "preparing" || phase === "signing" || phase === "confirming"

  const handleDonate = async () => {
    setErrorMsg(null)
    setTxSignature(null)

    const amount = parseFloat(amountSol)
    if (Number.isNaN(amount) || amount <= 0) {
      Alert.alert("Invalid amount", "Enter a positive SOL amount, e.g. 0.05")
      return
    }

    try {
      // 1. Connect Phantom (показує picker якщо ще не підключався).
      let sender = wallet.account
      if (!sender) {
        sender = await wallet.connect()
      }
      const senderAddress = sender.publicKey.toBase58()

      // 2. Просимо бек збилдити unsigned Umbra deposit-tx.
      //    Umbra шифрує суму і кладе в shielded pool на ім'я recipient'а.
      setPhase("preparing")
      const lamports = BigInt(Math.round(amount * LAMPORTS_PER_SOL)).toString()
      const prepared = await donationsService.prepareDonation({
        senderAddress,
        recipientAddress: charity.donationWallet,
        amount: lamports,
      })

      // 3. Десеріалізуємо base64 → VersionedTransaction.
      const txBytes = Buffer.from(prepared.transaction, "base64")
      const tx = VersionedTransaction.deserialize(txBytes)

      // 4. Підпис + submit через MWA.
      setPhase("signing")
      const connection = new Connection(SOLANA_RPC_URL, "confirmed")
      const { context } = await connection.getLatestBlockhashAndContext("confirmed")
      const sig = await wallet.signAndSendTransaction(tx, context.slot)

      console.log("[Donate] tx signature:", sig)
      setTxSignature(sig)

      // 5. Чекаємо confirm у блокчейні.
      setPhase("confirming")
      const confirmation = await connection.confirmTransaction(sig, "confirmed")
      if (confirmation.value.err) {
        throw new Error(`Transaction failed on-chain: ${JSON.stringify(confirmation.value.err)}`)
      }

      setPhase("done")
    } catch (err: any) {
      console.error("[Donate] failed:", err)
      const msg =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.message ??
        "Unknown error"
      setErrorMsg(msg)
      setPhase("idle")
    }
  }

  const openInSolscan = () => {
    if (!txSignature) return
    const url =
      SOLANA_CLUSTER === "mainnet-beta"
        ? `${SOLSCAN_BASE}/${txSignature}`
        : `${SOLSCAN_BASE}/${txSignature}?cluster=devnet`
    Linking.openURL(url).catch(console.error)
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text
          style={[
            styles.headerTitle,
            {
              color: colors.text,
              fontFamily: typography.fontFamily.bold,
              fontSize: typography.fontSize.xl,
            },
          ]}
        >
          Donate
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.scrollContent,
            // Запас знизу щоб контент не залазив під bottomBar та TabBar.
            { paddingBottom: tabBarHeight + 120 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Charity card preview */}
          <View
            style={[
              styles.charityCard,
              { backgroundColor: charity.cardColor },
            ]}
          >
            <View style={styles.charityCardHeader}>
              <Image source={{ uri: charity.logoUrl }} style={styles.charityLogo} />
              <View style={styles.charityCardBadge}>
                <Text style={styles.charityCardBadgeText}>CHARITY</Text>
              </View>
            </View>
            <Text style={styles.charityName}>{charity.companyName}</Text>
            <Text style={styles.charityContactPerson}>{charity.contactPerson}</Text>
            <Text style={styles.charitySlogan}>{charity.slogan}</Text>
          </View>

          {/* About */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {charity.description}
            </Text>
          </View>

          {/* Wallet address (truncated) */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Donation Wallet
            </Text>
            <View style={styles.walletBox}>
              <Text style={styles.walletText} numberOfLines={1}>
                {charity.donationWallet.slice(0, 8)}...
                {charity.donationWallet.slice(-8)}
              </Text>
            </View>
          </View>

          {/* Amount input */}
          {phase !== "done" && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Amount (SOL)
              </Text>
              <TextInput
                style={styles.amountInput}
                value={amountSol}
                onChangeText={setAmountSol}
                keyboardType="decimal-pad"
                placeholder="0.05"
                placeholderTextColor="#9B9B9B"
                editable={!isBusy}
              />
              <View style={styles.quickAmounts}>
                {["0.01", "0.05", "0.1", "0.5"].map((a) => (
                  <TouchableOpacity
                    key={a}
                    onPress={() => setAmountSol(a)}
                    disabled={isBusy}
                    style={styles.quickAmountChip}
                  >
                    <Text style={styles.quickAmountText}>{a} SOL</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Status / error */}
          {errorMsg && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={20} color="#D32F2F" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {phase === "done" && (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />
              <Text style={styles.successTitle}>Donation sent!</Text>
              <Text style={styles.successSubtitle}>
                Thank you for supporting {charity.companyName} 🙏
              </Text>
              <TouchableOpacity onPress={openInSolscan} style={styles.solscanLink}>
                <Ionicons name="open-outline" size={16} color="#4A90E2" />
                <Text style={styles.solscanLinkText}>View on Solscan</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Bottom action — absolute щоб не залежати від ScrollView висоти. */}
        <View
          style={[
            styles.bottomBar,
            {
              paddingBottom: insets.bottom + 12,
              bottom: tabBarHeight,
            },
          ]}
        >
          {phase === "done" ? (
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.donateButton, isBusy && styles.donateButtonDisabled]}
              onPress={handleDonate}
              disabled={isBusy}
              activeOpacity={0.8}
            >
              {isBusy ? (
                <View style={styles.donateButtonBusy}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.donateButtonText}>
                    {phase === "preparing"
                      ? "Preparing transaction..."
                      : phase === "signing"
                        ? "Awaiting signature..."
                        : "Confirming on-chain..."}
                  </Text>
                </View>
              ) : (
                <Text style={styles.donateButtonText}>Donate</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { textAlign: "center" },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  charityCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  charityCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  charityLogo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  charityCardBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  charityCardBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  charityName: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  charityContactPerson: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    marginBottom: 12,
  },
  charitySlogan: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontStyle: "italic",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  walletBox: {
    backgroundColor: "#F2F2F2",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
  },
  walletText: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 13,
    color: "#27261F",
  },
  amountInput: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: "600",
    color: "#27261F",
  },
  quickAmounts: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  quickAmountChip: {
    backgroundColor: "#F2F2F2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  quickAmountText: {
    color: "#27261F",
    fontSize: 12,
    fontWeight: "600",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FDECEA",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  errorText: {
    flex: 1,
    color: "#B71C1C",
    fontSize: 13,
  },
  successBox: {
    backgroundColor: "#E8F5E9",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  successTitle: {
    color: "#2E7D32",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 8,
  },
  successSubtitle: {
    color: "#2E7D32",
    fontSize: 13,
    marginTop: 4,
    textAlign: "center",
  },
  solscanLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 12,
  },
  solscanLinkText: {
    color: "#4A90E2",
    fontSize: 13,
    fontWeight: "600",
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F2F2F2",
  },
  donateButton: {
    backgroundColor: "#27261F",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  donateButtonDisabled: {
    backgroundColor: "#B5B4AE",
  },
  donateButtonBusy: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  donateButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  doneButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
})

export default DonateCardScreen
