"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useColorScheme } from "react-native"
import { colors } from "../constants/colors"
import { typography } from "../constants/typography"
import AsyncStorage from "@react-native-async-storage/async-storage"

type ThemeType = "light" | "dark" | "system"

interface ThemeContextType {
  theme: ThemeType
  isDark: boolean
  colors: typeof colors
  typography: typeof typography
  setTheme: (theme: ThemeType) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // NOTE: Тема жорстко зафіксована на light. Dark mode вимкнено
  // (буде додано окремою фічею пізніше). useColorScheme/AsyncStorage
  // навмисно не читаємо, щоб системна тема не міняла кольори.
  const [theme, setThemeState] = useState<ThemeType>("light")
  const isDark = false

  const setTheme = async (newTheme: ThemeType) => {
    // Поки що ігноруємо запит на зміну теми — апка завжди light.
    setThemeState("light")
    try {
      await AsyncStorage.setItem("theme", "light")
    } catch (error) {
      console.error("Failed to save theme preference", error)
    }
  }

  // Кольори завжди світлі
  const themeColors = { ...colors }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        colors: themeColors,
        typography,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
