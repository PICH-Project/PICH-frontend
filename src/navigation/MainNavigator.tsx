"use client"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../hooks/useTheme"
import StackScreen from "../screens/main/Stack"
import CardDetail from "../screens/main/CardDetail"
import SettingsNavigator from "./SettingsNavigator"
import { View, StyleSheet, Platform } from "react-native"
import { StackParamList, TabParamList } from "./types"

// Placeholder screens
const ShareScreen = () => <View style={{ flex: 1, backgroundColor: "#FFFFFF" }} />
const ScanScreen = () => <View style={{ flex: 1, backgroundColor: "#FFFFFF" }} />
const AccountScreen = () => <View style={{ flex: 1, backgroundColor: "#FFFFFF" }} />

const Tab = createBottomTabNavigator<TabParamList>()
const Stack = createNativeStackNavigator<StackParamList>()

// Stack navigator for the Stack tab
const StackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StackMain" component={StackScreen} />
      <Stack.Screen name="CardDetail" component={CardDetail} />
    </Stack.Navigator>
  )
}

const MainNavigator = () => {
  const { colors } = useTheme()

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FFCC4D",
        tabBarInactiveTintColor: "#888888",
        tabBarStyle: {
          backgroundColor: "#1E1B4B",
          borderTopWidth: 0,
          height: 80,
          paddingBottom: Platform.OS === "ios" ? 20 : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Share"
        component={ShareScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.shareButtonContainer}>
              <View style={[styles.shareButton, { backgroundColor: focused ? "#FFCC4D" : "#FFFFFF" }]}>
                <Ionicons name="arrow-up" size={24} color="#1E1B4B" />
              </View>
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen
        name="Scan"
        component={ScanScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="qr-code-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Stack"
        component={StackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="layers-outline" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  shareButtonContainer: {
    position: "absolute",
    top: -30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  shareButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
})

export default MainNavigator;