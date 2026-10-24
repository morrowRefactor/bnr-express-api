module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'production',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres@localhost/bnr-app',
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://postgres@localhost/bnr-app-test',
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api",
  EMAIL_API_KEY: process.env.EMAIL_API_KEY,
  // Must be set in production; server.js refuses to start without it
  JWT_SECRET: process.env.JWT_SECRET || 'local-dev-only-jwt-secret',
  // Comma-separated user IDs allowed to manage videos, tags and site text
  ADMIN_USER_IDS: (process.env.ADMIN_USER_IDS || '1').split(',').map(id => parseInt(id.trim(), 10))
}
