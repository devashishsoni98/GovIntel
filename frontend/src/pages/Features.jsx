"use client"

import { 
  Activity, BarChart3, CheckCircle, Clock, Layers, Lock, Shield, 
  Sparkles, Users, Zap, Database, Bell, FileText, TrendingUp, 
  GitBranch, Filter, Globe, Search, AlertTriangle
} from "lucide-react"
import { useState } from "react"

function FeatureCard({ title, description, icon: Icon, benefits, colorClass = "bg-blue-600" }) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  return (
    <div className="group rounded-2xl border border-slate-700/50 bg-slate-800/40 p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/10">
      <div className={`mb-4 inline-flex rounded-lg ${colorClass}/15 p-3 ring-1 ring-inset ${colorClass}/20`}>
        <Icon className="h-6 w-6 text-blue-400" aria-hidden="true" />
      </div>
      <h3 className="text-white font-semibold text-xl mb-3">{title}</h3>
      <p className="text-slate-300 leading-relaxed mb-4">{description}</p>
      
      {benefits && (
        <>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors flex items-center gap-1"
          >
            {isExpanded ? "Show less" : "Learn more"}
            <Sparkles className="h-3 w-3" />
          </button>
          
          {isExpanded && (
            <ul className="mt-4 space-y-2 border-t border-slate-700/50 pt-4">
              {benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-400 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}

function CategorySection({ title, description, features, icon: Icon }) {
  return (
    <section className="mb-16">
      <div className="mb-8 flex items-start gap-4">
        <div className="inline-flex rounded-lg bg-blue-500/15 p-3 ring-1 ring-inset ring-blue-500/20">
          <Icon className="h-6 w-6 text-blue-400" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">{title}</h2>
          <p className="mt-2 text-slate-400 leading-relaxed max-w-3xl">{description}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, idx) => (
          <FeatureCard key={idx} {...feature} />
        ))}
      </div>
    </section>
  )
}

export default function FeaturesPage() {
  const coreFeatures = [
    {
      title: "Multi-Channel Case Intake",
      description: "Centralize cases from email, web forms, phone, mobile apps, and walk-ins into a single unified system.",
      icon: Database,
      colorClass: "bg-blue-600",
      benefits: [
        "Automatic routing based on category and priority",
        "Duplicate detection to prevent redundant cases",
        "Integration with existing 311 systems and CRMs",
        "Custom intake forms for different departments"
      ]
    },
    {
      title: "Advanced Analytics Dashboard",
      description: "Visualize trends, patterns, and performance metrics with interactive charts and customizable reports.",
      icon: BarChart3,
      colorClass: "bg-purple-600",
      benefits: [
        "Real-time data visualization with drill-down capabilities",
        "Custom report builder with scheduled exports",
        "Comparative analysis across time periods and departments",
        "Predictive analytics for resource planning"
      ]
    },
    {
      title: "Intelligent Case Routing",
      description: "AI-powered assignment system that matches cases to the right teams based on skills, workload, and priority.",
      icon: GitBranch,
      colorClass: "bg-green-600",
      benefits: [
        "Smart load balancing across team members",
        "Priority-based escalation workflows",
        "Skills-based routing for specialized cases",
        "Automatic reassignment for overdue cases"
      ]
    },
    {
      title: "SLA Monitoring & Alerts",
      description: "Track service level agreements in real-time with automated notifications for at-risk cases.",
      icon: Clock,
      colorClass: "bg-orange-600",
      benefits: [
        "Configurable SLA rules by case type and priority",
        "Multi-channel alerts (email, SMS, in-app)",
        "Escalation chains for overdue cases",
        "Historical SLA compliance reporting"
      ]
    },
    {
      title: "Citizen Communication Portal",
      description: "Keep constituents informed with automated updates and a self-service portal for case tracking.",
      icon: Globe,
      colorClass: "bg-indigo-600",
      benefits: [
        "Real-time case status tracking for citizens",
        "Automated email and SMS notifications",
        "Two-way communication with case managers",
        "Anonymous feedback and satisfaction surveys"
      ]
    },
    {
      title: "Mobile Field Operations",
      description: "Empower field teams with mobile apps for case updates, photo documentation, and offline access.",
      icon: Activity,
      colorClass: "bg-teal-600",
      benefits: [
        "Offline mode for areas with poor connectivity",
        "GPS tracking and location-based case assignment",
        "Photo and video evidence capture",
        "Voice notes and quick status updates"
      ]
    }
  ]

  const securityFeatures = [
    {
      title: "Role-Based Access Control",
      description: "Granular permissions system ensuring users only access data relevant to their responsibilities.",
      icon: Lock,
      colorClass: "bg-red-600",
      benefits: [
        "Department and team-level access controls",
        "Custom roles with specific permissions",
        "Data field-level security for sensitive information",
        "Temporary access grants for auditors and consultants"
      ]
    },
    {
      title: "Comprehensive Audit Trails",
      description: "Complete logging of all system actions for compliance, investigation, and process improvement.",
      icon: FileText,
      colorClass: "bg-yellow-600",
      benefits: [
        "Immutable logs of all data access and modifications",
        "User action tracking with timestamps and IP addresses",
        "Export capabilities for compliance reporting",
        "Suspicious activity detection and alerts"
      ]
    },
    {
      title: "Data Encryption & Privacy",
      description: "Enterprise-grade encryption for data at rest and in transit, ensuring compliance with privacy regulations.",
      icon: Shield,
      colorClass: "bg-blue-600",
      benefits: [
        "End-to-end encryption for sensitive data",
        "Automatic PII detection and redaction",
        "Compliance with GDPR, CCPA, and local regulations",
        "Regular security audits and penetration testing"
      ]
    }
  ]

  const integrationFeatures = [
    {
      title: "Third-Party Integrations",
      description: "Seamlessly connect with existing government systems, GIS platforms, and communication tools.",
      icon: Layers,
      colorClass: "bg-cyan-600",
      benefits: [
        "REST API for custom integrations",
        "Pre-built connectors for popular platforms",
        "Webhook support for real-time data sync",
        "SAML/OAuth for single sign-on"
      ]
    },
    {
      title: "Advanced Search & Filtering",
      description: "Powerful search capabilities to find cases, patterns, and insights across millions of records.",
      icon: Search,
      colorClass: "bg-violet-600",
      benefits: [
        "Full-text search across all case data",
        "Saved searches and custom filters",
        "Similar case detection using AI",
        "Export filtered results for analysis"
      ]
    },
    {
      title: "Workflow Automation",
      description: "Build custom workflows to automate routine tasks and ensure consistent case handling.",
      icon: Zap,
      colorClass: "bg-amber-600",
      benefits: [
        "Visual workflow builder with drag-and-drop",
        "Conditional logic and branching",
        "Scheduled tasks and recurring actions",
        "Integration with external systems via webhooks"
      ]
    }
  ]

  const reportingFeatures = [
    {
      title: "Performance Metrics",
      description: "Track KPIs and team performance with customizable dashboards and automated reports.",
      icon: TrendingUp,
      colorClass: "bg-emerald-600",
      benefits: [
        "Individual and team performance tracking",
        "Benchmarking against historical data",
        "Goal setting and progress monitoring",
        "Performance reviews with data-backed insights"
      ]
    },
    {
      title: "Public Transparency Reports",
      description: "Generate publishable reports that build trust while protecting sensitive information.",
      icon: Users,
      colorClass: "bg-pink-600",
      benefits: [
        "Automatic PII redaction for public reports",
        "Customizable report templates",
        "Interactive public dashboards",
        "Open data export in standard formats"
      ]
    },
    {
      title: "Anomaly Detection",
      description: "AI-powered system that identifies unusual patterns, potential issues, and improvement opportunities.",
      icon: AlertTriangle,
      colorClass: "bg-rose-600",
      benefits: [
        "Automatic detection of duplicate or fraudulent cases",
        "Identification of process bottlenecks",
        "Outlier detection in resolution times",
        "Early warning system for emerging issues"
      ]
    }
  ]

  return (
    <main className="bg-slate-900 min-h-screen">
      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1">
            <Sparkles className="h-4 w-4 text-blue-400" aria-hidden="true" />
            <span className="text-xs font-medium text-blue-200">Comprehensive Features</span>
          </div>
          <h1 className="text-balance text-3xl font-bold text-white sm:text-5xl lg:text-6xl">
            Everything You Need to Transform Citizen Services
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-slate-300 sm:text-lg leading-relaxed">
            GovIntel combines powerful analytics, secure operations, and intelligent automation to help your agency deliver exceptional service to constituents.
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-16">
        <div className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">50+</div>
              <div className="text-slate-400 text-sm mt-1">Core Features</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">99.9%</div>
              <div className="text-slate-400 text-sm mt-1">Uptime SLA</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">24/7</div>
              <div className="text-slate-400 text-sm mt-1">Support Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">SOC 2</div>
              <div className="text-slate-400 text-sm mt-1">Certified</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Categories */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <CategorySection
          title="Core Platform Features"
          description="Essential tools for managing citizen cases from intake to resolution"
          features={coreFeatures}
          icon={Layers}
        />

        <CategorySection
          title="Security & Compliance"
          description="Enterprise-grade security features to protect sensitive government data"
          features={securityFeatures}
          icon={Shield}
        />

        <CategorySection
          title="Integration & Automation"
          description="Connect with existing systems and automate routine workflows"
          features={integrationFeatures}
          icon={Zap}
        />

        <CategorySection
          title="Reporting & Intelligence"
          description="Transform data into actionable insights with advanced analytics"
          features={reportingFeatures}
          icon={BarChart3}
        />
      </div>


      {/* Footer */}
      <footer className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
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
      </footer>
    </main>
  )
}