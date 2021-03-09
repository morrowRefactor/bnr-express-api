module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres@localhost/bnr-app',
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://postgres@localhost/bnr-app-test',
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api",
    EMAIL_API_KEY: process.env.EMAIL_API_KEY,
    JWT_SECRET: process.env.JWT_SECRET || 'bnr-super-secret-time'
  }