import type { Metadata } from "next"
import { Playfair_Display, Spectral, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "next-auth/react"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
})

const spectral = Spectral({
  subsets: ["latin"],
  variable: "--font-spectral",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "700"],
  display: "swap",
})

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
    <html lang="en" className={`dark ${playfair.variable} ${spectral.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
