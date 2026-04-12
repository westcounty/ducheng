import { db } from '../db/client.js'
import { tasks, subTasks } from '../db/schema.js'
import { eq, sql, and } from 'drizzle-orm'

/**
 * List published tasks with optional city filter and pagination.
 */
export async function listTasks({ city, page = 1, pageSize = 20 }) {
  const conditions = [eq(tasks.status, 'published')]
  if (city) conditions.push(eq(tasks.city, city))

  const offset = (page - 1) * pageSize

  const [items, countResult] = await Promise.all([
    db.select().from(tasks)
      .where(and(...conditions))
      .orderBy(tasks.createdAt)
      .limit(pageSize)
      .offset(offset),
    db.select({ count: sql`count(*)` }).from(tasks)
      .where(and(...conditions)),
  ])

  const total = Number(countResult[0]?.count ?? 0)

  return {
    items: items.map(({ status, ...rest }) => rest),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

/**
 * Get a single published task by slug, including its sub-task list (overview only).
 */
export async function getTaskBySlug(slug) {
  const [task] = await db.select().from(tasks)
    .where(and(eq(tasks.slug, slug), eq(tasks.status, 'published')))
    .limit(1)

  if (!task) return null

  const subs = await db.select({
    id: subTasks.id,
    orderIndex: subTasks.orderIndex,
    type: subTasks.type,
    title: subTasks.title,
    locationName: subTasks.locationName,
  }).from(subTasks)
    .where(eq(subTasks.taskId, task.id))
    .orderBy(subTasks.orderIndex)

  return {
    ...task,
    subTasks: subs,
    totalSubTasks: subs.length,
  }
}

/**
 * Get a specific sub-task by task ID and order index.
 */
export async function getSubTaskByIndex(taskId, orderIndex) {
  const [sub] = await db.select().from(subTasks)
    .where(and(eq(subTasks.taskId, taskId), eq(subTasks.orderIndex, orderIndex)))
    .limit(1)
  return sub || null
}

/**
 * Get all sub-tasks for a task (for progress tracking).
 */
export async function getSubTasksForTask(taskId) {
  return db.select().from(subTasks)
    .where(eq(subTasks.taskId, taskId))
    .orderBy(subTasks.orderIndex)
}
