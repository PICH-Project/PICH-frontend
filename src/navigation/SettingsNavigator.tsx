import { createNativeStackNavigator } from "@react-navigation/native-stack"
import SettingsScreen from "../screens/settings/Settings"
import AccountSettingsScreen from "../screens/settings/AccountSettings"
import AppSettingsScreen from "../screens/settings/AppSettings"
import SubscriptionScreen from "../screens/settings/Subscription"
import SupportScreen from "../screens/settings/Support"
import SignOutScreen from "../screens/settings/SignOut"

const Stack = createNativeStackNavigator()

const SettingsNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
      <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
      <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="SignOut" component={SignOutScreen} />
    </Stack.Navigator>
  )
}

export default SettingsNavigator
