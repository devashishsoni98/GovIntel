import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

// User roles
export const USER_ROLES = {
  CITIZEN: "citizen",
  OFFICER: "officer",
  ADMIN: "admin",
}

// Mock user database for development
const MOCK_USERS = {
  // Admin user - only one admin allowed
  "admin@gmail.com": {
    id: "admin_001",
    name: "System Administrator",
    email: "admin@gmail.com",
    password: "12345",
    role: USER_ROLES.ADMIN,
  },
  // Sample officer users
  "officer@municipal.gov": {
    id: "officer_001",
    name: "John Officer",
    email: "officer@municipal.gov",
    password: "officer123",
    role: USER_ROLES.OFFICER,
    department: "municipal",
    phone: "+1234567890",
  },
  // Sample citizen users
  "citizen@example.com": {
    id: "citizen_001",
    name: "Jane Citizen",
    email: "citizen@example.com",
    password: "citizen123",
    role: USER_ROLES.CITIZEN,
    phone: "+1234567891",
  },
}

// Store for dynamically registered users
const dynamicUsers = {}

// Async thunk for login
export const loginUser = createAsyncThunk("auth/loginUser", async ({ email, password, role }, { rejectWithValue }) => {
  try {
    console.log("Login attempt:", { email, role })

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Check in mock users first, then dynamic users
    const user = MOCK_USERS[email] || dynamicUsers[email]

    if (!user) {
      return rejectWithValue("User not found. Please check your email or sign up first.")
    }

    if (user.password !== password) {
      return rejectWithValue("Invalid password. Please try again.")
    }

    // IMPORTANT: Check if the selected role matches the user's actual role
    if (user.role !== role) {
      const roleNames = {
        [USER_ROLES.CITIZEN]: "Citizen",
        [USER_ROLES.OFFICER]: "Officer",
        [USER_ROLES.ADMIN]: "Administrator",
      }
      return rejectWithValue(
        `Invalid Credentials.`,
      )
    }

    // Create response without password
    const { password: _, ...userWithoutPassword } = user
    const mockResponse = {
      user: userWithoutPassword,
      token: "mock_jwt_token_" + Math.random().toString(36).substr(2, 16),
    }

    // Store token in localStorage
    localStorage.setItem("token", mockResponse.token)
    localStorage.setItem("user", JSON.stringify(mockResponse.user))

    return mockResponse
  } catch (error) {
    console.error("Login error:", error)
    return rejectWithValue(error.message || "Network error during login")
  }
})

// Async thunk for registration
export const registerUser = createAsyncThunk("auth/registerUser", async (userData, { rejectWithValue }) => {
  try {
    console.log("Registration attempt:", userData)

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // PREVENT ADMIN REGISTRATION
    if (userData.role === USER_ROLES.ADMIN) {
      return rejectWithValue(
        "Administrator accounts cannot be created through registration. Contact system administrator.",
      )
    }

    // Check if user already exists
    if (MOCK_USERS[userData.email] || dynamicUsers[userData.email]) {
      return rejectWithValue("An account with this email already exists. Please try logging in instead.")
    }

    // Validate required fields based on role
    if (userData.role === USER_ROLES.OFFICER) {
      if (!userData.department) {
        return rejectWithValue("Department is required for officer registration.")
      }
      if (!userData.phone) {
        return rejectWithValue("Phone number is required for officer registration.")
      }
    }

    if (userData.role === USER_ROLES.CITIZEN) {
      if (!userData.phone) {
        return rejectWithValue("Phone number is required for citizen registration.")
      }
    }

    // Create new user
    const newUser = {
      id: userData.role + "_" + Math.random().toString(36).substr(2, 9),
      name: userData.name,
      email: userData.email,
      password: userData.password, // In real app, this would be hashed
      role: userData.role,
      ...(userData.department && { department: userData.department }),
      ...(userData.phone && { phone: userData.phone }),
    }

    // Store in dynamic users
    dynamicUsers[userData.email] = newUser

    // Create response without password
    const { password: _, ...userWithoutPassword } = newUser
    const mockResponse = {
      user: userWithoutPassword,
      token: "mock_jwt_token_" + Math.random().toString(36).substr(2, 16),
    }

    // Store token in localStorage
    localStorage.setItem("token", mockResponse.token)
    localStorage.setItem("user", JSON.stringify(mockResponse.user))

    return mockResponse
  } catch (error) {
    console.error("Registration error:", error)
    return rejectWithValue(error.message || "Network error during registration")
  }
})

// Async thunk for logout
export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, { rejectWithValue }) => {
  try {
    // Optional: Call logout API endpoint
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
  } catch (error) {
    // Continue with logout even if API call fails
    console.warn("Logout API call failed:", error)
  } finally {
    // Always clear local storage
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  }
})

const initialState = {
  user: null, // { id, name, email, role, token, department?, phone? }
  isAuthenticated: false,
  loading: false,
  error: null,
  token: null,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null
    },

    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload
    },

    // Initialize auth from localStorage
    initializeAuth: (state) => {
      const token = localStorage.getItem("token")
      const user = localStorage.getItem("user")

      if (token && user) {
        try {
          state.token = token
          state.user = JSON.parse(user)
          state.isAuthenticated = true
        } catch (error) {
          // Clear corrupted data
          localStorage.removeItem("token")
          localStorage.removeItem("user")
        }
      }
    },

    // Update user profile
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
        localStorage.setItem("user", JSON.stringify(state.user))
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
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
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.isAuthenticated = false
        state.user = null
        state.token = null
      })

      // Register cases
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
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.isAuthenticated = false
        state.user = null
        state.token = null
      })

      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.loading = false
        state.error = null
      })
  },
})

export const { clearError, setLoading, initializeAuth, updateUserProfile } = authSlice.actions

export default authSlice.reducer

// Selectors
export const selectAuth = (state) => state.auth
export const selectUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectAuthLoading = (state) => state.auth.loading
export const selectAuthError = (state) => state.auth.error
export const selectUserRole = (state) => state.auth.user?.role
