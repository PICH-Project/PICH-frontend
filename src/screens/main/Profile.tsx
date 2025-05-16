"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, ActivityIndicator } from "react-native"
import { useAuth } from "../../contexts/AuthContext"
import { useProtectedApi } from "../../hooks/useProtectedApi"
import type { UserProfile } from "../../services/authService"

const ProfileScreen = () => {
  const { user } = useAuth()
  const api = useProtectedApi()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await api.get("/api/users/profile")
        setProfile(data)
      } catch (err: any) {
        setError(err.message || "Failed to load profile")
        console.error("Error fetching profile:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [api])

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FFCC4D" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {profile ? (
        <View style={styles.profileContainer}>
          <Text style={styles.name}>
            {profile.firstName} {profile.lastName}
          </Text>
          <Text style={styles.email}>{profile.email}</Text>
          {profile.nickname && <Text style={styles.nickname}>"{profile.nickname}"</Text>}
        </View>
      ) : (
        <Text>No profile data available</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  profileContainer: {
    width: "100%",
    padding: 20,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  email: {
    fontSize: 16,
    marginBottom: 5,
  },
  nickname: {
    fontSize: 16,
    fontStyle: "italic",
  },
})

export default ProfileScreen
