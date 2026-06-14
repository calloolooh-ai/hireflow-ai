"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/Navbar"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts"
import { Loader2, TrendingUp } from "lucide-react"

interface AnalyticsData {
  activeJobs: number
  totalCandidates: number
  evaluationsCompleted: number
  hiresRecommended: number
  decisionBreakdown: Array<{ name: string; value: number; color: string }>
  avgScoresByJob: Array<{ name: string; technical: number; culture: number; composite: number }>
  topSkills: Array<{ skill: string; count: number }>
  hiringVelocity: Array<{ date: string; evaluations: number }>
}

const TOOLTIP_STYLE = {
  backgroundColor: "#111827",
  border: "1px solid #1e293b",
  borderRadius: "8px",
  color: "#f8fafc",
  fontSize: "12px",
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => { setError("Failed to load analytics. Please try again."); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div>
        <Navbar title="Analytics" />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Navbar title="Analytics" />
        <div className="p-6">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  const topStatCards = [
    { label: "Active Jobs", value: data.activeJobs },
    { label: "Total Candidates", value: data.totalCandidates },
    { label: "Evaluations", value: data.evaluationsCompleted },
    { label: "Hires Recommended", value: data.hiresRecommended },
  ]

  return (
    <div>
      <Navbar title="Analytics" subtitle="Hiring intelligence dashboard" />
      <div className="p-6 space-y-6">
        {/* KPI row */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {topStatCards.map(({ label, value }) => (
            <div
              key={label}
              className="bg-[#111827] border border-[#1e293b] rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-500 font-medium">{label}</span>
              </div>
              <div className="text-2xl font-bold text-white">{value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {/* Decision Breakdown */}
          <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">
              Hire vs Hold vs Reject
            </h3>
            {data.decisionBreakdown.every((d) => d.value === 0) ? (
              <div className="flex items-center justify-center h-48 text-sm text-slate-500">
                No decisions yet
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={180}>
                  <PieChart>
                    <Pie
                      data={data.decisionBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {data.decisionBreakdown.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {data.decisionBreakdown.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-sm shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-slate-400">{item.name}</span>
                      <span className="text-xs font-semibold text-white ml-auto">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Average Scores by Job */}
          <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">
              Average Scores by Job
            </h3>
            {data.avgScoresByJob.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-sm text-slate-500">
                No evaluation data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={data.avgScoresByJob}
                  margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[0, 10]}
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend
                    wrapperStyle={{ fontSize: "11px", color: "#94a3b8", paddingTop: "8px" }}
                  />
                  <Bar dataKey="technical" fill="#8b5cf6" radius={[3, 3, 0, 0]} name="Technical" />
                  <Bar dataKey="culture" fill="#10b981" radius={[3, 3, 0, 0]} name="Culture" />
                  <Bar dataKey="composite" fill="#3b82f6" radius={[3, 3, 0, 0]} name="Composite" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top Skills */}
          <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">
              Top Candidate Skills
            </h3>
            {data.topSkills.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-sm text-slate-500">
                No skill data yet
              </div>
            ) : (
              <div className="space-y-2.5">
                {data.topSkills.slice(0, 10).map((item, i) => {
                  const max = data.topSkills[0]?.count || 1
                  const pct = (item.count / max) * 100
                  return (
                    <div key={item.skill} className="flex items-center gap-3">
                      <div className="w-4 text-right text-xs text-slate-600 shrink-0">
                        #{i + 1}
                      </div>
                      <div className="w-24 shrink-0 text-xs text-slate-300 truncate">
                        {item.skill}
                      </div>
                      <div className="flex-1 h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="w-6 text-right text-xs text-slate-500 shrink-0">
                        {item.count}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Hiring Velocity */}
          <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Hiring Velocity</h3>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <TrendingUp className="w-3.5 h-3.5" />
                Evaluations over time
              </div>
            </div>
            {data.hiringVelocity.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-sm text-slate-500">
                No velocity data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart
                  data={data.hiringVelocity}
                  margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Line
                    type="monotone"
                    dataKey="evaluations"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", r: 3 }}
                    name="Evaluations"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
