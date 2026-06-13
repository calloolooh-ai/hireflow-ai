export interface User {
  id: string
  email: string
  name: string
  role: string
  createdAt: Date
}

export interface Job {
  id: string
  userId: string
  title: string
  department: string
  level: string
  location: string
  description: string
  status: "active" | "archived"
  bandRoomId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Candidate {
  id: string
  jobId: string
  name: string
  email: string
  resumeText: string | null
  linkedinUrl: string | null
  status: "pending" | "evaluating" | "complete" | "hired" | "rejected" | "hold"
  bandThreadId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Evaluation {
  id: string
  candidateId: string
  jobId: string
  agentType: AgentType
  output: string
  score: number | null
  createdAt: Date
}

export interface BandMessage {
  id: string
  roomId: string
  threadId: string
  agentType: string
  content: string
  metadata: string | null
  createdAt: Date
}

export interface Decision {
  id: string
  candidateId: string
  jobId: string
  decision: "HIRE" | "HOLD" | "REJECT"
  reasoning: string | null
  compositeScore: number | null
  confidence: number | null
  approvedBy: string | null
  approvedAt: Date | null
  humanDecision: "approve" | "reject" | "review" | null
  createdAt: Date
}

export interface AuditLog {
  id: string
  entityType: string
  entityId: string
  action: string
  actorType: "agent" | "human"
  actorId: string | null
  data: string | null
  createdAt: Date
}

export type AgentType =
  | "resume_analyst"
  | "technical_evaluator"
  | "culture_evaluator"
  | "compensation_agent"
  | "ranking_agent"

export interface ResumeOutput {
  skills: string[]
  yearsExperience: number
  strengths: string[]
  summary: string
  education: string[]
  companies: string[]
}

export interface TechnicalOutput {
  score: number
  rationale: string
  strengths: string[]
  gaps: string[]
  keywordMatches: string[]
}

export interface CultureOutput {
  score: number
  rationale: string
  communication: number
  leadership: number
  collaboration: number
  adaptability: number
}

export interface CompensationOutput {
  minSalary: number
  maxSalary: number
  confidence: number
  marketRate: string
  factors: string[]
}

export interface RankingOutput {
  compositeScore: number
  decision: "HIRE" | "HOLD" | "REJECT"
  reasoning: string
  confidence: number
  technicalWeight: number
  cultureWeight: number
  highlights: string[]
  concerns: string[]
}

export interface AgentContext {
  candidateId: string
  jobId: string
  candidate: Candidate
  job: Job
  bandRoomId: string
  bandThreadId: string
}

export interface EvalEvent {
  type:
    | "start"
    | "agent_start"
    | "band_read"
    | "band_post"
    | "agent_complete"
    | "complete"
    | "error"
  agent?: AgentType
  agentLabel?: string
  message: string
  score?: number
  decision?: string
  data?: unknown
  timestamp: string
}
