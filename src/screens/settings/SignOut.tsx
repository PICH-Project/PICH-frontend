"use client"
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useDispatch, useSelector } from "react-redux"
import { useTheme } from "../../hooks/useTheme"
import Button from "../../components/common/Button"
import { logout } from "../../store/slices/authSlice"
import type { AppDispatch, RootState } from "../../store"
import { useTabBarHeight } from "../../hooks/useTabBarHeight"
import { usePrivy } from "@privy-io/expo"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const SignOutScreen = () => {
  const { logout: logoutPrivy } = usePrivy();
  const navigation = useNavigation()
  const { colors, typography } = useTheme()
  const dispatch = useDispatch<AppDispatch>()
  const { loading } = useSelector((state: RootState) => state.auth)
  const insets = useSafeAreaInsets()

  const handleSignOut = () => {
    dispatch(logout())
    logoutPrivy();
  }

  const handleCancel = () => {
    navigation.goBack()
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.text} />
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
          Sign Out
        </Text>
        <TouchableOpacity>
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={[styles.content, { paddingBottom: useTabBarHeight() }]}>
        <Image source={require("../../../assets/logout-icon.png")} style={styles.image} resizeMode="contain" />
        <Text
          style={[
            styles.title,
            {
              color: colors.textPrimary,
              fontFamily: typography.fontFamily.bold,
              fontSize: typography.fontSize.xxxl,
            },
          ]}
        >
          Oh no! You're Leaving...
        </Text>
        <Text
          style={[
            styles.subtitle,
            {
              color: colors.textPrimary,
              fontFamily: typography.fontFamily.bold,
              fontSize: typography.fontSize.xxl,
            },
          ]}
        >
          Are you sure?
        </Text>
        <View style={styles.buttonsContainer}>
          <Button
            title="Neah, Just Kidding"
            variant="primary"
            onPress={handleCancel}
            style={styles.button}
            fullWidth
            rounded
          />
          <Button
            title="Yes, Log Me Out"
            variant="outline"
            onPress={handleSignOut}
            loading={loading}
            style={styles.button}
            fullWidth
            rounded
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    textAlign: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 32,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 48,
  },
  buttonsContainer: {
    width: "100%",
  },
  button: {
    marginBottom: 16,
  },
})

export default SignOutScreen
