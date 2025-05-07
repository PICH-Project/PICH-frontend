"use client"

import { useMemo } from "react"
import { Platform } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

/**
 * Custom hook to calculate the total height of the tab bar
 * including the protruding Share button
 */
export const useTabBarHeight = () => {
  const insets = useSafeAreaInsets()

  return useMemo(() => {
    const tabBarHeight = 60
    const bottomInset = Platform.OS === "ios" ? insets.bottom : 10

    // Total height includes the tab bar, bottom insets, and the button lift
    return tabBarHeight + bottomInset
  }, [insets.bottom])
}
