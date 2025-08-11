"use client"

import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "../../hooks/useTheme"
import Avatar from "../../components/common/Avatar"
import { useTabBarHeight } from "@/hooks/useTabBarHeight"
import { useAuth } from "../../hooks/useAuth"
import { useDispatch } from "react-redux"
import { fetchUserProfile } from "@/store/slices/authSlice"
import type { AppDispatch } from "@/store"

const SettingsScreen = () => {
  const navigation = useNavigation()
  const { colors, typography } = useTheme()
  const { user } = useAuth()
  const dispatch = useDispatch<AppDispatch>()
  const [loading, setLoading] = useState(false)
  const tabBarHeight = useTabBarHeight()

  // Fetch user profile if not already loaded
  useEffect(() => {
    if (!user && !loading) {
      setLoading(true)
      dispatch(fetchUserProfile())
        .unwrap()
        .then(() => setLoading(false))
        .catch(() => setLoading(false))
    }
  }, [user, dispatch, loading])

  const menuItems = [
    {
      id: "account",
      title: "Account Settings",
      icon: "person-outline",
      iconColor: colors.accent,
      screen: "AccountSettings", // Make sure this matches the screen name in SettingsNavigator
    },
    {
      id: "app",
      title: "Application settings",
      icon: "settings-outline",
      iconColor: colors.accent,
      screen: "AppSettings",
    },
    {
      id: "subscription",
      title: "Subscription",
      icon: "star-outline",
      iconColor: colors.accent,
      screen: "Subscription",
    },
    {
      id: "support",
      title: "Contact Support",
      icon: "chatbubble-outline",
      iconColor: colors.accent,
      screen: "Support",
    },
    {
      id: "signout",
      title: "Sign Out",
      icon: "log-out-outline",
      iconColor: colors.accent,
      screen: "SignOut",
    },
  ]

  // Display a loading indicator while fetching user data
  if (loading && !user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    )
  }

  // Format the display name based on available user data
  const getDisplayName = () => {
    if (!user) return "User"

    return `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User"
  }

  // Get the nickname or a fallback
  const getNickname = () => {
    if (!user) return ""

    return user.nickname || ""
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text
          style={[
            styles.headerTitle,
            {
              color: colors.text,
              fontFamily: typography.fontFamily.bold,
              fontSize: typography.fontSize.xxl,
            },
          ]}
        >
          Settings
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + 20 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <Avatar uri={user?.avatar || "https://randomuser.me/api/portraits/men/32.jpg"} size={80} />
          <View style={styles.profileInfo}>
            <Text
              style={[
                styles.profileName,
                {
                  color: colors.text,
                  fontFamily: typography.fontFamily.bold,
                  fontSize: typography.fontSize.xl,
                },
              ]}
            >
              {getDisplayName()}
            </Text>
            {getNickname() ? (
              <Text
                style={[
                  styles.profileUsername,
                  {
                    color: colors.textSecondary,
                    fontFamily: typography.fontFamily.regular,
                    fontSize: typography.fontSize.lg,
                  },
                ]}
              >
                {getNickname()}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <React.Fragment key={item.id}>
              {item.id === "subscription" && (
                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      color: colors.textSecondary,
                      fontFamily: typography.fontFamily.regular,
                      fontSize: typography.fontSize.md,
                    },
                  ]}
                >
                  Resources
                </Text>
              )}
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  {
                    borderBottomColor: colors.border,
                  },
                ]}
                onPress={() => navigation.navigate(item.screen as never)}
              >
                <View style={styles.menuItemLeft}>
                  <View
                    style={[
                      styles.menuItemIcon,
                      {
                        backgroundColor: colors.secondary,
                      },
                    ]}
                  >
                    <Ionicons name={item.icon as any} size={24} color={item.iconColor} />
                  </View>
                  <Text
                    style={[
                      styles.menuItemText,
                      {
                        color: colors.text,
                        fontFamily: typography.fontFamily.medium,
                        fontSize: typography.fontSize.lg,
                      },
                    ]}
                  >
                    {item.title}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        <View style={styles.logoContainer}>
          <Image source={require("../../../assets/logo.png")} style={styles.logo} resizeMode="contain" />
          <Text
            style={[
              styles.versionText,
              {
                color: colors.textSecondary,
                fontFamily: typography.fontFamily.regular,
                fontSize: typography.fontSize.sm,
              },
            ]}
          >
            Version 2.0.3 (571)
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// Add the loadingContainer and loadingText styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 24,
  },
  headerTitle: {
    textAlign: "center",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  profileInfo: {
    marginLeft: 16,
  },
  profileName: {
    marginBottom: 4,
  },
  profileUsername: {},
  menuSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuItemText: {},
  logoContainer: {
    alignItems: "center",
    marginTop: 32,
  },
  logo: {
    width: 150,
    height: 60,
  },
  versionText: {
    marginTop: 8,
  },
})

export default SettingsScreen
