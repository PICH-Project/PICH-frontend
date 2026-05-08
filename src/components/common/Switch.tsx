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
        false: colors.white,
        true: colors.textTertiary,
      }}
      
      thumbColor={Platform.OS === "ios" ? "#FFFFFF" : value ? colors.text : colors.textTertiary}
      ios_backgroundColor="#E9E9EA"
    />
  )
}

export default Switch;
