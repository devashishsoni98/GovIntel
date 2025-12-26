import React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Provider } from "react-redux"
import { store } from "./redux/store"
import AuthInitializer from "./components/AuthInitializer"
import ProtectedRoute from "./components/ProtectedRoute"
import Navbar from "./components/Navbar"

// Pages
import Home from "./pages/Home"
import SignIn from "./components/SignIn"
import Dashboard from "./pages/Dashboard"
import MyGrievances from "./pages/MyGrievances"
import SubmitComplaint from "./pages/SubmitComplaint"
import GrievanceDetail from "./pages/GrievanceDetail"
import AssignedCases from "./pages/AssignedCases"
import UserManagement from "./pages/UserManagement"
import Analytics from "./pages/Analytics"
import FeaturesPage from "./pages/Features"
import HowItWorksPage from "./pages/HowItWorks"

// User roles
import { USER_ROLES } from "./redux/slices/authSlice"

function App() {
  return (
    <Provider store={store}>
      <AuthInitializer>
        <Router>
          <div className="min-h-screen bg-slate-900">
            <Navbar />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Citizen Routes */}
              <Route
                path="/my-grievances"
                element={
                  <ProtectedRoute allowedRoles={[USER_ROLES.CITIZEN]}>
                    <MyGrievances />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/submit-complaint"
                element={
                  <ProtectedRoute allowedRoles={[USER_ROLES.CITIZEN]}>
                    <SubmitComplaint />
                  </ProtectedRoute>
                }
              />

              {/* Officer Routes */}
              <Route
                path="/assigned-cases"
                element={
                  <ProtectedRoute allowedRoles={[USER_ROLES.OFFICER]}>
                    <AssignedCases />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/user-management"
                element={
                  <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                    <Analytics />
                  </ProtectedRoute>
                }
              />

              {/* Shared Routes */}
              <Route
                path="/grievance/:id"
                element={
                  <ProtectedRoute>
                    <GrievanceDetail />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthInitializer>
    </Provider>
  )
}

export default App