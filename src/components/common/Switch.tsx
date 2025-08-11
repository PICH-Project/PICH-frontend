"use client"

import type React from "react"
import { Platform, Switch as SwitchNative } from "react-native"
import { useTheme } from "../../hooks/useTheme"

interface SwitchProps {
  value: boolean
  onValueChange: (value: boolean) => void
  disabled?: boolean
}

const Switch: React.FC<SwitchProps> = ({ value, onValueChange, disabled = false }) => {
  const { colors } = useTheme()

  return (
    <SwitchNative
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
  )
}

export default Switch;
