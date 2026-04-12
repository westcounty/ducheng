import { listTasks, getTaskBySlug } from '../services/task-service.js'

export function registerRoutes(app) {
  // GET /api/tasks — list tasks (public, no auth required)
  app.get('/api/tasks', async (request) => {
    const { city, page, pageSize } = request.query
    return listTasks({
      city: city || undefined,
      page: parseInt(page || '1', 10),
      pageSize: parseInt(pageSize || '20', 10),
    })
  })

  // GET /api/tasks/:slug — task detail with sub-task overview (public)
  app.get('/api/tasks/:slug', async (request, reply) => {
    const { slug } = request.params
    const task = await getTaskBySlug(slug)

    if (!task) {
      return reply.code(404).send({ error: 'Task not found' })
    }

    return task
  })
}
