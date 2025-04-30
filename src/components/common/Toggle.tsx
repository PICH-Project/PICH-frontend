"use client"

import type React from "react"
import { View, Text, StyleSheet, Switch, Platform } from "react-native"
import { useTheme } from "../../hooks/useTheme"

interface ToggleProps {
  label: string
  description?: string
  value: boolean
  onValueChange: (value: boolean) => void
  disabled?: boolean
}

const Toggle: React.FC<ToggleProps> = ({ label, description, value, onValueChange, disabled = false }) => {
  const { colors, typography } = useTheme()

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.label,
            {
              color: colors.text,
              fontFamily: typography.fontFamily.medium,
              fontSize: typography.fontSize.md,
            },
          ]}
        >
          {label}
        </Text>
        {description && (
          <Text
            style={[
              styles.description,
              {
                color: colors.textSecondary,
                fontFamily: typography.fontFamily.regular,
                fontSize: typography.fontSize.sm,
              },
            ]}
          >
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: Platform.OS === "ios" ? "#E9E9EA" : "#767577",
          true: colors.secondary,
        }}
        thumbColor={Platform.OS === "ios" ? "#FFFFFF" : value ? colors.primary : "#F4F3F4"}
        ios_backgroundColor="#E9E9EA"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  label: {
    marginBottom: 4,
  },
  description: {
    lineHeight: 20,
  },
})

export default Toggle
