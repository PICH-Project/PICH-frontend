"use client"
import { useEffect } from "react"
import { View, Text, StyleSheet, Image, SafeAreaView, ScrollView, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useSelector } from "react-redux"
import { useTheme } from "../../hooks/useTheme"
import SocialButton from "../../components/auth/SocialButton"
import { useAuth } from "../../contexts/AuthContext"
import type { RootState } from "../../store"
import { createPrivyClient, useLoginWithOAuth, usePrivy } from "@privy-io/expo"
import { ConfigVariables } from "@/constants/configVariables"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { StackParamList } from "@/navigation/types"

type StackNav = NativeStackNavigationProp<StackParamList>

const WelcomeScreen = () => {
  const navigation = useNavigation()
  const stackNavigation = useNavigation<StackNav>()
  const { loginWithPrivy } = useAuth()
  const { colors, typography } = useTheme()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  const { login, state } = useLoginWithOAuth({
    onSuccess: async () => {
      const privy = createPrivyClient({
        appId: ConfigVariables.PRIVY_APP_ID,
        clientId: ConfigVariables.PRIVY_CLIENT_SIMPLE_ID,
      });
      const accessToken = await privy.getAccessToken();

      console.log('accessToken', accessToken);

      try {
        await loginWithPrivy({ privyAccessToken: accessToken })

        stackNavigation.navigate("CardDetail", { cardId: 'e19ad2f8-165f-4df8-8997-7065174105ae' });
      } catch (err) {
        // Error is handled by the auth context and shown in the useEffect above
        console.error("Login with google failed during backend request:", err)
        Alert.alert(
          "Login Failed",
          "The google account data you entered is invalid. Please check your credentials and try again.",
          [{ text: "OK" }],
        );
        logout();
      }
    },
    onError: (err: any) => {
      console.error("Login with google failed during oauth with privy:", err)
      Alert.alert(
        "Login Failed",
        "The google account data you entered is invalid. Please check your credentials and try again.",
        [{ text: "OK" }],
      );
      logout();
    },
  });
  const { user, logout } = usePrivy();

  //const { login } = useAuth()

  //console.log(user, 'user');

  // If already authenticated, skip welcome screen
  useEffect(() => {
    if (isAuthenticated) {
      // The navigation in AppNavigator will handle the redirect
      console.log("User already authenticated, skipping welcome screen")
    }
  }, [isAuthenticated, navigation])

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
          <SocialButton provider="google" onPress={() => login({ provider: 'google' })} />
          <SocialButton provider="facebook" onPress={handleFacebookLogin} />
        </View>

        {/* <View style={styles.buttonsContainer}>
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
        </View> */}
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
