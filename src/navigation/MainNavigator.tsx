"use client"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { Ionicons } from "@expo/vector-icons"
import StackScreen from "../screens/main/Stack"
import CardDetail from "../screens/main/CardDetail"
import ScanScreen from "../screens/main/Scan"
import ActionsScreen from "../screens/main/Actions"
import SettingsNavigator from "./SettingsNavigator"
import { View, Text, StyleSheet, Platform, Dimensions, TouchableOpacity } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import type { TabParamList, StackParamList } from "./types"

// Placeholder screens
const AccountScreen = () => <View style={{ flex: 1, backgroundColor: "#FFFFFF" }} />
const ShareScreen = () => <View style={{ flex: 1, backgroundColor: "#FFFFFF" }} />

const Tab = createBottomTabNavigator<TabParamList>()
const Stack = createNativeStackNavigator<StackParamList>()

// Stack navigator for the Stack tab
const StackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StackMain" component={StackScreen} />
      <Stack.Screen name="CardDetail" component={CardDetail} />
      <Stack.Screen name="Actions" component={ActionsScreen} />
    </Stack.Navigator>
  )
}

// Custom Tab Bar component with curved top edge
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const insets = useSafeAreaInsets()
  const { width } = Dimensions.get("window")
  const tabBarHeight = 60
  const bottomInset = Platform.OS === "ios" ? insets.bottom : 10
  const totalHeight = tabBarHeight + bottomInset

  // Share button configuration
  const buttonSize = 60
  const buttonLift = 35 // How much the button sticks out above the tab bar

  return (
    <View style={[styles.tabBarContainer, { height: totalHeight + buttonLift }]}>
      {/* Tab bar background */}
      <View style={[styles.tabBarBackground, { height: totalHeight }]}>
        {/* Left section */}
        <View style={styles.tabBarLeftSection} />

        {/* Right section */}
        <View style={styles.tabBarRightSection} />

        {/* Center bump */}
        <View style={[styles.tabBarCenterBump, { height: totalHeight + buttonLift / 2 }]} />
      </View>

      {/* Tab Buttons */}
      <View style={[styles.tabsContainer, { paddingBottom: bottomInset }]}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key]
          const label = options.tabBarLabel || options.title || route.name
          const isFocused = state.index === index

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            })

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name)
            }
          }

          // Special case for the Share button
          if (route.name === "Share") {
            return (
              <TouchableOpacity
                key={route.key}
                activeOpacity={0.8}
                onPress={onPress}
                style={[styles.tabButton, styles.shareButtonContainer]}
              >
                <View
                  style={[
                    styles.shareButton,
                    {
                      backgroundColor: isFocused ? "#FFCC4D" : "#FFFFFF",
                      bottom: buttonLift,
                    },
                  ]}
                >
                  <Ionicons name="arrow-up" size={24} color="#2F2F2F" />
                </View>
              </TouchableOpacity>
            )
          }

          // Regular tab buttons
          return (
            <TouchableOpacity key={route.key} onPress={onPress} activeOpacity={0.7} style={styles.tabButton}>
              <Ionicons
                name={
                  route.name === "Account"
                    ? "person-outline"
                    : route.name === "Settings"
                      ? "settings-outline"
                      : route.name === "Scan"
                        ? "qr-code-outline"
                        : "layers-outline" // Stack
                }
                size={24}
                color={isFocused ? "#FFCC4D" : "#AAAAAA"}
              />
              <Text style={[styles.tabLabel, { color: isFocused ? "#FFCC4D" : "#AAAAAA" }]}>{label}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const MainNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Account" component={AccountScreen} />
      <Tab.Screen name="Settings" component={SettingsNavigator} />
      <Tab.Screen
        name="Share"
        component={ShareScreen}
        options={{
          tabBarLabel: "Share",
        }}
      />
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="Stack" component={StackNavigator} />
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
  },
  tabBarBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  tabBarLeftSection: {
    position: "absolute",
    left: 0,
    bottom: 0,
    width: "40%",
    height: "100%",
    backgroundColor: "#2F2F2F",
  },
  tabBarRightSection: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: "40%",
    height: "100%",
    backgroundColor: "#2F2F2F",
  },
  tabBarCenterBump: {
    position: "absolute",
    left: "50%",
    bottom: 0,
    width: 120,
    height: "100%",
    marginLeft: -60,
    backgroundColor: "#2F2F2F",
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
  },
  tabsContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  shareButtonContainer: {
    justifyContent: "flex-start",
    alignItems: "center",
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
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
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
})

export default MainNavigator
