"use client"
import { useEffect } from "react"
import { View, Text, StyleSheet, Image, SafeAreaView, ScrollView } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useSelector } from "react-redux"
import { useTheme } from "../../hooks/useTheme"
import Button from "../../components/common/Button"
import SocialButton from "../../components/auth/SocialButton"
import useAuth from "../../hooks/useAuth"
import type { RootState } from "../../store"

const WelcomeScreen = () => {
  const navigation = useNavigation()
  const { colors, typography } = useTheme()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  const { login } = useAuth()

  // If already authenticated, skip welcome screen
  useEffect(() => {
    if (isAuthenticated) {
      // The navigation in AppNavigator will handle the redirect
      console.log("User already authenticated, skipping welcome screen")
    }
  }, [isAuthenticated, navigation])

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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <Image source={require("../../../assets/logo.png")} style={styles.logo} resizeMode="contain" />
        </View>

        <View style={styles.imageContainer}>
          <Image source={require("../../../assets/welcome-image.png")} style={styles.image} resizeMode="contain" />
        </View>

        <Text
          style={[
            styles.title,
            {
              color: colors.text,
              fontFamily: typography.fontFamily.bold,
              fontSize: typography.fontSize.xxxl,
            },
          ]}
        >
          The best place to store contacts
        </Text>

        <View style={styles.socialButtonsContainer}>
          <SocialButton provider="google" onPress={handleGoogleLogin} />
          <SocialButton provider="facebook" onPress={handleFacebookLogin} />
        </View>

        <View style={styles.buttonsContainer}>
          <Button
            title="Log in"
            variant="outline"
            onPress={() => navigation.navigate("Login" as never)}
            style={styles.button}
            fullWidth
          />
          <Button
            title="Sign Up"
            variant="primary"
            onPress={() => navigation.navigate("Signup" as never)}
            style={styles.button}
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 150,
    height: 60,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  image: {
    width: 200,
    height: 200,
  },
  title: {
    textAlign: "center",
    marginBottom: 40,
  },
  socialButtonsContainer: {
    marginBottom: 24,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
})

export default WelcomeScreen
