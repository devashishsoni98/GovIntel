// import { useState, useEffect, useRef } from "react"
// import { useSelector } from "react-redux"
// import { Link, useNavigate } from "react-router-dom"
// import { selectIsAuthenticated, selectUser } from "../redux/slices/authSlice"
// import {
//   ChevronRight,
//   Shield,
//   Brain,
//   Users,
//   BarChart3,
//   Clock,
//   ArrowRight,
//   Star,
//   MessageSquare,
//   TrendingUp,
//   Lock,
//   Zap,
//   CheckCircle,
// } from "lucide-react"

// const Home = () => {
//   const isAuthenticated = useSelector(selectIsAuthenticated)
//   const user = useSelector(selectUser)
//   const navigate = useNavigate()

//   // Section reveal animation
//   const ScrollReveal = ({ children, className = "", delay = 0 }) => {
//     const [isVisible, setIsVisible] = useState(false)
//     const [hasAnimated, setHasAnimated] = useState(false)
//     const ref = useRef()

//     useEffect(() => {
//       if (hasAnimated) return
//       const observer = new window.IntersectionObserver(
//         ([entry]) => {
//           if (entry.isIntersecting && !hasAnimated) {
//             setTimeout(() => {
//               setIsVisible(true)
//               setHasAnimated(true)
//             }, delay)
//             observer.disconnect()
//           }
//         },
//         {
//           threshold: 0.1,
//           rootMargin: "50px 0px -50px 0px",
//         },
//       )
//       if (ref.current) observer.observe(ref.current)
//       return () => observer.disconnect()
//     }, [hasAnimated, delay])

//     return (
//       <div
//         ref={ref}
//         className={`transition-all duration-1000 ease-out ${
//           isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
//         } ${className}`}
//       >
//         {children}
//       </div>
//     )
//   }

//   // Data for sections
//   const features = [
//     {
//       icon: <Brain className="w-8 h-8" />,
//       title: "AI-Powered Analysis",
//       description: "Advanced NLP and sentiment analysis to understand citizen grievances automatically.",
//       color: "from-blue-500 to-cyan-500",
//     },
//     {
//       icon: <Shield className="w-8 h-8" />,
//       title: "Auto-Prioritization",
//       description: "Smart classification system that routes complaints to the right department instantly.",
//       color: "from-purple-500 to-pink-500",
//     },
//     {
//       icon: <BarChart3 className="w-8 h-8" />,
//       title: "Real-time Dashboard",
//       description: "Comprehensive analytics dashboard for government officials to track and manage cases.",
//       color: "from-green-500 to-emerald-500",
//     },
//     {
//       icon: <Lock className="w-8 h-8" />,
//       title: "Privacy-Focused",
//       description: "End-to-end encryption and privacy-first design to protect citizen data.",
//       color: "from-orange-500 to-red-500",
//     },
//   ]

//   const stats = [
//     { number: "10K+", label: "Grievances Processed", icon: <MessageSquare className="w-6 h-6" /> },
//     { number: "95%", label: "Accuracy Rate", icon: <TrendingUp className="w-6 h-6" /> },
//     { number: "24/7", label: "System Availability", icon: <Clock className="w-6 h-6" /> },
//     { number: "50+", label: "Govt. Departments", icon: <Users className="w-6 h-6" /> },
//   ]

//   const testimonials = [
//     {
//       name: "Sarah Johnson",
//       role: "City Administrator",
//       avatar: "/placeholder.svg?height=40&width=40",
//       content:
//         "GovIntel has revolutionized how we handle citizen complaints. The AI classification is incredibly accurate!",
//       rating: 5,
//     },
//     {
//       name: "Michael Chen",
//       role: "Department Head",
//       avatar: "/placeholder.svg?height=40&width=40",
//       content: "The automated routing system has reduced our response time by 70%. Citizens are much happier now.",
//       rating: 5,
//     },
//     {
//       name: "Emily Rodriguez",
//       role: "Public Relations Officer",
//       avatar: "/placeholder.svg?height=40&width=40",
//       content: "Finally, a system that understands the urgency and sentiment behind citizen grievances.",
//       rating: 5,
//     },
//   ]

//   // Main page
//   return (
//     <div
//       className={`
//         min-h-screen
//         bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900
//         text-white
//         overflow-x-hidden
//         pt-16 sm:pt-16 md:pt-20 lg:pt-20
//       `}
//     >
//       {/* Hero Section */}
//       <section className="relative min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)] flex items-center justify-center px-4 sm:px-6 lg:px-8">
//         <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-600/20 backdrop-blur-3xl"></div>
//         <div className="relative z-10 max-w-7xl mx-auto text-center">
//           <ScrollReveal>
//             <div className="mb-8 sm:mb-10">
//               <span className="inline-flex items-center px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm sm:text-base font-medium backdrop-blur-sm hover:bg-purple-500/30 transition-all duration-300">
//                 <Zap className="w-4 h-4 mr-2" />
//                 AI-Powered Government Solution
//               </span>
//             </div>
//             <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-white via-purple-100 to-cyan-100 bg-clip-text text-transparent leading-tight">
//               Transform Public
//               <br />
//               <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
//                 Grievance Management
//               </span>
//             </h1>
//             <p className="text-lg xs:text-xl sm:text-2xl md:text-3xl text-slate-300 mb-10 sm:mb-14 max-w-3xl sm:max-w-5xl mx-auto leading-relaxed">
//               AI-backed complaint analyzer that automatically prioritizes, classifies, and routes citizen grievances to
//               the right department with advanced NLP and sentiment analysis.
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
//               {isAuthenticated ? (
//                 <button
//                   onClick={() => navigate("/dashboard")}
//                   className="w-full sm:w-auto group bg-gradient-to-r from-purple-500 to-pink-500 px-8 sm:px-10 py-4 sm:py-5 rounded-xl text-lg sm:text-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 text-center"
//                 >
//                   Go to Dashboard
//                   <ArrowRight className="inline-block ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
//                 </button>
//               ) : (
//                 <Link
//                   to="/signin"
//                   className="w-full sm:w-auto group bg-gradient-to-r from-purple-500 to-pink-500 px-8 sm:px-10 py-4 sm:py-5 rounded-xl text-lg sm:text-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 inline-flex items-center justify-center"
//                 >
//                   Start Free Trial
//                   <ArrowRight className="inline-block ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
//                 </Link>
//               )}
//               <button className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 rounded-xl text-lg sm:text-xl font-semibold border border-slate-600 hover:border-slate-500 hover:bg-slate-800/50 transition-all duration-300 backdrop-blur-sm">
//                 Watch Demo
//               </button>
//             </div>
//             {isAuthenticated && (
//               <div className="mt-8 p-6 bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-xl inline-block hover:bg-slate-800/40 transition-all duration-300">
//                 <p className="text-slate-300">
//                   Welcome back, <span className="text-white font-semibold">{user?.name}</span>!
//                 </p>
//                 <p className="text-sm text-slate-400 capitalize">Role: {user?.role}</p>
//               </div>
//             )}
//           </ScrollReveal>
//         </div>
//         {/* Floating Elements */}
//         <div className="absolute inset-0 overflow-hidden pointer-events-none">
//           <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
//           <div className="absolute bottom-1/4 right-1/4 w-80 h-80 sm:w-[32rem] sm:h-[32rem] bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
//           <div className="absolute top-1/2 right-1/3 w-72 h-72 sm:w-[28rem] sm:h-[28rem] bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
//         </div>
//       </section>

//       {/* Stats Section */}
//       <section className="relative py-16 xs:py-20 sm:py-24 md:py-32 px-2 sm:px-4 lg:px-8">
//         <div className="absolute inset-0 bg-gradient-to-r from-emerald-800/30 via-slate-800/30 to-blue-800/30 backdrop-blur-xl"></div>
//         <div className="relative z-10 max-w-7xl mx-auto">
//           <ScrollReveal>
//             <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
//               {stats.map((stat, index) => (
//                 <div key={index} className="text-center group">
//                   <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl mb-2 sm:mb-4 group-hover:scale-110 transition-transform backdrop-blur-sm border border-emerald-500/20">
//                     {stat.icon}
//                   </div>
//                   <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-1 sm:mb-2">
//                     {stat.number}
//                   </div>
//                   <div className="text-slate-400 font-medium text-xs sm:text-base">{stat.label}</div>
//                 </div>
//               ))}
//             </div>
//           </ScrollReveal>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section id="features" className="relative py-16 xs:py-20 sm:py-24 md:py-32 px-2 sm:px-4 lg:px-8">
//         <div className="max-w-7xl mx-auto">
//           <ScrollReveal>
//             <div className="text-center mb-8 sm:mb-16">
//               <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
//                 Powerful Features for Modern Government
//               </h2>
//               <p className="text-base xs:text-lg sm:text-xl text-slate-400 max-w-xl sm:max-w-3xl mx-auto">
//                 Leverage cutting-edge AI technology to streamline public grievance management and improve citizen
//                 satisfaction.
//               </p>
//             </div>
//           </ScrollReveal>
//           <div className="grid xs:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
//             {features.map((feature, index) => (
//               <ScrollReveal key={index} delay={index * 100}>
//                 <div className="group relative p-5 sm:p-8 rounded-2xl bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:transform hover:scale-105 h-full flex flex-col">
//                   <div
//                     className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${feature.color} rounded-2xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform`}
//                   >
//                     {feature.icon}
//                   </div>
//                   <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4 text-white group-hover:text-blue-300 transition-colors">
//                     {feature.title}
//                   </h3>
//                   <p className="text-slate-400 leading-relaxed flex-grow text-sm sm:text-base">{feature.description}</p>
//                   <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
//                 </div>
//               </ScrollReveal>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Dashboard Preview Section */}
//       <section className="relative py-16 xs:py-20 sm:py-24 md:py-32 px-2 sm:px-4 lg:px-8">
//         <div className="absolute inset-0 bg-gradient-to-r from-pink-800/30 via-purple-800/30 to-blue-800/30 backdrop-blur-xl"></div>
//         <div className="relative z-10 max-w-7xl mx-auto">
//           <div className="grid xs:grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
//             <ScrollReveal>
//               <div>
//                 <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
//                   Powerful Analytics Dashboard
//                 </h2>
//                 <p className="text-base xs:text-lg sm:text-xl text-slate-300 mb-4 sm:mb-8 leading-relaxed">
//                   Track, analyze, and respond to citizen grievances with our comprehensive dashboard designed for
//                   government officials.
//                 </p>
//                 <ul className="space-y-2 sm:space-y-4">
//                   {[
//                     "Real-time grievance tracking and status updates",
//                     "Advanced filtering and search capabilities",
//                     "Performance metrics and response time analytics",
//                     "Department-specific views and permissions",
//                   ].map((item, index) => (
//                     <li key={index} className="flex items-start">
//                       <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-pink-400 mr-2 sm:mr-3 mt-0.5" />
//                       <span className="text-slate-300 text-sm sm:text-base">{item}</span>
//                     </li>
//                   ))}
//                 </ul>
//                 <button className="mt-6 sm:mt-8 group bg-gradient-to-r from-pink-500 to-purple-500 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-base sm:text-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-all transform hover:scale-105">
//                   Explore Dashboard
//                   <ChevronRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
//                 </button>
//               </div>
//             </ScrollReveal>
//             <ScrollReveal delay={200}>
//               <div className="relative">
//                 <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-3xl blur-xl"></div>
//                 <img
//                   src="/placeholder.svg?height=600&width=800"
//                   alt="Dashboard Preview"
//                   className="relative rounded-2xl shadow-2xl border border-slate-700/50 w-full"
//                 />
//               </div>
//             </ScrollReveal>
//           </div>
//         </div>
//       </section>

//       {/* How It Works Section */}
//       <section id="how-it-works" className="relative py-16 xs:py-20 sm:py-24 md:py-32 px-2 sm:px-4 lg:px-8">
//         <div className="absolute inset-0 bg-gradient-to-r from-amber-800/30 via-orange-800/30 to-red-800/30 backdrop-blur-2xl"></div>
//         <div className="relative z-10 max-w-7xl mx-auto">
//           <ScrollReveal>
//             <div className="text-center mb-8 sm:mb-16">
//               <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
//                 How GovIntel Works
//               </h2>
//               <p className="text-base xs:text-lg sm:text-xl text-slate-300 max-w-xl sm:max-w-3xl mx-auto">
//                 A simple, automated process that transforms how governments handle citizen grievances.
//               </p>
//             </div>
//           </ScrollReveal>
//           <div className="grid xs:grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
//             {[
//               {
//                 step: "01",
//                 title: "Submit Grievance",
//                 description: "Citizens submit complaints through multiple channels - web, mobile, or phone.",
//                 icon: <MessageSquare className="w-8 h-8" />,
//                 color: "from-amber-500 to-orange-500",
//               },
//               {
//                 step: "02",
//                 title: "AI Analysis",
//                 description: "Advanced NLP analyzes sentiment, urgency, and automatically classifies the complaint.",
//                 icon: <Brain className="w-8 h-8" />,
//                 color: "from-orange-500 to-red-500",
//               },
//               {
//                 step: "03",
//                 title: "Smart Routing",
//                 description: "System routes to appropriate department with priority level and suggested actions.",
//                 icon: <ArrowRight className="w-8 h-8" />,
//                 color: "from-red-500 to-pink-500",
//               },
//             ].map((item, index) => (
//               <ScrollReveal key={index} delay={index * 200}>
//                 <div className="relative text-center group p-6 sm:p-8 rounded-2xl bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:scale-105">
//                   <div
//                     className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r ${item.color} rounded-full mb-4 sm:mb-6 group-hover:scale-110 transition-transform`}
//                   >
//                     {item.icon}
//                   </div>
//                   <div className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-2 sm:mb-4 group-hover:from-orange-200 group-hover:to-amber-200 transition-all">
//                     {item.step}
//                   </div>
//                   <h3 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-4 text-white group-hover:text-orange-300 transition-colors">
//                     {item.title}
//                   </h3>
//                   <p className="text-slate-300 leading-relaxed max-w-xs sm:max-w-sm mx-auto text-sm sm:text-base">
//                     {item.description}
//                   </p>
//                 </div>
//               </ScrollReveal>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Testimonials Section */}
//       <section className="relative py-16 xs:py-20 sm:py-24 md:py-32 px-2 sm:px-4 lg:px-8">
//         <div className="absolute inset-0 bg-gradient-to-r from-blue-800/30 via-slate-800/30 to-purple-800/30 backdrop-blur-2xl"></div>
//         <div className="relative z-10 max-w-7xl mx-auto">
//           <ScrollReveal>
//             <div className="text-center mb-8 sm:mb-16">
//               <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
//                 Trusted by Government Leaders
//               </h2>
//               <p className="text-base xs:text-lg sm:text-xl text-slate-300 max-w-xl sm:max-w-3xl mx-auto">
//                 See how GovIntel is making a difference for officials and citizens alike.
//               </p>
//             </div>
//           </ScrollReveal>
//           <div className="grid xs:grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
//             {testimonials.map((t, i) => (
//               <ScrollReveal key={i} delay={i * 150}>
//                 <div className="relative p-6 sm:p-8 rounded-2xl bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:scale-105 flex flex-col h-full">
//                   <div className="flex items-center gap-x-3 mb-4">
//                     <img
//                       src={t.avatar || "/placeholder.svg"}
//                       alt={t.name}
//                       className="w-10 h-10 rounded-full border-2 border-blue-400"
//                     />
//                     <div>
//                       <div className="font-bold text-white">{t.name}</div>
//                       <div className="text-xs text-slate-400">{t.role}</div>
//                     </div>
//                   </div>
//                   <div className="flex mb-2">
//                     {Array.from({ length: t.rating }).map((_, idx) => (
//                       <Star key={idx} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
//                     ))}
//                   </div>
//                   <p className="text-slate-300 text-sm sm:text-base flex-grow">"{t.content}"</p>
//                 </div>
//               </ScrollReveal>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Call to Action Section */}
//       <section className="relative py-16 xs:py-20 sm:py-24 px-2 sm:px-4 lg:px-8">
//         <div className="absolute inset-0 bg-gradient-to-r from-purple-800/30 via-blue-800/30 to-cyan-800/30 backdrop-blur-2xl"></div>
//         <div className="relative z-10 max-w-4xl mx-auto text-center">
//           <ScrollReveal>
//             <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
//               Ready to Modernize Your Grievance Management?
//             </h2>
//             <p className="text-base xs:text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
//               {isAuthenticated
//                 ? "Continue your journey with GovIntel's powerful features."
//                 : "Try GovIntel for free and see how AI can transform your public service delivery."}
//             </p>
//             <div className="flex flex-col xs:flex-row gap-4 justify-center items-center">
//               {isAuthenticated ? (
//                 <button
//                   onClick={() => navigate("/dashboard")}
//                   className="group bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 rounded-xl text-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
//                 >
//                   Go to Dashboard
//                   <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
//                 </button>
//               ) : (
//                 <Link
//                   to="/signin"
//                   className="group bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 rounded-xl text-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 inline-flex items-center"
//                 >
//                   Start Free Trial
//                   <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
//                 </Link>
//               )}
//               <button className="px-8 py-4 rounded-xl text-lg font-semibold border border-slate-600 hover:border-slate-500 hover:bg-slate-800/50 transition-all backdrop-blur-sm">
//                 Request a Demo
//               </button>
//             </div>
//           </ScrollReveal>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="py-8 px-2 sm:px-4 lg:px-8 bg-slate-900 border-t border-slate-700/50">
//         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
//           <div className="flex items-center gap-x-2">
//             <Shield className="w-7 h-7 text-purple-400" />
//             <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
//               GovIntel
//             </span>
//           </div>
//           <div className="text-slate-400 text-sm">&copy; {new Date().getFullYear()} GovIntel. All rights reserved.</div>
//           <div className="flex gap-x-4">
//             <a href="/privacy" className="text-slate-400 hover:text-white text-sm">
//               Privacy Policy
//             </a>
//             <a href="/terms" className="text-slate-400 hover:text-white text-sm">
//               Terms of Service
//             </a>
//           </div>
//         </div>
//       </footer>
//     </div>
//   )
// }

// export default Home

"use client"

import { Activity, BarChart3, CheckCircle, Clock, Layers, Lock, Shield, Sparkles, Users } from "lucide-react"
import { useEffect, useState } from "react"

function Stat({ label, value, icon: Icon, colorClass }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/50 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/10 focus-within:ring-1 focus-within:ring-blue-500/30">
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-5" />
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-lg ${colorClass} shadow-md shadow-black/20`}
        >
          <Icon className="h-6 w-6 text-white" aria-hidden="true" />
        </div>
        <div>
          <p className="text-slate-400 text-sm">{label}</p>
          <p className="text-white text-xl font-semibold">{value}</p>
        </div>
      </div>
    </div>
  )
}

function Feature({ title, description, icon: Icon }) {
  return (
    <div className="group rounded-2xl border border-slate-700/50 bg-slate-800/40 p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/10 focus-within:ring-1 focus-within:ring-blue-500/30">
      <div className="mb-4 inline-flex rounded-lg bg-blue-500/15 p-3 ring-1 ring-inset ring-blue-500/20">
        <Icon className="h-5 w-5 text-blue-400" aria-hidden="true" />
      </div>
      <h3 className="text-white font-semibold text-lg mb-2 text-pretty">{title}</h3>
      <p className="text-slate-300 leading-relaxed text-sm">{description}</p>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  )
}

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(t)
  }, [])

  return (
    <main className="bg-slate-900">
      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1">
            <Sparkles className="h-4 w-4 text-blue-400" aria-hidden="true" />
            <span className="text-xs font-medium text-blue-200">GovIntel</span>
          </div>
          <h1 className="text-balance text-3xl font-bold text-white sm:text-5xl lg:text-6xl">
            Actionable Intelligence for Modern Governance
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-slate-300 sm:text-lg leading-relaxed">
            GovIntel helps agencies transform citizen feedback into measurable outcomes with secure analytics, real-time
            monitoring, and operational insights — all in one unified platform.
          </p>
        </div>

        {/* Hero visual (non-interactive) */}
        <div
          className={`mx-auto mt-10 max-w-5xl rounded-2xl border border-slate-700/40 bg-slate-800/40 p-4 sm:p-6 ${loading ? "animate-pulse" : ""}`}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <div className="col-span-2 space-y-2 rounded-xl border border-slate-700/40 bg-slate-900/40 p-4">
              {loading ? (
                <div className="space-y-3">
                  <div className="h-4 w-40 rounded bg-slate-700/50" />
                  <div className="h-4 w-52 rounded bg-slate-700/50" />
                  <div className="h-4 w-48 rounded bg-slate-700/50" />
                  <div className="h-4 w-44 rounded bg-slate-700/50" />
                </div>
              ) : (
                <>
                  <InfoRow label="Active cases" value="1,284" />
                  <InfoRow label="Avg. resolution time" value="36h" />
                  <InfoRow label="On-time completion" value="92%" />
                  <InfoRow label="Satisfaction index" value="4.6/5" />
                </>
              )}
            </div>
            <div className="col-span-3 rounded-xl border border-slate-700/40 bg-slate-900/40 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-slate-300 text-sm font-medium">Monthly Insights</span>
                <span className="text-slate-500 text-xs">Synthetic preview</span>
              </div>
              <div className={`grid grid-cols-12 gap-2 h-40 ${loading ? "opacity-70" : ""}`}>
                {Array.from({ length: 12 }).map((_, i) => {
                  const height = [28, 44, 36, 52, 48, 62, 40, 70, 58, 64, 50, 60][i]
                  const isPeak = i === 7
                  return (
                    <div key={i} className="flex h-full items-end" aria-hidden="true">
                      <div
                        className={`w-full rounded-md ${isPeak ? "bg-green-500" : "bg-blue-500/70"}`}
                        style={{ height: `${height}%` }}
                        title={`Month ${i + 1}`}
                      />
                    </div>
                  )
                })}
              </div>
              <p className="mt-3 text-xs text-slate-500">Data shown is illustrative for design preview.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-slate-700/50" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-28 rounded bg-slate-700/50" />
                    <div className="h-5 w-16 rounded bg-slate-600/50" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Agencies onboarded" value="120+" icon={Users} colorClass="bg-blue-600" />
            <Stat label="Cases processed" value="2.4M" icon={Activity} colorClass="bg-blue-600" />
            <Stat label="Automations live" value="350+" icon={Layers} colorClass="bg-blue-600" />
            <Stat label="Compliance score" value="99.9%" icon={Shield} colorClass="bg-green-600" />
          </div>
        )}
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16">
        <div className="mb-8">
          <h2 className="text-balance text-2xl font-semibold text-white sm:text-3xl">
            Built for accountability, insight, and impact
          </h2>
          <p className="mt-2 max-w-2xl text-slate-400 leading-relaxed">
            A secure analytics foundation tailored for public-sector workflows — from intake to resolution.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-6 shadow-sm">
                <div className="mb-4 h-10 w-10 rounded-lg bg-blue-500/20" />
                <div className="mb-2 h-5 w-40 rounded bg-slate-700/50" />
                <div className="h-4 w-full rounded bg-slate-700/40" />
                <div className="mt-2 h-4 w-3/5 rounded bg-slate-700/40" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Feature
              title="Unified Case Intelligence"
              description="Consolidate cases from multiple intake channels and reveal patterns instantly with status, priority, and category breakdowns."
              icon={BarChart3}
            />
            <Feature
              title="Operational Excellence"
              description="Track SLAs, bottlenecks, and average resolution time to optimize staffing and improve turnaround."
              icon={Clock}
            />
            <Feature
              title="Outcome Transparency"
              description="Quantify resolution rates and publish non-sensitive outcomes to build trust with your constituents."
              icon={CheckCircle}
            />
            <Feature
              title="Role-Based Security"
              description="Granular access controls and audit trails protect sensitive information and ensure compliance."
              icon={Lock}
            />
            <Feature
              title="Real-Time Monitoring"
              description="Stay ahead with live dashboards, alerts, and performance indicators tailored to your agency’s goals."
              icon={Activity}
            />
            <Feature
              title="Scalable Architecture"
              description="Designed to scale from departments to entire city/state deployments without rework."
              icon={Layers}
            />
          </div>
        )}
      </section>

      {/* Dashboard Preview (non-interactive) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16">
        <div className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-white text-lg font-semibold">GovIntel Dashboard Preview</h3>
            <span className="text-slate-500 text-xs">Non-interactive showcase</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 animate-pulse">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-slate-700/40 bg-slate-900/40 p-4">
                  <div className="mb-3 h-4 w-40 rounded bg-slate-700/50" />
                  <div className="space-y-3">
                    <div className="h-4 w-64 rounded bg-slate-700/40" />
                    <div className="h-4 w-56 rounded bg-slate-700/40" />
                    <div className="h-4 w-48 rounded bg-slate-700/40" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="rounded-xl border border-slate-700/40 bg-slate-900/40 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/10">
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-slate-300 text-sm font-medium">Status Summary</span>
                </div>
                <div className="space-y-3">
                  <InfoRow label="Pending" value="342" />
                  <InfoRow label="In Progress" value="506" />
                  <InfoRow label="Resolved" value="404" />
                  <InfoRow label="Closed" value="32" />
                </div>
              </div>
              <div className="rounded-xl border border-slate-700/40 bg-slate-900/40 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/10">
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-slate-300 text-sm font-medium">Category Breakdown</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {[
                    ["Sanitation", 64],
                    ["Roads", 58],
                    ["Utilities", 48],
                    ["Public Safety", 36],
                  ].map(([label, pct], i) => (
                    <div key={i}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-slate-400 text-xs">{label}</span>
                        <span className="text-slate-300 text-xs">{pct}%</span>
                      </div>
                      <div className="h-2 w-full rounded bg-slate-700/60">
                        <div className="h-2 rounded bg-blue-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-slate-700/40 bg-slate-900/40 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/10">
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-slate-300 text-sm font-medium">Quality & Impact</span>
                </div>
                <div className="space-y-3">
                  <InfoRow label="On-time SLA" value="92%" />
                  <InfoRow label="Verified outcomes" value="87%" />
                  <InfoRow label="Escalations" value="1.8%" />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Trust / Highlights */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <h4 className="text-white text-lg font-semibold">Accessibility by Default</h4>
                <p className="mt-2 text-slate-400 leading-relaxed text-sm">
                  High contrast, semantic markup, and responsive layouts ensure GovIntel is usable for everyone.
                </p>
              </div>
              <div>
                <h4 className="text-white text-lg font-semibold">Privacy & Security</h4>
                <p className="mt-2 text-slate-400 leading-relaxed text-sm">
                  Data is safeguarded with role-based controls and rigorous auditing appropriate for public
                  institutions.
                </p>
              </div>
              <div>
                <h4 className="text-white text-lg font-semibold">Proven at Scale</h4>
                <p className="mt-2 text-slate-400 leading-relaxed text-sm">
                  Designed to support multi-agency rollouts with consistent performance and reliability.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Footer (no links) */}
      <footer className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16 pb-16">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-6">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-white font-semibold">GovIntel</p>
                <p className="text-slate-400 text-sm mt-1">Evidence‑based decisions for public good.</p>
              </div>
              <div className="flex items-center gap-4 text-slate-400 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />
                  <span>AA contrast</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" aria-hidden="true" />
                  <span>Secure by design</span>
                </div>
              </div>
            </div>
            <div className="mt-6 border-t border-slate-700/40 pt-4 text-slate-500 text-xs">
              © {new Date().getFullYear()} GovIntel. All rights reserved.
            </div>
          </div>
        )}
      </footer>
    </main>
  )
}
