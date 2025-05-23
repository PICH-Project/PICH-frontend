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

const SignupScreen = () => {
  const navigation = useNavigation()
  const { colors, typography } = useTheme()
  const { register, error, loading, clearAuthError } = useAuth()

  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [nickname, setNickname] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Clear any validation errors when inputs change
  useEffect(() => {
    if (validationError) {
      setValidationError(null)
    }
  }, [email, firstName, lastName, password, confirmPassword])

  // Clear Redux errors when component unmounts
  useEffect(() => {
    return () => {
      clearAuthError()
    }
  }, [clearAuthError])

  // Show error alert when auth error occurs
  useEffect(() => {
    if (error) {
      Alert.alert("Signup Error", error)
      clearAuthError()
    }
  }, [error, clearAuthError])

  const validateInputs = () => {
    if (!email.trim()) {
      setValidationError("Email is required")
      return false
    }

    if (!firstName.trim()) {
      setValidationError("First name is required")
      return false
    }

    if (!lastName.trim()) {
      setValidationError("Last name is required")
      return false
    }

    if (!password) {
      setValidationError("Password is required")
      return false
    }

    if (!confirmPassword) {
      setValidationError("Please confirm your password")
      return false
    }

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match")
      return false
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setValidationError("Please enter a valid email address")
      return false
    }

    // Basic password strength validation
    if (password.length < 8) {
      setValidationError("Password must be at least 8 characters long")
      return false
    }

    return true
  }

  const handleSignup = async () => {
    if (!validateInputs()) {
      return
    }

    try {
      await register({
        email,
        firstName,
        lastName,
        nickname: nickname || undefined,
        password,
      })
    } catch (err) {
      // Error is handled by the auth context and shown in the useEffect above
      console.error("Signup failed:", err)
    }
  }

  const handleGoogleSignup = () => {
    // Implement Google signup
    console.log("Google signup")
  }

  const handleFacebookSignup = () => {
    // Implement Facebook signup
    console.log("Facebook signup")
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
            activeTab="signup"
            onTabChange={(tab) => {
              if (tab === "login") {
                navigation.navigate("Login" as never)
              }
            }}
          />

          <View style={styles.socialButtonsContainer}>
            <SocialButton provider="google" onPress={handleGoogleSignup} />
            <SocialButton provider="facebook" onPress={handleFacebookSignup} />
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

          <View style={styles.inputRow}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    borderColor: validationError && !firstName.trim() ? colors.error : colors.border,
                    fontFamily: typography.fontFamily.regular,
                    fontSize: typography.fontSize.md,
                  },
                ]}
                placeholder="First Name"
                placeholderTextColor={colors.textSecondary}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
            </View>

            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    borderColor: validationError && !lastName.trim() ? colors.error : colors.border,
                    fontFamily: typography.fontFamily.regular,
                    fontSize: typography.fontSize.md,
                  },
                ]}
                placeholder="Last Name"
                placeholderTextColor={colors.textSecondary}
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  fontFamily: typography.fontFamily.regular,
                  fontSize: typography.fontSize.md,
                },
              ]}
              placeholder="Nickname (optional)"
              placeholderTextColor={colors.textSecondary}
              value={nickname}
              onChangeText={setNickname}
              autoCapitalize="words"
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
              autoComplete="password-new"
            />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: validationError && !confirmPassword ? colors.error : colors.border,
                  fontFamily: typography.fontFamily.regular,
                  fontSize: typography.fontSize.md,
                },
              ]}
              placeholder="Confirm Password"
              placeholderTextColor={colors.textSecondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoComplete="password-new"
            />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Button title="Sign up" onPress={handleSignup} loading={loading} style={styles.signupButton} fullWidth />

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
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  signupButton: {
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

export default SignupScreen
