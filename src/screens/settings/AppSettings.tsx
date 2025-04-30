"use client"

import { useState } from "react"
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "../../hooks/useTheme"
import Avatar from "../../components/common/Avatar"
import Toggle from "../../components/common/Toggle"

const AppSettingsScreen = () => {
  const navigation = useNavigation()
  const { colors, typography } = useTheme()
  const [locationEnabled, setLocationEnabled] = useState(true)
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true)
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true)
  const [darkModeEnabled, setDarkModeEnabled] = useState(true)
  const [submitButtonPlacement, setSubmitButtonPlacement] = useState("Center")

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
          Application settings
        </Text>
        <TouchableOpacity>
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <Avatar uri="https://randomuser.me/api/portraits/men/32.jpg" size={80} />
          <View style={styles.profileInfo}>
            <Text
              style={[
                styles.profileName,
                {
                  color: colors.text,
                  fontFamily: typography.fontFamily.bold,
                  fontSize: typography.fontSize.xl,
                },
              ]}
            >
              John Doe
            </Text>
            <Text
              style={[
                styles.profileUsername,
                {
                  color: colors.textSecondary,
                  fontFamily: typography.fontFamily.regular,
                  fontSize: typography.fontSize.lg,
                },
              ]}
            >
              Johny
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.editButton,
              {
                backgroundColor: colors.secondary,
              },
            ]}
          >
            <Ionicons name="pencil" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.settingsSection}>
          <Toggle
            label="Location Settings"
            description="Allow fetch to use the location services on your device"
            value={locationEnabled}
            onValueChange={setLocationEnabled}
          />

          <Toggle
            label="Push Notification"
            description="Allow fetch to send push notifications on your device"
            value={pushNotificationsEnabled}
            onValueChange={setPushNotificationsEnabled}
          />

          <Toggle
            label="Email Notifications"
            description="Allow fetch to send an email of incoming notifications"
            value={emailNotificationsEnabled}
            onValueChange={setEmailNotificationsEnabled}
          />

          <Toggle
            label="Dark Mode"
            description="Reduces eye strain and saves battery life efficiently"
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
          />

          <View style={styles.dropdownSection}>
            <Text
              style={[
                styles.dropdownLabel,
                {
                  color: colors.text,
                  fontFamily: typography.fontFamily.medium,
                  fontSize: typography.fontSize.md,
                },
              ]}
            >
              Submit button placement
            </Text>
            <Text
              style={[
                styles.dropdownDescription,
                {
                  color: colors.textSecondary,
                  fontFamily: typography.fontFamily.regular,
                  fontSize: typography.fontSize.sm,
                },
              ]}
            >
              You can choose the placement of the submit button according to your preferences
            </Text>
            <TouchableOpacity
              style={[
                styles.dropdown,
                {
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={{
                  color: colors.text,
                  fontFamily: typography.fontFamily.regular,
                  fontSize: typography.fontSize.md,
                }}
              >
                {submitButtonPlacement}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
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
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    marginBottom: 4,
  },
  profileUsername: {},
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  settingsSection: {
    marginBottom: 32,
  },
  dropdownSection: {
    marginTop: 16,
  },
  dropdownLabel: {
    marginBottom: 4,
  },
  dropdownDescription: {
    marginBottom: 16,
  },
  dropdown: {
    height: 56,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
})

export default AppSettingsScreen
