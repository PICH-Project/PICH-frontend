"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { TextInput, Modal, Alert, ActivityIndicator } from "react-native"
import type { AppDispatch, RootState } from "../../store"
import { fetchUserProfile, updateUserProfile } from "../../store/slices/userSlice"
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "../../hooks/useTheme"
import Avatar from "../../components/common/Avatar"
import Toggle from "../../components/common/Toggle"
import { useTabBarHeight } from "../../hooks/useTabBarHeight"

const AppSettingsScreen = () => {
  const navigation = useNavigation()
  const { colors, typography } = useTheme()
  const dispatch = useDispatch<AppDispatch>()

  // Redux state
  const { profile, loading } = useSelector((state: RootState) => state.user)

  // App settings state
  const [locationEnabled, setLocationEnabled] = useState(true)
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true)
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true)
  const [darkModeEnabled, setDarkModeEnabled] = useState(true)
  const [submitButtonPlacement, setSubmitButtonPlacement] = useState("Center")

  // Edit modal state
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const [editFirstName, setEditFirstName] = useState("")
  const [editLastName, setEditLastName] = useState("")
  const [editNickname, setEditNickname] = useState("")
  const [saving, setSaving] = useState(false)

  // Fetch user profile on component mount
  useEffect(() => {
    if (!profile) {
      dispatch(fetchUserProfile())
    }
  }, [dispatch, profile])

  // Update edit form when user data changes
  useEffect(() => {
    if (profile) {
      setEditFirstName(profile.firstName || "")
      setEditLastName(profile.lastName || "")
      setEditNickname(profile.nickname || "")
    }
  }, [profile])

  const handleEditPress = () => {
    if (profile) {
      setEditFirstName(profile.firstName || "")
      setEditLastName(profile.lastName || "")
      setEditNickname(profile.nickname || "")
      setIsEditModalVisible(true)
    }
  }

  const handleSaveProfile = async () => {
    if (!profile) return

    setSaving(true)
    try {
      await dispatch(
        updateUserProfile({
          id: profile.id,
          firstName: editFirstName.trim(),
          lastName: editLastName.trim(),
          nickname: editNickname.trim(),
          // Keep existing values for other fields
          gender: profile.gender,
          birthDate: profile.birthDate,
          email: profile.email,
          phone: profile.phone,
        }),
      ).unwrap()

      setIsEditModalVisible(false)
      Alert.alert("Success", "Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      Alert.alert("Error", "Failed to update profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const renderEditModal = () => (
    <Modal
      visible={isEditModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setIsEditModalVisible(false)}
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
            <Text style={[styles.modalCancelButton, { color: colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
            Edit Profile
          </Text>
          <TouchableOpacity onPress={handleSaveProfile} disabled={saving}>
            {saving ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={[styles.modalSaveButton, { color: colors.primary }]}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <View style={styles.inputGroup}>
            <Text
              style={[styles.inputLabel, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}
            >
              First Name
            </Text>
            <TextInput
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.border, fontFamily: typography.fontFamily.regular },
              ]}
              value={editFirstName}
              onChangeText={setEditFirstName}
              placeholder="Enter first name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text
              style={[styles.inputLabel, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}
            >
              Last Name
            </Text>
            <TextInput
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.border, fontFamily: typography.fontFamily.regular },
              ]}
              value={editLastName}
              onChangeText={setEditLastName}
              placeholder="Enter last name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text
              style={[styles.inputLabel, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}
            >
              Nickname
            </Text>
            <TextInput
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.border, fontFamily: typography.fontFamily.regular },
              ]}
              value={editNickname}
              onChangeText={setEditNickname}
              placeholder="Enter nickname"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  )

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

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { marginBottom: useTabBarHeight() }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <Avatar uri={profile?.avatar || "https://randomuser.me/api/portraits/men/32.jpg"} size={80} />
          <View style={styles.profileInfo}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
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
                  {profile ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "User" : "Loading..."}
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
                  {profile?.nickname || "No nickname"}
                </Text>
              </>
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.editButton,
              {
                backgroundColor: colors.secondary,
              },
            ]}
            onPress={handleEditPress}
            disabled={loading || !profile}
          >
            <Ionicons name="pencil" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Rest of the settings remain the same */}
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

      {renderEditModal()}
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
    marginTop: 24,
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
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalCancelButton: {
    fontSize: 16,
  },
  modalSaveButton: {
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
})

export default AppSettingsScreen
