import jwt from 'jsonwebtoken'
import { config } from '../config.js'

/**
 * Verifies JWT token from Authorization header.
 * Uses shared TUCHAN_JWT_SECRET — same as tuchan-api and Nannaricher.
 * In dev mode without secret, decodes without verification.
 */
export function verifyToken(token) {
  if (!config.jwtSecret) {
    // Dev mode: decode without verification
    try {
      const decoded = jwt.decode(token)
      if (!decoded?.sub) return null
      return { payload: decoded, verified: false }
    } catch {
      return null
    }
  }

  try {
    const payload = jwt.verify(token, Buffer.from(config.jwtSecret, 'base64'), {
      algorithms: ['HS256', 'HS384', 'HS512'],
    })
    return { payload, verified: true }
  } catch {
    return null
  }
}

/**
 * Fastify preHandler hook that extracts userId from JWT.
 * Sets request.userId on success, returns 401 on failure.
 */
export async function authPreHandler(request, reply) {
  const authHeader = request.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return reply.code(401).send({ error: 'No token provided' })
  }

  const result = verifyToken(token)
  if (!result) {
    return reply.code(401).send({ error: 'Invalid or expired token' })
  }

  request.userId = result.payload.sub
}

/**
 * Optional auth: sets userId if token present, but doesn't block.
 */
export async function optionalAuthPreHandler(request, reply) {
  const authHeader = request.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (token) {
    const result = verifyToken(token)
    if (result) {
      request.userId = result.payload.sub
    }
  }
}
