"use client"

import { useState } from "react"
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "../../hooks/useTheme"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "../../store"
import { createCard } from "../../store/slices/cardsSlice"
import Button from "../../components/common/Button"
import Avatar from "../../components/common/Avatar"
import Toggle from "../../components/common/Toggle"
import { useTabBarHeight } from "../../hooks/useTabBarHeight"

const CreateCardScreen = () => {
  const navigation = useNavigation()
  const { colors, typography } = useTheme()
  const dispatch = useDispatch<AppDispatch>()
  const tabBarHeight = useTabBarHeight()

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: "PAC" as "BAC" | "PAC" | "VAC" | "CAC",
    name: "",
    nickname: "",
    avatar: "",
    phone: "",
    email: "",
    social: {} as Record<string, string>,
    isPrime: false,
    bio: "",
    location: {
      country: "",
      city: "",
      address: "",
      postalCode: "",
    },
    category: "OTHER" as "FAMILY" | "FRIENDS" | "WORK" | "OTHER",
    blockchainId: "",
    isMainCard: false,
    isInWallet: false,
  })

  // Social media platforms
  const [socialPlatforms, setSocialPlatforms] = useState([
    { key: "instagram", label: "Instagram", value: "" },
    { key: "twitter", label: "Twitter", value: "" },
    { key: "linkedin", label: "LinkedIn", value: "" },
    { key: "facebook", label: "Facebook", value: "" },
  ])

  const cardTypes = [
    { value: "BAC", label: "Business Card", color: "#4CD964" },
    { value: "PAC", label: "Personal Card", color: "#FFCC4D" },
    { value: "VAC", label: "Virtual Card", color: "#FF6347" },
    { value: "CAC", label: "Custom Card", color: "#5AC8FA" },
  ]

  const categories = [
    { value: "FAMILY", label: "Family" },
    { value: "FRIENDS", label: "Friends" },
    { value: "WORK", label: "Work" },
    { value: "OTHER", label: "Other" },
  ]

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field.startsWith("location.")) {
      const locationField = field.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const handleSocialChange = (platform: string, value: string) => {
    setSocialPlatforms((prev) => prev.map((p) => (p.key === platform ? { ...p, value } : p)))

    // Update formData.social
    setFormData((prev) => ({
      ...prev,
      social: {
        ...prev.social,
        [platform]: value,
      },
    }))
  }

  const handleAvatarChange = (uri: string) => {
    setFormData((prev) => ({
      ...prev,
      avatar: uri,
    }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert("Validation Error", "Name is required")
      return false
    }
    if (!formData.nickname.trim()) {
      Alert.alert("Validation Error", "Nickname is required")
      return false
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      Alert.alert("Validation Error", "Please enter a valid email address")
      return false
    }
    return true
  }

  const preparePayload = () => {
    // Filter out empty social media entries
    const filteredSocial = Object.entries(formData.social).reduce(
      (acc, [key, value]) => {
        if (value && value.trim()) {
          acc[key] = value.trim()
        }
        return acc
      },
      {} as Record<string, string>,
    )

    // Prepare location object, only include if at least one field is filled
    const hasLocationData = Object.values(formData.location).some((value) => value && value.trim())
    const location = hasLocationData
      ? {
          country: formData.location.country || undefined,
          city: formData.location.city || undefined,
          address: formData.location.address || undefined,
          postalCode: formData.location.postalCode || undefined,
        }
      : undefined

    return {
      type: formData.type,
      name: formData.name.trim(),
      nickname: formData.nickname.trim(),
      avatar: formData.avatar || undefined,
      phone: formData.phone.trim() || undefined,
      email: formData.email.trim() || undefined,
      social: Object.keys(filteredSocial).length > 0 ? filteredSocial : undefined,
      isPrime: formData.isPrime,
      bio: formData.bio.trim() || undefined,
      location,
      category: formData.category,
      blockchainId: formData.blockchainId.trim() || undefined,
      isMainCard: formData.isMainCard,
      isInWallet: formData.isInWallet,
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const payload = preparePayload()
      await dispatch(createCard(payload)).unwrap()

      Alert.alert("Success", "Card created successfully!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ])
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create card. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
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
          Create Card
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarContainer}>
          <Avatar uri={formData.avatar} size={120} editable onImageSelected={handleAvatarChange} />
          <Text style={[styles.avatarLabel, { color: colors.textSecondary }]}>Tap to add photo</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Card Type</Text>
          <View style={styles.cardTypeContainer}>
            {cardTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.cardTypeButton,
                  {
                    backgroundColor: formData.type === type.value ? type.color : colors.card,
                    borderColor: formData.type === type.value ? type.color : colors.border,
                  },
                ]}
                onPress={() => handleInputChange("type", type.value)}
              >
                <Text
                  style={[
                    styles.cardTypeText,
                    {
                      color: formData.type === type.value ? "#FFFFFF" : colors.text,
                    },
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Basic Information</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Name *</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              value={formData.name}
              onChangeText={(value) => handleInputChange("name", value)}
              placeholder="Enter full name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Nickname *</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              value={formData.nickname}
              onChangeText={(value) => handleInputChange("nickname", value)}
              placeholder="Enter nickname"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Phone</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              value={formData.phone}
              onChangeText={(value) => handleInputChange("phone", value)}
              placeholder="Enter phone number"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              value={formData.email}
              onChangeText={(value) => handleInputChange("email", value)}
              placeholder="Enter email address"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Bio</Text>
            <TextInput
              style={[styles.textArea, { color: colors.text, borderColor: colors.border }]}
              value={formData.bio}
              onChangeText={(value) => handleInputChange("bio", value)}
              placeholder="Enter bio description"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Blockchain ID</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              value={formData.blockchainId}
              onChangeText={(value) => handleInputChange("blockchainId", value)}
              placeholder="Enter blockchain ID (optional)"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Social Media</Text>
          {socialPlatforms.map((platform) => (
            <View key={platform.key} style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{platform.label}</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                value={platform.value}
                onChangeText={(value) => handleSocialChange(platform.key, value)}
                placeholder={`Enter ${platform.label} username/URL`}
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
              />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Location</Text>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Country</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                value={formData.location.country}
                onChangeText={(value) => handleInputChange("location.country", value)}
                placeholder="Country"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>City</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                value={formData.location.city}
                onChangeText={(value) => handleInputChange("location.city", value)}
                placeholder="City"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Address</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              value={formData.location.address}
              onChangeText={(value) => handleInputChange("location.address", value)}
              placeholder="Enter address"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Postal Code</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              value={formData.location.postalCode}
              onChangeText={(value) => handleInputChange("location.postalCode", value)}
              placeholder="Enter postal code"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Category</Text>
          <View style={styles.categoryContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.value}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor: formData.category === category.value ? colors.primary : colors.card,
                    borderColor: formData.category === category.value ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => handleInputChange("category", category.value)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color: formData.category === category.value ? "#FFFFFF" : colors.text,
                    },
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Card Settings</Text>

          <Toggle
            label="Prime Card"
            description="Mark this card as a premium card with enhanced features"
            value={formData.isPrime}
            onValueChange={(value) => handleInputChange("isPrime", value)}
          />

          <Toggle
            label="Set as Main Card"
            description="Use this card as your primary card for sharing"
            value={formData.isMainCard}
            onValueChange={(value) => handleInputChange("isMainCard", value)}
          />

          <Toggle
            label="Add to Wallet"
            description="Include this card in your wallet collection"
            value={formData.isInWallet}
            onValueChange={(value) => handleInputChange("isInWallet", value)}
          />
        </View>

        <Button title="Create Card" onPress={handleSubmit} loading={loading} style={styles.submitButton} fullWidth />
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
  avatarLabel: {
    marginTop: 8,
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  cardTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  cardTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  cardTypeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlignVertical: "top",
  },
  inputRow: {
    flexDirection: "row",
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
  },
  submitButton: {
    marginTop: 16,
  },
})

export default CreateCardScreen
