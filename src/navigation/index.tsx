"use client"

import { FC, useState } from "react"

import { useEffect } from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "../store"
import AuthNavigator from "./AuthNavigator"
import MainNavigator from "./MainNavigator"
import { fetchUserProfile } from "../store/slices/authSlice"
import { fetchCards } from "../store/slices/cardsSlice"
import {
  fetchConnections,
  fetchFriends,
  fetchConnectedCards,
} from "../store/slices/connectionsSlice"
import { fetchSettings } from "../store/slices/settingsSlice"
import { initAuth } from "../store/slices/authSlice"
import {
  fetchAllSubscriptions,
  fetchUserLimits,
} from "../store/slices/subscriptionsSlice"
import SplashScreen from "../screens/SplashScreen"
import { NavigationContainerRefWithCurrent } from "@react-navigation/native"

const RootStack = createNativeStackNavigator()

const AppNavigator: FC<IProps> = () => {
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

      // Fetch user's connections + connected cards (чужі)
      dispatch(fetchConnections())
      dispatch(fetchFriends())
      dispatch(fetchConnectedCards())

      // Fetch user's settings
      dispatch(fetchSettings())

      // Fetch user's active subscriptions + combined limits
      dispatch(fetchAllSubscriptions())
      dispatch(fetchUserLimits())

      //handleAuthenticatedUser();

      // const timer = setTimeout(() => {
      //     navigationRef.navigate('Main', {
      //       screen: 'Stack',
      //       params: {
      //         screen: 'CardDetail',
      //         params: { cardId: '29635cf8-36ff-45d9-afcb-b7e71f66f405' },
      //       },
      //     });
      //     console.log('redirect1k ready      ', navigationRef.isReady(), isNavReady)
      // }, 0); // next tick after Main is rendered

      // return () => clearTimeout(timer);
    }
  }, [isAuthenticated, dispatch])

  // useEffect(() => {
  //   if (isAuthenticated && navigationRef.isReady()) {
  //     console.log('redirect1k  123  ', navigationRef.navigate)
  //     navigationRef.navigate("Main", {
  //       screen: "Stack",
  //       params: {
  //         screen: "CardDetail",
  //         params: { cardId: "29635cf8-36ff-45d9-afcb-b7e71f66f405" },
  //       },
  //     })
  //     console.log('below122 ')
  //   }
  // }, [isAuthenticated, navigationRef.isReady()])

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

interface IProps {
  navigationRef: NavigationContainerRefWithCurrent<any>;
  isNavReady: boolean;
}

export default AppNavigator
