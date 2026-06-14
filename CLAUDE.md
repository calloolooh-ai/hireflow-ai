# HireFlow AI - Project Context

## Overview

HireFlow AI is being built for the Band of Agents Hackathon 2026.

This is NOT a traditional SaaS application.

The primary goal is to demonstrate a real-world enterprise workflow where multiple AI agents collaborate through Band to make hiring decisions.

The project must showcase:

- Multi-agent collaboration
- Shared context
- Agent handoffs
- Human-in-the-loop approvals
- Auditability
- Enterprise value

Band must be central to the workflow. Band is NOT a notification layer. Band is NOT a final output layer. Band is the collaboration layer.

---

## Hackathon Goal

The judges are specifically looking for:

- At least 3 collaborating agents
- Agent-to-agent communication
- Shared state
- Context handoffs
- Review workflows
- Enterprise business value
- Visible collaboration

The project should clearly demonstrate that agents are coordinating work through Band rather than acting independently.

---

## Product Vision

HireFlow AI transforms hiring into a transparent AI-assisted collaboration process.

Instead of a recruiter manually reviewing dozens of candidates, specialized agents collaborate inside Band rooms and produce explainable hiring recommendations.

Band becomes the hiring war room.

Every recommendation is:

- Explainable
- Searchable
- Auditable
- Human-approved

---

## Core User Story

1. A hiring manager creates a job opening.
2. Candidates are added.
3. AI agents evaluate each candidate.
4. Agents share findings through Band.
5. Agents review each other's work.
6. Agents debate disagreements.
7. A final recommendation is produced.
8. Human reviewers approve or reject the recommendation.
9. Every step remains visible in Band.

---

## Agent Architecture

There are 5 primary agents.

### Resume Analyst

Responsibilities:
- Resume parsing
- Skills extraction
- Experience extraction
- Candidate summary

Outputs structured JSON.

---

### Technical Evaluator

Responsibilities:
- Match candidate skills against job requirements
- Technical scoring
- Skill gap identification

Produces:
- score
- strengths
- weaknesses
- rationale

---

### Culture Evaluator

Responsibilities:
- Communication analysis
- Leadership analysis
- Collaboration assessment
- Team fit evaluation

Produces:
- score
- reasoning
- concerns

---

### Compensation Analyst

Responsibilities:
- Estimate salary range
- Market positioning
- Confidence scoring

Produces:
- min salary
- max salary
- confidence

---

### Ranking Agent

Responsibilities:
- Read outputs from all previous agents
- Resolve disagreements
- Generate final recommendation

Produces:
- HIRE
- HOLD
- REJECT

Along with full reasoning.

---

## Important Demo Feature

The system must visibly show agent collaboration. Do NOT hide communication.

The user should see:

```
Resume Analyst
↓
Technical Evaluator
↓
Culture Evaluator
↓
Compensation Analyst
↓
Ranking Agent
```

All interactions should be visible in the UI.

---

## Hiring Debate Mode

This is a key differentiator.

Example interaction:

> **Technical Evaluator:** "I recommend HIRE with score 9.1."
>
> **Culture Evaluator:** "I disagree. Communication indicators are weak."
>
> **Ranking Agent:** "Conflict detected. Reviewing both analyses."
>
> **Ranking Agent:** "Decision: HOLD."

These interactions should appear in the Band thread. Judges should clearly see collaboration and conflict resolution.

---

## Band Usage Requirements

Band must be the actual coordination layer.

Agent workflow:
1. Agent A posts analysis.
2. Agent B reads Band thread.
3. Agent B responds with analysis.
4. Agent C reads thread history.
5. Agent C contributes context.
6. Ranking Agent reviews all thread messages.
7. Final decision is generated.

Never simulate Band as a simple notification feed. Band should appear as the central shared workspace.

---

## Demo Priorities

1. Visible agent collaboration
2. Enterprise hiring workflow
3. Explainable decisions
4. Human approval process
5. Beautiful UI

---

## Technical Stack

**Frontend:**
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Recharts
- Lucide React

**Backend:**
- Next.js Route Handlers
- SQLite
- Drizzle ORM

**Authentication:**
- NextAuth

**Deployment:**
- Vercel

**AI Provider:**
- Featherless AI
- Default Model: `deepseek-ai/DeepSeek-V3.1`

---

## Environment Variables

```
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
FEATHERLESS_API_KEY
BAND_API_KEY
BAND_API_URL
```

---

## Design Guidelines

**Theme:** Dark mode first.

| Token      | Value     |
|------------|-----------|
| Background | `#0f172a` |
| Cards      | `#111827` |
| Primary    | `#3b82f6` |
| Success    | `#10b981` |
| Warning    | `#f59e0b` |
| Danger     | `#ef4444` |

Visual style should resemble Vercel, Linear, and OpenAI — clean and enterprise-focused.

---

## Explainability Rules

Every AI decision must include reasoning. Every score must be inspectable.

Users must be able to see:
- Evidence
- Rationale
- Agent notes
- Raw output

No black-box recommendations.

---

## Audit Requirements

Every action should be stored. Examples:
- Candidate created
- Evaluation started
- Agent response generated
- Band message posted
- Decision approved
- Decision rejected

All timestamps must be preserved.

---

## MVP Success Criteria

A successful MVP allows:

1. User creates a job.
2. User adds candidates.
3. User runs evaluation.
4. Multiple agents collaborate through Band.
5. Results are visible in real time.
6. Ranking Agent generates recommendation.
7. Human approves recommendation.
8. All activity is stored and searchable.

---

## What Not To Build

Avoid:
- Complex ATS integrations
- Advanced RBAC systems
- Multi-tenant enterprise architecture
- Microservices
- Kubernetes
- Unnecessary abstraction

Focus on:
- Agent collaboration
- Band integration
- Hiring workflow
- Strong demo experience

---

## North Star

When making implementation decisions always ask:

> "Does this make agent collaboration through Band more visible, useful, and central to the workflow?"

If not, deprioritize it.
