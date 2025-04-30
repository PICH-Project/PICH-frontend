"use client"

import type React from "react"
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, type ViewStyle, type TextStyle } from "react-native"
import { useTheme } from "../../hooks/useTheme"

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: "primary" | "secondary" | "outline"
  size?: "small" | "medium" | "large"
  disabled?: boolean
  loading?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
  fullWidth?: boolean
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const { colors, typography } = useTheme()

  // Determine background color based on variant
  const getBackgroundColor = () => {
    if (disabled) return colors.textSecondary

    switch (variant) {
      case "primary":
        return colors.primary
      case "secondary":
        return colors.secondary
      case "outline":
        return "transparent"
      default:
        return colors.primary
    }
  }

  // Determine text color based on variant
  const getTextColor = () => {
    if (disabled) return colors.background

    switch (variant) {
      case "primary":
      case "secondary":
        return "#FFFFFF"
      case "outline":
        return colors.primary
      default:
        return "#FFFFFF"
    }
  }

  // Determine padding based on size
  const getPadding = () => {
    switch (size) {
      case "small":
        return { paddingVertical: 8, paddingHorizontal: 16 }
      case "medium":
        return { paddingVertical: 12, paddingHorizontal: 24 }
      case "large":
        return { paddingVertical: 16, paddingHorizontal: 32 }
      default:
        return { paddingVertical: 12, paddingHorizontal: 24 }
    }
  }

  // Determine font size based on size
  const getFontSize = () => {
    switch (size) {
      case "small":
        return typography.fontSize.sm
      case "medium":
        return typography.fontSize.md
      case "large":
        return typography.fontSize.lg
      default:
        return typography.fontSize.md
    }
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: variant === "outline" ? colors.primary : "transparent",
          borderWidth: variant === "outline" ? 1 : 0,
          width: fullWidth ? "100%" : "auto",
          ...getPadding(),
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: getTextColor(),
              fontSize: getFontSize(),
              fontFamily: typography.fontFamily.medium,
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  text: {
    textAlign: "center",
  },
})

export default Button
