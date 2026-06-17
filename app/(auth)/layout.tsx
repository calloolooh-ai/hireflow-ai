import { Cpu } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4 tech-grid">
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center orange-glow">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-zinc-900 tracking-tight">HireFlow AI</span>
          </div>
          <p className="text-zinc-400 text-sm font-mono">
            Band-native multi-agent hiring intelligence
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
