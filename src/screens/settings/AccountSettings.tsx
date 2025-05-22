"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "../../hooks/useTheme"
import Avatar from "../../components/common/Avatar"
import Button from "../../components/common/Button"
import { useTabBarHeight } from "../../hooks/useTabBarHeight"
// Change the import from contexts to hooks
import { useAuth } from "../../hooks/useAuth"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "../../store"
import { updateUserProfile } from "../../store/slices/userSlice"
import { fetchUserProfile } from "@/store/slices/authSlice"

const AccountSettingsScreen = () => {
  const navigation = useNavigation()
  const { colors, typography } = useTheme()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [nickName, setNickName] = useState("")
  const [gender, setGender] = useState("M")
  const [birthDate, setBirthDate] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const tabBarHeight = useTabBarHeight()

  // Add state and effect to load user profile
  const [loading, setLoading] = useState(false)
  // Replace the line where refreshUserProfile is destructured
  const { user } = useAuth()
  const dispatch = useDispatch<AppDispatch>()

  // Set default values to prevent undefined errors
  useEffect(() => {
    setFirstName("John")
    setLastName("Doe")
    setNickName("Johny")
    setGender("M")
    setBirthDate("24.02.1986")
    setEmail("j.doe@gmail.com")
    setPhone("+1 876 765 56 54")
  }, [])

  // Remove the loadUserProfile function that uses refreshUserProfile
  // Remove this entire useEffect block:
  // Replace it with a simpler useEffect that just sets loading to false
  useEffect(() => {
    // Set loading to false after initial render
    setLoading(false)
  }, [])

  useEffect(() => {
    // Only fetch user profile if it's not already loaded
    if (!user && !loading) {
      setLoading(true)
      dispatch(fetchUserProfile())
        .unwrap()
        .then(() => setLoading(false))
        .catch(() => setLoading(false))
    } else {
      // If user is already loaded, update the form with user data
      if (user) {
        setFirstName(user.firstName || "John")
        setLastName(user.lastName || "Doe")
        setNickName(user.nickname || "")
        setGender(user.gender || "M")
        setBirthDate(user.birthDate || "24.02.1986")
        setEmail(user.email || "j.doe@gmail.com")
        setPhone(user.phone || "+1 876 765 56 54")
      }
      setLoading(false)
    }
  }, [user])

  // This useEffect is no longer needed as we're handling it in the first useEffect
  // Remove this entire useEffect block:
  // useEffect(() => {
  //   if (user) {
  //     setFirstName(user.firstName || "John");
  //     setLastName(user.lastName || "Doe");
  //     setNickName(user.nickname || "Johny");
  //     setGender(user.gender || "M");
  //     setBirthDate(user.birthDate || "24.02.1986");
  //     setEmail(user.email || "j.doe@gmail.com");
  //     setPhone(user.phone || "+1 876 765 56 54");
  //   }
  // }, [user]);

  // Add a save function to update user profile
  const handleSave = async () => {
    if (!user) {
      Alert.alert("Error", "User profile not loaded")
      return
    }

    setLoading(true)
    try {
      await dispatch(
        updateUserProfile({
          id: user.id,
          firstName,
          lastName,
          nickname: nickName,
          gender,
          birthDate,
          email,
          phone,
        }),
      ).unwrap()

      Alert.alert("Success", "Profile updated successfully")
      navigation.goBack()
    } catch (error) {
      console.error("Error updating profile:", error)
      Alert.alert("Error", "Failed to update profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = (uri: string) => {
    console.log("Avatar changed:", uri)
  }

  const handleGoBack = () => {
    navigation.goBack()
  }

  // Render a simple loading screen while data is being fetched
  if (loading && !user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
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
          Account Settings
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={{ color: colors.primary, fontWeight: "bold" }}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarContainer}>
          <Avatar
            uri={user?.avatar || "https://randomuser.me/api/portraits/men/32.jpg"}
            size={120}
            editable
            onImageSelected={handleAvatarChange}
          />
        </View>

        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.regular,
              fontSize: typography.fontSize.lg,
            },
          ]}
        >
          General settings
        </Text>
        <View style={[styles.separator, { backgroundColor: colors.border }]} />

        <View style={styles.inputGroup}>
          <Text
            style={[
              styles.inputLabel,
              {
                color: colors.textSecondary,
                fontFamily: typography.fontFamily.regular,
                fontSize: typography.fontSize.md,
              },
            ]}
          >
            First Name
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: colors.border,
                fontFamily: typography.fontFamily.regular,
                fontSize: typography.fontSize.md,
              },
            ]}
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text
            style={[
              styles.inputLabel,
              {
                color: colors.textSecondary,
                fontFamily: typography.fontFamily.regular,
                fontSize: typography.fontSize.md,
              },
            ]}
          >
            Last Name
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: colors.border,
                fontFamily: typography.fontFamily.regular,
                fontSize: typography.fontSize.md,
              },
            ]}
            value={lastName}
            onChangeText={setLastName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text
            style={[
              styles.inputLabel,
              {
                color: colors.textSecondary,
                fontFamily: typography.fontFamily.regular,
                fontSize: typography.fontSize.md,
              },
            ]}
          >
            Nick Name
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: colors.border,
                fontFamily: typography.fontFamily.regular,
                fontSize: typography.fontSize.md,
              },
            ]}
            value={nickName}
            onChangeText={setNickName}
          />
        </View>

        <View style={styles.rowInputs}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text
              style={[
                styles.inputLabel,
                {
                  color: colors.textSecondary,
                  fontFamily: typography.fontFamily.regular,
                  fontSize: typography.fontSize.md,
                },
              ]}
            >
              Gender
            </Text>
            <View
              style={[
                styles.selectInput,
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
                {gender}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
            </View>
          </View>

          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text
              style={[
                styles.inputLabel,
                {
                  color: colors.textSecondary,
                  fontFamily: typography.fontFamily.regular,
                  fontSize: typography.fontSize.md,
                },
              ]}
            >
              Birth
            </Text>
            <View
              style={[
                styles.dateInput,
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
                {birthDate}
              </Text>
              <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
            </View>
          </View>
        </View>

        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.regular,
              fontSize: typography.fontSize.lg,
              marginTop: 24,
            },
          ]}
        >
          Contact information
        </Text>
        <View style={[styles.separator, { backgroundColor: colors.border }]} />

        <View style={styles.inputGroup}>
          <Text
            style={[
              styles.inputLabel,
              {
                color: colors.textSecondary,
                fontFamily: typography.fontFamily.regular,
                fontSize: typography.fontSize.md,
              },
            ]}
          >
            Email
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: colors.border,
                fontFamily: typography.fontFamily.regular,
                fontSize: typography.fontSize.md,
              },
            ]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text
            style={[
              styles.inputLabel,
              {
                color: colors.textSecondary,
                fontFamily: typography.fontFamily.regular,
                fontSize: typography.fontSize.md,
              },
            ]}
          >
            Phone number
          </Text>
          <View style={styles.phoneInputContainer}>
            <TextInput
              style={[
                styles.phoneInput,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  fontFamily: typography.fontFamily.regular,
                  fontSize: typography.fontSize.md,
                },
              ]}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <TouchableOpacity
              style={[
                styles.addPhoneButton,
                {
                  backgroundColor: colors.border,
                },
              ]}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <Button
          title="Change password"
          variant="outline"
          onPress={() => console.log("Change password")}
          style={styles.changePasswordButton}
          fullWidth
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...Platform.select({
      ios: {
        paddingTop: 12,
      },
      android: {
        paddingTop: 16,
      },
    }),
  },
  headerTitle: {
    textAlign: "center",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  separator: {
    height: 1,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  rowInputs: {
    flexDirection: "row",
    marginBottom: 16,
  },
  selectInput: {
    height: 56,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateInput: {
    height: 56,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  phoneInput: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  addPhoneButton: {
    width: 56,
    height: 56,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  changePasswordButton: {
    marginTop: 24,
  },
})

export default AccountSettingsScreen
