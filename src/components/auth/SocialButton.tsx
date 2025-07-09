"use client"

import type React from "react"
import { TouchableOpacity, Text, StyleSheet, type ViewStyle } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../hooks/useTheme"

interface SocialButtonProps {
  provider?: "google" | "facebook" | "solana"
  onPress: () => void
  style?: ViewStyle;
  text?: string;
}

const SocialButton: React.FC<SocialButtonProps> = ({
  provider = "",
  onPress,
  style,
  text,
}) => {
  const { colors, typography } = useTheme()

  const getIcon = () => {
    switch (provider) {
      case "google":
        return "logo-google"
      case "facebook":
        return "logo-facebook"
      case "solana":
        return ""
      default:
        return ""
    }
  }

  const getLabel = () => {
    switch (provider) {
      case "google":
        return "Continue with Google"
      case "facebook":
        return "Continue with Facebook"
      case "solana":
        return "Continue with Solana"
      default:
        return "Continue with Google"
    }
  }

  const getIconColor = () => {
    switch (provider) {
      case "google":
        return "#FFCC4D"
      case "facebook":
        return "#FFCC4D"
      default:
        return "#FFCC4D"
    }
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderWidth: 1,
        },
        style,
      ]}
      onPress={onPress}
    >
      {!!getIcon() && (
        <Ionicons name={getIcon()} size={24} color={getIconColor()} style={styles.icon} />
      )}
      <Text
        style={[
          styles.text,
          {
            color: colors.text,
            fontFamily: typography.fontFamily.medium,
            fontSize: typography.fontSize.md,
          },
        ]}
      >
        {text || getLabel()}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 50,
    marginVertical: 8,
  },
  icon: {
    marginRight: 12,
  },
  text: {
    textAlign: "center",
  },
})

export default SocialButton
