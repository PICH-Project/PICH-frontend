"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Image, StyleSheet, View, TouchableOpacity, ActivityIndicator, Text, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../hooks/useTheme"
import * as ImagePicker from "expo-image-picker"
import filesService, { type UploadFolder } from "../../services/filesService"

interface AvatarProps {
  uri?: string | null
  size?: number
  editable?: boolean
  /**
   * Якщо передано — після вибору фото компонент САМ заллє його на бек
   * (Supabase Storage) і поверне в `onImageSelected` ПУБЛІЧНУ URL.
   * Без цього prop'а — повертається локальний uri і завантаженням
   * займається parent (стара поведінка).
   */
  uploadFolder?: UploadFolder
  onImageSelected?: (uri: string) => void
}

const Avatar: React.FC<AvatarProps> = ({
  uri,
  size = 80,
  editable = false,
  uploadFolder,
  onImageSelected,
}) => {
  const { colors, typography } = useTheme()
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

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return
      }

      const localUri = result.assets[0].uri
      // Показуємо локальне фото одразу — швидкий UX feedback.
      setImageUri(localUri)

      if (uploadFolder) {
        // Заливаємо на бек, віддаємо parent'у публічну Supabase-URL.
        try {
          const uploaded = await filesService.uploadImage(localUri, uploadFolder)
          setImageUri(uploaded.url)
          onImageSelected?.(uploaded.url)
        } catch (err: any) {
          console.error("Avatar upload failed:", err)
          const msg =
            err?.response?.data?.message ??
            err?.message ??
            "Failed to upload image. Please try again."
          Alert.alert("Upload failed", msg)
          // Відкат — показуємо стару URL якщо була.
          setImageUri(uri || null)
        }
      } else {
        // Legacy-режим — parent сам розбереться з локальним URI.
        onImageSelected?.(localUri)
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
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: '#9B9B9B',
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
          <>
            <Ionicons name="image" size={size * 0.4} color={'#9B9B9B'} />
            {editable && (
              <Text
                style={[
                  {
                    color: colors.text,
                    fontFamily: typography.fontFamily.medium,
                    fontSize: typography.fontSize.sm,
                  },
                ]}
              >
                Add photo
              </Text>
            )}
          </>
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
