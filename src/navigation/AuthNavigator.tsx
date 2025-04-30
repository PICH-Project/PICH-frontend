import { createNativeStackNavigator } from "@react-navigation/native-stack"
import WelcomeScreen from "../screens/auth/Welcome"
import LoginScreen from "../screens/auth/Login"
import SignupScreen from "../screens/auth/Signup"

const Stack = createNativeStackNavigator()

const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  )
}

export default AuthNavigator
