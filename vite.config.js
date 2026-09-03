import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

function aiProxyPlugin(serverApiKey) {
  return {
    name: 'ai-proxy-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method === 'GET' && req.url === '/api/ai/models') {
          try {
            const apiRes = await fetch('https://openrouter.ai/api/v1/models')
            const apiData = await apiRes.json()

            if (!apiRes.ok) {
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: false, code: 'API_ERROR', error: 'Не удалось получить список моделей' }))
              return
            }

            const models = (apiData.data || [])
              .map((m) => ({
                id: m.id,
                name: m.name || m.id,
                context_length: m.context_length,
                prompt_price: m.pricing?.prompt,
                completion_price: m.pricing?.completion,
              }))
              .sort((a, b) => a.name.localeCompare(b.name))

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true, models }))
          } catch (err) {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: false, code: 'SERVER_ERROR', error: err.message }))
          }
          return
        }

        if (req.method === 'POST' && req.url === '/api/ai/chat') {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}')
              const serverKey = serverApiKey
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
export default defineConfig(({ mode }) => {
  // Пустой префикс '' заставляет loadEnv вернуть ВСЕ переменные из .env,
  // а не только те, что начинаются с VITE_ (иначе OPENROUTER_API_KEY
  // никогда не попадёт в process.env этого файла).
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss(), aiProxyPlugin(env.OPENROUTER_API_KEY)],
  }
})
