import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import grievanceReducer from "./slices/grievanceSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    grievances: grievanceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
})
