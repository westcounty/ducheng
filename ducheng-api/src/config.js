import 'dotenv/config'

export const config = {
  port: parseInt(process.env.PORT || '3100', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.TUCHAN_JWT_SECRET,
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
  corsOrigin: process.env.CORS_ORIGIN || '*',

  // GLM-4V API (智谱 multi-modal)
  glmApiKey: process.env.GLM_API_KEY || '',
  glmApiBaseUrl: process.env.GLM_API_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4',
  glmModel: process.env.GLM_MODEL || 'glm-4v-plus',
}
