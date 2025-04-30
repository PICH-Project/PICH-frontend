"use client"

import { useEffect } from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "../store"
import AuthNavigator from "./AuthNavigator"
import MainNavigator from "./MainNavigator"
import { fetchUserProfile } from "../store/slices/userSlice"
import { fetchCards } from "../store/slices/cardsSlice"
import { fetchSettings } from "../store/slices/settingsSlice"

const RootStack = createNativeStackNavigator()

const AppNavigator = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch<AppDispatch>()

  // When user is authenticated, fetch necessary data
  useEffect(() => {
    if (isAuthenticated) {
      // Fetch user profile
      dispatch(fetchUserProfile())

      // Fetch user's cards
      dispatch(fetchCards())

      // Fetch user's settings
      dispatch(fetchSettings())
    }
  }, [isAuthenticated, dispatch])

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
