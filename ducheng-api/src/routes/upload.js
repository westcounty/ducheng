import fs from 'node:fs/promises'
import path from 'node:path'
import { nanoid } from 'nanoid'
import { config } from '../config.js'
import { authPreHandler } from '../middleware/auth.js'

export function registerUploadRoutes(app) {
  // POST /api/upload/photo — upload a photo, return URL
  app.post('/api/upload/photo', { preHandler: authPreHandler }, async (request, reply) => {
    const data = await request.file()
    if (!data) {
      return reply.code(400).send({ error: 'No file provided' })
    }

    // Validate file type
    if (!data.mimetype.startsWith('image/')) {
      return reply.code(400).send({ error: 'Only image files are allowed' })
    }

    // Generate unique filename
    const ext = path.extname(data.filename || '.jpg') || '.jpg'
    const filename = `${nanoid(16)}${ext}`
    const filepath = path.join(config.uploadDir, filename)

    // Ensure upload directory exists
    await fs.mkdir(config.uploadDir, { recursive: true })

    // Save file
    const buffer = await data.toBuffer()
    await fs.writeFile(filepath, buffer)

    // Return the URL path (will be served statically or proxied)
    const url = `/uploads/${filename}`

    return { url, filename }
  })
}
