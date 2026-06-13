import type { Metadata } from "next"
import "./globals.css"
import { SessionProvider } from "next-auth/react"

export const metadata: Metadata = {
  title: "HireFlow AI — Multi-Agent Hiring Intelligence",
  description:
    "Band-native multi-agent hiring intelligence platform where AI agents collaborate with human hiring teams to make transparent, auditable hiring decisions.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0f172a] text-slate-100 antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
