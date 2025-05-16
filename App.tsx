import { SafeAreaProvider } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { NavigationContainer } from "@react-navigation/native"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import { store, persistor } from "./src/store"
import AppNavigator from "./src/navigation"
import { ThemeProvider } from "./src/hooks/useTheme"
import { AuthProvider } from "./src/contexts/AuthContext"

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <AuthProvider>
            <SafeAreaProvider>
              <NavigationContainer>
                <StatusBar style="auto" />
                <AppNavigator />
              </NavigationContainer>
            </SafeAreaProvider>
          </AuthProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  )
}
