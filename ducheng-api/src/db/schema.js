import {
  pgTable, uuid, varchar, text, integer, decimal,
  timestamp, jsonb, pgEnum, uniqueIndex
} from 'drizzle-orm/pg-core'

// Enums
export const difficultyEnum = pgEnum('difficulty', ['easy', 'medium', 'hard'])
export const taskStatusEnum = pgEnum('task_status', ['draft', 'pending_review', 'published', 'rejected', 'archived'])
export const subTaskTypeEnum = pgEnum('sub_task_type', ['photo', 'arrival', 'puzzle', 'quiz'])
export const submissionStatusEnum = pgEnum('submission_status', ['pending', 'approved', 'rejected'])
export const progressStatusEnum = pgEnum('progress_status', ['not_started', 'in_progress', 'completed'])
export const reviewActionEnum = pgEnum('review_action', ['approved', 'rejected'])

// Tasks
export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 64 }).notNull().unique(),
  title: varchar('title', { length: 128 }).notNull(),
  description: text('description').notNull(),
  coverImage: varchar('cover_image', { length: 256 }),
  estimatedMinutes: integer('estimated_minutes'),
  difficulty: difficultyEnum('difficulty').default('medium'),
  badgeName: varchar('badge_name', { length: 64 }),
  badgeIcon: varchar('badge_icon', { length: 16 }),
  badgeColor: varchar('badge_color', { length: 7 }),
  locationSummary: varchar('location_summary', { length: 256 }),
  city: varchar('city', { length: 32 }).notNull(),
  status: taskStatusEnum('status').default('published'),
  completionCount: integer('completion_count').default(0),
  createdBy: uuid('created_by'),
  avgRating: decimal('avg_rating', { precision: 3, scale: 2 }),
  ratingCount: integer('rating_count').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// Sub-tasks
export const subTasks = pgTable('sub_tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  taskId: uuid('task_id').notNull().references(() => tasks.id),
  orderIndex: integer('order_index').notNull(),
  locationName: varchar('location_name', { length: 128 }),
  locationAddress: varchar('location_address', { length: 256 }),
  locationLat: decimal('location_lat', { precision: 10, scale: 7 }),
  locationLng: decimal('location_lng', { precision: 10, scale: 7 }),
  type: subTaskTypeEnum('type').notNull(),
  title: varchar('title', { length: 128 }).notNull(),
  instruction: text('instruction').notNull(),
  validationConfig: jsonb('validation_config'),
  hints: jsonb('hints'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// Task submissions
export const taskSubmissions = pgTable('task_submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  taskId: uuid('task_id').notNull().references(() => tasks.id),
  subTaskId: uuid('sub_task_id').notNull().references(() => subTasks.id),
  status: submissionStatusEnum('status').default('pending'),
  photoUrl: varchar('photo_url', { length: 256 }),
  answerText: varchar('answer_text', { length: 256 }),
  gpsLat: decimal('gps_lat', { precision: 10, scale: 7 }),
  gpsLng: decimal('gps_lng', { precision: 10, scale: 7 }),
  aiResult: jsonb('ai_result'),
  aiConfidence: decimal('ai_confidence', { precision: 3, scale: 2 }),
  submittedAt: timestamp('submitted_at', { withTimezone: true }).defaultNow(),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
})

// Task progress
export const taskProgress = pgTable('task_progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  taskId: uuid('task_id').notNull().references(() => tasks.id),
  currentSubTaskIndex: integer('current_sub_task_index').default(0),
  status: progressStatusEnum('status').default('not_started'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  completionRank: integer('completion_rank'),
})

// User badges
export const userBadges = pgTable('user_badges', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  taskId: uuid('task_id').notNull().references(() => tasks.id),
  unlockedAt: timestamp('unlocked_at', { withTimezone: true }).defaultNow(),
})

// User posters
export const userPosters = pgTable('user_posters', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  taskId: uuid('task_id').notNull().references(() => tasks.id),
  imageUrl: varchar('image_url', { length: 256 }),
  photos: jsonb('photos'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// Task reviews (admin review log)
export const taskReviews = pgTable('task_reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  taskId: uuid('task_id').notNull().references(() => tasks.id),
  reviewerId: uuid('reviewer_id'),
  action: reviewActionEnum('action').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// Task comments
export const taskComments = pgTable('task_comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  taskId: uuid('task_id').notNull().references(() => tasks.id),
  userId: uuid('user_id').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// Task ratings
export const taskRatings = pgTable('task_ratings', {
  id: uuid('id').defaultRandom().primaryKey(),
  taskId: uuid('task_id').notNull().references(() => tasks.id),
  userId: uuid('user_id').notNull(),
  rating: integer('rating').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  uniqueIndex('task_ratings_task_user_idx').on(table.taskId, table.userId),
])
