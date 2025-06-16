import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "../../api"

// User roles
export const USER_ROLES = {
  CITIZEN: "citizen",
  OFFICER: "officer",
  ADMIN: "admin",
}

// Async thunks for API calls
export const registerUser = createAsyncThunk("auth/registerUser", async (userData, { rejectWithValue }) => {
  try {
    console.log("Registering user with data:", userData)
    const response = await api.post("/api/auth/register", userData)

    console.log("Registration response:", response.data)

    // Store token and user data
    if (response.data.success && response.data.data) {
      localStorage.setItem("token", response.data.data.token)
      localStorage.setItem("user", JSON.stringify(response.data.data.user))
      return response.data.data
    } else {
      throw new Error(response.data.message || "Registration failed")
    }
  } catch (error) {
    console.error("Registration error:", error)
    const message = error.response?.data?.message || error.message || "Registration failed"
    return rejectWithValue(message)
  }
})

export const loginUser = createAsyncThunk("auth/loginUser", async ({ email, password, role }, { rejectWithValue }) => {
  try {
    console.log("Logging in user with:", { email, role })
    const response = await api.post("/api/auth/login", {
      email,
      password,
      role,
    })

    console.log("Login response:", response.data)

    // Store token and user data
    if (response.data.success && response.data.data) {
      localStorage.setItem("token", response.data.data.token)
      localStorage.setItem("user", JSON.stringify(response.data.data.user))
      return response.data.data
    } else {
      throw new Error(response.data.message || "Login failed")
    }
  } catch (error) {
    console.error("Login error:", error)
    const message = error.response?.data?.message || error.message || "Login failed"
    return rejectWithValue(message)
  }
})

export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, { rejectWithValue }) => {
  try {
    await api.post("/api/auth/logout")
  } catch (error) {
    console.error("Logout error:", error)
    // Continue with logout even if API call fails
  } finally {
    // Always clear local storage
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  }
  return null
})

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    initializeAuth: (state) => {
      const token = localStorage.getItem("token")
      const user = localStorage.getItem("user")

      if (token && user) {
        try {
          state.token = token
          state.user = JSON.parse(user)
          state.isAuthenticated = true
          console.log("Auth initialized from localStorage:", state.user)
        } catch (error) {
          console.error("Error parsing user from localStorage:", error)
          localStorage.removeItem("token")
          localStorage.removeItem("user")
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Register user
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
        console.log("Registration successful:", action.payload.user)
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.isAuthenticated = false
        console.error("Registration failed:", action.payload)
      })

      // Login user
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
        console.log("Login successful:", action.payload.user)
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.isAuthenticated = false
        console.error("Login failed:", action.payload)
      })

      // Logout user
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.loading = false
        state.error = null
        console.log("Logout successful")
      })
  },
})

export const { clearError, initializeAuth } = authSlice.actions
export default authSlice.reducer

// Selectors
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectUser = (state) => state.auth.user
export const selectAuthLoading = (state) => state.auth.loading
export const selectAuthError = (state) => state.auth.error
export const selectToken = (state) => state.auth.token
