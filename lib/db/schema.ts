import { pgTable, text, real, timestamp } from "drizzle-orm/pg-core"
import { randomUUID } from "crypto"

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
})

export const jobs = pgTable("jobs", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  department: text("department").notNull(),
  level: text("level").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("active"),
  bandRoomId: text("band_room_id"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
})

export const candidates = pgTable("candidates", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  jobId: text("job_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  resumeText: text("resume_text"),
  linkedinUrl: text("linkedin_url"),
  status: text("status").notNull().default("pending"),
  bandThreadId: text("band_thread_id"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
})

export const evaluations = pgTable("evaluations", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  candidateId: text("candidate_id").notNull(),
  jobId: text("job_id").notNull(),
  agentType: text("agent_type").notNull(),
  output: text("output").notNull(),
  score: real("score"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
})

export const bandMessages = pgTable("band_messages", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  roomId: text("room_id").notNull(),
  threadId: text("thread_id").notNull(),
  agentType: text("agent_type").notNull(),
  content: text("content").notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
})

export const decisions = pgTable("decisions", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  candidateId: text("candidate_id").notNull(),
  jobId: text("job_id").notNull(),
  decision: text("decision").notNull(),
  reasoning: text("reasoning"),
  compositeScore: real("composite_score"),
  confidence: real("confidence"),
  approvedBy: text("approved_by"),
  approvedAt: timestamp("approved_at"),
  humanDecision: text("human_decision"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
})

export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  action: text("action").notNull(),
  actorType: text("actor_type").notNull(),
  actorId: text("actor_id"),
  data: text("data"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
})

export type InsertUser = typeof users.$inferInsert
export type SelectUser = typeof users.$inferSelect
export type InsertJob = typeof jobs.$inferInsert
export type SelectJob = typeof jobs.$inferSelect
export type InsertCandidate = typeof candidates.$inferInsert
export type SelectCandidate = typeof candidates.$inferSelect
export type InsertEvaluation = typeof evaluations.$inferInsert
export type SelectEvaluation = typeof evaluations.$inferSelect
export type InsertBandMessage = typeof bandMessages.$inferInsert
export type SelectBandMessage = typeof bandMessages.$inferSelect
export type InsertDecision = typeof decisions.$inferInsert
export type SelectDecision = typeof decisions.$inferSelect
export type InsertAuditLog = typeof auditLogs.$inferInsert
export type SelectAuditLog = typeof auditLogs.$inferSelect
