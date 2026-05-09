"use client"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { Ionicons } from "@expo/vector-icons"
import StackScreen from "../screens/main/Stack"
import CardDetail from "../screens/main/CardDetail"
import ScanScreen from "../screens/main/Scan"
import ActionsScreen from "../screens/main/Actions"
import ShareScreen from "../screens/main/Share"
import SettingsNavigator from "./SettingsNavigator"
import { View, Text, StyleSheet, Platform, Dimensions, TouchableOpacity } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import type { TabParamList, StackParamList } from "./types"
import EditCardScreen from "../screens/main/EditCard"
import SetMainCardScreen from "../screens/main/SetMainCard"
import DeleteCardScreen from "../screens/main/DeleteCard"
import AccountScreen from "@/screens/main/Account"
import { useEffect } from "react"
import { getFocusedRouteNameFromRoute, useNavigation, useRoute } from "@react-navigation/native"
import { useSelector } from "react-redux"
import { RootState } from "@/store"
import Svg, { Path } from "react-native-svg"
import CreateCardNewScreen from "@/screens/main/CreateCardNew"
import CardConstructorScreen from "@/screens/main/CardConstructor"

const Tab = createBottomTabNavigator<TabParamList>()
const Stack = createNativeStackNavigator<StackParamList>()

export const UserIcon = ({ color }: { color: string }) => (
  <Svg width={23} height={23} viewBox="0 0 23 23" fill="none">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6.25 5C6.25 3.67392 6.77678 2.40215 7.71447 1.46447C8.65215 0.526784 9.92392 0 11.25 0C12.5761 0 13.8479 0.526784 14.7855 1.46447C15.7232 2.40215 16.25 3.67392 16.25 5C16.25 6.32608 15.7232 7.59785 14.7855 8.53553C13.8479 9.47322 12.5761 10 11.25 10C9.92392 10 8.65215 9.47322 7.71447 8.53553C6.77678 7.59785 6.25 6.32608 6.25 5ZM6.25 12.5C4.5924 12.5 3.00269 13.1585 1.83058 14.3306C0.65848 15.5027 0 17.0924 0 18.75C0 19.7446 0.395088 20.6984 1.09835 21.4017C1.80161 22.1049 2.75544 22.5 3.75 22.5H18.75C19.7446 22.5 20.6984 22.1049 21.4017 21.4017C22.1049 20.6984 22.5 19.7446 22.5 18.75C22.5 17.0924 21.8415 15.5027 20.6694 14.3306C19.4973 13.1585 17.9076 12.5 16.25 12.5H6.25Z"
      fill={color}
    />
  </Svg>
);

export const GearIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={25} viewBox="0 0 24 25" fill="none">
    <Path
      d="M9.32 0.26542C11.0058 -0.0876289 12.7464 -0.0884801 14.4325 0.262919C14.5456 1.00444 14.8241 1.71101 15.2473 2.33029C15.6706 2.94958 16.2277 3.4657 16.8775 3.84042C17.5272 4.21548 18.2529 4.43955 19.0009 4.49603C19.749 4.5525 20.5001 4.43994 21.1988 4.16667C22.3465 5.45232 23.2159 6.96142 23.7525 8.59917C23.1675 9.06755 22.6952 9.66145 22.3707 10.3369C22.0461 11.0124 21.8776 11.7523 21.8775 12.5017C21.8775 14.0817 22.61 15.4904 23.7537 16.4067C23.216 18.0433 22.3457 19.5511 21.1975 20.8354C20.4991 20.5624 19.7481 20.4499 19.0003 20.5064C18.2525 20.5628 17.527 20.7868 16.8775 21.1617C16.2282 21.5363 15.6715 22.0521 15.2485 22.6709C14.8255 23.2897 14.5471 23.9957 14.4338 24.7367C12.7481 25.0905 11.0076 25.0922 9.32125 24.7417C9.20865 23.9998 8.93052 23.2928 8.50748 22.6731C8.08445 22.0534 7.52735 21.5368 6.8775 21.1617C6.22773 20.7868 5.50195 20.563 4.75391 20.5067C4.00588 20.4504 3.25478 20.5632 2.55625 20.8367C1.40854 19.551 0.539087 18.0419 0.00250012 16.4042C0.587513 15.9358 1.05976 15.3419 1.3843 14.6664C1.70885 13.9909 1.87741 13.2511 1.8775 12.5017C1.8775 10.9217 1.14375 9.51417 0 8.59667C0.537955 6.96049 1.40824 5.45313 2.55625 4.16917C3.25505 4.44206 4.00631 4.55421 4.75434 4.4973C5.50238 4.44039 6.22802 4.21589 6.8775 3.84042C7.52652 3.46567 8.083 2.94982 8.50578 2.33101C8.92856 1.7122 9.20683 1.00627 9.32 0.26542ZM11.8775 16.2529C12.8721 16.2529 13.8259 15.8578 14.5292 15.1546C15.2324 14.4513 15.6275 13.4975 15.6275 12.5029C15.6275 11.5084 15.2324 10.5545 14.5292 9.85127C13.8259 9.14801 12.8721 8.75292 11.8775 8.75292C10.8829 8.75292 9.92911 9.14801 9.22585 9.85127C8.52259 10.5545 8.1275 11.5084 8.1275 12.5029C8.1275 13.4975 8.52259 14.4513 9.22585 15.1546C9.92911 15.8578 10.8829 16.2529 11.8775 16.2529Z"
      fill={color}
    />
  </Svg>
);

export const ScanIcon = ({ color }: { color: string }) => (
  <Svg width={21} height={21} viewBox="0 0 21 21" fill="none">
    <Path
      d="M9.375 1.875V7.5C9.375 7.99728 9.17746 8.47419 8.82582 8.82582C8.47419 9.17746 7.99728 9.375 7.5 9.375H1.875C1.37772 9.375 0.900805 9.17746 0.549175 8.82582C0.197544 8.47419 0 7.99728 0 7.5V1.875C0 1.37772 0.197544 0.900805 0.549175 0.549175C0.900805 0.197544 1.37772 0 1.875 0H7.5C7.99728 0 8.47419 0.197544 8.82582 0.549175C9.17746 0.900805 9.375 1.37772 9.375 1.875ZM7.5 11.25H1.875C1.37772 11.25 0.900805 11.4475 0.549175 11.7992C0.197544 12.1508 0 12.6277 0 13.125V18.75C0 19.2473 0.197544 19.7242 0.549175 20.0758C0.900805 20.4275 1.37772 20.625 1.875 20.625H7.5C7.99728 20.625 8.47419 20.4275 8.82582 20.0758C9.17746 19.7242 9.375 19.2473 9.375 18.75V13.125C9.375 12.6277 9.17746 12.1508 8.82582 11.7992C8.47419 11.4475 7.99728 11.25 7.5 11.25ZM18.75 0H13.125C12.6277 0 12.1508 0.197544 11.7992 0.549175C11.4475 0.900805 11.25 1.37772 11.25 1.875V7.5C11.25 7.99728 11.4475 8.47419 11.7992 8.82582C12.1508 9.17746 12.6277 9.375 13.125 9.375H18.75C19.2473 9.375 19.7242 9.17746 20.0758 8.82582C20.4275 8.47419 20.625 7.99728 20.625 7.5V1.875C20.625 1.37772 20.4275 0.900805 20.0758 0.549175C19.7242 0.197544 19.2473 0 18.75 0ZM12.1875 16.875C12.4361 16.875 12.6746 16.7762 12.8504 16.6004C13.0262 16.4246 13.125 16.1861 13.125 15.9375V12.1875C13.125 11.9389 13.0262 11.7004 12.8504 11.5246C12.6746 11.3488 12.4361 11.25 12.1875 11.25C11.9389 11.25 11.7004 11.3488 11.5246 11.5246C11.3488 11.7004 11.25 11.9389 11.25 12.1875V15.9375C11.25 16.1861 11.3488 16.4246 11.5246 16.6004C11.7004 16.7762 11.9389 16.875 12.1875 16.875ZM19.6875 13.125H16.875V12.1875C16.875 11.9389 16.7762 11.7004 16.6004 11.5246C16.4246 11.3488 16.1861 11.25 15.9375 11.25C15.6889 11.25 15.4504 11.3488 15.2746 11.5246C15.0988 11.7004 15 11.9389 15 12.1875V18.75H12.1875C11.9389 18.75 11.7004 18.8488 11.5246 19.0246C11.3488 19.2004 11.25 19.4389 11.25 19.6875C11.25 19.9361 11.3488 20.1746 11.5246 20.3504C11.7004 20.5262 11.9389 20.625 12.1875 20.625H15.9375C16.1861 20.625 16.4246 20.5262 16.6004 20.3504C16.7762 20.1746 16.875 19.9361 16.875 19.6875V15H19.6875C19.9361 15 20.1746 14.9012 20.3504 14.7254C20.5262 14.5496 20.625 14.3111 20.625 14.0625C20.625 13.8139 20.5262 13.5754 20.3504 13.3996C20.1746 13.2238 19.9361 13.125 19.6875 13.125ZM19.6875 16.875C19.4389 16.875 19.2004 16.9738 19.0246 17.1496C18.8488 17.3254 18.75 17.5639 18.75 17.8125V19.6875C18.75 19.9361 18.8488 20.1746 19.0246 20.3504C19.2004 20.5262 19.4389 20.625 19.6875 20.625C19.9361 20.625 20.1746 20.5262 20.3504 20.3504C20.5262 20.1746 20.625 19.9361 20.625 19.6875V17.8125C20.625 17.5639 20.5262 17.3254 20.3504 17.1496C20.1746 16.9738 19.9361 16.875 19.6875 16.875Z"
      fill={color}
    />
  </Svg>
);

export const StackIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
    <Path
      d="M0 3.09375C0 2.27324 0.325948 1.48633 0.906138 0.906138C1.48633 0.325948 2.27324 0 3.09375 0H12.0312C12.8518 0 13.6387 0.325948 14.2189 0.906138C14.7991 1.48633 15.125 2.27324 15.125 3.09375V4.8125H9.96875C8.60123 4.8125 7.28972 5.35575 6.32273 6.32273C5.35575 7.28972 4.8125 8.60123 4.8125 9.96875V15.125H3.09375C2.27324 15.125 1.48633 14.7991 0.906138 14.2189C0.325948 13.6387 0 12.8518 0 12.0312V3.09375Z"
      fill={color}
    />
    <Path
      d="M9.96875 6.875C9.14824 6.875 8.36133 7.20095 7.78114 7.78114C7.20095 8.36133 6.875 9.14824 6.875 9.96875V18.9062C6.875 19.7268 7.20095 20.5137 7.78114 21.0939C8.36133 21.6741 9.14824 22 9.96875 22H18.9062C19.7268 22 20.5137 21.6741 21.0939 21.0939C21.6741 20.5137 22 19.7268 22 18.9062V9.96875C22 9.14824 21.6741 8.36133 21.0939 7.78114C20.5137 7.20095 19.7268 6.875 18.9062 6.875H9.96875Z"
      fill={color}
    />
  </Svg>
);

export const ArrowUpIcon = ({ color }: { color: string }) => (
  <Svg
    width={12}
    height={13}
    viewBox="0 0 10 11"
    fill="none"
  >
    <Path
      d="M4.49052 0.215822L0.0334883 9.87273C-0.0363386 10.0265 0.00526043 10.21 0.137486 10.3169C0.201533 10.3693 0.281297 10.3986 0.363997 10.4002C0.446696 10.4018 0.527545 10.3757 0.593589 10.3259L4.82777 7.15022L9.06195 10.3259C9.19789 10.4284 9.38657 10.4247 9.51806 10.3177C9.60794 10.2456 9.65623 10.1379 9.65623 10.0287C9.65623 9.97598 9.64508 9.92324 9.62206 9.87347L5.16502 0.216564C5.10411 0.0843389 4.97262 0.000398419 4.82777 0.000398425C4.68292 0.000398431 4.55144 0.0843389 4.49052 0.215822Z"
      fill={color}
    />
  </Svg>
);

const TabBarCenterBump = () => (
  <View style={{ position: "absolute", bottom: 0 }}>
    <Svg width={120} height={60} viewBox="0 0 120 60">
      <Path
        d="
          M0,0 
          C35,0 35,60 60,60 
          C85,60 85,0 120,0 
          L120,60 
          L0,60 
          Z
        "
        fill="#27261F"
      />
    </Svg>
  </View>
);

// Stack navigator for the Stack tab
const StackNavigator = () => {
  const route = useRoute<any>();

  // NOTE: раніше тут був useEffect, що автоматично редіректив на CardDetail з
  // `cardId: null` після першого рендеру. Це ламало нормальну навігацію
  // (наприклад, з Account → CardConstructor — юзера відразу перекидало на
  // CardDetail з невалідним cardId, що крашило компонент). Якщо потрібно
  // показувати першу картку при переході на Stack-таб — обробляти це треба
  // у StackScreen самій, а не на рівні навігатора.

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, }}>
      <Stack.Screen name="StackMain" component={StackScreen} initialParams={route.params} />
      <Stack.Screen name="CardDetail" component={CardDetail} />
      <Stack.Screen name="Actions" component={ActionsScreen} />
      <Stack.Screen name="CardConstructor" component={CardConstructorScreen} />
      <Stack.Screen name="CreateCard" component={CreateCardNewScreen} />
      <Stack.Screen name="EditCard" component={EditCardScreen} />
      <Stack.Screen name="SetMainCard" component={SetMainCardScreen} />
      <Stack.Screen name="DeleteCard" component={DeleteCardScreen} />
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

  const currentRoute = state.routes[state.index];
  const nestedRouteName =
    getFocusedRouteNameFromRoute(currentRoute) ?? currentRoute.name;
  const hiddenNavbarLogos = nestedRouteName === 'CreateCard'

  // Share button configuration
  const buttonSize = 60
  const buttonLift = 35 // How much the button sticks out above the tab bar

  return (
    <View style={[styles.tabBarContainer, { height: totalHeight + buttonLift }]}>
      {/* Tab bar background */}
      <View style={[styles.tabBarBackground, { height: hiddenNavbarLogos ? 35 : totalHeight }]}>
        {/* Left section */}
        <View style={styles.tabBarLeftSection} />

        {/* Right section */}
        <View style={styles.tabBarRightSection} />

        {/* Center bump */}
        {/* <View style={[styles.tabBarCenterBump, { height: totalHeight + buttonLift / 1.1 }]} /> */}
      </View>

      {/* Tab Buttons */}
      <View style={[styles.tabsContainer, hiddenNavbarLogos ? { height: 35 } : { height: 60 }, { paddingBottom: bottomInset, }]}>
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
          // if (route.name === "Share") {
          //   return (
          //     <TouchableOpacity
          //       key={route.key}
          //       activeOpacity={0.8}
          //       onPress={onPress}
          //       style={[styles.tabButton, styles.shareButtonContainer]}
          //     >
          //       <View>
          //         <View
          //           style={[
          //             styles.shareButton,
          //             {
          //               backgroundColor: isFocused ? "" : "#FFFFFF30",
          //               bottom: buttonLift,
          //             },
          //           ]}
          //         >
          //           <View
          //             style={[
          //               {
          //                 backgroundColor: "#FFFFFF",
          //                 width: 16,
          //                 height: 26,
          //                 display: 'flex',
          //                 alignItems: 'center',
          //                 justifyContent: 'center',
          //                 borderRadius: 4,
          //                 padding: 4
          //               },
          //             ]}
          //           >
          //             <ArrowUpIcon color="#27261F" />
          //         </View>
          //       </View>
          //       <Text style={[styles.tabLabel, { color: isFocused ? "#FFFFFF" : "#AAAAAA", bottom: buttonLift - 2, textAlign: 'center' }]}>
          //         {label}
          //       </Text>
          //     </View>
          //     </TouchableOpacity>
          //   )
          // }

          // Regular tab buttons
          return (
            <TouchableOpacity key={route.key} onPress={onPress} activeOpacity={0.7} style={styles.tabButton}>
              {route.name === "Account" && !hiddenNavbarLogos && (
                <UserIcon color={isFocused ? "#FFFFFF" :"#9B9B9B"} />
              )}

              {route.name === "Stack" && !hiddenNavbarLogos && (
                <StackIcon color={isFocused ? "#FFFFFF" :"#9B9B9B"} />
              )}

              {route.name === "Scan" && !hiddenNavbarLogos && (
                <ScanIcon color={isFocused ? "#FFFFFF" :"#9B9B9B"} />
              )}

              {route.name === "Settings" && !hiddenNavbarLogos && (
                <GearIcon color={isFocused ? "#FFFFFF" :"#9B9B9B"}/>
              )}

              {route.name === "Share" && !hiddenNavbarLogos && (
                <View
                      style={[
                        {
                          backgroundColor: isFocused ? "#FFFFFF" :"#9B9B9B",
                          width: 16,
                          height: 26,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 4,
                          padding: 4
                        },
                      ]}
                    >
                      <ArrowUpIcon color="#27261F" />
                  </View>
              )}
              
              {/* <Ionicons
                name={
                  route.name === "Account"
                    ? "person"
                    : route.name === "Settings"
                      ? "settings-sharp"
                      : route.name === "Scan"
                        ? "qr-code"
                        : "layers-outline" // Stack
                }
                size={24}
                color={isFocused ? "#FFCC4D" : "#AAAAAA"}
              /> */}
              <Text style={[styles.tabLabel, { color: isFocused ? "#FFFFFF" : "#AAAAAA" }]}>{label}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const MainNavigator = () => {
  const navigation = useNavigation<any>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
      console.log('hell ou')
      navigation.navigate('Stack', {
        navigateToCard: true,
      });
  }, []);


  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
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
    backgroundColor: "#27261F",
  },
  tabBarRightSection: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: "60%",
    height: "100%",
    backgroundColor: "#27261F",
  },
  tabBarCenterBump: {
    position: "absolute",
    left: "50%",
    bottom: 0.5,
    width: 120,
    height: "100%",
    marginLeft: -60,
    backgroundColor: "#27261F",
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
  },
  tabsContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
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
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
})

export default MainNavigator
