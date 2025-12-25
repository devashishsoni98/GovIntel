// "use client";

// import { useState, useEffect } from "react";
// import { useSelector } from "react-redux";
// import { Link } from "react-router-dom";
// import {
//   Plus,
//   FileText,
//   Clock,
//   CheckCircle,
//   AlertCircle,
//   MessageSquare,
//   Calendar,
//   MapPin,
// } from "lucide-react";
// import { selectUser } from "../../redux/slices/authSlice";
// import api from "../../api";

// const CitizenDashboard = () => {
//   const user = useSelector(selectUser);
//   const [stats, setStats] = useState({
//     total: 0,
//     pending: 0,
//     inProgress: 0,
//     resolved: 0,
//     closed: 0,
//     rejected: 0,
//     resolutionRate: 0,
//     avgResolutionTime: 0,
//   });
//   const [recentGrievances, setRecentGrievances] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       // Fetch analytics
//       const analyticsResponse = await api.get("/analytics/dashboard");



//       if (analyticsResponse.ok) {
//         const analyticsData = analyticsResponse.data;
//         console.log("Analytics data:", analyticsData);

//         if (analyticsData.success && analyticsData.data) {
//           setStats(
//             analyticsData.data.summary || {
//               total: 0,
//               pending: 0,
//               inProgress: 0,
//               resolved: 0,
//               closed: 0,
//               rejected: 0,
//               resolutionRate: 0,
//               avgResolutionTime: 0,
//             }
//           );

//           // Set recent grievances from analytics if available
//           if (analyticsData.data.recentGrievances) {
//             setRecentGrievances(analyticsData.data.recentGrievances);
//           }
//         }
//       } else {
//         console.error("Analytics API error:", analyticsResponse.status);
//       }

//       // If we don't have recent grievances from analytics, fetch them separately
//       if (recentGrievances.length === 0) {
//         const grievancesResponse = await api.get(
//           "/grievances?limit=5&sortBy=updatedAt&sortOrder=desc"
//         );

//         const grievancesData = grievancesResponse.data;

//         if (grievancesResponse.ok) {
//           const grievancesData = await grievancesResponse.json();
//           console.log("Grievances data:", grievancesData);

//           // Fix: Access grievancesData.data directly, not grievancesData.data.grievances
//           if (grievancesData.success && grievancesData.data) {
//             setRecentGrievances(
//               Array.isArray(grievancesData.data) ? grievancesData.data : []
//             );
//           }
//         } else {
//           console.error("Grievances API error:", grievancesResponse.status);
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching dashboard data:", error);
//       setError("Failed to load dashboard data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "pending":
//         return "text-yellow-400 bg-yellow-400/10";
//       case "in_progress":
//         return "text-blue-400 bg-blue-400/10";
//       case "resolved":
//         return "text-green-400 bg-green-400/10";
//       case "closed":
//         return "text-gray-400 bg-gray-400/10";
//       case "rejected":
//         return "text-red-400 bg-red-400/10";
//       default:
//         return "text-gray-400 bg-gray-400/10";
//     }
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case "pending":
//         return <Clock className="w-4 h-4" />;
//       case "in_progress":
//         return <AlertCircle className="w-4 h-4" />;
//       case "resolved":
//         return <CheckCircle className="w-4 h-4" />;
//       default:
//         return <FileText className="w-4 h-4" />;
//     }
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-slate-900 pt-20 p-8">
//         <div className="max-w-7xl mx-auto">
//           <div className="animate-pulse">
//             <div className="h-8 bg-slate-700 rounded w-1/4 mb-8"></div>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//               {[...Array(4)].map((_, i) => (
//                 <div key={i} className="h-32 bg-slate-700 rounded-xl"></div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-slate-900 pt-20 p-8">
//         <div className="max-w-7xl mx-auto">
//           <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8">
//             <p className="text-red-400">{error}</p>
//             <button
//               onClick={fetchDashboardData}
//               className="mt-2 text-red-300 hover:text-red-200 underline"
//             >
//               Try again
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-900 pt-20 sm:pt-24 p-4 sm:p-6 lg:p-8">
//       <div className="max-w-7xl mx-auto pt-18">
//         {/* Header */}
//         <div className="mb-6 sm:mb-8 animate-fade-in">
//           <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
//             Welcome back, {user?.name}!
//           </h1>
//           <p className="text-slate-400 text-base sm:text-lg">
//             Track your grievances and submit new complaints
//           </p>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
//           <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-3 sm:p-4 lg:p-6 hover:bg-slate-800/70 transition-all duration-300 group hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10 animate-slide-up">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-slate-400 text-xs sm:text-sm">
//                   Total Grievances
//                 </p>
//                 <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white group-hover:text-blue-300 transition-colors duration-300">
//                   {stats.total || 0}
//                 </p>
//               </div>
//               <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
//                 <FileText className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-400" />
//               </div>
//             </div>
//           </div>

//           {/* <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-3 sm:p-4 lg:p-6 hover:bg-slate-800/70 transition-all duration-300 group hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/10 animate-slide-up" style={{animationDelay: '0.1s'}}>
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-slate-400 text-xs sm:text-sm">Pending</p>
//                 <p className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300">{stats.pending || 0}</p>
//               </div>
//               <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
//                 <Clock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-400" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-3 sm:p-4 lg:p-6 hover:bg-slate-800/70 transition-all duration-300 group hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10 animate-slide-up" style={{animationDelay: '0.2s'}}>
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-slate-400 text-xs sm:text-sm">In Progress</p>
//                 <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-400 group-hover:text-blue-300 transition-colors duration-300">{stats.inProgress || 0}</p>
//               </div>
//               <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
//                 <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-400" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-3 sm:p-4 lg:p-6 hover:bg-slate-800/70 transition-all duration-300 group hover:scale-105 hover:shadow-xl hover:shadow-green-500/10 animate-slide-up" style={{animationDelay: '0.3s'}}>
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-slate-400 text-xs sm:text-sm">Resolved</p>
//                 <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-400 group-hover:text-green-300 transition-colors duration-300">{stats.resolved || 0}</p>
//               </div>
//               <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
//                 <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-400" />
//               </div>
//             </div>
//           </div> */}
//         </div>

//         {/* Quick Actions */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
//           <div className="lg:col-span-2">
//             <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 animate-fade-in">
//               <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
//                 <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
//                 Quick Actions
//               </h2>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
//                 <Link
//                   to="/submit-complaint"
//                   className="group bg-gradient-to-r from-purple-500 to-blue-500 p-4 sm:p-5 rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25 hover:-translate-y-1"
//                 >
//                   <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:rotate-90">
//                       <Plus className="w-5 h-5 text-white" />
//                     </div>
//                     <div>
//                       <h3 className="text-white font-semibold text-sm">
//                         Submit New Complaint
//                       </h3>
//                       <p className="text-white/80 text-xs">
//                         Report a new grievance
//                       </p>
//                     </div>
//                   </div>
//                 </Link>

//                 <Link
//                   to="/my-grievances"
//                   className="group bg-slate-700/50 border border-slate-600/50 p-4 sm:p-5 rounded-xl hover:bg-slate-700/70 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-slate-500/25 hover:-translate-y-1"
//                 >
//                   <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
//                       <MessageSquare className="w-5 h-5 text-blue-400" />
//                     </div>
//                     <div>
//                       <h3 className="text-white font-semibold text-sm">
//                         View My Grievances
//                       </h3>
//                       <p className="text-slate-400 text-xs">
//                         Track your complaints
//                       </p>
//                     </div>
//                   </div>
//                 </Link>
//               </div>
//             </div>
//           </div>

//           <div
//             className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 animate-fade-in"
//             style={{ animationDelay: "0.2s" }}
//           >
//             <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
//               <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
//               Tips
//             </h2>
//             <div className="space-y-4">
//               <div className="flex items-start gap-3">
//                 <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 animate-pulse"></div>
//                 <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
//                   Provide detailed descriptions for faster resolution
//                 </p>
//               </div>
//               <div className="flex items-start gap-3">
//                 <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 animate-pulse delay-200"></div>
//                 <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
//                   Include photos or videos as evidence
//                 </p>
//               </div>
//               <div className="flex items-start gap-3">
//                 <div className="w-2 h-2 bg-green-400 rounded-full mt-2 animate-pulse delay-500"></div>
//                 <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
//                   Check back regularly for updates
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Recent Grievances */}
//         <div
//           className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 animate-fade-in"
//           style={{ animationDelay: "0.4s" }}
//         >
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
//               <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
//               Recent Grievances
//             </h2>
//             <Link
//               to="/my-grievances"
//               className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-all duration-300 hover:scale-105"
//             >
//               View All
//             </Link>
//           </div>

//           {!recentGrievances || recentGrievances.length === 0 ? (
//             <div className="text-center py-8">
//               <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4 animate-pulse" />
//               <p className="text-slate-400">No grievances submitted yet</p>
//               <Link
//                 to="/submit-complaint"
//                 className="inline-flex items-center gap-2 mt-4 text-purple-400 hover:text-purple-300 transition-all duration-300 hover:scale-105"
//               >
//                 <Plus className="w-4 h-4" />
//                 Submit your first complaint
//               </Link>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {recentGrievances.map((grievance) => (
//                 <div
//                   key={grievance._id}
//                   className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4 hover:bg-slate-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-slate-500/10 hover:scale-[1.02] hover:-translate-y-1"
//                 >
//                   <div className="flex items-start justify-between">
//                     <div className="flex-1">
//                       <div className="flex items-center gap-3 mb-2">
//                         <h3 className="text-white font-medium">
//                           {grievance.title}
//                         </h3>
//                         <span
//                           className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(grievance.status)}`}
//                         >
//                           {getStatusIcon(grievance.status)}
//                           {grievance.status.replace("_", " ")}
//                         </span>
//                       </div>
//                       <p className="text-slate-400 text-sm mb-2 line-clamp-2 leading-relaxed">
//                         {grievance.description}
//                       </p>
//                       <div className="flex items-center gap-4 text-xs text-slate-500">
//                         <div className="flex items-center gap-1">
//                           <Calendar className="w-3 h-3" />
//                           {formatDate(grievance.createdAt)}
//                         </div>
//                         <div className="flex items-center gap-1">
//                           <MapPin className="w-3 h-3" />
//                           {grievance.category.replace("_", " ")}
//                         </div>
//                       </div>
//                     </div>
//                     <Link
//                       to={`/grievance/${grievance._id}`}
//                       className="text-purple-400 hover:text-purple-300 text-sm font-medium ml-4 transition-all duration-300 hover:underline hover:scale-105"
//                     >
//                       View Details
//                     </Link>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CitizenDashboard;

"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Plus,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Calendar,
  MapPin,
} from "lucide-react";
import { selectUser } from "../../redux/slices/authSlice";
import api from "../../api";

const CitizenDashboard = () => {
  const user = useSelector(selectUser);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    rejected: 0,
    resolutionRate: 0,
    avgResolutionTime: 0,
  });

  const [recentGrievances, setRecentGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // =============================
      // Analytics Dashboard
      // =============================
      const analyticsResponse = await api.get("/analytics/dashboard");
      const analyticsData = analyticsResponse.data;

      if (analyticsData?.success && analyticsData?.data) {
        setStats(
          analyticsData.data.summary || {
            total: 0,
            pending: 0,
            inProgress: 0,
            resolved: 0,
            closed: 0,
            rejected: 0,
            resolutionRate: 0,
            avgResolutionTime: 0,
          }
        );

        if (Array.isArray(analyticsData.data.recentGrievances)) {
          setRecentGrievances(analyticsData.data.recentGrievances);
          setLoading(false);
          return;
        }
      }

      // =============================
      // Fallback – Recent Grievances
      // =============================
      const grievancesResponse = await api.get(
        "/grievances?limit=5&sortBy=updatedAt&sortOrder=desc"
      );

      const grievancesData = grievancesResponse.data;

      if (grievancesData?.success && Array.isArray(grievancesData.data)) {
        setRecentGrievances(grievancesData.data);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-400 bg-yellow-400/10";
      case "in_progress":
        return "text-blue-400 bg-blue-400/10";
      case "resolved":
        return "text-green-400 bg-green-400/10";
      case "closed":
        return "text-gray-400 bg-gray-400/10";
      case "rejected":
        return "text-red-400 bg-red-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "in_progress":
        return <AlertCircle className="w-4 h-4" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // =============================
  // Loading UI
  // =============================
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 pt-20 p-8">
        <div className="max-w-7xl mx-auto animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =============================
  // Error UI
  // =============================
  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 pt-20 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8">
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-2 text-red-300 hover:text-red-200 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =============================
  // MAIN UI
  // =============================
  return (
    <div className="min-h-screen bg-slate-900 pt-20 sm:pt-24 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto pt-18">

        {/* Header */}
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-slate-400 text-base sm:text-lg">
            Track your grievances and submit new complaints
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-3 sm:p-4 lg:p-6">
            <p className="text-slate-400 text-sm">Total Grievances</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link
            to="/submit-complaint"
            className="bg-gradient-to-r from-purple-500 to-blue-500 p-5 rounded-xl text-white"
          >
            <Plus className="inline-block mr-2" />
            Submit New Complaint
          </Link>

          <Link
            to="/my-grievances"
            className="bg-slate-700 p-5 rounded-xl text-white"
          >
            <MessageSquare className="inline-block mr-2" />
            View My Grievances
          </Link>
        </div>

        {/* Recent Grievances */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-xl text-white mb-4">Recent Grievances</h2>

          {recentGrievances.length === 0 ? (
            <p className="text-slate-400">No grievances submitted yet</p>
          ) : (
            <div className="space-y-4">
              {recentGrievances.map((g) => (
                <div
                  key={g._id}
                  className="bg-slate-700/40 p-4 rounded-lg"
                >
                  <div className="flex justify-between mb-1">
                    <h3 className="text-white">{g.title}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs ${getStatusColor(
                        g.status
                      )}`}
                    >
                      {g.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm">{g.description}</p>
                  <div className="flex gap-4 text-xs text-slate-500 mt-2">
                    <span>{formatDate(g.createdAt)}</span>
                    <span>{g.category}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CitizenDashboard;
