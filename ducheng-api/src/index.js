import Fastify from 'fastify'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import path from 'node:path'
import { config } from './config.js'
import { registerRoutes } from './routes/tasks.js'
import { registerProgressRoutes } from './routes/progress.js'
import { registerSubmissionRoutes } from './routes/submissions.js'
import { registerUploadRoutes } from './routes/upload.js'

const app = Fastify({ logger: true })

await app.register(cors, { origin: config.corsOrigin })
await app.register(multipart, { limits: { fileSize: config.maxFileSize } })

// Serve uploaded files statically
await app.register(fastifyStatic, {
  root: path.resolve(config.uploadDir),
  prefix: '/uploads/',
})

// Health check
app.get('/api/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

// Register route modules
registerRoutes(app)
registerProgressRoutes(app)
registerSubmissionRoutes(app)
registerUploadRoutes(app)

// Start server
try {
  await app.listen({ port: config.port, host: '0.0.0.0' })
  console.log(`ducheng-api running on port ${config.port}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
