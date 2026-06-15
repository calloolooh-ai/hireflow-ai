import postgres from "postgres"

const sql = postgres(process.env.DATABASE_URL!)

async function run() {
  await sql`DROP TABLE IF EXISTS audit_logs, decisions, band_messages, evaluations, candidates, jobs, users CASCADE`
  console.log("All tables dropped")
  await sql.end()
  process.exit(0)
}

run().catch((err) => { console.error(err); process.exit(1) })
