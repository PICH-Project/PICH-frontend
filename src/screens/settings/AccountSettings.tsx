"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "../../hooks/useTheme"
import Avatar from "../../components/common/Avatar"
import Button from "../../components/common/Button"
import { useTabBarHeight } from "../../hooks/useTabBarHeight"

const AccountSettingsScreen = () => {
  const navigation = useNavigation()
  const { colors, typography } = useTheme()
  const [firstName, setFirstName] = useState("John")
  const [lastName, setLastName] = useState("Doe")
  const [nickName, setNickName] = useState("Johny")
  const [gender, setGender] = useState("M")
  const [birthDate, setBirthDate] = useState("24.02.1986")
  const [email, setEmail] = useState("j.doe@gmail.com")
  const [phone, setPhone] = useState("+1 876 765 56 54")

  const handleAvatarChange = (uri: string) => {
    console.log("Avatar changed:", uri)
  }

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
          Account Settings
        </Text>
        <TouchableOpacity>
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: useTabBarHeight() }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarContainer}>
          <Avatar
            uri="https://randomuser.me/api/portraits/men/32.jpg"
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
