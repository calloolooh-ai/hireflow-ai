import type { NextAuthConfig } from "next-auth"

// Edge-compatible auth config — no DB imports, used by middleware
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user
      const { pathname } = request.nextUrl

      if (pathname.startsWith("/dashboard")) {
        return isLoggedIn
      }
      if ((pathname === "/login" || pathname === "/signup") && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", request.nextUrl))
      }
      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id as string
      return session
    },
  },
  providers: [], // Filled in auth.ts — not needed at Edge
}
