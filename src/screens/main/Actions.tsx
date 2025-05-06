"use client"

import { useMemo } from "react"
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, StatusBar } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation, useRoute } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RouteProp } from "@react-navigation/native"
import { useTheme } from "../../hooks/useTheme"
import { useSelector } from "react-redux"
import type { RootState } from "../../store"
import type { StackParamList } from "../../navigation/types"

type ActionsNavigationProp = NativeStackNavigationProp<StackParamList, "Actions">
type ActionsRouteProp = RouteProp<StackParamList, "Actions">

interface ActionItem {
  id: string
  title: string
  icon: string
  iconColor: string
  backgroundColor: string
  onPress: () => void
}

const ActionsScreen = () => {
  const navigation = useNavigation<ActionsNavigationProp>()
  const route = useRoute<ActionsRouteProp>()
  const { colors } = useTheme()
  const { cardId } = route.params || {}

  // Get card details if cardId is provided
  const card = useSelector((state: RootState) => (cardId ? state.cards.cards.find((c) => c.id === cardId) : null))

  const handleAddNewCard = () => {
    // Navigate to create card screen
    console.log("Add new card")
    // navigation.navigate("CreateCard")
  }

  const handleEditCard = () => {
    if (!cardId) {
      console.log("No card selected to edit")
      return
    }
    // Navigate to edit card screen
    console.log("Edit card:", cardId)
    // navigation.navigate("EditCard", { cardId })
  }

  const handleAddToWallet = () => {
    if (!cardId) {
      console.log("No card selected to add to wallet")
      return
    }
    console.log("Add card to wallet:", cardId)
    // Implement wallet functionality
  }

  const handleSetMainCard = () => {
    if (!cardId) {
      console.log("No card selected to set as main")
      return
    }
    console.log("Set as main card:", cardId)
    // Implement set as main card functionality
  }

  const handleDeleteCard = () => {
    if (!cardId) {
      console.log("No card selected to delete")
      return
    }
    console.log("Delete card:", cardId)
    // Implement delete card functionality with confirmation
  }

  const actions: ActionItem[] = useMemo(
    () => [
      {
        id: "add",
        title: "Add new card",
        icon: "add",
        iconColor: "#FFFFFF",
        backgroundColor: "#A39DE8",
        onPress: handleAddNewCard,
      },
      {
        id: "edit",
        title: "Edit card",
        icon: "pencil",
        iconColor: "#FFFFFF",
        backgroundColor: "#A39DE8",
        onPress: handleEditCard,
      },
      {
        id: "wallet",
        title: "Add card to wallet",
        icon: "wallet",
        iconColor: "#FFFFFF",
        backgroundColor: "#A39DE8",
        onPress: handleAddToWallet,
      },
      {
        id: "main",
        title: "Current main card",
        icon: "person",
        iconColor: "#FFFFFF",
        backgroundColor: "#A39DE8",
        onPress: handleSetMainCard,
      },
      {
        id: "delete",
        title: "Delete card",
        icon: "trash",
        iconColor: "#FFFFFF",
        backgroundColor: "#E74C3C",
        onPress: handleDeleteCard,
      },
    ],
    [cardId],
  )

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#F8F8FF" }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#6C63FF" />
        </TouchableOpacity>
        <Text style={styles.title}>Actions</Text>
        <View style={styles.menuButton}>{/* Empty view to maintain header layout */}</View>
      </View>

      <View style={styles.actionsContainer}>
        <View style={styles.actionsContent}>
          {actions.map((action) => (
            <TouchableOpacity key={action.id} style={styles.actionItem} onPress={action.onPress} activeOpacity={0.7}>
              <View style={[styles.iconContainer, { backgroundColor: action.backgroundColor }]}>
                <Ionicons name={action.icon as any} size={24} color={action.iconColor} />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E1B4B",
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  actionsContainer: {
    flex: 1,
    justifyContent: "center", // Vertically center the content
    paddingHorizontal: 36,
  },
  actionsContent: {
    // This wrapper allows us to center the action items while maintaining spacing
    width: "100%",
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EBEAFA",
    borderRadius: 12,
    padding: 8, // Slightly reduced padding
    marginBottom: 12, // Reduced margin between items
  },
  iconContainer: {
    width: 44, // Slightly smaller icon container
    height: 44, // Slightly smaller icon container
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  actionTitle: {
    fontSize: 16, // Reduced from 18 to 16
    fontWeight: "500",
    color: "#1E1B4B",
  },
})

export default ActionsScreen
