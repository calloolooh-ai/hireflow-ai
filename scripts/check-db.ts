import postgres from "postgres"

const sql = postgres(process.env.DATABASE_URL!)

async function run() {
  const users = await sql`SELECT id, email, name FROM users`
  console.log("Users in Supabase:", users)
  await sql.end()
  process.exit(0)
}

run().catch((err) => { console.error(err); process.exit(1) })
