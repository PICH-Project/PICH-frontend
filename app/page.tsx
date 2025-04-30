"use client"
import { View, Text, StyleSheet } from "react-native"
import { useTheme } from "../src/hooks/useTheme"

export default function Page() {
  const { colors, typography } = useTheme()

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text
        style={[
          styles.text,
          {
            color: colors.text,
            fontFamily: typography.fontFamily.bold,
            fontSize: typography.fontSize.xxl,
          },
        ]}
      >
        Welcome to PICH!
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    textAlign: "center",
  },
})
