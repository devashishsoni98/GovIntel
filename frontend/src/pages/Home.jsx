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
