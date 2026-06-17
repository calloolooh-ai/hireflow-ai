"use client"

import { useState } from "react"
import { ChevronUp, ChevronDown, ExternalLink } from "lucide-react"

interface CandidateRow {
  id: string
  name: string
  email: string
  technicalScore: number | null
  cultureScore: number | null
  compositeScore: number | null
  minSalary: number | null
  maxSalary: number | null
  decision: "HIRE" | "HOLD" | "REJECT" | null
  confidence: number | null
  status: string
}

interface Props {
  candidates: CandidateRow[]
  jobId: string
  onCandidateClick?: (id: string) => void
}

type SortKey = keyof CandidateRow
type SortDir = "asc" | "desc"

const DECISION_STYLES = {
  HIRE: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  HOLD: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  REJECT: "text-red-400 bg-red-500/10 border-red-500/30",
}

function ScoreBar({ score }: { score: number | null }) {
  if (score === null) return <span className="text-zinc-600 text-xs">—</span>
  const pct = (score / 10) * 100
  const color =
    score >= 8 ? "bg-emerald-500" : score >= 6.5 ? "bg-amber-500" : "bg-red-500"
  const textColor =
    score >= 8 ? "text-emerald-400" : score >= 6.5 ? "text-amber-400" : "text-red-400"

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-[#1f1f28] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs font-medium tabular-nums ${textColor}`}>
        {score.toFixed(1)}
      </span>
    </div>
  )
}

export default function CandidateMatrix({ candidates, onCandidateClick }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("compositeScore")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  const sorted = [...candidates].sort((a, b) => {
    const av = a[sortKey] ?? -Infinity
    const bv = b[sortKey] ?? -Infinity
    const cmp = av < bv ? -1 : av > bv ? 1 : 0
    return sortDir === "asc" ? cmp : -cmp
  })

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k)
      return <ChevronUp className="w-3 h-3 text-zinc-700 opacity-0 group-hover:opacity-100" />
    return sortDir === "asc" ? (
      <ChevronUp className="w-3 h-3 text-orange-400" />
    ) : (
      <ChevronDown className="w-3 h-3 text-orange-400" />
    )
  }

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min || !max) return "—"
    return `$${Math.round(min / 1000)}K–$${Math.round(max / 1000)}K`
  }

  const COLS: Array<{ key: SortKey; label: string }> = [
    { key: "name", label: "Candidate" },
    { key: "technicalScore", label: "Technical" },
    { key: "cultureScore", label: "Culture" },
    { key: "minSalary", label: "Compensation" },
    { key: "compositeScore", label: "Overall" },
    { key: "decision", label: "Decision" },
  ]

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#1f1f28]">
            {COLS.map(({ key, label }) => (
              <th
                key={key}
                onClick={() => toggleSort(key)}
                className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider cursor-pointer group hover:text-zinc-300 transition-colors select-none"
              >
                <div className="flex items-center gap-1">
                  {label}
                  <SortIcon k={key} />
                </div>
              </th>
            ))}
            <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1f1f28]">
          {sorted.map((c) => (
            <tr
              key={c.id}
              className={`hover:bg-[#1a1a22] transition-colors ${
                c.decision === "HIRE" ? "bg-emerald-500/3" :
                c.decision === "REJECT" ? "bg-red-500/3" : ""
              }`}
            >
              <td className="px-4 py-3.5">
                <div>
                  <div className="text-sm font-medium text-white">{c.name}</div>
                  <div className="text-xs text-zinc-600">{c.email}</div>
                </div>
              </td>
              <td className="px-4 py-3.5">
                <ScoreBar score={c.technicalScore} />
              </td>
              <td className="px-4 py-3.5">
                <ScoreBar score={c.cultureScore} />
              </td>
              <td className="px-4 py-3.5 text-xs text-zinc-400">
                {formatSalary(c.minSalary, c.maxSalary)}
              </td>
              <td className="px-4 py-3.5">
                <ScoreBar score={c.compositeScore} />
              </td>
              <td className="px-4 py-3.5">
                {c.decision ? (
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded border text-xs font-bold ${
                      DECISION_STYLES[c.decision]
                    }`}
                  >
                    {c.decision}
                  </span>
                ) : (
                  <span className="text-xs text-zinc-600">Pending</span>
                )}
              </td>
              <td className="px-4 py-3.5 text-right">
                <button
                  onClick={() => onCandidateClick?.(c.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-white bg-[#1f1f28] hover:bg-[#2a2a36] rounded-md transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Detail
                </button>
              </td>
            </tr>
          ))}

          {sorted.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-10 text-center text-sm text-zinc-500">
                No evaluated candidates yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
