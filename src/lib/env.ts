import { z } from 'zod'

const clientEnvSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
})

export type ClientEnv = z.infer<typeof clientEnvSchema>

export const env: ClientEnv = (() => {
  const parsed = clientEnvSchema.safeParse(import.meta.env)
  if (!parsed.success) {
    const formatted = parsed.error.format()
    // We throw a synchronous error to fail fast at startup if env is invalid
    throw new Error(`Invalid environment variables for client: ${JSON.stringify(formatted)}`)
  }
  return parsed.data
})()


