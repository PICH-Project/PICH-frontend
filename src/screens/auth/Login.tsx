"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Image,
} from "react-native"
import { useLoginWithEmail } from "@privy-io/expo"

const LoginScreen = () => {
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [codeSent, setCodeSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { sendCode, loginWithCode } = useLoginWithEmail()

  const handleSendCode = async () => {
    if (!email) return

    setIsLoading(true)
    try {
      await sendCode({ email })
      setCodeSent(true)
    } catch (error) {
      console.error("Error sending code:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!code) return

    setIsLoading(true)
    try {
      await loginWithCode({ code, email })
      // Navigation will be handled by the AppNavigator when user state changes
    } catch (error) {
      console.error("Error logging in:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image source={{ uri: "https://your-app-logo-url.com/logo.png" }} style={styles.logo} resizeMode="contain" />
          <Text style={styles.appName}>PICH</Text>
        </View>

        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Welcome to PICH</Text>
          <Text style={styles.welcomeText}>Your digital business card platform powered by blockchain technology</Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            inputMode="email"
            autoCapitalize="none"
            editable={!codeSent}
          />

          {codeSent && (
            <TextInput
              style={styles.input}
              value={code}
              onChangeText={setCode}
              placeholder="Verification Code"
              inputMode="numeric"
              autoFocus
            />
          )}

          {!codeSent ? (
            <TouchableOpacity style={styles.button} onPress={handleSendCode} disabled={isLoading || !email}>
              {isLoading ? <ActivityIndicator color="#000000" /> : <Text style={styles.buttonText}>Send Code</Text>}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading || !code}>
              {isLoading ? <ActivityIndicator color="#000000" /> : <Text style={styles.buttonText}>Login</Text>}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>By continuing, you agree to our Terms of Service and Privacy Policy</Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000000",
  },
  welcomeContainer: {
    marginBottom: 32,
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 12,
    textAlign: "center",
  },
  welcomeText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  formContainer: {
    marginBottom: 32,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#FFCC4D",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    height: 56,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#888888",
    textAlign: "center",
  },
})

export default LoginScreen
