"use client"
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "../../hooks/useTheme"

interface SupportOption {
  id: string
  title: string
  icon: string
  action: () => void
}

const SupportScreen = () => {
  const navigation = useNavigation()
  const { colors, typography } = useTheme()

  const supportOptions: SupportOption[] = [
    {
      id: "call",
      title: "Call us",
      icon: "call",
      action: () => console.log("Call support"),
    },
    {
      id: "message",
      title: "Message us",
      icon: "mail",
      action: () => console.log("Message support"),
    },
    {
      id: "chat",
      title: "Chat with us",
      icon: "paper-plane",
      action: () => console.log("Chat with support"),
    },
  ]

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text
          style={[
            styles.headerTitle,
            {
              color: colors.text,
              fontFamily: typography.fontFamily.bold,
              fontSize: typography.fontSize.xl,
            },
          ]}
        >
          Contact Support
        </Text>
        <TouchableOpacity>
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text
          style={[
            styles.title,
            {
              color: colors.text,
              fontFamily: typography.fontFamily.bold,
              fontSize: typography.fontSize.xxxl,
            },
          ]}
        >
          Get in touch
        </Text>
        <Text
          style={[
            styles.subtitle,
            {
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.regular,
              fontSize: typography.fontSize.md,
            },
          ]}
        >
          If you have any issues, questions, or suggestions regarding the app, feel free to contact us, and we will
          definitely respond to you.
        </Text>

        <View style={styles.optionsContainer}>
          {supportOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                {
                  backgroundColor: colors.card,
                },
              ]}
              onPress={option.action}
            >
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: colors.secondary,
                  },
                ]}
              >
                <Ionicons name={option.icon as any} size={24} color={colors.primary} />
              </View>
              <Text
                style={[
                  styles.optionTitle,
                  {
                    color: colors.text,
                    fontFamily: typography.fontFamily.medium,
                    fontSize: typography.fontSize.lg,
                  },
                ]}
              >
                {option.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    textAlign: "center",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 32,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionTitle: {},
})

export default SupportScreen
