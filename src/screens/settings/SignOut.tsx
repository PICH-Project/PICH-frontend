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

const SignOutScreen = () => {
  const navigation = useNavigation()
  const { colors, typography } = useTheme()
  const dispatch = useDispatch<AppDispatch>()
  const { loading } = useSelector((state: RootState) => state.auth)

  const handleSignOut = () => {
    Alert.alert(
      "Confirm Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: () => {
            dispatch(logout())
          },
        },
      ],
      { cancelable: true },
    )
  }

  const handleCancel = () => {
    navigation.goBack()
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
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
              color: colors.text,
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
              color: colors.text,
              fontFamily: typography.fontFamily.bold,
              fontSize: typography.fontSize.xxl,
            },
          ]}
        >
          Are you sure?
        </Text>
        <View style={styles.buttonsContainer}>
          <Button title="Neah, Just Kidding" variant="primary" onPress={handleCancel} style={styles.button} fullWidth />
          <Button
            title="Yes, Log Me Out"
            variant="outline"
            onPress={handleSignOut}
            loading={loading}
            style={styles.button}
            fullWidth
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
