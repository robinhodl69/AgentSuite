import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const agentTarget = env.VITE_AGENT_API_URL || 'http://127.0.0.1:8001'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/health': agentTarget,
        '/agent': agentTarget,
      },
    },
  }
})
