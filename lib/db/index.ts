import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"
import * as schema from "./schema"
import path from "path"

const url = process.env.VERCEL
  ? "file:/tmp/hireflow.db"
  : process.env.DATABASE_URL?.startsWith("file:")
  ? process.env.DATABASE_URL
  : `file:${path.resolve(process.cwd(), "hireflow.db")}`

export const client = createClient({ url })
export const db = drizzle(client, { schema })

const CREATE_SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    level TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    band_room_id TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS candidates (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    resume_text TEXT,
    linkedin_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    band_thread_id TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS evaluations (
    id TEXT PRIMARY KEY,
    candidate_id TEXT NOT NULL,
    job_id TEXT NOT NULL,
    agent_type TEXT NOT NULL,
    output TEXT NOT NULL,
    score REAL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS band_messages (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL,
    thread_id TEXT NOT NULL,
    agent_type TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata TEXT,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS decisions (
    id TEXT PRIMARY KEY,
    candidate_id TEXT NOT NULL,
    job_id TEXT NOT NULL,
    decision TEXT NOT NULL,
    reasoning TEXT,
    composite_score REAL,
    confidence REAL,
    approved_by TEXT,
    approved_at INTEGER,
    human_decision TEXT,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,
    actor_type TEXT NOT NULL,
    actor_id TEXT,
    data TEXT,
    created_at INTEGER NOT NULL
  );
`

// Initialize once; all callers await this
const _init = client.executeMultiple(CREATE_SQL)
export const ensureInit = () => _init
