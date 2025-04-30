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
  const systemColorScheme = useColorScheme()
  const [theme, setThemeState] = useState<ThemeType>("system")
  const [isDark, setIsDark] = useState(systemColorScheme === "dark")

  useEffect(() => {
    // Load saved theme preference
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("theme")
        if (savedTheme) {
          setThemeState(savedTheme as ThemeType)
        }
      } catch (error) {
        console.error("Failed to load theme preference", error)
      }
    }

    loadTheme()
  }, [])

  useEffect(() => {
    // Determine if dark mode should be active
    if (theme === "system") {
      setIsDark(systemColorScheme === "dark")
    } else {
      setIsDark(theme === "dark")
    }
  }, [theme, systemColorScheme])

  const setTheme = async (newTheme: ThemeType) => {
    setThemeState(newTheme)
    try {
      await AsyncStorage.setItem("theme", newTheme)
    } catch (error) {
      console.error("Failed to save theme preference", error)
    }
  }

  // Adjust colors based on theme
  const themeColors = {
    ...colors,
    // Override colors for dark mode if needed
    ...(isDark && {
      background: "#121212",
      card: "#1E1E1E",
      text: "#FFFFFF",
      textSecondary: "#AAAAAA",
      border: "#333333",
    }),
  }

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
