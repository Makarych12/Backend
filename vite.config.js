import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

function aiProxyPlugin() {
  return {
    name: 'ai-proxy-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method === 'POST' && req.url === '/api/ai/chat') {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}')
              const serverKey = process.env.OPENROUTER_API_KEY
              const clientKey = req.headers['x-openrouter-key']
              const apiKey = serverKey || clientKey

              if (!apiKey || apiKey.trim() === '') {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.end(
                  JSON.stringify({
                    ok: false,
                    code: 'NO_API_KEY',
                    error: 'AI-функция временно недоступна, добавьте API-ключ в настройках',
                  })
                )
                return
              }

              const model = data.model || 'openai/gpt-4o-mini'
              const messages = []
              if (data.systemPrompt) {
                messages.push({ role: 'system', content: data.systemPrompt })
              }
              if (Array.isArray(data.messages)) {
                messages.push(...data.messages)
              } else if (data.prompt) {
                messages.push({ role: 'user', content: data.prompt })
              }

              const apiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${apiKey.trim()}`,
                  'HTTP-Referer': 'http://localhost:5173',
                  'X-Title': 'Backend Interactive Course',
                },
                body: JSON.stringify({
                  model,
                  messages,
                  temperature: data.temperature ?? 0.7,
                  max_tokens: data.maxTokens ?? 1200,
                }),
              })

              const apiData = await apiRes.json()

              if (!apiRes.ok || apiData.error) {
                const errMsg = apiData.error?.message || 'Ошибка вызова AI API'
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ ok: false, code: 'API_ERROR', error: errMsg }))
                return
              }

              const content = apiData.choices?.[0]?.message?.content || ''
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: true, message: content }))
            } catch (err) {
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: false, code: 'SERVER_ERROR', error: err.message }))
            }
          })
          return
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), aiProxyPlugin()],
})
