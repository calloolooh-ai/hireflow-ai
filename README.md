# HireFlow AI

**Band-native multi-agent hiring intelligence platform**

> "Where AI agents collaborate with human hiring teams to make transparent, auditable hiring decisions."

Built for the Band of Agents Hackathon.

---

## What Makes This Band-Native

Band is the **collaboration backbone** — not a notification channel:

1. **Resume Analyst** extracts skills and posts findings to a Band thread
2. **Technical Evaluator** reads the Band thread, then posts its score with reasoning
3. **Culture Evaluator** reads all prior Band messages, then posts culture assessment
4. **Compensation Agent** reads Band context to calibrate salary range
5. **Ranking Agent** reads the **entire Band thread**, synthesizes all agent findings, and posts a final recommendation

Every agent explicitly references prior Band messages. The UI visualizes this with real-time arrows:

```
Resume Analyst → [Band] → Technical Evaluator → [Band] → Culture Evaluator
                                                               ↓
                        Ranking Agent ← [Band] ← Compensation Agent
```

---

## Quick Start

```bash
cd hireflowai
npm install
npm run db:seed   # Create demo data
npm run dev       # Start development server
```

Open [http://localhost:3000](http://localhost:3000)

**Demo credentials:**
- Email: `demo@hireflow.ai`
- Password: `demo1234`

---

## Features

- **Multi-agent pipeline**: 5 AI agents coordinate through Band
- **Live evaluation feed**: Watch agents collaborate in real-time via SSE
- **Band room visualization**: See every agent message with "via Band" connectors
- **Score matrix**: Sortable candidate comparison table
- **Candidate cards**: Expandable with raw JSON, reasoning, and human approval
- **Audit trail**: Every agent action timestamped and searchable
- **Human approval**: Approve/Reject/Review with full audit log
- **Analytics**: Recharts dashboards for hiring intelligence
- **Demo mode**: Works without any API keys — realistic mock data

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| Backend | Next.js Route Handlers, SSE streaming |
| Database | SQLite (better-sqlite3) + Drizzle ORM |
| Auth | NextAuth v5 (credentials) |
| AI | Featherless.ai (OpenAI-compatible) |
| Collaboration | Band API (with SQLite mock fallback) |
| Charts | Recharts |

---

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | SQLite file path: `file:./hireflow.db` |
| `NEXTAUTH_SECRET` | Yes | Random 32+ char secret |
| `NEXTAUTH_URL` | Yes | `http://localhost:3000` in dev |
| `FEATHERLESS_API_KEY` | No | Enables real LLM calls (demo mode otherwise) |
| `AI_MODEL` | No | Default: `meta-llama/Llama-3.3-70B-Instruct` |
| `BAND_API_KEY` | No | Enables live Band API (SQLite mock otherwise) |
| `BAND_API_URL` | No | Band API base URL |

---

## Architecture

### Agent Pipeline

```
/lib/agents/
├── resume-analyst.ts      # Extracts skills, experience, summary
├── technical-evaluator.ts # Scores technical fit (reads Band)
├── culture-evaluator.ts   # Scores culture fit (reads Band)
├── compensation-agent.ts  # Estimates salary range (reads Band)
├── ranking-agent.ts       # Final decision (reads entire Band thread)
└── orchestrator.ts        # Coordinates all agents + streams events
```

### Band Integration

```
/lib/band/index.ts

createRoom(name, description)     → BandRoom
createThread(roomId, title)       → BandThread
postMessage(roomId, threadId, ...) → BandMessage
fetchMessages(roomId, threadId)   → BandMessage[]
```

When `BAND_API_KEY` is set: uses real Band API
When not set: stores messages in SQLite, identical semantics

### Database Schema

- `users` — authentication
- `jobs` — job positions with `bandRoomId`
- `candidates` — applicants with `bandThreadId`
- `evaluations` — per-agent output + score
- `band_messages` — all Band thread messages
- `decisions` — final recommendations + human approvals
- `audit_logs` — complete action history

---

## Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard or:
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add FEATHERLESS_API_KEY
vercel env add BAND_API_KEY
```

**Note:** For persistent data on Vercel, use [Turso](https://turso.tech) (SQLite-compatible):
```bash
# Replace better-sqlite3 with @libsql/client + drizzle-orm/libsql
```

The app uses `/tmp/hireflow.db` on Vercel, which resets on cold starts. For demos this is fine — run `db:seed` to pre-populate data.

---

## Demo Flow

1. **Sign in** with demo credentials
2. **Dashboard** shows overview with agent pipeline diagram
3. **Go to Jobs** → click "Senior Frontend Engineer"
4. **Run Evaluation** on any candidate
5. Watch **live feed**: agents spin up, read Band, post findings
6. **View Results** → Band Activity tab shows full agent collaboration
7. **Approve/Reject** the AI recommendation with one click
8. **Analytics** shows score distributions and hiring velocity

---

## Band Collaboration Flow (Visualized)

```
Job Room: hiring-senior-frontend-engineer
│
└─ Thread: Evaluation: Sarah Kim
   │
   ├─ [Resume Analyst] → "Skills: React, TypeScript, Next.js..."
   │                          ↓ via Band
   ├─ [Technical Evaluator] → "Read 1 message from Band. Score: 9.2/10..."
   │                          ↓ via Band
   ├─ [Culture Evaluator] → "Read 2 messages from Band. Culture: 8.8/10..."
   │                          ↓ via Band
   ├─ [Compensation Agent] → "Read 3 messages. Salary: $175K-$225K..."
   │                          ↓ via Band
   └─ [Ranking Agent] → "Synthesized 4 agent messages. HIRE (9.0/10)"
                          ↓
               Human approval required
```

---

Built with ❤️ for the Band of Agents Hackathon
