import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { grievanceService } from "../../api/grievanceService" // Add this import

const initialState = {
  grievances: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
}

// Fetch grievances
export const fetchGrievances = createAsyncThunk(
  "grievances/fetchGrievances",
  async (filters = {}, { rejectWithValue }) => {
    try {
      return await grievanceService.getGrievances(filters)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch grievances")
    }
  },
)

// Create a new grievance
export const createGrievance = createAsyncThunk(
  "grievances/createGrievance",
  async (grievanceData, { rejectWithValue }) => {
    try {
      console.log("Redux: Creating grievance with FormData")
      
      // Log FormData contents for debugging
      if (grievanceData instanceof FormData) {
        console.log("FormData entries:")
        for (let [key, value] of grievanceData.entries()) {
          if (value instanceof File) {
            console.log(key, `File: ${value.name} (${value.size} bytes)`)
          } else {
            console.log(key, value)
          }
        }
      }
      
      return await grievanceService.createGrievance(grievanceData)
    } catch (error) {
      console.error("Redux createGrievance error:", error)
      return rejectWithValue(error.response?.data?.message || "Failed to create grievance")
    }
  },
)

// Update grievance status
export const updateGrievanceStatus = createAsyncThunk(
  "grievances/updateStatus",
  async ({ id, status, comment }, { rejectWithValue }) => {
    try {
      return await grievanceService.updateStatus(id, status, comment)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update status")
    }
  },
)

export const grievanceSlice = createSlice({
  name: "grievances",
  initialState,
  reducers: {
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGrievances.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchGrievances.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.grievances = action.payload
      })
      .addCase(fetchGrievances.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
        state.grievances = []
      })
      .addCase(createGrievance.pending, (state) => {
        state.isLoading = true
      })
      .addCase(createGrievance.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.grievances.push(action.payload)
      })
      .addCase(createGrievance.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(updateGrievanceStatus.pending, (state) => {
        state.isLoading = true
      })
      .addCase(updateGrievanceStatus.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.grievances = state.grievances.map((grievance) =>
          grievance._id === action.payload._id ? action.payload : grievance,
        )
      })
      .addCase(updateGrievanceStatus.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
  },
})

export const { reset } = grievanceSlice.actions
export default grievanceSlice.reducer
