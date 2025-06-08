import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

// Grievance status constants
export const GRIEVANCE_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  CLOSED: "closed",
  REJECTED: "rejected",
}

// Grievance priority levels
export const GRIEVANCE_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
}

// Grievance categories
export const GRIEVANCE_CATEGORIES = {
  INFRASTRUCTURE: "infrastructure",
  SANITATION: "sanitation",
  WATER_SUPPLY: "water_supply",
  ELECTRICITY: "electricity",
  TRANSPORTATION: "transportation",
  HEALTHCARE: "healthcare",
  EDUCATION: "education",
  POLICE: "police",
  OTHER: "other",
}

// Async thunk for fetching grievances
export const fetchGrievances = createAsyncThunk(
  "grievances/fetchGrievances",
  async ({ page = 1, limit = 10, filters = {} }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const response = await fetch(`/api/grievances?page=${page}&limit=${limit}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ filters }),
      })

      if (!response.ok) {
        const error = await response.json()
        return rejectWithValue(error.message || "Failed to fetch grievances")
      }

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error.message || "Network error")
    }
  },
)

// Async thunk for creating a new grievance
export const createGrievance = createAsyncThunk(
  "grievances/createGrievance",
  async (grievanceData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const response = await fetch("/api/grievances", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(grievanceData),
      })

      if (!response.ok) {
        const error = await response.json()
        return rejectWithValue(error.message || "Failed to create grievance")
      }

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error.message || "Network error")
    }
  },
)

// Async thunk for updating grievance status
export const updateGrievanceStatus = createAsyncThunk(
  "grievances/updateGrievanceStatus",
  async ({ grievanceId, status, comment }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const response = await fetch(`/api/grievances/${grievanceId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ status, comment }),
      })

      if (!response.ok) {
        const error = await response.json()
        return rejectWithValue(error.message || "Failed to update grievance status")
      }

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error.message || "Network error")
    }
  },
)

// Async thunk for deleting a grievance
export const deleteGrievance = createAsyncThunk(
  "grievances/deleteGrievance",
  async (grievanceId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const response = await fetch(`/api/grievances/${grievanceId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        return rejectWithValue(error.message || "Failed to delete grievance")
      }

      return { grievanceId }
    } catch (error) {
      return rejectWithValue(error.message || "Network error")
    }
  },
)

// Async thunk for fetching grievance analytics
export const fetchGrievanceAnalytics = createAsyncThunk(
  "grievances/fetchAnalytics",
  async ({ dateRange, department }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const params = new URLSearchParams()
      if (dateRange) params.append("dateRange", dateRange)
      if (department) params.append("department", department)

      const response = await fetch(`/api/grievances/analytics?${params}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        return rejectWithValue(error.message || "Failed to fetch analytics")
      }

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error.message || "Network error")
    }
  },
)

const initialState = {
  // Grievances list
  grievances: [],
  totalGrievances: 0,
  currentPage: 1,
  totalPages: 0,

  // Selected grievance
  selectedGrievance: null,

  // Analytics data
  analytics: {
    totalCount: 0,
    statusDistribution: {},
    categoryDistribution: {},
    priorityDistribution: {},
    resolutionTime: 0,
    satisfactionRate: 0,
  },

  // Filters
  filters: {
    status: "",
    category: "",
    priority: "",
    dateRange: "",
    department: "",
    searchQuery: "",
  },

  // Loading states
  loading: false,
  analyticsLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,

  // Error states
  error: null,
  analyticsError: null,
}

const grievanceSlice = createSlice({
  name: "grievances",
  initialState,
  reducers: {
    // Clear errors
    clearError: (state) => {
      state.error = null
      state.analyticsError = null
    },

    // Set filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },

    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        status: "",
        category: "",
        priority: "",
        dateRange: "",
        department: "",
        searchQuery: "",
      }
    },

    // Set selected grievance
    setSelectedGrievance: (state, action) => {
      state.selectedGrievance = action.payload
    },

    // Clear selected grievance
    clearSelectedGrievance: (state) => {
      state.selectedGrievance = null
    },

    // Set current page
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload
    },

    // Reset grievances state
    resetGrievances: (state) => {
      state.grievances = []
      state.totalGrievances = 0
      state.currentPage = 1
      state.totalPages = 0
      state.selectedGrievance = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch grievances cases
      .addCase(fetchGrievances.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGrievances.fulfilled, (state, action) => {
        state.loading = false
        state.grievances = action.payload.grievances
        state.totalGrievances = action.payload.total
        state.currentPage = action.payload.page
        state.totalPages = action.payload.totalPages
        state.error = null
      })
      .addCase(fetchGrievances.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Create grievance cases
      .addCase(createGrievance.pending, (state) => {
        state.createLoading = true
        state.error = null
      })
      .addCase(createGrievance.fulfilled, (state, action) => {
        state.createLoading = false
        state.grievances.unshift(action.payload)
        state.totalGrievances += 1
        state.error = null
      })
      .addCase(createGrievance.rejected, (state, action) => {
        state.createLoading = false
        state.error = action.payload
      })

      // Update grievance status cases
      .addCase(updateGrievanceStatus.pending, (state) => {
        state.updateLoading = true
        state.error = null
      })
      .addCase(updateGrievanceStatus.fulfilled, (state, action) => {
        state.updateLoading = false
        const index = state.grievances.findIndex((g) => g.id === action.payload.id)
        if (index !== -1) {
          state.grievances[index] = action.payload
        }
        if (state.selectedGrievance?.id === action.payload.id) {
          state.selectedGrievance = action.payload
        }
        state.error = null
      })
      .addCase(updateGrievanceStatus.rejected, (state, action) => {
        state.updateLoading = false
        state.error = action.payload
      })

      // Delete grievance cases
      .addCase(deleteGrievance.pending, (state) => {
        state.deleteLoading = true
        state.error = null
      })
      .addCase(deleteGrievance.fulfilled, (state, action) => {
        state.deleteLoading = false
        state.grievances = state.grievances.filter((g) => g.id !== action.payload.grievanceId)
        state.totalGrievances -= 1
        if (state.selectedGrievance?.id === action.payload.grievanceId) {
          state.selectedGrievance = null
        }
        state.error = null
      })
      .addCase(deleteGrievance.rejected, (state, action) => {
        state.deleteLoading = false
        state.error = action.payload
      })

      // Fetch analytics cases
      .addCase(fetchGrievanceAnalytics.pending, (state) => {
        state.analyticsLoading = true
        state.analyticsError = null
      })
      .addCase(fetchGrievanceAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false
        state.analytics = action.payload
        state.analyticsError = null
      })
      .addCase(fetchGrievanceAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false
        state.analyticsError = action.payload
      })
  },
})

export const {
  clearError,
  setFilters,
  clearFilters,
  setSelectedGrievance,
  clearSelectedGrievance,
  setCurrentPage,
  resetGrievances,
} = grievanceSlice.actions

export default grievanceSlice.reducer

// Selectors
export const selectGrievances = (state) => state.grievances.grievances
export const selectGrievancesLoading = (state) => state.grievances.loading
export const selectGrievancesError = (state) => state.grievances.error
export const selectSelectedGrievance = (state) => state.grievances.selectedGrievance
export const selectGrievanceFilters = (state) => state.grievances.filters
export const selectGrievanceAnalytics = (state) => state.grievances.analytics
export const selectAnalyticsLoading = (state) => state.grievances.analyticsLoading
export const selectTotalGrievances = (state) => state.grievances.totalGrievances
export const selectCurrentPage = (state) => state.grievances.currentPage
export const selectTotalPages = (state) => state.grievances.totalPages
