"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "../../hooks/useTheme"
import Button from "../../components/common/Button"
import SocialButton from "../../components/auth/SocialButton"
import AuthTabs from "../../components/auth/AuthTabs"
import { useAuth } from "../../contexts/AuthContext"

const LoginScreen = () => {
  const navigation = useNavigation()
  const { colors, typography } = useTheme()
  const { login, error, loading, clearAuthError } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Clear any validation errors when inputs change
  useEffect(() => {
    if (validationError) {
      setValidationError(null)
    }
  }, [email, password])

  // Clear Redux errors when component unmounts
  useEffect(() => {
    return () => {
      clearAuthError()
    }
  }, [clearAuthError])

  // Show error alert when auth error occurs
  useEffect(() => {
    if (error) {
      Alert.alert("Login Error", error)
      clearAuthError()
    }
  }, [error, clearAuthError])

  const validateInputs = () => {
    if (!email.trim()) {
      setValidationError("Email is required")
      return false
    }

    if (!password) {
      setValidationError("Password is required")
      return false
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setValidationError("Please enter a valid email address")
      return false
    }

    return true
  }

  const handleLogin = async () => {
    if (!validateInputs()) {
      return
    }

    try {
      await login({ email, password })
    } catch (err) {
      // Error is handled by the auth context and shown in the useEffect above
      console.error("Login failed:", err)
      Alert.alert(
        "Login Failed",
        "The email or password you entered is invalid. Please check your credentials and try again.",
        [{ text: "OK" }],
      )
      clearAuthError();
    }
  }

  const handleGoogleLogin = () => {
    // Implement Google login
    console.log("Google login")
  }

  const handleFacebookLogin = () => {
    // Implement Facebook login
    console.log("Facebook login")
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Image source={require("../../../assets/logo.png")} style={styles.logo} resizeMode="contain" />
          </View>

          <Text
            style={[
              styles.subtitle,
              {
                color: colors.textSecondary,
                fontFamily: typography.fontFamily.regular,
                fontSize: typography.fontSize.lg,
              },
            ]}
          >
            Set up your Advanta account
          </Text>

          <AuthTabs
            activeTab="login"
            onTabChange={(tab) => {
              if (tab === "signup") {
                navigation.navigate("Signup" as never)
              }
            }}
          />

          <View style={styles.socialButtonsContainer}>
            <SocialButton provider="google" onPress={handleGoogleLogin} />
            <SocialButton provider="facebook" onPress={handleFacebookLogin} />
          </View>

          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text
              style={[
                styles.dividerText,
                {
                  color: colors.textSecondary,
                  fontFamily: typography.fontFamily.regular,
                  fontSize: typography.fontSize.md,
                  backgroundColor: colors.background,
                },
              ]}
            >
              Or better yet...
            </Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
          </View>

          {validationError && (
            <Text
              style={[
                styles.errorText,
                {
                  color: colors.error,
                  fontFamily: typography.fontFamily.medium,
                  fontSize: typography.fontSize.sm,
                },
              ]}
            >
              {validationError}
            </Text>
          )}

          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: validationError && !email.trim() ? colors.error : colors.border,
                  fontFamily: typography.fontFamily.regular,
                  fontSize: typography.fontSize.md,
                },
              ]}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: validationError && !password ? colors.error : colors.border,
                  fontFamily: typography.fontFamily.regular,
                  fontSize: typography.fontSize.md,
                },
              ]}
              placeholder="Password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
            />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Button title="Login" onPress={handleLogin} loading={loading} style={styles.loginButton} fullWidth />

          <Text
            style={[
              styles.termsText,
              {
                color: colors.textSecondary,
                fontFamily: typography.fontFamily.regular,
                fontSize: typography.fontSize.sm,
              },
            ]}
          >
            By creating an account, you accept our{" "}
            <Text
              style={[
                styles.termsLink,
                {
                  color: colors.text,
                  fontFamily: typography.fontFamily.medium,
                },
              ]}
            >
              Terms and conditions
            </Text>{" "}
            you read our{" "}
            <Text
              style={[
                styles.termsLink,
                {
                  color: colors.text,
                  fontFamily: typography.fontFamily.medium,
                },
              ]}
            >
              Privacy Policy
            </Text>
            .
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  logo: {
    width: 150,
    height: 60,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 32,
  },
  socialButtonsContainer: {
    marginBottom: 24,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
  },
  errorText: {
    textAlign: "center",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
    position: "relative",
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: 16,
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  termsText: {
    textAlign: "center",
  },
  termsLink: {
    textDecorationLine: "none",
  },
})

export default LoginScreen
