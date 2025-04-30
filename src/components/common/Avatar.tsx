"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Image, StyleSheet, View, TouchableOpacity, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../hooks/useTheme"
import * as ImagePicker from "expo-image-picker"

interface AvatarProps {
  uri?: string | null
  size?: number
  editable?: boolean
  onImageSelected?: (uri: string) => void
}

const Avatar: React.FC<AvatarProps> = ({ uri, size = 80, editable = false, onImageSelected }) => {
  const { colors } = useTheme()
  const [imageUri, setImageUri] = useState<string | null>(uri || null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setImageUri(uri || null)
  }, [uri])

  const pickImage = async () => {
    if (!editable) return

    try {
      setLoading(true)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedUri = result.assets[0].uri
        setImageUri(selectedUri)
        if (onImageSelected) {
          onImageSelected(selectedUri)
        }
      }
    } catch (error) {
      console.error("Error picking image:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: imageUri ? "transparent" : colors.card,
        },
      ]}
      onPress={pickImage}
      disabled={!editable}
    >
      {loading ? (
        <ActivityIndicator color={colors.primary} size="small" />
      ) : imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={[
            styles.image,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        />
      ) : (
        <Ionicons name="person" size={size * 0.5} color={colors.textSecondary} />
      )}

      {editable && (
        <View
          style={[
            styles.editButton,
            {
              backgroundColor: colors.primary,
              right: 0,
              bottom: 0,
            },
          ]}
        >
          <Ionicons name="pencil" size={size * 0.2} color="#FFFFFF" />
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  editButton: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
})

export default Avatar
