"use client"

import { 
  CheckCircle, Shield, Sparkles, ArrowRight, 
  Upload, Users, BarChart3, Bell, Settings, 
  FileText, Zap, Lock, TrendingUp, Database,
  GitBranch, MessageSquare, CheckSquare
} from "lucide-react"
import { useState } from "react"

function ProcessStep({ number, title, description, icon: Icon, details, isLast }) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  return (
    <div className="relative">
      {/* Connection Line */}
      {!isLast && (
        <div className="absolute left-6 top-20 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 to-transparent hidden lg:block" />
      )}
      
      <div className="group rounded-2xl border border-slate-700/50 bg-slate-800/40 p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/10">
        <div className="flex items-start gap-4">
          {/* Step Number */}
          <div className="flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg shadow-lg shadow-blue-500/20">
              {number}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 mb-3">
                <div className="inline-flex rounded-lg bg-blue-500/15 p-2 ring-1 ring-inset ring-blue-500/20">
                  <Icon className="h-5 w-5 text-blue-400" aria-hidden="true" />
                </div>
                <h3 className="text-white font-semibold text-xl">{title}</h3>
              </div>
            </div>
            
            <p className="text-slate-300 leading-relaxed mb-4">{description}</p>
            
            {details && (
              <>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                  {isExpanded ? "Show less" : "View details"}
                  <ArrowRight className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                </button>
                
                {isExpanded && (
                  <div className="mt-4 space-y-3 border-t border-slate-700/50 pt-4">
                    {details.map((detail, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-white font-medium text-sm">{detail.title}</div>
                          <div className="text-slate-400 text-sm mt-0.5">{detail.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Timeline({ title, description, items }) {
  return (
    <div className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-6">
      <h3 className="text-white font-semibold text-xl mb-2">{title}</h3>
      <p className="text-slate-400 text-sm mb-6">{description}</p>
      
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/20 ring-2 ring-blue-500/30">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
              </div>
            </div>
            <div className="flex-1 pb-4 border-b border-slate-700/30 last:border-0">
              <div className="text-white font-medium">{item.phase}</div>
              <div className="text-slate-400 text-sm mt-1">{item.duration}</div>
              <div className="text-slate-300 text-sm mt-2">{item.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BenefitCard({ icon: Icon, title, description }) {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/10">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="inline-flex rounded-lg bg-green-500/15 p-2 ring-1 ring-inset ring-green-500/20">
            <Icon className="h-5 w-5 text-green-400" aria-hidden="true" />
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-1">{title}</h4>
          <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  )
}

export default function HowItWorksPage() {
  const implementationSteps = [
    {
      number: 1,
      title: "Discovery & Planning",
      description: "We start by understanding your agency's unique needs, workflows, and goals to create a tailored implementation plan.",
      icon: Users,
      details: [
        {
          title: "Stakeholder Workshops",
          description: "Collaborative sessions with department heads and end users to map current processes"
        },
        {
          title: "Requirements Analysis",
          description: "Detailed documentation of case types, workflows, and integration needs"
        },
        {
          title: "Success Metrics Definition",
          description: "Establish KPIs and benchmarks to measure improvement"
        },
        {
          title: "Implementation Roadmap",
          description: "Phased rollout plan with milestones and resource allocation"
        }
      ]
    },
    {
      number: 2,
      title: "System Configuration",
      description: "Our team configures GovIntel to match your workflows, including case categories, routing rules, and integrations.",
      icon: Settings,
      details: [
        {
          title: "Custom Case Types",
          description: "Configure categories, fields, and workflows specific to your departments"
        },
        {
          title: "User Roles & Permissions",
          description: "Set up role-based access control aligned with your organizational structure"
        },
        {
          title: "Integration Setup",
          description: "Connect to existing systems like 311, GIS, email, and communication platforms"
        },
        {
          title: "Branding & Customization",
          description: "Apply your agency's branding to citizen-facing portals and communications"
        }
      ]
    },
    {
      number: 3,
      title: "Data Migration",
      description: "Securely transfer historical case data and ensure continuity with your existing systems.",
      icon: Database,
      details: [
        {
          title: "Data Assessment",
          description: "Audit existing data quality and identify cleanup requirements"
        },
        {
          title: "Migration Planning",
          description: "Create detailed migration strategy with validation checkpoints"
        },
        {
          title: "Secure Transfer",
          description: "Encrypted data transfer with validation and verification"
        },
        {
          title: "Historical Reporting",
          description: "Ensure historical data is accessible for trend analysis and reporting"
        }
      ]
    },
    {
      number: 4,
      title: "Training & Onboarding",
      description: "Comprehensive training programs ensure your team is confident and productive from day one.",
      icon: FileText,
      details: [
        {
          title: "Role-Based Training",
          description: "Customized sessions for administrators, case managers, and field staff"
        },
        {
          title: "Hands-On Workshops",
          description: "Practice with realistic scenarios in a sandbox environment"
        },
        {
          title: "Documentation & Resources",
          description: "Video tutorials, quick reference guides, and searchable knowledge base"
        },
        {
          title: "Train-the-Trainer Program",
          description: "Empower internal champions to support ongoing learning"
        }
      ]
    },
    {
      number: 5,
      title: "Pilot Launch",
      description: "Start with a controlled pilot in one department to validate configuration and gather feedback.",
      icon: Zap,
      details: [
        {
          title: "Soft Launch",
          description: "Limited user group tests core workflows and provides feedback"
        },
        {
          title: "Performance Monitoring",
          description: "Track system performance and user adoption metrics"
        },
        {
          title: "Iterative Refinement",
          description: "Adjust workflows and configurations based on real-world usage"
        },
        {
          title: "Success Validation",
          description: "Confirm pilot meets success criteria before full rollout"
        }
      ]
    },
    {
      number: 6,
      title: "Full Deployment",
      description: "Roll out GovIntel across all departments with ongoing support and continuous improvement.",
      icon: TrendingUp,
      details: [
        {
          title: "Phased Rollout",
          description: "Gradual expansion across departments to minimize disruption"
        },
        {
          title: "24/7 Support",
          description: "Dedicated support team available throughout deployment"
        },
        {
          title: "Performance Optimization",
          description: "Continuous monitoring and tuning for optimal performance"
        },
        {
          title: "Ongoing Enhancement",
          description: "Regular updates, new features, and best practice sharing"
        }
      ]
    }
  ]

  const dailyWorkflow = [
    {
      phase: "Case Intake",
      duration: "Ongoing",
      description: "Citizens submit cases through multiple channels - all automatically captured and categorized"
    },
    {
      phase: "Intelligent Routing",
      duration: "< 1 minute",
      description: "AI assigns cases to appropriate teams based on type, priority, and workload"
    },
    {
      phase: "Case Management",
      duration: "Ongoing",
      description: "Team members update status, add notes, and coordinate resolution efforts"
    },
    {
      phase: "Citizen Communication",
      duration: "Automated",
      description: "Automatic updates keep constituents informed at every milestone"
    },
    {
      phase: "Quality Review",
      duration: "Before closure",
      description: "Verification of resolution and documentation before marking complete"
    },
    {
      phase: "Analytics & Reporting",
      duration: "Real-time",
      description: "Dashboards update continuously with latest performance metrics"
    }
  ]

  const implementationTimeline = [
    {
      phase: "Discovery & Planning",
      duration: "2-4 weeks",
      description: "Requirements gathering, stakeholder alignment, and implementation planning"
    },
    {
      phase: "Configuration & Setup",
      duration: "3-6 weeks",
      description: "System configuration, integrations, and customization"
    },
    {
      phase: "Data Migration",
      duration: "2-3 weeks",
      description: "Historical data transfer and validation"
    },
    {
      phase: "Training & Testing",
      duration: "2-4 weeks",
      description: "User training, UAT, and refinement"
    },
    {
      phase: "Pilot Launch",
      duration: "4-8 weeks",
      description: "Controlled rollout with one department or use case"
    },
    {
      phase: "Full Deployment",
      duration: "4-12 weeks",
      description: "Phased rollout across all departments"
    }
  ]

  return (
    <main className="bg-slate-900 min-h-screen">
      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1">
            <Sparkles className="h-4 w-4 text-blue-400" aria-hidden="true" />
            <span className="text-xs font-medium text-blue-200">Implementation Guide</span>
          </div>
          <h1 className="text-balance text-3xl font-bold text-white sm:text-5xl lg:text-6xl">
            From Setup to Success in Weeks, Not Months
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-slate-300 sm:text-lg leading-relaxed">
            Our proven implementation process ensures your agency is up and running quickly with minimal disruption and maximum impact.
          </p>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <BenefitCard
            icon={Zap}
            title="Fast Time to Value"
            description="Go live in 8-12 weeks with our streamlined implementation process"
          />
          <BenefitCard
            icon={Users}
            title="Expert Guidance"
            description="Dedicated implementation team with public sector expertise"
          />
          <BenefitCard
            icon={Shield}
            title="Risk-Free Pilot"
            description="Validate success with a controlled pilot before full deployment"
          />
        </div>
      </section>


      {/* Daily Workflow & Timeline */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Timeline
            title="Daily Case Workflow"
            description="How cases flow through the system once deployed"
            items={dailyWorkflow}
          />
        
        </div>
      </section>

      {/* Platform Architecture */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-16">
        <div className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-white mb-6">How GovIntel Works</h2>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto mb-3 inline-flex rounded-full bg-blue-500/15 p-4 ring-1 ring-inset ring-blue-500/20">
                <Upload className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Multi-Channel Intake</h3>
              <p className="text-slate-400 text-sm">
                Cases flow in from web, mobile, email, phone, and walk-ins
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-3 inline-flex rounded-full bg-purple-500/15 p-4 ring-1 ring-inset ring-purple-500/20">
                <GitBranch className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Smart Routing</h3>
              <p className="text-slate-400 text-sm">
                AI assigns cases to the right team based on skills and workload
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-3 inline-flex rounded-full bg-green-500/15 p-4 ring-1 ring-inset ring-green-500/20">
                <MessageSquare className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Collaborative Resolution</h3>
              <p className="text-slate-400 text-sm">
                Teams work together with real-time updates and communication
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-3 inline-flex rounded-full bg-orange-500/15 p-4 ring-1 ring-inset ring-orange-500/20">
                <BarChart3 className="h-8 w-8 text-orange-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Analytics & Insights</h3>
              <p className="text-slate-400 text-sm">
                Real-time dashboards track performance and identify trends
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Details */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-16">
        <div className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Technical Approach</h2>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Lock className="h-5 w-5 text-blue-400" />
                <h3 className="text-white font-semibold">Cloud-Native Architecture</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Built on modern cloud infrastructure for scalability, reliability, and security. Automatic updates ensure you always have the latest features.
              </p>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-3">
                <GitBranch className="h-5 w-5 text-green-400" />
                <h3 className="text-white font-semibold">API-First Design</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Comprehensive REST APIs enable seamless integration with existing systems. Connect to GIS, 311, CRM, and other government platforms.
              </p>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckSquare className="h-5 w-5 text-purple-400" />
                <h3 className="text-white font-semibold">Compliance-Ready</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                SOC 2 certified with built-in support for GDPR, CCPA, and government-specific regulations. Audit trails for every action.
              </p>
            </div>
          </div>
        </div>
      </section>


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