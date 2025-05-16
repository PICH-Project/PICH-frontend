import { configureStore } from "@reduxjs/toolkit"
import { combineReducers } from "redux"
import { persistStore, persistReducer } from "redux-persist"
import AsyncStorage from "@react-native-async-storage/async-storage"
import authReducer from "./slices/authSlice"
import cardsReducer from "./slices/cardsSlice"
import connectionsReducer from "./slices/connectionsSlice"
import settingsReducer from "./slices/settingsSlice"
import userReducer from "./slices/userSlice"

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth", "user", "settings"],
}

const rootReducer = combineReducers({
  auth: authReducer,
  cards: cardsReducer,
  connections: connectionsReducer,
  settings: settingsReducer,
  user: userReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
