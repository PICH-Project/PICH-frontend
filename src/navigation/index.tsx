"use client"

import { useState } from "react"

import { useEffect } from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "../store"
import AuthNavigator from "./AuthNavigator"
import MainNavigator from "./MainNavigator"
import { fetchUserProfile } from "../store/slices/authSlice"
import { fetchCards } from "../store/slices/cardsSlice"
import { fetchConnections, fetchFriends } from "../store/slices/connectionsSlice"
import { fetchSettings } from "../store/slices/settingsSlice"
import { initAuth } from "../store/slices/authSlice"
import SplashScreen from "../screens/SplashScreen"

const RootStack = createNativeStackNavigator()

const AppNavigator = () => {
  const { isAuthenticated, loading: authLoading } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch<AppDispatch>()
  const [isInitializing, setIsInitializing] = useState(true)

  // Initialize auth state on app start
  useEffect(() => {
    const initialize = async () => {
      await dispatch(initAuth())
      setIsInitializing(false)
    }

    initialize()
  }, [dispatch])

  // When user is authenticated, fetch necessary data
  useEffect(() => {
    if (isAuthenticated) {
      // Fetch user profile
      dispatch(fetchUserProfile())

      // Fetch user's cards
      dispatch(fetchCards())

      // Fetch user's connections and friends
      dispatch(fetchConnections())
      dispatch(fetchFriends())

      // Fetch user's settings
      dispatch(fetchSettings())
    }
  }, [isAuthenticated, dispatch])

  // Show splash screen while initializing
  if (isInitializing || authLoading) {
    return <SplashScreen />
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <RootStack.Screen name="Main" component={MainNavigator} />
      )}
    </RootStack.Navigator>
  )
}

export default AppNavigator
