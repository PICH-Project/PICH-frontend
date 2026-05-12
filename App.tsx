import 'react-native-reanimated';
import 'fast-text-encoding';
import 'react-native-get-random-values';
import '@ethersproject/shims';
import { Buffer } from 'buffer';
global.Buffer = Buffer;

import { SafeAreaProvider } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { NavigationContainer, createNavigationContainerRef } from "@react-navigation/native"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import { useFonts } from "expo-font"
import { PlayfairDisplay_700Bold } from "@expo-google-fonts/playfair-display"
import { Caveat_700Bold } from "@expo-google-fonts/caveat"
import { View } from "react-native"
import { store, persistor } from "./src/store"
import AppNavigator from "./src/navigation"
import { ThemeProvider } from "./src/hooks/useTheme"
import { AuthProvider } from "./src/contexts/AuthContext"
import PrivyProvider from './src/providers/PrivyProvider';
import { useState } from 'react';

const navigationRef = createNavigationContainerRef();

export default function App() {
  const [isNavReady, setIsNavReady] = useState<boolean>(false);

  // Завантажуємо Google Fonts для преміум name-font фічі картки.
  // Поки не завантажились — рендеримо порожній екран (швидко, ~100мс).
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    Caveat_700Bold,
  })

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: "#FFFFFF" }} />
  }

  return (
    <PrivyProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ThemeProvider>
            <AuthProvider>
              <SafeAreaProvider>
                <NavigationContainer
                  ref={navigationRef}
                  onReady={() => {
                    console.log('ready ');
                    setIsNavReady(true);
                  }}
                >
                  <StatusBar style="dark" />
                  <AppNavigator isNavReady={isNavReady} navigationRef={navigationRef} />
                </NavigationContainer>
              </SafeAreaProvider>
            </AuthProvider>
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </PrivyProvider>
  )
}
