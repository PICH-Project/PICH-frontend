import 'fast-text-encoding';
import 'react-native-get-random-values';
import '@ethersproject/shims';
import { Buffer } from 'buffer';
global.Buffer = Buffer;

import { SafeAreaProvider } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { NavigationContainer } from "@react-navigation/native"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import { store, persistor } from "./src/store"
import AppNavigator from "./src/navigation"
import { ThemeProvider } from "./src/hooks/useTheme"
import { AuthProvider } from "./src/contexts/AuthContext"
import PrivyProvider from './src/providers/PrivyProvider';

export default function App() {
  return (
    <PrivyProvider>
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
    </PrivyProvider>
  )
}
