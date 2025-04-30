"use client"

import type React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { useTheme } from "../../hooks/useTheme"

interface AuthTabsProps {
  activeTab: "login" | "signup"
  onTabChange: (tab: "login" | "signup") => void
}

const AuthTabs: React.FC<AuthTabsProps> = ({ activeTab, onTabChange }) => {
  const { colors, typography } = useTheme()

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === "login" && {
            borderBottomColor: colors.accent,
            borderBottomWidth: 3,
          },
        ]}
        onPress={() => onTabChange("login")}
      >
        <Text
          style={[
            styles.tabText,
            {
              color: activeTab === "login" ? colors.text : colors.textSecondary,
              fontFamily: activeTab === "login" ? typography.fontFamily.bold : typography.fontFamily.regular,
              fontSize: typography.fontSize.lg,
            },
          ]}
        >
          Login
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === "signup" && {
            borderBottomColor: colors.accent,
            borderBottomWidth: 3,
          },
        ]}
        onPress={() => onTabChange("signup")}
      >
        <Text
          style={[
            styles.tabText,
            {
              color: activeTab === "signup" ? colors.text : colors.textSecondary,
              fontFamily: activeTab === "signup" ? typography.fontFamily.bold : typography.fontFamily.regular,
              fontSize: typography.fontSize.lg,
            },
          ]}
        >
          Create Account
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabText: {
    textAlign: "center",
  },
})

export default AuthTabs
