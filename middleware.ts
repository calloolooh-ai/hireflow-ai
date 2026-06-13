import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

// Use Edge-compatible auth config (no DB imports)
export default NextAuth(authConfig).auth

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
}
