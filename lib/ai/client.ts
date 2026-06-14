import OpenAI from "openai"

export const AI_MODEL = process.env.AI_MODEL || "deepseek-ai/DeepSeek-V3.1"
export const isDemoMode = !process.env.FEATHERLESS_API_KEY || process.env.FEATHERLESS_API_KEY === ""

let _client: OpenAI | null = null

export function getAIClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.FEATHERLESS_API_KEY || "demo-key",
      baseURL: "https://api.featherless.ai/v1",
    })
  }
  return _client
}

export async function callAI(
  systemPrompt: string,
  userPrompt: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  if (isDemoMode) {
    throw new Error("DEMO_MODE")
  }

  const client = getAIClient()
  const response = await client.chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: options?.temperature ?? 0.3,
    max_tokens: options?.maxTokens ?? 1500,
  })

  return response.choices[0]?.message?.content || ""
}

export function extractJSON<T>(text: string): T {
  const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) ||
    text.match(/\{[\s\S]*\}/)
  const jsonStr = jsonMatch?.[1] || jsonMatch?.[0] || text
  return JSON.parse(jsonStr.trim())
}
