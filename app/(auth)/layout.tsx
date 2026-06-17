import { Cpu } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0c0c0f] flex items-center justify-center p-4 tech-grid">
      <div className="absolute inset-x-0 top-0 h-[300px] pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(ellipse_at_50%_-20%,rgba(249,115,22,0.08),transparent_60%)]" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center orange-glow">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">HireFlow AI</span>
          </div>
          <p className="text-zinc-500 text-sm font-mono">
            Band-native multi-agent hiring intelligence
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
