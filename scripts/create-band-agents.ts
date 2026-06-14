/**
 * Create the 5 HireFlow External Agents on Band.
 *
 * Band agents are registered through the *Human API* with a HUMAN api key
 * (different from the per-agent keys the app uses at runtime). Each call to
 * POST /me/agents/register creates one agent owned by you and returns an
 * api_key that is shown ONCE — this script captures those keys + the agent
 * UUIDs and writes them straight into .env.local.
 *
 * Usage:
 *   BAND_HUMAN_API_KEY=hum_xxx npx tsx scripts/create-band-agents.ts
 *
 * Get your human API key from your Band workspace account settings. Re-running
 * is safe in the sense that it only fills EMPTY env slots — already-populated
 * agents are skipped so you don't create duplicates.
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { resolve } from "path"

const ENV_PATH = resolve(process.cwd(), ".env.local")
const HUMAN_BASE_URL =
  process.env.BAND_HUMAN_API_URL || "https://app.band.ai/api/v1/me"

type Role =
  | "resume_analyst"
  | "technical_evaluator"
  | "culture_evaluator"
  | "compensation_agent"
  | "ranking_agent"

const AGENTS: Array<{
  role: Role
  envPrefix: string
  name: string
  description: string
}> = [
  {
    role: "resume_analyst",
    envPrefix: "BAND_RESUME_ANALYST",
    name: "Resume Analyst",
    description:
      "Parses resumes, extracts skills, experience and a candidate summary. First agent in the HireFlow hiring pipeline.",
  },
  {
    role: "technical_evaluator",
    envPrefix: "BAND_TECHNICAL_EVALUATOR",
    name: "Technical Evaluator",
    description:
      "Matches candidate skills against job requirements and produces a technical score, strengths, weaknesses and rationale.",
  },
  {
    role: "culture_evaluator",
    envPrefix: "BAND_CULTURE_EVALUATOR",
    name: "Culture Evaluator",
    description:
      "Assesses communication, leadership, collaboration and team fit, producing a culture score with reasoning and concerns.",
  },
  {
    role: "compensation_agent",
    envPrefix: "BAND_COMPENSATION_AGENT",
    name: "Compensation Analyst",
    description:
      "Estimates a market-aligned salary range with a confidence score based on the candidate profile and role.",
  },
  {
    role: "ranking_agent",
    envPrefix: "BAND_RANKING_AGENT",
    name: "Ranking Agent",
    description:
      "Reads all prior agent findings in the Band thread, resolves disagreements and produces a final HIRE / HOLD / REJECT recommendation.",
  },
]

// ── tiny .env parser/writer (no dotenv dependency) ───────────────────────────

function parseEnv(text: string): Map<string, string> {
  const map = new Map<string, string>()
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m) map.set(m[1], m[2])
  }
  return map
}

function upsertEnvLine(text: string, key: string, value: string): string {
  const re = new RegExp(`^${key}=.*$`, "m")
  if (re.test(text)) return text.replace(re, `${key}=${value}`)
  return text.replace(/\n*$/, "") + `\n${key}=${value}\n`
}

// ── Band Human API ───────────────────────────────────────────────────────────

async function registerAgent(
  humanKey: string,
  name: string,
  description: string
): Promise<{ id: string; apiKey: string }> {
  const res = await fetch(`${HUMAN_BASE_URL}/agents/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": humanKey,
    },
    // Band wraps payloads under a resource key elsewhere; send wrapped and
    // include the flat fields too so we're tolerant of either shape.
    body: JSON.stringify({ agent: { name, description }, name, description }),
  })

  if (!res.ok) {
    throw new Error(`register "${name}" failed ${res.status}: ${await res.text()}`)
  }

  const json = await res.json()
  const data = json?.data ?? json
  // Band nests credentials and agent info separately:
  // { data: { credentials: { api_key }, agent: { id } } }
  const id = data?.agent?.id ?? data?.id ?? data?.agent_id
  const apiKey =
    data?.credentials?.api_key ??
    data?.api_key ??
    data?.apiKey ??
    data?.key

  if (!id || !apiKey) {
    throw new Error(
      `register "${name}" returned unexpected shape: ${JSON.stringify(json)}`
    )
  }
  return { id, apiKey }
}

async function main() {
  let envText = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, "utf8") : ""
  const env = parseEnv(envText)

  const humanKey = process.env.BAND_HUMAN_API_KEY || env.get("BAND_HUMAN_API_KEY")
  if (!humanKey) {
    console.error(
      "Missing BAND_HUMAN_API_KEY. Get your human API key from your Band\n" +
        "workspace account settings, then run:\n\n" +
        "  BAND_HUMAN_API_KEY=hum_xxx npx tsx scripts/create-band-agents.ts\n"
    )
    process.exit(1)
  }

  for (const agent of AGENTS) {
    const keyVar = `${agent.envPrefix}_KEY`
    const idVar = `${agent.envPrefix}_ID`

    if (env.get(keyVar) && env.get(idVar)) {
      console.log(`⏭  ${agent.name}: already configured, skipping`)
      continue
    }

    process.stdout.write(`→  Creating ${agent.name}… `)
    const { id, apiKey } = await registerAgent(
      humanKey,
      agent.name,
      agent.description
    )

    envText = upsertEnvLine(envText, keyVar, apiKey)
    envText = upsertEnvLine(envText, idVar, id)
    writeFileSync(ENV_PATH, envText) // persist after each so a mid-run failure
    env.set(keyVar, apiKey) //          doesn't lose an already-issued key
    env.set(idVar, id)

    console.log(`done (id ${id})`)
  }

  console.log(
    "\n✅ All 5 agents created and written to .env.local.\n" +
      "   Restart `npm run dev` — bandMode will switch from 'mock' to 'live'."
  )
  process.exit(0)
}

main().catch((err) => {
  console.error("\n❌", err instanceof Error ? err.message : err)
  process.exit(1)
})
