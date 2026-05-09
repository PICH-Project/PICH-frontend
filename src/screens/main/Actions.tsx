"use client"

import { ReactNode, useMemo } from "react"
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, StatusBar, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation, useRoute } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RouteProp } from "@react-navigation/native"
import { useTheme } from "../../hooks/useTheme"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "../../store"
import type { StackParamList } from "../../navigation/types"
import { useTabBarHeight } from "../../hooks/useTabBarHeight"
import Svg, { Path } from "react-native-svg"
import { useSafeAreaInsets } from "react-native-safe-area-context"

type ActionsNavigationProp = NativeStackNavigationProp<StackParamList, "Actions">
type ActionsRouteProp = RouteProp<StackParamList, "Actions">

interface ActionItem {
  id: string
  title: string
  icon: string | ReactNode
  iconColor: string
  onPress: () => void
}

const PlusIcon = ({ color = "#71706A" }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 9.68555C0 9.02281 0.537244 8.48555 1.19999 8.48555H8.48527V1.20026C8.48527 0.537523 9.02253 0.000265079 9.68527 0.000265316C10.348 0.00026481 10.8853 0.537523 10.8853 1.20027V8.48555H18.1705C18.8333 8.48555 19.3705 9.0228 19.3705 9.68555C19.3705 10.3483 18.8333 10.8855 18.1705 10.8855H10.8853V18.1708C10.8853 18.8336 10.348 19.3708 9.68527 19.3708C9.02253 19.3708 8.48527 18.8336 8.48527 18.1708V10.8855H1.19999C0.537244 10.8855 0 10.3483 0 9.68555Z"
      fill={color}
    />
  </Svg>
);

const EditIcon = ({ color = "#71706A" }: { color?: string }) => (
  <Svg width={19} height={19} viewBox="0 0 19 19" fill="none">
    <Path
      d="M13.9127 0.769891C14.9393 -0.25663 16.6036 -0.25663 17.6301 0.769891C18.6566 1.79641 18.6566 3.46073 17.6301 4.48725L16.588 5.52934L12.8707 1.81198L13.9127 0.769891Z"
      fill={color}
    />
    <Path
      d="M11.012 3.67066L0 14.6826V18.4H3.71736L14.7293 7.38802L11.012 3.67066Z"
      fill={color}
    />
  </Svg>
);

const WalletIcon = ({ color = "#71706A" }: { color?: string }) => (
  <Svg width={22} height={19} viewBox="0 0 22 19" fill="none">
    <Path
      d="M19.872 3.34545H2.592C2.36285 3.34545 2.14309 3.25734 1.98106 3.10049C1.81903 2.94364 1.728 2.73091 1.728 2.50909C1.728 2.28727 1.81903 2.07454 1.98106 1.91769C2.14309 1.76084 2.36285 1.67273 2.592 1.67273H17.28C17.5091 1.67273 17.7289 1.58461 17.8909 1.42776C18.053 1.27091 18.144 1.05818 18.144 0.836364C18.144 0.614546 18.053 0.401814 17.8909 0.244965C17.7289 0.0881168 17.5091 0 17.28 0H2.592C1.90456 0 1.24527 0.26435 0.759179 0.734896C0.273085 1.20544 0 1.84364 0 2.50909V15.8909C0 16.5564 0.273085 17.1946 0.759179 17.6651C1.24527 18.1357 1.90456 18.4 2.592 18.4H19.872C20.3303 18.4 20.7698 18.2238 21.0939 17.9101C21.4179 17.5964 21.6 17.1709 21.6 16.7273V5.01818C21.6 4.57455 21.4179 4.14908 21.0939 3.83539C20.7698 3.52169 20.3303 3.34545 19.872 3.34545ZM15.984 11.7091C15.7277 11.7091 15.4771 11.6355 15.264 11.4977C15.0509 11.3598 14.8847 11.1639 14.7867 10.9346C14.6886 10.7054 14.6629 10.4532 14.7129 10.2098C14.7629 9.96644 14.8863 9.7429 15.0676 9.56745C15.2488 9.392 15.4798 9.27251 15.7312 9.22411C15.9826 9.1757 16.2431 9.20054 16.48 9.2955C16.7168 9.39045 16.9192 9.55125 17.0616 9.75756C17.204 9.96387 17.28 10.2064 17.28 10.4545C17.28 10.7873 17.1435 11.1064 16.9004 11.3416C16.6574 11.5769 16.3277 11.7091 15.984 11.7091Z"
      fill={color}
    />
  </Svg>
);

const ProfileIcon = ({ color = "#71706A" }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M20 10C20 15.5228 15.5228 20 10 20C4.47715 20 0 15.5228 0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10ZM12.5 6.25C12.5 7.63071 11.3807 8.75 10 8.75C8.61929 8.75 7.5 7.63071 7.5 6.25C7.5 4.86929 8.61929 3.75 10 3.75C11.3807 3.75 12.5 4.86929 12.5 6.25ZM9.99992 11.25C7.47799 11.25 5.30493 12.7437 4.31717 14.8946C5.69254 16.49 7.72831 17.5 9.99998 17.5C12.2716 17.5 14.3073 16.4901 15.6827 14.8947C14.695 12.7437 12.5219 11.25 9.99992 11.25Z"
      fill={color}
    />
  </Svg>
);

const TrashIcon = ({ color = "#FF6459" }: { color?: string }) => (
  <Svg width={19} height={17} viewBox="0 0 17 19" fill="none">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.2 0C6.74547 0 6.32996 0.246103 6.12669 0.635704L5.25836 2.3H1.2C0.537258 2.3 0 2.81487 0 3.45C0 4.08513 0.537259 4.6 1.2 4.6L1.2 16.1C1.2 17.3703 2.27452 18.4 3.6 18.4H13.2C14.5255 18.4 15.6 17.3703 15.6 16.1V4.6C16.2627 4.6 16.8 4.08513 16.8 3.45C16.8 2.81487 16.2627 2.3 15.6 2.3H11.5416L10.6733 0.635704C10.47 0.246103 10.0545 0 9.6 0H7.2ZM4.8 6.9C4.8 6.26487 5.33726 5.75 6 5.75C6.66274 5.75 7.2 6.26487 7.2 6.9V13.8C7.2 14.4351 6.66274 14.95 6 14.95C5.33726 14.95 4.8 14.4351 4.8 13.8V6.9ZM10.8 5.75C10.1373 5.75 9.6 6.26487 9.6 6.9V13.8C9.6 14.4351 10.1373 14.95 10.8 14.95C11.4627 14.95 12 14.4351 12 13.8V6.9C12 6.26487 11.4627 5.75 10.8 5.75Z"
      fill={color}
    />
  </Svg>
);

const ActionsScreen = () => {
  const navigation = useNavigation<ActionsNavigationProp>()
  const route = useRoute<ActionsRouteProp>()
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const { cardId } = route.params || {}

  // Get card details if cardId is provided
  const card = useSelector((state: RootState) => (cardId ? state.cards.cards.find((c) => c.id === cardId) : null))

  const handleAddNewCard = () => {
    // Navigate to create card screen
    navigation.navigate("CardConstructor")
  }

  const handleEditCard = () => {
    // Navigate to edit card screen
    navigation.navigate("EditCard")
  }

  const handleAddToWallet = async () => {
    if (!cardId) {
      Alert.alert("Error", "No card selected to add to wallet")
      return
    }

    try {
      Alert.alert("Success", "Card wallet status updated")
    } catch (error) {
      console.error("Error toggling wallet status:", error)
      Alert.alert("Error", "Failed to update wallet status. Please try again.")
    }
  }

  const handleSetMainCard = async () => {
    // Navigate to set main card screen
    navigation.navigate("SetMainCard")
  }

  const handleDeleteCard = () => {
    // Navigate to delete card screen
    navigation.navigate("DeleteCard")
  }

  const actions: ActionItem[] = useMemo(
    () => [
      {
        id: "add",
        title: "Add new card",
        icon: <PlusIcon />,
        iconColor: "#FFFFFF",
        onPress: handleAddNewCard,
      },
      {
        id: "edit",
        title: "Edit card",
        icon: <EditIcon />,
        iconColor: "#FFFFFF",
        onPress: handleEditCard,
      },
      {
        id: "wallet",
        title: "Add card to wallet",
        icon: <WalletIcon />,
        iconColor: "#FFFFFF",
        onPress: handleAddToWallet,
      },
      {
        id: "main",
        title: "Current main card",
        icon: <ProfileIcon />,
        iconColor: "#FFFFFF",
        onPress: handleSetMainCard,
      },
      {
        id: "delete",
        title: "Delete card",
        icon: <TrashIcon />,
        iconColor: "#FFFFFF",
        onPress: handleDeleteCard,
      },
    ],
    [cardId],
  )

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          // Add padding for tab bar
          backgroundColor: colors.background,
        },
      ]}
    >
      <StatusBar barStyle="dark-content" />

      <View style={[styles.headerContainer, { paddingTop: insets.top + 15 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Actions</Text>
        <View style={styles.menuButton}>{/* Empty view to maintain header layout */}</View>
      </View>

      <View style={[styles.actionsContainer, { paddingBottom: useTabBarHeight() }]}>
        <View style={styles.actionsContent}>
          {actions.map((action) => (
            <TouchableOpacity key={action.id} style={[styles.actionItem, { borderColor: colors.textPrimary }]} onPress={action.onPress} activeOpacity={0.7}>
              <View style={[styles.iconContainer]}>
                {action.icon}
              </View>
              <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>{action.title}</Text>
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
    paddingVertical: 24,
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
    borderWidth: 1,
    borderRadius: 12,
    padding: 8, // Slightly reduced padding
    marginBottom: 12, // Reduced margin between items
  },
  iconContainer: {
    width: 36, // Slightly smaller icon container
    height: 40, // Slightly smaller icon container
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
