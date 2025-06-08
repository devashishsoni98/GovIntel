import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Provider } from "react-redux"
import { store } from "./redux/store"
import AuthInitializer from "./components/AuthInitializer"
import ProtectedRoute from "./components/ProtectedRoute"
import Navbar from "./components/Navbar"
import SignIn from "./components/SignIn"
import { USER_ROLES } from "./redux/slices/authSlice"
import Home from "./pages/Home"
import "./index.css"
// Import your page components
// import Dashboard from './pages/Dashboard'
// import UserManagement from './pages/UserManagement'
// import MyGrievances from './pages/MyGrievances'
// etc.

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

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <div className="pt-20 p-8">
                      <h1 className="text-white text-2xl">Dashboard</h1>
                      {/* <Dashboard /> */}
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Citizen Only Routes */}
              <Route
                path="/my-grievances"
                element={
                  <ProtectedRoute allowedRoles={[USER_ROLES.CITIZEN]}>
                    <div className="pt-20 p-8">
                      <h1 className="text-white text-2xl">My Grievances</h1>
                      {/* <MyGrievances /> */}
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/submit-complaint"
                element={
                  <ProtectedRoute allowedRoles={[USER_ROLES.CITIZEN]}>
                    <div className="pt-20 p-8">
                      <h1 className="text-white text-2xl">Submit Complaint</h1>
                      {/* <SubmitComplaint /> */}
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Officer Only Routes */}
              <Route
                path="/assigned-cases"
                element={
                  <ProtectedRoute allowedRoles={[USER_ROLES.OFFICER]}>
                    <div className="pt-20 p-8">
                      <h1 className="text-white text-2xl">Assigned Cases</h1>
                      {/* <AssignedCases /> */}
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Admin Only Routes */}
              <Route
                path="/user-management"
                element={
                  <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                    <div className="pt-20 p-8">
                      <h1 className="text-white text-2xl">User Management</h1>
                      {/* <UserManagement /> */}
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/analytics"
                element={
                  <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                    <div className="pt-20 p-8">
                      <h1 className="text-white text-2xl">Analytics</h1>
                      {/* <Analytics /> */}
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Shared Protected Routes */}
              <Route
                path="/reports/*"
                element={
                  <ProtectedRoute allowedRoles={[USER_ROLES.OFFICER, USER_ROLES.ADMIN]}>
                    <div className="pt-20 p-8">
                      <h1 className="text-white text-2xl">Reports</h1>
                      {/* <Reports /> */}
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Unauthorized Page */}
              <Route
                path="/unauthorized"
                element={
                  <div className="pt-20 p-8 text-center">
                    <h1 className="text-white text-2xl mb-4">Unauthorized Access</h1>
                    <p className="text-slate-400">You don't have permission to access this page.</p>
                  </div>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthInitializer>
    </Provider>
  )
}

export default App
