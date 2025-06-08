import { useState, useEffect, useRef } from "react"
import { useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { selectIsAuthenticated, selectUser } from "../redux/slices/authSlice"
import {
  ChevronRight,
  Shield,
  Brain,
  Users,
  BarChart3,
  Clock,
  ArrowRight,
  Star,
  MessageSquare,
  TrendingUp,
  Lock,
  Zap,
  CheckCircle,
} from "lucide-react"

const Home = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectUser)
  const navigate = useNavigate()

  // Section reveal animation
  const ScrollReveal = ({ children, className = "", delay = 0 }) => {
    const [isVisible, setIsVisible] = useState(false)
    const [hasAnimated, setHasAnimated] = useState(false)
    const ref = useRef()

    useEffect(() => {
      if (hasAnimated) return
      const observer = new window.IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !hasAnimated) {
            setTimeout(() => {
              setIsVisible(true)
              setHasAnimated(true)
            }, delay)
            observer.disconnect()
          }
        },
        {
          threshold: 0.1,
          rootMargin: "50px 0px -50px 0px",
        },
      )
      if (ref.current) observer.observe(ref.current)
      return () => observer.disconnect()
    }, [hasAnimated, delay])

    return (
      <div
        ref={ref}
        className={`transition-all duration-1000 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        } ${className}`}
      >
        {children}
      </div>
    )
  }

  // Data for sections
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Analysis",
      description: "Advanced NLP and sentiment analysis to understand citizen grievances automatically.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Auto-Prioritization",
      description: "Smart classification system that routes complaints to the right department instantly.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Real-time Dashboard",
      description: "Comprehensive analytics dashboard for government officials to track and manage cases.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Privacy-Focused",
      description: "End-to-end encryption and privacy-first design to protect citizen data.",
      color: "from-orange-500 to-red-500",
    },
  ]

  const stats = [
    { number: "10K+", label: "Grievances Processed", icon: <MessageSquare className="w-6 h-6" /> },
    { number: "95%", label: "Accuracy Rate", icon: <TrendingUp className="w-6 h-6" /> },
    { number: "24/7", label: "System Availability", icon: <Clock className="w-6 h-6" /> },
    { number: "50+", label: "Govt. Departments", icon: <Users className="w-6 h-6" /> },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "City Administrator",
      avatar: "/placeholder.svg?height=40&width=40",
      content:
        "GovIntel has revolutionized how we handle citizen complaints. The AI classification is incredibly accurate!",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Department Head",
      avatar: "/placeholder.svg?height=40&width=40",
      content: "The automated routing system has reduced our response time by 70%. Citizens are much happier now.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Public Relations Officer",
      avatar: "/placeholder.svg?height=40&width=40",
      content: "Finally, a system that understands the urgency and sentiment behind citizen grievances.",
      rating: 5,
    },
  ]

  // Main page
  return (
    <div
      className={`
        min-h-screen
        bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900
        text-white
        overflow-x-hidden
        pt-[56px] sm:pt-[56px] md:pt-[72px] lg:pt-[72px]
      `}
    >
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-56px)] md:min-h-[calc(100vh-72px)] flex items-center justify-center px-2 sm:px-4 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-600/20 backdrop-blur-3xl"></div>
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <ScrollReveal>
            <div className="mb-6 sm:mb-8">
              <span className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs sm:text-sm font-medium backdrop-blur-sm">
                <Zap className="w-4 h-4 mr-2" />
                AI-Powered Government Solution
              </span>
            </div>
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white via-purple-100 to-cyan-100 bg-clip-text text-transparent leading-tight">
              Transform Public
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Grievance Management
              </span>
            </h1>
            <p className="text-base xs:text-lg sm:text-xl md:text-2xl text-slate-300 mb-8 sm:mb-12 max-w-2xl sm:max-w-4xl mx-auto leading-relaxed">
              AI-backed complaint analyzer that automatically prioritizes, classifies, and routes citizen grievances to
              the right department with advanced NLP and sentiment analysis.
            </p>
            <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center items-center">
              {isAuthenticated ? (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="group bg-gradient-to-r from-purple-500 to-pink-500 px-6 xs:px-8 py-3 xs:py-4 rounded-xl text-base xs:text-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
                >
                  Go to Dashboard
                  <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <Link
                  to="/signin"
                  className="group bg-gradient-to-r from-purple-500 to-pink-500 px-6 xs:px-8 py-3 xs:py-4 rounded-xl text-base xs:text-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 inline-flex items-center"
                >
                  Start Free Trial
                  <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
              <button className="px-6 xs:px-8 py-3 xs:py-4 rounded-xl text-base xs:text-lg font-semibold border border-slate-600 hover:border-slate-500 hover:bg-slate-800/50 transition-all backdrop-blur-sm">
                Watch Demo
              </button>
            </div>
            {isAuthenticated && (
              <div className="mt-6 p-4 bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-xl inline-block">
                <p className="text-slate-300">
                  Welcome back, <span className="text-white font-semibold">{user?.name}</span>!
                </p>
                <p className="text-sm text-slate-400">Role: {user?.role}</p>
              </div>
            )}
          </ScrollReveal>
        </div>
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-40 h-40 xs:w-64 xs:h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-56 h-56 xs:w-96 xs:h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/3 w-48 h-48 xs:w-80 xs:h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 xs:py-20 sm:py-24 md:py-32 px-2 sm:px-4 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-800/30 via-slate-800/30 to-blue-800/30 backdrop-blur-xl"></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl mb-2 sm:mb-4 group-hover:scale-110 transition-transform backdrop-blur-sm border border-emerald-500/20">
                    {stat.icon}
                  </div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-1 sm:mb-2">
                    {stat.number}
                  </div>
                  <div className="text-slate-400 font-medium text-xs sm:text-base">{stat.label}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-16 xs:py-20 sm:py-24 md:py-32 px-2 sm:px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-8 sm:mb-16">
              <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Powerful Features for Modern Government
              </h2>
              <p className="text-base xs:text-lg sm:text-xl text-slate-400 max-w-xl sm:max-w-3xl mx-auto">
                Leverage cutting-edge AI technology to streamline public grievance management and improve citizen
                satisfaction.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid xs:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {features.map((feature, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <div className="group relative p-5 sm:p-8 rounded-2xl bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:transform hover:scale-105 h-full flex flex-col">
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${feature.color} rounded-2xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4 text-white group-hover:text-blue-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed flex-grow text-sm sm:text-base">{feature.description}</p>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="relative py-16 xs:py-20 sm:py-24 md:py-32 px-2 sm:px-4 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-800/30 via-purple-800/30 to-blue-800/30 backdrop-blur-xl"></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid xs:grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <ScrollReveal>
              <div>
                <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Powerful Analytics Dashboard
                </h2>
                <p className="text-base xs:text-lg sm:text-xl text-slate-300 mb-4 sm:mb-8 leading-relaxed">
                  Track, analyze, and respond to citizen grievances with our comprehensive dashboard designed for
                  government officials.
                </p>
                <ul className="space-y-2 sm:space-y-4">
                  {[
                    "Real-time grievance tracking and status updates",
                    "Advanced filtering and search capabilities",
                    "Performance metrics and response time analytics",
                    "Department-specific views and permissions",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-pink-400 mr-2 sm:mr-3 mt-0.5" />
                      <span className="text-slate-300 text-sm sm:text-base">{item}</span>
                    </li>
                  ))}
                </ul>
                <button className="mt-6 sm:mt-8 group bg-gradient-to-r from-pink-500 to-purple-500 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-base sm:text-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-all transform hover:scale-105">
                  Explore Dashboard
                  <ChevronRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <div className="relative">
                <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-3xl blur-xl"></div>
                <img
                  src="/placeholder.svg?height=600&width=800"
                  alt="Dashboard Preview"
                  className="relative rounded-2xl shadow-2xl border border-slate-700/50 w-full"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-16 xs:py-20 sm:py-24 md:py-32 px-2 sm:px-4 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-800/30 via-orange-800/30 to-red-800/30 backdrop-blur-2xl"></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-8 sm:mb-16">
              <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                How GovIntel Works
              </h2>
              <p className="text-base xs:text-lg sm:text-xl text-slate-300 max-w-xl sm:max-w-3xl mx-auto">
                A simple, automated process that transforms how governments handle citizen grievances.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid xs:grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
            {[
              {
                step: "01",
                title: "Submit Grievance",
                description: "Citizens submit complaints through multiple channels - web, mobile, or phone.",
                icon: <MessageSquare className="w-8 h-8" />,
                color: "from-amber-500 to-orange-500",
              },
              {
                step: "02",
                title: "AI Analysis",
                description: "Advanced NLP analyzes sentiment, urgency, and automatically classifies the complaint.",
                icon: <Brain className="w-8 h-8" />,
                color: "from-orange-500 to-red-500",
              },
              {
                step: "03",
                title: "Smart Routing",
                description: "System routes to appropriate department with priority level and suggested actions.",
                icon: <ArrowRight className="w-8 h-8" />,
                color: "from-red-500 to-pink-500",
              },
            ].map((item, index) => (
              <ScrollReveal key={index} delay={index * 200}>
                <div className="relative text-center group p-6 sm:p-8 rounded-2xl bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:scale-105">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r ${item.color} rounded-full mb-4 sm:mb-6 group-hover:scale-110 transition-transform`}
                  >
                    {item.icon}
                  </div>
                  <div className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-2 sm:mb-4 group-hover:from-orange-200 group-hover:to-amber-200 transition-all">
                    {item.step}
                  </div>
                  <h3 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-4 text-white group-hover:text-orange-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-300 leading-relaxed max-w-xs sm:max-w-sm mx-auto text-sm sm:text-base">
                    {item.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-16 xs:py-20 sm:py-24 md:py-32 px-2 sm:px-4 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-800/30 via-slate-800/30 to-purple-800/30 backdrop-blur-2xl"></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-8 sm:mb-16">
              <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Trusted by Government Leaders
              </h2>
              <p className="text-base xs:text-lg sm:text-xl text-slate-300 max-w-xl sm:max-w-3xl mx-auto">
                See how GovIntel is making a difference for officials and citizens alike.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid xs:grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
            {testimonials.map((t, i) => (
              <ScrollReveal key={i} delay={i * 150}>
                <div className="relative p-6 sm:p-8 rounded-2xl bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:scale-105 flex flex-col h-full">
                  <div className="flex items-center gap-x-3 mb-4">
                    <img
                      src={t.avatar || "/placeholder.svg"}
                      alt={t.name}
                      className="w-10 h-10 rounded-full border-2 border-blue-400"
                    />
                    <div>
                      <div className="font-bold text-white">{t.name}</div>
                      <div className="text-xs text-slate-400">{t.role}</div>
                    </div>
                  </div>
                  <div className="flex mb-2">
                    {Array.from({ length: t.rating }).map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 text-sm sm:text-base flex-grow">"{t.content}"</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative py-16 xs:py-20 sm:py-24 px-2 sm:px-4 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-800/30 via-blue-800/30 to-cyan-800/30 backdrop-blur-2xl"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Ready to Modernize Your Grievance Management?
            </h2>
            <p className="text-base xs:text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              {isAuthenticated
                ? "Continue your journey with GovIntel's powerful features."
                : "Try GovIntel for free and see how AI can transform your public service delivery."}
            </p>
            <div className="flex flex-col xs:flex-row gap-4 justify-center items-center">
              {isAuthenticated ? (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="group bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 rounded-xl text-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
                >
                  Go to Dashboard
                  <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <Link
                  to="/signin"
                  className="group bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 rounded-xl text-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 inline-flex items-center"
                >
                  Start Free Trial
                  <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
              <button className="px-8 py-4 rounded-xl text-lg font-semibold border border-slate-600 hover:border-slate-500 hover:bg-slate-800/50 transition-all backdrop-blur-sm">
                Request a Demo
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-2 sm:px-4 lg:px-8 bg-slate-900 border-t border-slate-700/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-x-2">
            <Shield className="w-7 h-7 text-purple-400" />
            <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              GovIntel
            </span>
          </div>
          <div className="text-slate-400 text-sm">&copy; {new Date().getFullYear()} GovIntel. All rights reserved.</div>
          <div className="flex gap-x-4">
            <a href="/privacy" className="text-slate-400 hover:text-white text-sm">
              Privacy Policy
            </a>
            <a href="/terms" className="text-slate-400 hover:text-white text-sm">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
